import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { formatDate, formatTime, formatCurrency } from '../../utils/formatDate';
import { useClockIn } from '../../hooks/useClockIn';
import { useFreezeMembership } from '../../hooks/useFreezeMembership';
import './CustomerDetail.css';

const CustomerDetail = ({ customer, onClose, onUpdate }) => {
  const { classes, updateCustomer } = useData();
  const { clockIn } = useClockIn();
  const { freezeMembership, unfreezeMembership } = useFreezeMembership();
  
  const [showFreezeForm, setShowFreezeForm] = useState(false);
  const [freezeStart, setFreezeStart] = useState('');
  const [freezeEnd, setFreezeEnd] = useState('');
  const [freezeReason, setFreezeReason] = useState('');
  const [message, setMessage] = useState('');

  const handleClockIn = () => {
    const result = clockIn(customer.id);
    setMessage(result.success ? result.message : `Error: ${result.error}`);
    if (result.success) {
      setTimeout(() => setMessage(''), 3000);
      onUpdate();
    }
  };

  const handleFreeze = () => {
    if (!freezeStart || !freezeEnd) {
      setMessage('Please provide start and end dates');
      return;
    }
    
    const result = freezeMembership(customer.id, freezeStart, freezeEnd, freezeReason);
    setMessage(result.success ? result.message : `Error: ${result.error}`);
    
    if (result.success) {
      setShowFreezeForm(false);
      setFreezeStart('');
      setFreezeEnd('');
      setFreezeReason('');
      onUpdate();
    }
  };

  const handleUnfreeze = () => {
    const result = unfreezeMembership(customer.id);
    setMessage(result.success ? result.message : `Error: ${result.error}`);
    if (result.success) {
      onUpdate();
    }
  };

  const enrolledClassNames = customer.enrolledClasses
    ?.map(classId => {
      const cls = classes.find(c => c.id === classId);
      const sessions = customer.classSessions?.[classId] || 0;
      return cls ? { name: cls.name, id: classId, sessions } : null;
    })
    .filter(Boolean) || [];

  const totalSessions = customer.classSessions 
    ? Object.values(customer.classSessions).reduce((sum, val) => sum + val, 0)
    : customer.remainingSessions || 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{customer.name}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {message && (
          <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        <div className="modal-body">
          <div className="detail-section">
            <h3>Contact Information</h3>
            <p><strong>Phone:</strong> {customer.phone}</p>
            <p><strong>Email:</strong> {customer.email}</p>
          </div>

          <div className="detail-section">
            <h3>Membership Details</h3>
            <p><strong>Type:</strong> {customer.membershipType}</p>
            <p><strong>Status:</strong> <span className={`badge ${customer.status}`}>{customer.status}</span></p>
            <p className="fee-highlight-detail"><strong>Monthly Fee:</strong> <span className="fee-amount-large">{formatCurrency(customer.subscriptionFee || 0)}</span></p>
            <p><strong>Start Date:</strong> {formatDate(customer.startDate)}</p>
            <p><strong>End Date:</strong> {formatDate(customer.endDate)}</p>
            <p><strong>Total Remaining Sessions:</strong> {totalSessions}</p>
          </div>

          <div className="detail-section">
            <h3>Enrolled Classes & Sessions</h3>
            {enrolledClassNames.length > 0 ? (
              <ul className="class-list">
                {enrolledClassNames.map((classInfo, idx) => (
                  <li key={idx}>
                    <span className="class-name">{classInfo.name}</span>
                    <span className="class-sessions">{classInfo.sessions} sessions</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-state">Not enrolled in any classes</p>
            )}
          </div>

          <div className="detail-section">
            <h3>Recent Attendance</h3>
            {customer.attendanceLog && customer.attendanceLog.length > 0 ? (
              <div className="attendance-list">
                {customer.attendanceLog.slice(-5).reverse().map((log, idx) => (
                  <div key={idx} className="attendance-item">
                    <span>{formatDate(log.timestamp)}</span>
                    <span>{formatTime(log.timestamp)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-state">No attendance records</p>
            )}
          </div>

          {customer.freezePeriods && customer.freezePeriods.length > 0 && (
            <div className="detail-section">
              <h3>Freeze History</h3>
              {customer.freezePeriods.map((freeze, idx) => (
                <div key={idx} className="freeze-record">
                  <p><strong>{formatDate(freeze.startDate)} - {formatDate(freeze.endDate)}</strong></p>
                  {freeze.reason && <p className="freeze-reason">{freeze.reason}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="primary" onClick={handleClockIn}>
            Clock In
          </button>
          
          {customer.status === 'frozen' ? (
            <button className="secondary" onClick={handleUnfreeze}>
              Unfreeze Membership
            </button>
          ) : (
            <button className="secondary" onClick={() => setShowFreezeForm(!showFreezeForm)}>
              {showFreezeForm ? 'Cancel Freeze' : 'Freeze Membership'}
            </button>
          )}
        </div>

        {showFreezeForm && (
          <div className="freeze-form">
            <h3>Freeze Membership</h3>
            <div className="form-group">
              <label>Start Date</label>
              <input 
                type="date" 
                value={freezeStart} 
                onChange={(e) => setFreezeStart(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input 
                type="date" 
                value={freezeEnd} 
                onChange={(e) => setFreezeEnd(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label>Reason (Optional)</label>
              <textarea 
                value={freezeReason} 
                onChange={(e) => setFreezeReason(e.target.value)}
                placeholder="Medical, travel, etc."
              />
            </div>
            <button className="primary" onClick={handleFreeze}>
              Confirm Freeze
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDetail;
