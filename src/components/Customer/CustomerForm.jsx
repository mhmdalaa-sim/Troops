import { useState } from 'react';
import { useData } from '../../context/DataContext';
import './CustomerForm.css';

const CustomerForm = ({ onClose, onSubmit }) => {
  const { addCustomer } = useData();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    membershipType: 'Monthly Premium',
    subscriptionFee: 150,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    remainingSessions: 12,
    enrolledClasses: []
  });

  const [errors, setErrors] = useState({});

  const membershipOptions = [
    { name: 'Monthly Premium', sessions: 12, months: 1, fee: 150 },
    { name: 'Monthly Basic', sessions: 8, months: 1, fee: 100 },
    { name: '3-Month Premium', sessions: 36, months: 3, fee: 400 },
    { name: '3-Month Basic', sessions: 24, months: 3, fee: 270 },
    { name: '6-Month Premium', sessions: 72, months: 6, fee: 750 },
    { name: '6-Month Basic', sessions: 48, months: 6, fee: 500 },
    { name: 'Annual Premium', sessions: 144, months: 12, fee: 1400 },
    { name: 'Custom', sessions: 0, months: 0, fee: 0 }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-calculate end date and sessions based on membership type
    if (name === 'membershipType') {
      const selected = membershipOptions.find(opt => opt.name === value);
      if (selected && selected.name !== 'Custom') {
        const start = new Date(formData.startDate);
        start.setMonth(start.getMonth() + selected.months);
        setFormData(prev => ({
          ...prev,
          endDate: start.toISOString().split('T')[0],
          remainingSessions: selected.sessions,
          subscriptionFee: selected.fee
        }));
      }
    }
    
    if (name === 'startDate') {
      const selected = membershipOptions.find(opt => opt.name === formData.membershipType);
      if (selected && selected.name !== 'Custom') {
        const start = new Date(value);
        start.setMonth(start.getMonth() + selected.months);
        setFormData(prev => ({
          ...prev,
          startDate: value,
          endDate: start.toISOString().split('T')[0]
        }));
      }
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (formData.remainingSessions <= 0) newErrors.remainingSessions = 'Sessions must be greater than 0';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    const newCustomer = addCustomer(formData);
    onSubmit(newCustomer);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Register New Customer</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="customer-form">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Smith"
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="555-0101"
              />
              {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Membership Type *</label>
            <select
              name="membershipType"
              value={formData.membershipType}
              onChange={handleChange}
            >
              {membershipOptions.map(opt => (
                <option key={opt.name} value={opt.name}>
                  {opt.name} {opt.fee > 0 ? `- $${opt.fee}` : ''} {opt.sessions > 0 ? `(${opt.sessions} sessions)` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Monthly Subscription Fee *</label>
            <input
              type="number"
              name="subscriptionFee"
              value={formData.subscriptionFee}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="150.00"
            />
            {errors.subscriptionFee && <span className="error-text">{errors.subscriptionFee}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
              />
              {errors.startDate && <span className="error-text">{errors.startDate}</span>}
            </div>

            <div className="form-group">
              <label>End Date *</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
              />
              {errors.endDate && <span className="error-text">{errors.endDate}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Sessions Included *</label>
            <input
              type="number"
              name="remainingSessions"
              value={formData.remainingSessions}
              onChange={handleChange}
              min="1"
            />
            {errors.remainingSessions && <span className="error-text">{errors.remainingSessions}</span>}
          </div>

          <div className="form-actions">
            <button type="button" className="secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary">
              Register Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm;
