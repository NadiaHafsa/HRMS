import { useEffect, useState } from 'react';
import api from '../services/api';
import './Logs.css';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await api.get('/logs?limit=100');
      setLogs(response.data.data);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading logs...</div>;

  return (
    <div className="logs-page">
      <h1>Activity Logs</h1>
      
      <div className="logs-container">
        {logs.length === 0 ? (
          <p>No logs found</p>
        ) : (
          <table className="logs-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>User</th>
                <th>Action</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                  <td>{log.User?.name || 'System'}</td>
                  <td className="action-cell">{log.action.replace(/_/g, ' ')}</td>
                  <td>
                    {log.meta && Object.keys(log.meta).length > 0 && (
                      <code>{JSON.stringify(log.meta, null, 2)}</code>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Logs;