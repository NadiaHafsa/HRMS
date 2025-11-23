const { Employee, Team, Log } = require('../models');

// Get all employees for organisation
const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll({
      where: { organisation_id: req.user.orgId },
      include: [{
        model: Team,
        attributes: ['id', 'name'],
        through: { attributes: [] }
      }],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: employees
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employees',
      error: error.message
    });
  }
};

// Get single employee
const getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      where: {
        id: req.params.id,
        organisation_id: req.user.orgId
      },
      include: [{
        model: Team,
        attributes: ['id', 'name', 'description'],
        through: { attributes: [] }
      }]
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee',
      error: error.message
    });
  }
};

// Create employee
const createEmployee = async (req, res) => {
  try {
    const { first_name, last_name, email, phone } = req.body;

    if (!first_name || !last_name) {
      return res.status(400).json({
        success: false,
        message: 'First name and last name are required'
      });
    }

    const employee = await Employee.create({
      organisation_id: req.user.orgId,
      first_name,
      last_name,
      email,
      phone
    });

    // Create log
    await Log.create({
      organisation_id: req.user.orgId,
      user_id: req.user.userId,
      action: 'employee_created',
      meta: { employeeId: employee.id, first_name, last_name }
    });

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create employee',
      error: error.message
    });
  }
};

// Update employee
const updateEmployee = async (req, res) => {
  try {
    const { first_name, last_name, email, phone } = req.body;

    const employee = await Employee.findOne({
      where: {
        id: req.params.id,
        organisation_id: req.user.orgId
      }
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    await employee.update({
      first_name: first_name || employee.first_name,
      last_name: last_name || employee.last_name,
      email: email !== undefined ? email : employee.email,
      phone: phone !== undefined ? phone : employee.phone
    });

    // Create log
    await Log.create({
      organisation_id: req.user.orgId,
      user_id: req.user.userId,
      action: 'employee_updated',
      meta: { employeeId: employee.id, updates: req.body }
    });

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: employee
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update employee',
      error: error.message
    });
  }
};

// Delete employee
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      where: {
        id: req.params.id,
        organisation_id: req.user.orgId
      }
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const employeeName = `${employee.first_name} ${employee.last_name}`;
    await employee.destroy();

    // Create log
    await Log.create({
      organisation_id: req.user.orgId,
      user_id: req.user.userId,
      action: 'employee_deleted',
      meta: { employeeId: req.params.id, name: employeeName }
    });

    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete employee',
      error: error.message
    });
  }
};

module.exports = {
  getAllEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee
};