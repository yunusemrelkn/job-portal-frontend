// src/pages/ProfilePage.tsx - Complete ProfilePage with Password Change
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getRoleString } from '../types';
import api from '../services/api';
import PasswordChangeForm from '../components/PasswordChangeForm';

interface UpdateProfileForm {
  name: string;
  surname: string;
  phone: string;
}

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UpdateProfileForm>({
    name: '',
    surname: '',
    phone: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        surname: user.surname,
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.put('/users/profile', formData);
      updateUser(response.data);
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert('Error updating profile: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name,
        surname: user.surname,
        phone: user.phone || ''
      });
    }
    setEditing(false);
  };

  const handlePasswordChangeSuccess = () => {
    setShowPasswordForm(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateEmploymentDuration = (startDate: string) => {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} days`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'}`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      return `${years} ${years === 1 ? 'year' : 'years'}${remainingMonths > 0 ? `, ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}` : ''}`;
    }
  };

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '3.75rem', marginBottom: '1rem' }}>🔒</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
          Please Log In
        </h2>
        <p style={{ color: '#6b7280' }}>You need to be logged in to view your profile.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827' }}>My Profile</h1>

      {/* Basic Profile Information */}
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>Personal Information</h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Edit Profile
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  First Name
                </label>
                <input
                  type="text"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    outline: 'none'
                  }}
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    outline: 'none'
                  }}
                  value={formData.surname}
                  onChange={(e) => setFormData({...formData, surname: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                Phone Number
              </label>
              <input
                type="tel"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  outline: 'none'
                }}
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+1-555-123-4567"
              />
            </div>

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
                  fontWeight: '500'
                }}
              >
                {loading ? 'Saving...' : 'Save Changes'}
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
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                First Name
              </label>
              <p style={{ margin: '0.25rem 0 0 0', color: '#111827' }}>{user.name}</p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                Last Name
              </label>
              <p style={{ margin: '0.25rem 0 0 0', color: '#111827' }}>{user.surname}</p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                Email Address
              </label>
              <p style={{ margin: '0.25rem 0 0 0', color: '#111827' }}>{user.email}</p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                Phone Number
              </label>
              <p style={{ margin: '0.25rem 0 0 0', color: '#111827' }}>{user.phone || 'Not provided'}</p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                Role
              </label>
              <p style={{ margin: '0.25rem 0 0 0', color: '#111827' }}>{getRoleString(user.role)}</p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                Member Since
              </label>
              <p style={{ margin: '0.25rem 0 0 0', color: '#111827' }}>
                {formatDate(user.createdAt)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Account Security Section */}
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>Account Security</h2>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <p style={{ margin: 0, fontWeight: '500', color: '#374151' }}>Password</p>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
              Keep your account secure with a strong password
            </p>
          </div>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            style={{
              backgroundColor: showPasswordForm ? '#dc2626' : '#f3f4f6',
              color: showPasswordForm ? 'white' : '#374151',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              border: '1px solid #d1d5db',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            {showPasswordForm ? 'Cancel' : 'Change Password'}
          </button>
        </div>

        {!showPasswordForm && (
          <div style={{
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '0.375rem',
            padding: '1rem'
          }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
              Security Tips:
            </h4>
            <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.75rem', color: '#6b7280' }}>
              <li>Use a unique password that you don't use elsewhere</li>
              <li>Include numbers, symbols, and both uppercase and lowercase letters</li>
              <li>Change your password if you suspect it has been compromised</li>
            </ul>
          </div>
        )}
      </div>

      {/* Password Change Form */}
      {showPasswordForm && (
        <PasswordChangeForm 
          onSuccess={handlePasswordChangeSuccess}
          onCancel={() => setShowPasswordForm(false)}
        />
      )}

      {/* Current Employment Section - Show for hired job seekers using EmploymentDto */}
      {user?.currentEmployment && (
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0, color: '#111827' }}>
              Current Employment
            </h2>
            <span style={{
              padding: '0.25rem 0.75rem',
              backgroundColor: '#d1fae5',
              color: '#065f46',
              fontSize: '0.75rem',
              borderRadius: '9999px',
              border: '1px solid #10b981',
              fontWeight: '500'
            }}>
              EMPLOYED ✓
            </span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                Company
              </label>
              <p style={{ margin: '0.25rem 0 0 0', color: '#111827', fontSize: '1rem', fontWeight: '500' }}>
                {user.currentEmployment.companyName}
              </p>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                Department
              </label>
              <p style={{ margin: '0.25rem 0 0 0', color: '#111827' }}>
                {user.currentEmployment.departmentName}
              </p>
            </div>
            
            {user.currentEmployment.companyLocation && (
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                  Office Location
                </label>
                <p style={{ margin: '0.25rem 0 0 0', color: '#111827' }}>
                  📍 {user.currentEmployment.companyLocation}
                </p>
              </div>
            )}
            
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                Employment Duration
              </label>
              <p style={{ margin: '0.25rem 0 0 0', color: '#111827' }}>
                {calculateEmploymentDuration(user.currentEmployment.startDate)}
              </p>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                Start Date
              </label>
              <p style={{ margin: '0.25rem 0 0 0', color: '#111827' }}>
                {formatDate(user.currentEmployment.startDate)}
              </p>
            </div>
          </div>
          
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '0.375rem'
          }}>
            <p style={{ fontSize: '0.875rem', color: '#15803d', margin: 0 }}>
              🎉 Congratulations! You are currently employed with <strong>{user.currentEmployment.companyName}</strong> 
              in the <strong>{user.currentEmployment.departmentName}</strong> department since {formatDate(user.currentEmployment.startDate)}.
            </p>
          </div>
        </div>
      )}
      
      {/* Job Search Status - Show for non-employed job seekers */}
      {getRoleString(user?.role) === 'JobSeeker' && !user?.currentEmployment && (
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0, color: '#111827' }}>
              Job Search Status
            </h2>
            <span style={{
              padding: '0.25rem 0.75rem',
              backgroundColor: '#eff6ff',
              color: '#1e40af',
              fontSize: '0.75rem',
              borderRadius: '9999px',
              border: '1px solid #bfdbfe',
              fontWeight: '500'
            }}>
              SEEKING OPPORTUNITIES
            </span>
          </div>
          
          <div style={{
            padding: '1rem',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '0.375rem',
            marginBottom: '1rem'
          }}>
            <p style={{ fontSize: '0.875rem', color: '#1e40af', margin: 0 }}>
              💼 You are currently seeking employment opportunities. 
              Continue applying to jobs and building your professional profile to increase your chances of getting hired.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => window.location.href = '/jobs'}
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Browse Jobs
            </button>
            <button
              onClick={() => window.location.href = '/suggestions'}
              style={{
                backgroundColor: '#059669',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Get Job Suggestions
            </button>
            <button
              onClick={() => window.location.href = '/cv'}
              style={{
                backgroundColor: '#7c3aed',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Update CV
            </button>
          </div>
        </div>
      )}

      {/* Company Information - Show for employers */}
      {getRoleString(user?.role) === 'Employer' && user?.companyName && (
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0, color: '#111827' }}>
              Company Information
            </h2>
            <span style={{
              padding: '0.25rem 0.75rem',
              backgroundColor: '#fef3c7',
              color: '#92400e',
              fontSize: '0.75rem',
              borderRadius: '9999px',
              border: '1px solid #fbbf24',
              fontWeight: '500'
            }}>
              EMPLOYER
            </span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                Company Name
              </label>
              <p style={{ margin: '0.25rem 0 0 0', color: '#111827', fontSize: '1rem', fontWeight: '500' }}>
                {user.companyName}
              </p>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                Your Role
              </label>
              <p style={{ margin: '0.25rem 0 0 0', color: '#111827' }}>
                Employer / Hiring Manager
              </p>
            </div>
          </div>
          
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: '#fef3c7',
            border: '1px solid #fbbf24',
            borderRadius: '0.375rem',
            marginBottom: '1rem'
          }}>
            <p style={{ fontSize: '0.875rem', color: '#92400e', margin: 0 }}>
              🏢 You are an employer at <strong>{user.companyName}</strong>. You can post jobs, review applications, and hire the best candidates for your company.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => window.location.href = '/employer/jobs'}
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Manage Jobs
            </button>
            <button
              onClick={() => window.location.href = '/employer/applications'}
              style={{
                backgroundColor: '#059669',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Review Applications
            </button>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default ProfilePage;