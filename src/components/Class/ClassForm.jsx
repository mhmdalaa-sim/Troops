import { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import './ClassForm.css';

const ClassForm = ({ classData, onClose }) => {
  const { addClass, updateClass } = useData();
  
  const [formData, setFormData] = useState({
    name: '',
    instructor: '',
    schedule: '',
    capacity: 20,
    description: '',
    sessionsPerVisit: 1,
    monthlyFee: 100,
    dropInFee: 20
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (classData) {
      setFormData({
        name: classData.name,
        instructor: classData.instructor,
        schedule: classData.schedule,
        capacity: classData.capacity,
        description: classData.description,
        sessionsPerVisit: classData.sessionsPerVisit || 1,
        monthlyFee: classData.monthlyFee || 100,
        dropInFee: classData.dropInFee || 20
      });
    }
  }, [classData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Class name is required';
    if (!formData.instructor.trim()) newErrors.instructor = 'Instructor is required';
    if (!formData.schedule.trim()) newErrors.schedule = 'Schedule is required';
    if (formData.capacity <= 0) newErrors.capacity = 'Capacity must be greater than 0';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    if (classData) {
      updateClass(classData.id, formData);
    } else {
      addClass(formData);
    }
    
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{classData ? 'Edit Class' : 'Add New Class'}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="class-form">
          <div className="form-group">
            <label>Class Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Brazilian Jiu-Jitsu"
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>Instructor *</label>
            <input
              type="text"
              name="instructor"
              value={formData.instructor}
              onChange={handleChange}
              placeholder="Master Carlos"
            />
            {errors.instructor && <span className="error-text">{errors.instructor}</span>}
          </div>

          <div className="form-group">
            <label>Schedule *</label>
            <input
              type="text"
              name="schedule"
              value={formData.schedule}
              onChange={handleChange}
              placeholder="Mon, Wed, Fri - 6:00 PM"
            />
            {errors.schedule && <span className="error-text">{errors.schedule}</span>}
          </div>

          <div className="form-group">
            <label>Capacity *</label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              min="1"
            />
            {errors.capacity && <span className="error-text">{errors.capacity}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Sessions Per Visit *</label>
              <input
                type="number"
                name="sessionsPerVisit"
                value={formData.sessionsPerVisit}
                onChange={handleChange}
                min="1"
              />
            </div>

            <div className="form-group">
              <label>Monthly Fee ($) *</label>
              <input
                type="number"
                name="monthlyFee"
                value={formData.monthlyFee}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Drop-In Fee ($) *</label>
            <input
              type="number"
              name="dropInFee"
              value={formData.dropInFee}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="20.00"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of the class..."
              rows="4"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary">
              {classData ? 'Update Class' : 'Create Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassForm;
