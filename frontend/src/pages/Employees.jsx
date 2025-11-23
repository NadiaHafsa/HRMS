import { useEffect, useState } from 'react';
import api from '../services/api';
import './Employees.css';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  });
  
  // Validation errors state
  const [errors, setErrors] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Validation functions
  const validateFirstName = (name) => {
    if (!name || name.trim() === '') {
      setErrors(prev => ({ ...prev, first_name: 'First name is required' }));
      return false;
    }
    if (name.trim().length < 2) {
      setErrors(prev => ({ ...prev, first_name: 'First name must be at least 2 characters' }));
      return false;
    }
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      setErrors(prev => ({ ...prev, first_name: 'First name should only contain letters' }));
      return false;
    }
    setErrors(prev => ({ ...prev, first_name: '' }));
    return true;
  };

  const validateLastName = (name) => {
    if (!name || name.trim() === '') {
      setErrors(prev => ({ ...prev, last_name: 'Last name is required' }));
      return false;
    }
    if (name.trim().length < 2) {
      setErrors(prev => ({ ...prev, last_name: 'Last name must be at least 2 characters' }));
      return false;
    }
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      setErrors(prev => ({ ...prev, last_name: 'Last name should only contain letters' }));
      return false;
    }
    setErrors(prev => ({ ...prev, last_name: '' }));
    return true;
  };

  const validateEmail = (email) => {
    if (!email || email.trim() === '') {
      setErrors(prev => ({ ...prev, email: '' })); // Email is optional
      return true;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email (e.g., name@example.com)' }));
      return false;
    }
    
    setErrors(prev => ({ ...prev, email: '' }));
    return true;
  };

  const validatePhone = (phone) => {
    if (!phone || phone.trim() === '') {
      setErrors(prev => ({ ...prev, phone: '' })); // Phone is optional
      return true;
    }
    
    // Remove spaces, dashes, and parentheses for validation
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    if (!/^\+?[\d]{10,15}$/.test(cleanPhone)) {
      setErrors(prev => ({ ...prev, phone: 'Phone should be 10-15 digits (e.g., 1234567890 or +911234567890)' }));
      return false;
    }
    
    setErrors(prev => ({ ...prev, phone: '' }));
    return true;
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data.data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const isFirstNameValid = validateFirstName(formData.first_name);
    const isLastNameValid = validateLastName(formData.last_name);
    const isEmailValid = validateEmail(formData.email);
    const isPhoneValid = validatePhone(formData.phone);
    
    if (!isFirstNameValid || !isLastNameValid || !isEmailValid || !isPhoneValid) {
      alert('Please fix all validation errors before submitting');
      return;
    }
    
    try {
      if (editingEmployee) {
        await api.put(`/employees/${editingEmployee.id}`, formData);
      } else {
        await api.post('/employees', formData);
      }
      fetchEmployees();
      closeModal();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Operation failed';
      alert(errorMessage);
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email || '',
      phone: employee.phone || ''
    });
    setErrors({ first_name: '', last_name: '', email: '', phone: '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await api.delete(`/employees/${id}`);
      fetchEmployees();
    } catch (error) {
      alert(error.response?.data?.message || 'Delete failed');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEmployee(null);
    setFormData({ first_name: '', last_name: '', email: '', phone: '' });
    setErrors({ first_name: '', last_name: '', email: '', phone: '' });
  };

  if (loading) return <div className="loading">Loading employees...</div>;

  return (
    <div className="employees-page">
      <div className="page-header">
        <h1>Employees</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          Add Employee
        </button>
      </div>

      <div className="employees-grid">
        {employees.length === 0 ? (
          <p>No employees found. Add your first employee!</p>
        ) : (
          employees.map((employee) => (
            <div key={employee.id} className="employee-card">
              <h3>{employee.first_name} {employee.last_name}</h3>
              <p>{employee.email || 'No email'}</p>
              <p>{employee.phone || 'No phone'}</p>
              <div className="teams-info">
                {employee.Teams?.length > 0 && (
                  <small>Teams: {employee.Teams.map(t => t.name).join(', ')}</small>
                )}
              </div>
              <div className="card-actions">
                <button onClick={() => handleEdit(employee)}>Edit</button>
                <button onClick={() => handleDelete(employee.id)} className="btn-danger">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingEmployee ? 'Edit Employee' : 'Add Employee'}</h2>
            <form onSubmit={handleSubmit}>
              
              {/* First Name Field */}
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, first_name: value });
                    validateFirstName(value);
                  }}
                  onBlur={() => validateFirstName(formData.first_name)}
                  style={errors.first_name ? { borderColor: '#dc2626' } : {}}
                  required
                />
                {errors.first_name && (
                  <small style={{ color: '#dc2626', display: 'block', marginTop: '4px' }}>
                    {errors.first_name}
                  </small>
                )}
              </div>

              {/* Last Name Field */}
              <div className="form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, last_name: value });
                    validateLastName(value);
                  }}
                  onBlur={() => validateLastName(formData.last_name)}
                  style={errors.last_name ? { borderColor: '#dc2626' } : {}}
                  required
                />
                {errors.last_name && (
                  <small style={{ color: '#dc2626', display: 'block', marginTop: '4px' }}>
                    {errors.last_name}
                  </small>
                )}
              </div>

              {/* Email Field */}
              <div className="form-group">
                <label>Email (optional)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, email: value });
                    validateEmail(value);
                  }}
                  onBlur={() => validateEmail(formData.email)}
                  style={errors.email ? { borderColor: '#dc2626' } : {}}
                />
                {errors.email && (
                  <small style={{ color: '#dc2626', display: 'block', marginTop: '4px' }}>
                    {errors.email}
                  </small>
                )}
              </div>

              {/* Phone Field */}
              <div className="form-group">
                <label>Phone (optional)</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, phone: value });
                    validatePhone(value);
                  }}
                  onBlur={() => validatePhone(formData.phone)}
                  style={errors.phone ? { borderColor: '#dc2626' } : {}}
                  placeholder="e.g., 1234567890 or +911234567890"
                />
                {errors.phone && (
                  <small style={{ color: '#dc2626', display: 'block', marginTop: '4px' }}>
                    {errors.phone}
                  </small>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" onClick={closeModal}>Cancel</button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={errors.first_name || errors.last_name || errors.email || errors.phone}
                >
                  {editingEmployee ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;