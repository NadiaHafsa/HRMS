import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          HRMS - {user.organisation.name}
        </Link>
        
        <div className="navbar-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/employees">Employees</Link>
          <Link to="/teams">Teams</Link>
          <Link to="/logs">Logs</Link>
        </div>

        <div className="navbar-user">
          <span className="user-name">{user.name}</span>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;