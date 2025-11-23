const express = require('express');
const router = express.Router();
const {
  getAllTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  assignEmployees,
  unassignEmployee
} = require('../controllers/teamController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

router.get('/', getAllTeams);
router.get('/:id', getTeam);
router.post('/', createTeam);
router.put('/:id', updateTeam);
router.delete('/:id', deleteTeam);

// Team assignment routes
router.post('/:id/assign', assignEmployees);
router.post('/:id/unassign', unassignEmployee);

module.exports = router;