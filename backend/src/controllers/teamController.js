const { Team, Employee, Log } = require('../models');

// Get all teams
const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.findAll({
      where: { organisation_id: req.user.orgId },
      include: [{
        model: Employee,
        attributes: ['id', 'first_name', 'last_name', 'email'],
        through: { attributes: [] }
      }],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: teams
    });
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teams',
      error: error.message
    });
  }
};

// Get single team
const getTeam = async (req, res) => {
  try {
    const team = await Team.findOne({
      where: {
        id: req.params.id,
        organisation_id: req.user.orgId
      },
      include: [{
        model: Employee,
        attributes: ['id', 'first_name', 'last_name', 'email', 'phone'],
        through: { attributes: [] }
      }]
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    res.json({
      success: true,
      data: team
    });
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team',
      error: error.message
    });
  }
};

// Create team
const createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Team name is required'
      });
    }

    const team = await Team.create({
      organisation_id: req.user.orgId,
      name,
      description
    });

    // Create log
    await Log.create({
      organisation_id: req.user.orgId,
      user_id: req.user.userId,
      action: 'team_created',
      meta: { teamId: team.id, name }
    });

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      data: team
    });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create team',
      error: error.message
    });
  }
};

// Update team
const updateTeam = async (req, res) => {
  try {
    const { name, description } = req.body;

    const team = await Team.findOne({
      where: {
        id: req.params.id,
        organisation_id: req.user.orgId
      }
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    await team.update({
      name: name || team.name,
      description: description !== undefined ? description : team.description
    });

    // Create log
    await Log.create({
      organisation_id: req.user.orgId,
      user_id: req.user.userId,
      action: 'team_updated',
      meta: { teamId: team.id, updates: req.body }
    });

    res.json({
      success: true,
      message: 'Team updated successfully',
      data: team
    });
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update team',
      error: error.message
    });
  }
};

// Delete team
const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findOne({
      where: {
        id: req.params.id,
        organisation_id: req.user.orgId
      }
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    const teamName = team.name;
    await team.destroy();

    // Create log
    await Log.create({
      organisation_id: req.user.orgId,
      user_id: req.user.userId,
      action: 'team_deleted',
      meta: { teamId: req.params.id, name: teamName }
    });

    res.json({
      success: true,
      message: 'Team deleted successfully'
    });
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete team',
      error: error.message
    });
  }
};

// Assign employees to team
const assignEmployees = async (req, res) => {
  try {
    const { employeeIds } = req.body;
    const teamId = req.params.id;

    if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'employeeIds must be a non-empty array'
      });
    }

    // Verify team exists and belongs to organisation
    const team = await Team.findOne({
      where: {
        id: teamId,
        organisation_id: req.user.orgId
      }
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Verify all employees exist and belong to organisation
    const employees = await Employee.findAll({
      where: {
        id: employeeIds,
        organisation_id: req.user.orgId
      }
    });

    if (employees.length !== employeeIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some employees not found or do not belong to your organisation'
      });
    }

    // Add employees to team
    await team.addEmployees(employees);

    // Create log
    await Log.create({
      organisation_id: req.user.orgId,
      user_id: req.user.userId,
      action: 'employees_assigned_to_team',
      meta: { teamId, employeeIds, teamName: team.name }
    });

    res.json({
      success: true,
      message: 'Employees assigned successfully'
    });
  } catch (error) {
    console.error('Assign employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign employees',
      error: error.message
    });
  }
};

// Unassign employee from team
const unassignEmployee = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const teamId = req.params.id;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'employeeId is required'
      });
    }

    const team = await Team.findOne({
      where: {
        id: teamId,
        organisation_id: req.user.orgId
      }
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    const employee = await Employee.findOne({
      where: {
        id: employeeId,
        organisation_id: req.user.orgId
      }
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    await team.removeEmployee(employee);

    // Create log
    await Log.create({
      organisation_id: req.user.orgId,
      user_id: req.user.userId,
      action: 'employee_unassigned_from_team',
      meta: { teamId, employeeId, teamName: team.name }
    });

    res.json({
      success: true,
      message: 'Employee unassigned successfully'
    });
  } catch (error) {
    console.error('Unassign employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unassign employee',
      error: error.message
    });
  }
};

module.exports = {
  getAllTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  assignEmployees,
  unassignEmployee
};