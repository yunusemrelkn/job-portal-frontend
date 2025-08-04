import React, { useState } from 'react';
import api from '../services/api';

interface PasswordChangeFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const PasswordChangeForm: React.FC<PasswordChangeFormProps> = ({ 
  onSuccess, 
  onCancel 
}) => {
  const [formData, setFormData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const validateForm = (): string[] => {
    const newErrors: string[] = [];

    if (!formData.currentPassword) {
      newErrors.push('Current password is required');
    }

    if (!formData.newPassword) {
      newErrors.push('New password is required');
    } else if (formData.newPassword.length < 6) {
      newErrors.push('New password must be at least 6 characters long');
    }

    if (!formData.confirmPassword) {
      newErrors.push('Password confirmation is required');
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.push('New passwords do not match');
    }

    if (formData.currentPassword === formData.newPassword && formData.currentPassword) {
      newErrors.push('New password must be different from current password');
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors([]);

    try {
      await api.post('/users/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });

      // Clear form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      alert('Password changed successfully!');
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error changing password';
      setErrors([errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setErrors([]);
    onCancel?.();
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const getPasswordStrength = (password: string): { strength: string; color: string; width: string } => {
    if (password.length === 0) return { strength: '', color: '#e5e7eb', width: '0%' };
    if (password.length < 6) return { strength: 'Weak', color: '#ef4444', width: '25%' };
    if (password.length < 8) return { strength: 'Fair', color: '#f59e0b', width: '50%' };
    if (password.length < 12) return { strength: 'Good', color: '#10b981', width: '75%' };
    return { strength: 'Strong', color: '#059669', width: '100%' };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: '0 0 0.5rem 0', color: '#111827' }}>
          Change Password
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
          Choose a strong password to keep your account secure.
        </p>
      </div>

      {errors.length > 0 && (
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '0.375rem',
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ color: '#dc2626' }}>⚠️</span>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#dc2626', margin: 0 }}>
              Please fix the following errors:
            </h3>
          </div>
          <ul style={{ margin: 0, paddingLeft: '1rem', color: '#dc2626', fontSize: '0.875rem' }}>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Current Password */}
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
            Current Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPasswords.current ? 'text' : 'password'}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                paddingRight: '3rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                outline: 'none'
              }}
              value={formData.currentPassword}
              onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
              placeholder="Enter your current password"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: '#6b7280'
              }}
            >
              {showPasswords.current ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
            New Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPasswords.new ? 'text' : 'password'}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                paddingRight: '3rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                outline: 'none'
              }}
              value={formData.newPassword}
              onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
              placeholder="Enter your new password"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: '#6b7280'
              }}
            >
              {showPasswords.new ? '🙈' : '👁️'}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {formData.newPassword && (
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Password Strength:</span>
                <span style={{ fontSize: '0.75rem', color: passwordStrength.color, fontWeight: '500' }}>
                  {passwordStrength.strength}
                </span>
              </div>
              <div style={{
                width: '100%',
                height: '4px',
                backgroundColor: '#e5e7eb',
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: passwordStrength.width,
                  height: '100%',
                  backgroundColor: passwordStrength.color,
                  transition: 'width 0.3s ease, background-color 0.3s ease'
                }} />
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
            Confirm New Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPasswords.confirm ? 'text' : 'password'}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                paddingRight: '3rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                outline: 'none'
              }}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              placeholder="Confirm your new password"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: '#6b7280'
              }}
            >
              {showPasswords.confirm ? '🙈' : '👁️'}
            </button>
          </div>
          
          {/* Password Match Indicator */}
          {formData.confirmPassword && (
            <div style={{ marginTop: '0.5rem' }}>
              <span style={{
                fontSize: '0.75rem',
                color: formData.newPassword === formData.confirmPassword ? '#059669' : '#dc2626'
              }}>
                {formData.newPassword === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
              </span>
            </div>
          )}
        </div>

        {/* Password Requirements */}
        <div style={{
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '0.375rem',
          padding: '1rem'
        }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
            Password Requirements:
          </h4>
          <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.75rem', color: '#6b7280' }}>
            <li style={{ color: formData.newPassword.length >= 6 ? '#059669' : '#6b7280' }}>
              At least 6 characters long
            </li>
            <li style={{ color: formData.newPassword !== formData.currentPassword && formData.newPassword ? '#059669' : '#6b7280' }}>
              Different from current password
            </li>
            <li style={{ color: formData.newPassword === formData.confirmPassword && formData.confirmPassword ? '#059669' : '#6b7280' }}>
              Passwords must match
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: loading ? '#9ca3af' : '#2563eb',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.375rem',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '500',
              flex: 1
            }}
          >
            {loading ? 'Changing Password...' : 'Change Password'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            style={{
              backgroundColor: '#6b7280',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.375rem',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500',
              flex: 1
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PasswordChangeForm;