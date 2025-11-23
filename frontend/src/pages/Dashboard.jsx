import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    employees: 0,
    teams: 0,
    recentLogs: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [employeesRes, teamsRes, logsRes] = await Promise.all([
        api.get('/employees'),
        api.get('/teams'),
        api.get('/logs?limit=5')
      ]);

      setStats({
        employees: employeesRes.data.data.length,
        teams: teamsRes.data.data.length,
        recentLogs: logsRes.data.data
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p className="welcome-text">Welcome, {user.name}!</p>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Employees</h3>
          <div className="stat-number">{stats.employees}</div>
        </div>
        <div className="stat-card">
          <h3>Total Teams</h3>
          <div className="stat-number">{stats.teams}</div>
        </div>
        <div className="stat-card">
          <h3>Organisation</h3>
          <div className="stat-text">{user.organisation.name}</div>
        </div>
      </div>

      <div className="recent-activity">
        <h2>Recent Activity</h2>
        {stats.recentLogs.length === 0 ? (
          <p>No recent activity</p>
        ) : (
          <div className="logs-list">
            {stats.recentLogs.map((log) => (
              <div key={log.id} className="log-item">
                <span className="log-action">{log.action.replace(/_/g, ' ')}</span>
                <span className="log-user">{log.User?.name || 'System'}</span>
                <span className="log-time">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;