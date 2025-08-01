import React, { useState, useEffect } from 'react';
import { getRoleString, Job } from '../types';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const FavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user && getRoleString(user.role) === 'JobSeeker') {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const response = await api.get('/favorites');
      setFavorites(response.data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (jobId: number) => {
    try {
      await api.delete(`/favorites/${jobId}`);
      setFavorites(favorites.filter(job => job.jobId !== jobId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const handleApply = async (jobId: number) => {
    try {
      await api.post(`/applications/${jobId}`);
      alert('Application submitted successfully!');
      setFavorites(favorites.map(job => 
        job.jobId === jobId ? { ...job, hasApplied: true } : job
      ));
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error submitting application');
    }
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return null;
    if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min) return `From ${min.toLocaleString()}`;
    return `Up to ${max?.toLocaleString()}`;
  };

  if (user &&getRoleString(user.role) !== 'JobSeeker') {
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
        <div>Loading favorites...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827' }}>My Favorite Jobs</h1>
      
      {favorites.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3.75rem', marginBottom: '1rem' }}>❤️</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
            No Favorites Yet
          </h3>
          <p style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>
            Save jobs you're interested in by clicking the heart icon when browsing jobs.
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
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          {favorites.map((job) => (
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
                <button
                  onClick={() => handleRemoveFavorite(job.jobId)}
                  style={{
                    fontSize: '1.5rem',
                    color: '#dc2626',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                  aria-label="Remove from favorites"
                >
                  ♥
                </button>
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
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {job.hasApplied ? (
                  <button
                    disabled
                    style={{
                      width: '100%',
                      backgroundColor: '#d1d5db',
                      color: '#6b7280',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      border: 'none',
                      cursor: 'not-allowed'
                    }}
                  >
                    Applied ✓
                  </button>
                ) : (
                  <button
                    onClick={() => handleApply(job.jobId)}
                    style={{
                      width: '100%',
                      backgroundColor: '#2563eb',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Apply Now
                  </button>
                )}
              </div>
              
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                  Posted {new Date(job.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;