import { useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import html2canvas from 'html2canvas';
import { useData } from '../context/DataContext';
import { useClockIn } from '../hooks/useClockIn';
import { formatDate, formatTime, formatCurrency } from '../utils/formatDate';
import './CustomerProfilePage.css';

const CustomerProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCustomer, classes, addSessions } = useData();
  const { clockIn } = useClockIn();

  const [selectedClassId, setSelectedClassId] = useState('');
  const [newSessionCount, setNewSessionCount] = useState('');
  const [newSessionClassId, setNewSessionClassId] = useState('');
  const [message, setMessage] = useState('');
  const cardRef = useRef(null);

  const customerId = useMemo(() => {
    const parsed = parseInt(id, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }, [id]);

  const customer = customerId != null ? getCustomer(customerId) : null;

  const profileUrl = useMemo(() => {
    if (!customer) return '';
    return `${window.location.origin}/customers/${customer.id}`;
  }, [customer]);

  if (!customer) {
    return (
      <div className="customer-profile-page">
        <div className="customer-profile-header">
          <button className="secondary" onClick={() => navigate('/customers')}>
            ← Back to Customers
          </button>
        </div>
        <div className="empty-state-large">
          <h2>Customer not found</h2>
          <p>The customer you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  const enrolledClassDetails = customer.enrolledClasses
    ?.map((classId) => {
      const cls = classes.find((c) => c.id === classId);
      const sessions = customer.classSessions?.[classId] || 0;
      return cls
        ? {
            id: classId,
            name: cls.name,
            schedule: cls.schedule,
            sessions,
            sessionsPerVisit: cls.sessionsPerVisit || 1,
          }
        : null;
    })
    .filter(Boolean) || [];

  const totalSessions = customer.classSessions
    ? Object.values(customer.classSessions).reduce((sum, val) => sum + val, 0)
    : customer.remainingSessions || 0;

  const handleClockIn = () => {
    if (!selectedClassId) {
      setMessage('Please select a class to clock in.');
      return;
    }

    const result = clockIn(customer.id, parseInt(selectedClassId, 10));
    setMessage(result.success ? result.message : `Error: ${result.error}`);

    if (result.success) {
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const handleShareWhatsApp = () => {
    const rawPhone = customer.phone || '';
    let cleanedPhone = rawPhone.replace(/\D/g, '');

    if (!cleanedPhone) {
      setMessage('Error: Customer phone number is missing or invalid.');
      return;
    }

    // Normalize common international/local formats for WhatsApp links.
    // Examples:
    //  - +20 12 06151914  -> 201206151914
    //  - 01206151914      -> 201206151914 (replace leading 0 with country code 20)
    //  - 00201206151914   -> 201206151914 (strip leading 00)
    if (cleanedPhone.startsWith('00')) {
      cleanedPhone = cleanedPhone.replace(/^00/, '');
    }

    if (cleanedPhone.startsWith('0')) {
      // Assume Egyptian local number like 0XXXXXXXXXX -> prepend country code 20
      cleanedPhone = `20${cleanedPhone.slice(1)}`;
    }

    const lines = [
      `Your virtual gym card, ${customer.name}:`,
      profileUrl,
    ];

    if (customer.photoUrl) {
      lines.push(`Photo: ${customer.photoUrl}`);
    }

    const text = encodeURIComponent(lines.join('\n'));
    const url = `https://wa.me/${cleanedPhone}?text=${text}`;
    window.open(url, '_blank');
  };

  const handleDownloadCardImage = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${customer.name.replace(/\s+/g, '_')}_virtual_card.png`;
      link.click();

      setMessage('Virtual card image downloaded. You can now send it via WhatsApp as a photo.');
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      setMessage('Error: Could not generate card image.');
    }
  };

  const handleAddSessions = () => {
    if (!newSessionCount) {
      setMessage('Please enter how many sessions to add.');
      return;
    }

    const result = addSessions(
      customer.id,
      newSessionCount,
      newSessionClassId || null
    );

    setMessage(result.success ? `Added ${result.sessionsAdded} sessions.` : `Error: ${result.error}`);
    if (result.success) {
      setNewSessionCount('');
      // keep selected class for convenience
    }
  };

  return (
    <div className="customer-profile-page" ref={cardRef}>
      <div className="customer-profile-header">
        <button className="secondary" onClick={() => navigate('/customers')}>
          ← Back to Customers
        </button>
        <div>
          <h1>{customer.name}</h1>
          <p className="customer-profile-id">ID: {customer.id}</p>
        </div>
        <div className="header-actions">
          <button className="secondary" onClick={handleDownloadCardImage}>
            Download card image
          </button>
          <button className="secondary" onClick={handleShareWhatsApp}>
            Share via WhatsApp
          </button>
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="customer-profile-content">
        <div className="customer-card-panel card">
          <div className="customer-main-info">
            <div className="customer-photo">
              {customer.photoUrl ? (
                <img src={customer.photoUrl} alt={customer.name} />
              ) : (
                <div className="photo-placeholder">
                  <span>{customer.name.charAt(0)}</span>
                </div>
              )}
            </div>

            <div className="customer-details">
              <h2>Contact</h2>
              <p>
                <strong>Phone:</strong> {customer.phone}
              </p>
              <p>
                <strong>Email:</strong> {customer.email}
              </p>
              <p>
                <strong>Status:</strong>{' '}
                <span className={`badge ${customer.status}`}>{customer.status}</span>
              </p>
            </div>
          </div>

          <div className="membership-section">
            <h2>Membership</h2>
            <p>
              <strong>Type:</strong> {customer.membershipType}
            </p>
            <p>
              <strong>Monthly Fee:</strong>{' '}
              <span className="fee-amount-large">
                {formatCurrency(customer.subscriptionFee || 0)}
              </span>
            </p>
            <p>
              <strong>Start Date:</strong> {formatDate(customer.startDate)}
            </p>
            <p>
              <strong>End Date:</strong> {formatDate(customer.endDate)}
            </p>
            <p>
              <strong>Total Remaining Sessions:</strong> {totalSessions}
            </p>
          </div>
        </div>

        <div className="customer-qr-panel card">
          <h2>Virtual Card (Scan QR)</h2>
          <div className="qr-wrapper">
            <QRCode value={profileUrl} size={192} />
          </div>
          <p className="qr-help-text">
            Receptionist can scan this QR code to open this page instantly and clock the customer in.
          </p>

          <div className="clockin-section">
            <h3>Quick Clock In</h3>
            <div className="form-group">
              <label>Select Class</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
              >
                <option value="">-- Select Class --</option>
                {enrolledClassDetails.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} - {cls.schedule} ({cls.sessions} sessions, -{cls.sessionsPerVisit}{' '}
                    per visit)
                  </option>
                ))}
              </select>
              {enrolledClassDetails.length === 0 && (
                <span className="empty-state">
                  This customer is not enrolled in any classes yet.
                </span>
              )}
            </div>
            <button className="primary clock-in-btn" onClick={handleClockIn}>
              🥋 Clock In
            </button>
          </div>
        </div>
      </div>

      <div className="customer-profile-lower">
        <div className="detail-section card">
          <h2>Enrolled Classes & Sessions</h2>
          {enrolledClassDetails.length > 0 ? (
            <ul className="class-list">
              {enrolledClassDetails.map((cls) => (
                <li key={cls.id}>
                  <div className="class-name">{cls.name}</div>
                  <div className="class-meta">
                    <span>{cls.schedule}</span>
                    <span>{cls.sessions} sessions remaining</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state">Not enrolled in any classes</p>
          )}
        </div>

        <div className="detail-section card">
          <h2>Recent Attendance</h2>
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

        <div className="detail-section card">
          <h2>Add Individual Sessions</h2>
          <p className="helper-text">
            Use this to add session packs for this customer, even if they do not have a subscription.
          </p>
          <div className="form-row">
            <div className="form-group">
              <label>Number of sessions</label>
              <input
                type="number"
                min="1"
                value={newSessionCount}
                onChange={(e) => setNewSessionCount(e.target.value)}
                placeholder="e.g. 5"
              />
            </div>
            <div className="form-group">
              <label>Apply to class (optional)</label>
              <select
                value={newSessionClassId}
                onChange={(e) => setNewSessionClassId(e.target.value)}
              >
                <option value="">General drop-in (no specific class)</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button className="primary" onClick={handleAddSessions}>
            Add sessions
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfilePage;

