import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState('receptionist');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      login(selectedRole, name);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>🥋</h1>
          <h2>Martial Arts Gym</h2>
          <p>Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="form-group">
            <label>Select Role</label>
            <div className="role-options">
              <label className={`role-option ${selectedRole === 'receptionist' ? 'active' : ''}`}>
                <input
                  type="radio"
                  value="receptionist"
                  checked={selectedRole === 'receptionist'}
                  onChange={(e) => setSelectedRole(e.target.value)}
                />
                <div className="role-card">
                  <div className="role-icon">📋</div>
                  <div className="role-title">Receptionist</div>
                  <div className="role-desc">Manage check-ins & memberships</div>
                </div>
              </label>

              <label className={`role-option ${selectedRole === 'owner' ? 'active' : ''}`}>
                <input
                  type="radio"
                  value="owner"
                  checked={selectedRole === 'owner'}
                  onChange={(e) => setSelectedRole(e.target.value)}
                />
                <div className="role-card">
                  <div className="role-icon">👔</div>
                  <div className="role-title">Business Owner</div>
                  <div className="role-desc">View stats & manage classes</div>
                </div>
              </label>
            </div>
          </div>

          <button type="submit" className="primary login-btn">
            Enter System
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
