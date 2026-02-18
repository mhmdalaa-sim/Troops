import { formatDate, formatCurrency } from '../../utils/formatDate';
import './CustomerCard.css';

const CustomerCard = ({ customer, onClick }) => {
  const getStatusClass = (status) => {
    switch (status) {
      case 'active':
        return 'badge active';
      case 'frozen':
        return 'badge frozen';
      case 'expired':
        return 'badge expired';
      default:
        return 'badge';
    }
  };

  // Calculate total sessions across all classes
  const totalSessions = customer.classSessions 
    ? Object.values(customer.classSessions).reduce((sum, val) => sum + val, 0)
    : customer.remainingSessions || 0;

  const getSessionWarning = (remaining) => {
    if (remaining === 0) return 'session-warning critical';
    if (remaining < 5) return 'session-warning low';
    return '';
  };

  return (
    <div className="customer-card card" onClick={() => onClick(customer)}>
      <div className="customer-card-header">
        <div>
          <h3>{customer.name}</h3>
          <p className="customer-id">ID: {customer.id}</p>
        </div>
        <span className={getStatusClass(customer.status)}>
          {customer.status}
        </span>
      </div>

      <div className="customer-card-body">
        <div className="info-row">
          <span className="label">📞 Phone:</span>
          <span>{customer.phone}</span>
        </div>
        <div className="info-row">
          <span className="label">📧 Email:</span>
          <span>{customer.email}</span>
        </div>
        <div className="info-row">
          <span className="label">💳 Membership:</span>
          <span>{customer.membershipType}</span>
        </div>
        <div className="info-row fee-row">
          <span className="label">💵 Monthly Fee:</span>
          <span className="fee-amount">{formatCurrency(customer.subscriptionFee || 0)}</span>
        </div>
        <div className="info-row">
          <span className="label">📅 Valid Until:</span>
          <span>{formatDate(customer.endDate)}</span>
        </div>
        <div className={`info-row ${getSessionWarning(totalSessions)}`}>
          <span className="label">🎟️ Total Sessions:</span>
          <span className="sessions-count">{totalSessions}</span>
        </div>
      </div>

      <div className="customer-card-footer">
        <small>Enrolled in {customer.enrolledClasses?.length || 0} classes</small>
      </div>
    </div>
  );
};

export default CustomerCard;
