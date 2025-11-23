const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Organisation, Log } = require('../models');

// Register new organisation and admin user
const register = async (req, res) => {
  try {
    console.log('📝 Registration request received:', req.body);
    
    const { orgName, adminName, email, password } = req.body;

    // Validation
    if (!orgName || !adminName || !email || !password) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (password.length < 6) {
      console.log('❌ Password too short');
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log('❌ Email already exists:', email);
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    console.log('✅ Creating organisation...');
    // Create organisation
    const organisation = await Organisation.create({ name: orgName });
    console.log('✅ Organisation created:', organisation.id);

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    console.log('✅ Creating user...');
    // Create admin user
    const user = await User.create({
      organisation_id: organisation.id,
      name: adminName,
      email,
      password_hash
    });
    console.log('✅ User created:', user.id);

    // Create log
    await Log.create({
      organisation_id: organisation.id,
      user_id: user.id,
      action: 'organisation_created',
      meta: { orgName, adminName }
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, orgId: organisation.id },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    console.log('✅ Registration successful!');

    res.status(201).json({
      success: true,
      message: 'Organisation created successfully',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          organisation: {
            id: organisation.id,
            name: organisation.name
          }
        }
      }
    });
  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user with organisation
    const user = await User.findOne({
      where: { email },
      include: [{ model: Organisation }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Create log
    await Log.create({
      organisation_id: user.organisation_id,
      user_id: user.id,
      action: 'user_login',
      meta: { email }
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, orgId: user.organisation_id },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          organisation: {
            id: user.Organisation.id,
            name: user.Organisation.name
          }
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    await Log.create({
      organisation_id: req.user.orgId,
      user_id: req.user.userId,
      action: 'user_logout',
      meta: {}
    });

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message
    });
  }
};

module.exports = { register, login, logout };