import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, switchRole } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊', roles: ['owner', 'receptionist'] },
    { path: '/customers', label: 'Customers', icon: '👥', roles: ['owner', 'receptionist'] },
    { path: '/classes', label: 'Classes', icon: '🥋', roles: ['owner', 'receptionist'] },
    { path: '/attendance', label: 'Attendance', icon: '✓', roles: ['receptionist'] }
  ];

  const visibleNavItems = navItems.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">🥋</span>
        <span className="brand-text">Gym Manager</span>
      </div>

      <div className="navbar-nav">
        {visibleNavItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </div>

      <div className="navbar-user">
        <div className="user-info">
          <div className="user-name">{user?.name}</div>
          <div className="user-role">{user?.role}</div>
        </div>
        
        <div className="user-actions">
          {user?.role === 'owner' && (
            <button 
              className="secondary role-switch-btn"
              onClick={() => switchRole('receptionist')}
              title="Switch to Receptionist view"
            >
              📋
            </button>
          )}
          {user?.role === 'receptionist' && (
            <button 
              className="secondary role-switch-btn"
              onClick={() => switchRole('owner')}
              title="Switch to Owner view"
            >
              👔
            </button>
          )}
          <button className="danger" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
