import React, { useState, useEffect } from 'react';
import { Application, CV } from '../../types';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { getRoleString, getStatusString, getStatusEnum, ApplicationStatus } from '../../types';

interface ApplicationWithCV extends Application {
  cv?: CV;
  applicantDetails?: {
    name: string;
    email: string;
    phone?: string;
    experienceYears?: number;
    educationLevel?: string;
  };
}

interface Department {
  departmentId: number;
  name: string;
}

interface Skill {
  skillId: number;
  name: string;
}

const EmployerApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<ApplicationWithCV[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<ApplicationWithCV[]>([]);
  const [loading, setLoading] = useState(true);  
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [jobFilter, setJobFilter] = useState<string>('all');
  const [selectedCV, setSelectedCV] = useState<CV | null>(null);
  const [showCVModal, setShowCVModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<Set<number>>(new Set());
  const [jobs, setJobs] = useState<{jobId: number, title: string}[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user && getRoleString(user.role) === 'Employer') {
      fetchApplications();
    } else if (user) {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    filterApplications();
  }, [applications, statusFilter, jobFilter]);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/applications');
      console.log('Raw applications data:', response.data);
      
      // Process applications and get unique jobs
      const processedApplications = response.data.map((app: any) => ({
        ...app,
        status: getStatusString(app.status) // Convert enum to string
      }));
      
      setApplications(processedApplications);
      
      // Extract unique jobs
      const uniqueJobs = processedApplications.reduce((acc: any[], app: ApplicationWithCV) => {
        if (!acc.find(job => job.jobId === app.jobId)) {
          acc.push({
            jobId: app.jobId,
            title: app.jobTitle || `Job ${app.jobId}`
          });
        }
        return acc;
      }, []);
      
      setJobs(uniqueJobs);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => getStatusString(app.status) === statusFilter);
    }

    if (jobFilter !== 'all') {
      filtered = filtered.filter(app => app.jobId.toString() === jobFilter);
    }

    setFilteredApplications(filtered);
  };

  const handleStatusUpdate = async (applicationId: number, newStatus: ApplicationStatus) => {
    // Show confirmation for accepting candidates
    if (newStatus === ApplicationStatus.Accepted) {
      const application = applications.find(app => app.applicationId === applicationId);
      const confirmMessage = `Are you sure you want to hire ${application?.applicantName}?\n\nThis will:\n• Assign them to your company\n• Mark the job as filled\n• Automatically reject all other pending applications\n• Remove the job from public listings\n\nThis action cannot be undone.`;
      
      if (!window.confirm(confirmMessage)) {
        return;
      }
    }

    setUpdatingStatus(prev => new Set(prev).add(applicationId));

    try {
      const response = await api.put(`/applications/${applicationId}/status`, newStatus, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Update local state with proper type casting
      const statusString = getStatusString(newStatus) as 'Pending' | 'Accepted' | 'Rejected';
      setApplications(prev => prev.map(app => 
        app.applicationId === applicationId 
          ? { ...app, status: statusString }
          : app
      ));
      
      // Show success message with next steps
      if (newStatus === ApplicationStatus.Accepted) {
        alert(`🎉 Congratulations! You've successfully hired ${applications.find(app => app.applicationId === applicationId)?.applicantName}!\n\nThe candidate has been assigned to your company and the job posting has been filled. All other pending applications have been automatically rejected.`);
        
        // Optionally refresh the page to show updated data
        setTimeout(() => {
          fetchApplications();
        }, 1000);
      } else {
        alert(`Application status updated to ${statusString}`);
      }
      
    } catch (error: any) {
      console.error('Error updating application status:', error);
      const errorMessage = error.response?.data?.message || error.message;
      
      if (errorMessage.includes('already been filled')) {
        alert('❌ This job position has already been filled by another candidate.');
      } else {
        alert('Error updating application status: ' + errorMessage);
      }
    } finally {
      setUpdatingStatus(prev => {
        const newSet = new Set(prev);
        newSet.delete(applicationId);
        return newSet;
      });
    }
  };

  const viewCV = async (applicationId: number) => {
    try {
      const response = await api.get(`/applications/${applicationId}/cv`);
      setSelectedCV(response.data);
      setShowCVModal(true);
    } catch (error: any) {
      console.error('Error fetching CV:', error);
      alert('Error loading CV: ' + (error.response?.data?.message || error.message));
    }
  };

  const closeCVModal = () => {
    setSelectedCV(null);
    setShowCVModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' };
      case 'Accepted': return { bg: '#d1fae5', text: '#065f46', border: '#10b981' };
      case 'Rejected': return { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' };
      default: return { bg: '#f3f4f6', text: '#374151', border: '#6b7280' };
    }
  };

  const formatExperience = (years?: number) => {
    if (!years) return 'Not specified';
    if (years === 1) return '1 year';
    return `${years} years`;
  };

  const userRole = user ? getRoleString(user.role) : null;

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '3.75rem', marginBottom: '1rem' }}>🔒</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
          Please Log In
        </h2>
        <p style={{ color: '#6b7280' }}>You need to be logged in to manage applications.</p>
      </div>
    );
  }

  if (userRole !== 'Employer') {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '3.75rem', marginBottom: '1rem' }}>⚠️</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
          Access Denied
        </h2>
        <p style={{ color: '#6b7280' }}>This page is only accessible to employers.</p>
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
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
            Job Applications
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
            {user.companyName} • {filteredApplications.length} {filteredApplications.length === 1 ? 'application' : 'applications'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
              Filter by Status
            </label>
            <select
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                outline: 'none',
                backgroundColor: 'white'
              }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
              Filter by Job
            </label>
            <select
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                outline: 'none',
                backgroundColor: 'white'
              }}
              value={jobFilter}
              onChange={(e) => setJobFilter(e.target.value)}
            >
              <option value="all">All Jobs</option>
              {jobs.map((job) => (
                <option key={job.jobId} value={job.jobId.toString()}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📄</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
            {applications.length === 0 ? 'No Applications Yet' : 'No Applications Match Your Filters'}
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto' }}>
            {applications.length === 0 
              ? 'Once candidates start applying to your job postings, you\'ll see their applications here.'
              : 'Try adjusting your filters to see more applications.'}
          </p>
          {statusFilter !== 'all' || jobFilter !== 'all' ? (
            <button
              onClick={() => {
                setStatusFilter('all');
                setJobFilter('all');
              }}
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Clear Filters
            </button>
          ) : null}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filteredApplications.map((application) => (
            <div key={application.applicationId} style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              padding: '1.5rem',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                    {application.applicantName || 'Applicant'}
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0.25rem 0' }}>
                    {application.applicantEmail}
                  </p>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0.25rem 0' }}>
                    Applied for: <strong>{application.jobTitle}</strong>
                  </p>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0.25rem 0' }}>
                    Applied on: {new Date(application.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    ...getStatusColor(getStatusString(application.status)),
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    border: `1px solid ${getStatusColor(getStatusString(application.status)).border}`
                  }}>
                    {getStatusString(application.status)}
                  </div>
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                gap: '1rem', 
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => viewCV(application.applicationId)}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  View CV
                </button>

                {getStatusString(application.status) === 'Pending' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(application.applicationId, ApplicationStatus.Accepted)}
                      disabled={updatingStatus.has(application.applicationId)}
                      style={{
                        backgroundColor: updatingStatus.has(application.applicationId) ? '#9ca3af' : '#10b981',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.375rem',
                        border: 'none',
                        cursor: updatingStatus.has(application.applicationId) ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                    >
                      {updatingStatus.has(application.applicationId) ? 'Hiring...' : 'Accept & Hire'}
                    </button>
                    
                    <button
                      onClick={() => handleStatusUpdate(application.applicationId, ApplicationStatus.Rejected)}
                      disabled={updatingStatus.has(application.applicationId)}
                      style={{
                        backgroundColor: updatingStatus.has(application.applicationId) ? '#9ca3af' : '#ef4444',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.375rem',
                        border: 'none',
                        cursor: updatingStatus.has(application.applicationId) ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                    >
                      {updatingStatus.has(application.applicationId) ? 'Updating...' : 'Reject'}
                    </button>
                  </>
                )}

                {getStatusString(application.status) !== 'Pending' && (
                  <button
                    onClick={() => handleStatusUpdate(application.applicationId, ApplicationStatus.Pending)}
                    disabled={updatingStatus.has(application.applicationId)}
                    style={{
                      backgroundColor: updatingStatus.has(application.applicationId) ? '#9ca3af' : '#6b7280',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      border: 'none',
                      cursor: updatingStatus.has(application.applicationId) ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                  >
                    {updatingStatus.has(application.applicationId) ? 'Updating...' : 'Reset to Pending'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CV Modal */}
      {showCVModal && selectedCV && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '2rem',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>Applicant CV</h2>
              <button
                onClick={closeCVModal}
                style={{
                  color: '#6b7280',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.5rem'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {selectedCV.summary && (
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                    Professional Summary
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: '1.5' }}>
                    {selectedCV.summary}
                  </p>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                    Experience
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    {formatExperience(selectedCV.experienceYears)}
                  </p>
                </div>

                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                    Education Level
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    {selectedCV.educationLevel || 'Not specified'}
                  </p>
                </div>
              </div>

              {selectedCV.skills && selectedCV.skills.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                    Skills
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {selectedCV.skills.map((skill) => (
                      <span key={skill} style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: '#eff6ff',
                        color: '#1e40af',
                        fontSize: '0.75rem',
                        borderRadius: '9999px',
                        border: '1px solid #bfdbfe'
                      }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedCV.skillsText && (
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                    Additional Skills & Experience
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: '1.5' }}>
                    {selectedCV.skillsText}
                  </p>
                </div>
              )}

              <div style={{ fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                CV created on: {new Date(selectedCV.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button
                onClick={closeCVModal}
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
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Summary */}
      {applications.length > 0 && (
        <div style={{
          backgroundColor: '#f9fafb',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
            Application Summary
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>
                {applications.length}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Applications</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f59e0b' }}>
                {applications.filter(app => getStatusString(app.status) === 'Pending').length}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Pending Review</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>
                {applications.filter(app => getStatusString(app.status) === 'Accepted').length}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Hired</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef4444' }}>
                {applications.filter(app => getStatusString(app.status) === 'Rejected').length}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Rejected</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerApplicationsPage;