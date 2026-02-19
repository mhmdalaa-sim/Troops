import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useClockIn } from '../../hooks/useClockIn';
import { formatTime } from '../../utils/formatDate';
import './AttendanceTracker.css';

const AttendanceTracker = () => {
  const { customers, classes, attendanceRecords } = useData();
  const { clockIn } = useClockIn();
  
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.id.toString().includes(searchTerm)
  );

  // Get enrolled classes for selected customer
  const selectedCustomer = selectedCustomerId ? customers.find(c => c.id === parseInt(selectedCustomerId)) : null;
  const enrolledClasses = selectedCustomer
    ? classes // show all classes in the dropdown; enrollment will be automatic on check-in
    : [];

  const handleClockIn = () => {
    if (!selectedCustomerId) {
      setMessage('Please select a customer');
      return;
    }

    if (!selectedClassId) {
      setMessage('Please select a class for check-in');
      return;
    }

    const result = clockIn(
      parseInt(selectedCustomerId),
      parseInt(selectedClassId)
    );

    setMessage(result.success ? result.message : `Error: ${result.error}`);
    
    if (result.success) {
      setSelectedCustomerId('');
      setSelectedClassId('');
      setSearchTerm('');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  // Get today's attendance
  const today = new Date().toDateString();
  const todayAttendance = attendanceRecords.filter(record =>
    new Date(record.timestamp).toDateString() === today
  );

  return (
    <div className="attendance-tracker-container">
      <div className="tracker-section">
        <h2>Clock In Customer</h2>
        
        {message && (
          <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        <div className="clock-in-form">
          <div className="form-group">
            <label>Search Customer</label>
            <input
              type="text"
              placeholder="Search by name, phone, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Select Customer *</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => {
                setSelectedCustomerId(e.target.value);
                setSelectedClassId(''); // Reset class selection when customer changes
              }}
            >
              <option value="">-- Select Customer --</option>
              {(searchTerm ? filteredCustomers : customers).map(customer => {
                const totalSessions = customer.classSessions 
                  ? Object.values(customer.classSessions).reduce((sum, val) => sum + val, 0)
                  : customer.remainingSessions || 0;
                return (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone} ({totalSessions} total sessions)
                  </option>
                );
              })}
            </select>
          </div>

          <div className="form-group">
            <label>Select Class *</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              disabled={!selectedCustomerId}
            >
              <option value="">-- Select Class --</option>
              {enrolledClasses.map(cls => {
                const sessionsForClass = selectedCustomer?.classSessions?.[cls.id] || 0;
                const isEnrolled = (selectedCustomer?.enrolledClasses || []).map(Number).includes(cls.id);
                return (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} - {cls.schedule} ({sessionsForClass} sessions available, -{cls.sessionsPerVisit || 1} per visit){!isEnrolled ? ' — will enroll on first check-in' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <button className="primary clock-in-btn" onClick={handleClockIn}>
            🥋 Clock In
          </button>
        </div>
      </div>

      <div className="tracker-section">
        <h2>Today's Attendance ({todayAttendance.length})</h2>
        
        {todayAttendance.length > 0 ? (
          <div className="attendance-records">
            {todayAttendance.slice().reverse().map((record, idx) => {
              const customer = customers.find(c => c.id === record.customerId);
              const classInfo = record.classId 
                ? classes.find(c => c.id === record.classId)
                : null;
              
              return (
                <div key={idx} className="attendance-record card">
                  <div className="record-time">{formatTime(record.timestamp)}</div>
                  <div className="record-details">
                    <div className="record-name">{customer?.name || 'Unknown'}</div>
                    <div className="record-class">
                      {classInfo ? `${classInfo.name} (-${classInfo.sessionsPerVisit || 1} session${(classInfo.sessionsPerVisit || 1) > 1 ? 's' : ''})` : 'No Class'}
                    </div>
                  </div>
                  <div className="record-badge">✓</div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="empty-state">No attendance records for today</p>
        )}
      </div>
    </div>
  );
};

export default AttendanceTracker;
