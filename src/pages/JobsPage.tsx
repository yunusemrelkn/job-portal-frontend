import React, { useState, useEffect } from 'react';
import { Job } from '../types';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { getRoleString } from '../types';

const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [applyingIds, setApplyingIds] = useState<Set<number>>(new Set());
  const { user } = useAuth();

  useEffect(() => {
    fetchJobs();
  }, [search]);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs', {
        params: { search: search || undefined }
      });
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async (jobId: number, isFavorited: boolean) => {
    if (!user || getRoleString(user.role) !== 'JobSeeker') return;

    try {
      if (isFavorited) {
        await api.delete(`/favorites/${jobId}`);
      } else {
        await api.post(`/favorites/${jobId}`);
      }
      fetchJobs();
    } catch (error) {
      console.error('Error updating favorite:', error);
    }
  };

  const handleApply = async (jobId: number) => {
    if (!user || getRoleString(user.role) !== 'JobSeeker') return;

    setApplyingIds(prev => new Set(prev).add(jobId));

    try {
      await api.post(`/applications/${jobId}`);
      fetchJobs(); // Refresh to show updated application status
      alert('Application submitted successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error submitting application');
    } finally {
      setApplyingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return null;
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    return `Up to $${max?.toLocaleString()}`;
  };

  const userRole = user ? getRoleString(user.role) : null;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem' }}>
        <div>Loading jobs...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827' }}>
          Available Jobs
        </h1>
        
        <div>
          <input
            type="text"
            placeholder="Search jobs..."
            style={{
              width: '16rem',
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              outline: 'none'
            }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {userRole === 'JobSeeker' && (
        <div style={{
          backgroundColor: '#eff6ff',
          padding: '1rem',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          color: '#1e40af',
          border: '1px solid #bfdbfe'
        }}>
          💡 <strong>Tip:</strong> You can remove your pending applications from the "My Applications" page if you change your mind.
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        {jobs.map((job) => (
          <div key={job.jobId} style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            padding: '1.5rem',
            transition: 'box-shadow 0.2s'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', paddingRight: '0.5rem' }}>
                {job.title}
              </h3>
              {userRole === 'JobSeeker' && (
                <button
                  onClick={() => handleFavorite(job.jobId, job.isFavorited)}
                  style={{
                    fontSize: '1.5rem',
                    color: job.isFavorited ? '#dc2626' : '#9ca3af',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                  aria-label={job.isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                >
                  ♥
                </button>
              )}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              <p style={{ color: '#6b7280', fontWeight: '500' }}>{job.companyName}</p>
              <p style={{ color: '#6b7280' }}>{job.departmentName}</p>
              {job.location && (
                <p style={{ color: '#6b7280', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '0.25rem' }}>📍</span>
                  {job.location}
                </p>
              )}
              {formatSalary(job.salaryMin, job.salaryMax) && (
                <p style={{ color: '#6b7280', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '0.25rem' }}>💰</span>
                  {formatSalary(job.salaryMin, job.salaryMax)}
                </p>
              )}
            </div>
            
            <p style={{ 
              color: '#374151', 
              fontSize: '0.875rem', 
              marginBottom: '1rem',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {job.description}
            </p>
            
            {job.skills.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {job.skills.slice(0, 4).map((skill) => (
                    <span key={skill} style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      fontSize: '0.75rem',
                      borderRadius: '9999px'
                    }}>
                      {skill}
                    </span>
                  ))}
                  {job.skills.length > 4 && (
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: '#f3f4f6',
                      color: '#6b7280',
                      fontSize: '0.75rem',
                      borderRadius: '9999px'
                    }}>
                      +{job.skills.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {userRole === 'JobSeeker' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {job.hasApplied ? (
                  <div style={{
                    width: '100%',
                    backgroundColor: '#d1fae5',
                    color: '#065f46',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #a7f3d0',
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}>
                    ✓ Applied
                  </div>
                ) : (
                  <button
                    onClick={() => handleApply(job.jobId)}
                    disabled={applyingIds.has(job.jobId)}
                    style={{
                      width: '100%',
                      backgroundColor: applyingIds.has(job.jobId) ? '#9ca3af' : '#2563eb',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      border: 'none',
                      cursor: applyingIds.has(job.jobId) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {applyingIds.has(job.jobId) ? 'Applying...' : 'Apply Now'}
                  </button>
                )}
              </div>
            )}
            
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                Posted {new Date(job.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {jobs.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3.75rem', marginBottom: '1rem' }}>🔍</div>
          <p style={{ color: '#9ca3af', fontSize: '1.125rem' }}>No jobs found.</p>
          {search && (
            <p style={{ color: '#9ca3af', marginTop: '0.5rem' }}>
              Try adjusting your search terms or{' '}
              <button
                onClick={() => setSearch('')}
                style={{
                  color: '#2563eb',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                view all jobs
              </button>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default JobsPage;