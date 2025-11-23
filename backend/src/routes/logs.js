const express = require('express');
const router = express.Router();
const { Log, User } = require('../models');
const { authMiddleware } = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Get all logs for organisation
router.get('/', async (req, res) => {
  try {
    const { action, limit = 100 } = req.query;

    const where = { organisation_id: req.user.orgId };
    if (action) {
      where.action = action;
    }

    const logs = await Log.findAll({
      where,
      include: [{
        model: User,
        attributes: ['id', 'name', 'email']
      }],
      order: [['timestamp', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch logs',
      error: error.message
    });
  }
});

module.exports = router;