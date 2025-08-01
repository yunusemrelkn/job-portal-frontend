import React, { useState, useEffect } from 'react';
import { Application, getStatusString } from '../types';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { getRoleString } from '../types';

const ApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());
  const { user } = useAuth();

  useEffect(() => {
    if (user && getRoleString(user.role) === 'JobSeeker') {
      fetchApplications();
    } else if (user) {
      setLoading(false);
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/applications');
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveApplication = async (applicationId: number, jobTitle: string) => {
    const confirmMessage = `Are you sure you want to remove your application for "${jobTitle}"? This action cannot be undone.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setRemovingIds(prev => new Set(prev).add(applicationId));

    try {
      await api.delete(`/applications/${applicationId}`);
      
      // Remove from local state
      setApplications(prev => prev.filter(app => app.applicationId !== applicationId));
      
      // Show success message
      alert(`Your application for "${jobTitle}" has been removed successfully.`);
      
    } catch (error: any) {
      console.error('Error removing application:', error);
      const errorMessage = error.response?.data?.message || error.response?.data || 'Failed to remove application';
      alert(`Error: ${errorMessage}`);
    } finally {
      setRemovingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(applicationId);
        return newSet;
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const baseStyles = {
      padding: '0.5rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.875rem',
      fontWeight: '500'
    };
    
    switch (status) {
      case 'Pending':
        return { ...baseStyles, backgroundColor: '#fef3c7', color: '#92400e' };
      case 'Accepted':
        return { ...baseStyles, backgroundColor: '#d1fae5', color: '#065f46' };
      case 'Rejected':
        return { ...baseStyles, backgroundColor: '#fee2e2', color: '#991b1b' };
      default:
        return { ...baseStyles, backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  const canRemoveApplication = (status: string) => {
    // Only allow removal of pending applications
    return status === 'Pending';
  };

  const userRole = user ? getRoleString(user.role) : null;

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '3.75rem', marginBottom: '1rem' }}>🔒</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
          Please Log In
        </h2>
        <p style={{ color: '#6b7280' }}>You need to be logged in to view your applications.</p>
      </div>
    );
  }

  if (userRole !== 'JobSeeker') {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '3.75rem', marginBottom: '1rem' }}>⚠️</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
          Access Denied
        </h2>
        <p style={{ color: '#6b7280' }}>This page is only accessible to job seekers.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem' }}>
        <div>Loading applications...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827' }}>My Applications</h1>
        
        {applications.length > 0 && (
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Total: {applications.length} applications
            {applications.filter(app => app.status === 'Pending').length > 0 && (
              <span style={{ marginLeft: '1rem', color: '#92400e' }}>
                ({applications.filter(app => app.status === 'Pending').length} pending)
              </span>
            )}
          </div>
        )}
      </div>
      
      {applications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3.75rem', marginBottom: '1rem' }}>📋</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
            No Applications Yet
          </h3>
          <p style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>
            You haven't applied to any jobs yet. Start browsing jobs and apply to positions that interest you.
          </p>
          <button
            onClick={() => window.location.href = '/jobs'}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.375rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Browse Jobs
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {applications.map((application) => (
            <div key={application.applicationId} style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              padding: '1.5rem',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '1rem',
                flexWrap: 'wrap'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827' }}>
                      {application.jobTitle}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={getStatusBadge(getStatusString(application.status))}>
                        {getStatusString(application.status)}
                      </span>
                      
                      {/* Remove Application Button */}
                      {canRemoveApplication(getStatusString(application.status)) && (
                        <button
                          onClick={() => handleRemoveApplication(application.applicationId, application.jobTitle || 'this job')}
                          disabled={removingIds.has(application.applicationId)}
                          style={{
                            backgroundColor: removingIds.has(application.applicationId) ? '#9ca3af' : '#dc2626',
                            color: 'white',
                            padding: '0.375rem 0.75rem',
                            borderRadius: '0.375rem',
                            border: 'none',
                            cursor: removingIds.has(application.applicationId) ? 'not-allowed' : 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                          title="Remove application"
                        >
                          {removingIds.has(application.applicationId) ? (
                            <>
                              <span style={{
                                width: '12px',
                                height: '12px',
                                border: '2px solid #ffffff',
                                borderTop: '2px solid transparent',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                              }}></span>
                              Removing...
                            </>
                          ) : (
                            <>
                              🗑️ Remove
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <p style={{ color: '#6b7280', marginBottom: '0.5rem', fontWeight: '500' }}>
                    {application.companyName}
                  </p>
                  
                  <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                    Applied on {new Date(application.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  
                  {/* Show removal notice for pending applications */}
                  {getStatusString(application.status) === 'Pending' && (
                    <div style={{
                      marginTop: '0.75rem',
                      padding: '0.5rem',
                      backgroundColor: '#fffbeb',
                      border: '1px solid #fbbf24',
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem',
                      color: '#92400e'
                    }}>
                      💡 You can remove this application while it's pending
                    </div>
                  )}
                </div>
              </div>
              
              {getStatusString(application.status) === 'Accepted' && (
                <div style={{
                  marginTop: '1rem',
                  padding: '0.75rem',
                  backgroundColor: '#d1fae5',
                  border: '1px solid #a7f3d0',
                  borderRadius: '0.375rem'
                }}>
                  <p style={{ color: '#065f46', fontSize: '0.875rem' }}>
                    🎉 Congratulations! Your application has been accepted. The employer may contact you soon.
                  </p>
                </div>
              )}
              
              {getStatusString(application.status) === 'Rejected' && (
                <div style={{
                  marginTop: '1rem',
                  padding: '0.75rem',
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fca5a5',
                  borderRadius: '0.375rem'
                }}>
                  <p style={{ color: '#991b1b', fontSize: '0.875rem' }}>
                    Unfortunately, your application was not selected for this position. Keep applying to other opportunities!
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {applications.length > 0 && (
        <div style={{
          backgroundColor: '#f9fafb',
          padding: '1rem',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          <h4 style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
            About Application Management:
          </h4>
          <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
            <li>You can only remove applications that are still <strong>Pending</strong></li>
            <li>Once an application is <strong>Accepted</strong> or <strong>Rejected</strong>, it cannot be removed</li>
            <li>Removing an application will permanently delete it from the system</li>
            <li>You can always re-apply to the same job after removing your application</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ApplicationsPage;