import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatDate';
import ClassForm from './ClassForm';
import './ClassList.css';

const ClassList = () => {
  const { classes, deleteClass } = useData();
  const { isOwner } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);

  const handleEdit = (classData) => {
    setEditingClass(classData);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      deleteClass(id);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingClass(null);
  };

  return (
    <div className="class-list-container">
      <div className="class-list-header">
        <h2>Classes</h2>
        {isOwner && (
          <button className="primary" onClick={() => setShowForm(true)}>
            + Add New Class
          </button>
        )}
      </div>

      <div className="class-grid">
        {classes.map(cls => (
          <div key={cls.id} className="class-card card">
            <div className="class-card-header">
              <h3>{cls.name}</h3>
              <div className="capacity-badge">
                {cls.enrolledCount}/{cls.capacity}
              </div>
            </div>

            <div className="class-card-body">
              <div className="class-info">
                <span className="label">👨‍🏫 Instructor:</span>
                <span>{cls.instructor}</span>
              </div>
              <div className="class-info">
                <span className="label">📅 Schedule:</span>
                <span>{cls.schedule}</span>
              </div>
              <div className="class-info fee-highlight">
                <span className="label">💵 Monthly Fee:</span>
                <span className="fee-text">{formatCurrency(cls.monthlyFee || 0)}</span>
              </div>
              <div className="class-info">
                <span className="label">🎟️ Drop-In Fee:</span>
                <span>{formatCurrency(cls.dropInFee || 0)}</span>
              </div>
              <div className="class-info">
                <span className="label">🔢 Sessions/Visit:</span>
                <span>{cls.sessionsPerVisit || 1}</span>
              </div>
              <div className="class-info">
                <span className="label">📝 Description:</span>
                <span className="description">{cls.description}</span>
              </div>
              
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${(cls.enrolledCount / cls.capacity) * 100}%`,
                    backgroundColor: cls.enrolledCount >= cls.capacity 
                      ? 'var(--color-danger)' 
                      : 'var(--color-primary)'
                  }}
                />
              </div>
              <p className="enrollment-text">
                {cls.enrolledCount >= cls.capacity ? 'Class Full' : `${cls.capacity - cls.enrolledCount} spots available`}
              </p>
            </div>

            <div className="class-card-actions">
              {isOwner && (
                <>
                  <button className="secondary" onClick={() => handleEdit(cls)}>
                    Edit
                  </button>
                  <button className="danger" onClick={() => handleDelete(cls.id)}>
                    Delete
                  </button>
                </>
              )}
              {!isOwner && (
                <div className="view-only-notice">View Only - Owner can edit</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {classes.length === 0 && (
        <div className="empty-state-large">
          <h3>No Classes Yet</h3>
          <p>Add your first class to get started</p>
        </div>
      )}

      {showForm && (
        <ClassForm 
          classData={editingClass} 
          onClose={handleCloseForm} 
        />
      )}
    </div>
  );
};

export default ClassList;
