import { useEffect, useState } from 'react';
import api from '../services/api';
import './Teams.css';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState(null);
  const [showUnassignConfirm, setShowUnassignConfirm] = useState(false);
  const [unassignData, setUnassignData] = useState(null);
  const [editingTeam, setEditingTeam] = useState(null);
  const [assigningTeam, setAssigningTeam] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teamsRes, employeesRes] = await Promise.all([
        api.get('/teams'),
        api.get('/employees')
      ]);
      setTeams(teamsRes.data.data);
      setEmployees(employeesRes.data.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTeam) {
        await api.put(`/teams/${editingTeam.id}`, formData);
      } else {
        await api.post('/teams', formData);
      }
      fetchData();
      closeModal();
    } catch (error) {
      alert(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleAssign = async () => {
    if (selectedEmployees.length === 0) {
      alert('Please select at least one employee');
      return;
    }
    try {
      await api.post(`/teams/${assigningTeam.id}/assign`, {
        employeeIds: selectedEmployees
      });
      fetchData();
      closeAssignModal();
    } catch (error) {
      alert(error.response?.data?.message || 'Assignment failed');
    }
  };

  const handleUnassign = (teamId, employeeId, employeeName) => {
    setUnassignData({ teamId, employeeId, employeeName });
    setShowUnassignConfirm(true);
  };

  const confirmUnassign = async () => {
    try {
      await api.post(`/teams/${unassignData.teamId}/unassign`, { 
        employeeId: unassignData.employeeId 
      });
      fetchData();
      setShowUnassignConfirm(false);
      setUnassignData(null);
    } catch (error) {
      alert(error.response?.data?.message || 'Unassignment failed');
    }
  };

  const cancelUnassign = () => {
    setShowUnassignConfirm(false);
    setUnassignData(null);
  };

  const handleEdit = (team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      description: team.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = (team) => {
    setTeamToDelete(team);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/teams/${teamToDelete.id}`);
      fetchData();
      setShowDeleteConfirm(false);
      setTeamToDelete(null);
    } catch (error) {
      alert(error.response?.data?.message || 'Delete failed');
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setTeamToDelete(null);
  };

  const openAssignModal = (team) => {
    setAssigningTeam(team);
    const assignedIds = team.Employees?.map(e => e.id) || [];
    setSelectedEmployees(assignedIds);
    setShowAssignModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTeam(null);
    setFormData({ name: '', description: '' });
  };

  const closeAssignModal = () => {
    setShowAssignModal(false);
    setAssigningTeam(null);
    setSelectedEmployees([]);
  };

  const toggleEmployee = (employeeId) => {
    setSelectedEmployees(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  if (loading) return <div className="loading">Loading teams...</div>;

  return (
    <div className="teams-page">
      <div className="page-header">
        <h1>Teams</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          Add Team
        </button>
      </div>

      <div className="teams-grid">
        {teams.length === 0 ? (
          <p>No teams found. Create your first team!</p>
        ) : (
          teams.map((team) => (
            <div key={team.id} className="team-card">
              <h3>{team.name}</h3>
              <p className="team-description">{team.description || 'No description'}</p>
              <div className="team-members">
                <strong>Members ({team.Employees?.length || 0}):</strong>
                {team.Employees?.length > 0 ? (
                  <ul>
                    {team.Employees.map((emp) => (
                      <li key={emp.id}>
                        {emp.first_name} {emp.last_name}
                        <button
                          onClick={() => handleUnassign(team.id, emp.id, `${emp.first_name} ${emp.last_name}`)}
                          className="btn-remove"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No members</p>
                )}
              </div>
              <div className="card-actions">
                <button onClick={() => openAssignModal(team)}>Assign</button>
                <button onClick={() => handleEdit(team)}>Edit</button>
                <button onClick={() => handleDelete(team)} className="btn-danger">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Team Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingTeam ? 'Edit Team' : 'Add Team'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Team Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-primary">
                  {editingTeam ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Employees Modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={closeAssignModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Assign Employees to {assigningTeam?.name}</h2>
            <div className="employee-list">
              {employees.length === 0 ? (
                <p>No employees available</p>
              ) : (
                employees.map((emp) => (
                  <label key={emp.id} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(emp.id)}
                      onChange={() => toggleEmployee(emp.id)}
                    />
                    {emp.first_name} {emp.last_name}
                  </label>
                ))
              )}
            </div>
            <div className="modal-actions">
              <button type="button" onClick={closeAssignModal}>Cancel</button>
              <button onClick={handleAssign} className="btn-primary">
                Assign Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Team Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete the team <strong>"{teamToDelete?.name}"</strong>?</p>
            <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>
              This action cannot be undone. All employee assignments to this team will be removed.
            </p>
            <div className="modal-actions" style={{ marginTop: '24px' }}>
              <button type="button" onClick={cancelDelete}>Cancel</button>
              <button onClick={confirmDelete} className="btn-danger">
                Yes, Delete Team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unassign Employee Confirmation Modal */}
      {showUnassignConfirm && (
        <div className="modal-overlay" onClick={cancelUnassign}>
          <div className="modal confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Confirm Unassign</h2>
            <p>Are you sure you want to remove <strong>{unassignData?.employeeName}</strong> from this team?</p>
            <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>
              They will no longer be a member of this team.
            </p>
            <div className="modal-actions" style={{ marginTop: '24px' }}>
              <button type="button" onClick={cancelUnassign}>Cancel</button>
              <button onClick={confirmUnassign} className="btn-danger">
                Yes, Remove Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;