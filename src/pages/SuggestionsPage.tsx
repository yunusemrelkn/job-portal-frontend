import React, { useState, useEffect } from 'react';
import { JobSuggestion, CV, Job, SkillMatch } from '../types';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { getRoleString } from '../types';

const SuggestionsPage: React.FC = () => {
  const [suggestions, setSuggestions] = useState<JobSuggestion[]>([]);
  const [userCVs, setUserCVs] = useState<CV[]>([]);
  const [selectedCVId, setSelectedCVId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingsuggestions, setGeneratingSuggestions] = useState(false);
  const [applyingIds, setApplyingIds] = useState<Set<number>>(new Set());
  const { user } = useAuth();

  useEffect(() => {
    if (user && getRoleString(user.role) === 'JobSeeker') {
      fetchUserCVs();
    } else if (user) {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (selectedCVId && userCVs.length > 0) {
      generateSuggestions();
    }
  }, [selectedCVId, userCVs]);

  const fetchUserCVs = async () => {
    try {
      const response = await api.get('/cv');
      setUserCVs(response.data);
      
      // Auto-select the most recent CV
      if (response.data.length > 0) {
        const mostRecentCV = response.data.sort((a: CV, b: CV) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
        setSelectedCVId(mostRecentCV.cvId);
      }
    } catch (error) {
      console.error('Error fetching CVs:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestions = async () => {
    if (!selectedCVId) return;

    setGeneratingSuggestions(true);
    try {
      // Get all jobs
      const jobsResponse = await api.get('/jobs');
      const allJobs: Job[] = jobsResponse.data;

      // Get selected CV
      const selectedCV = userCVs.find(cv => cv.cvId === selectedCVId);
      if (!selectedCV) return;

      // Generate suggestions based on skill matching
      const jobSuggestions = generateJobSuggestions(allJobs, selectedCV);
      setSuggestions(jobSuggestions);

    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setGeneratingSuggestions(false);
    }
  };

  const generateJobSuggestions = (jobs: Job[], cv: CV): JobSuggestion[] => {
    const cvSkills = cv.skills.map(skill => skill.toLowerCase());
    
    const suggestions: JobSuggestion[] = jobs
      .filter(job => !job.hasApplied) // Don't suggest jobs already applied to
      .map(job => {
        const jobSkills = job.skills.map(skill => skill.toLowerCase());
        const matchingSkills = jobSkills.filter(jobSkill => 
          cvSkills.some(cvSkill => 
            cvSkill.includes(jobSkill) || 
            jobSkill.includes(cvSkill) ||
            cvSkill === jobSkill
          )
        );

        const matchScore = matchingSkills.length;
        const matchPercentage = jobSkills.length > 0 
          ? Math.round((matchingSkills.length / jobSkills.length) * 100)
          : 0;

        let reasonForSuggestion = '';
        if (matchScore === 0) {
          // Suggest based on other factors
          reasonForSuggestion = 'New opportunity to expand your skills';
        } else if (matchScore === jobSkills.length) {
          reasonForSuggestion = 'Perfect skill match!';
        } else if (matchPercentage >= 70) {
          reasonForSuggestion = 'Excellent skill match';
        } else if (matchPercentage >= 50) {
          reasonForSuggestion = 'Good skill match';
        } else if (matchPercentage >= 30) {
          reasonForSuggestion = 'Partial skill match';
        } else {
          reasonForSuggestion = 'Opportunity to learn new skills';
        }

        return {
          ...job,
          matchScore,
          matchingSkills: job.skills.filter(skill => 
            matchingSkills.includes(skill.toLowerCase())
          ),
          totalSkillsRequired: jobSkills.length,
          matchPercentage,
          reasonForSuggestion
        } as JobSuggestion;
      })
      .sort((a, b) => {
        // Sort by match score first, then by match percentage
        if (b.matchScore !== a.matchScore) {
          return b.matchScore - a.matchScore;
        }
        return b.matchPercentage - a.matchPercentage;
      });

    return suggestions;
  };

  const handleApply = async (jobId: number) => {
    if (!user || getRoleString(user.role) !== 'JobSeeker') return;

    setApplyingIds(prev => new Set(prev).add(jobId));

    try {
      await api.post(`/applications/${jobId}`);
      
      // Update suggestions to remove applied job
      setSuggestions(prev => prev.map(suggestion => 
        suggestion.jobId === jobId 
          ? { ...suggestion, hasApplied: true }
          : suggestion
      ));
      
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

  const handleFavorite = async (jobId: number, isFavorited: boolean) => {
    if (!user || getRoleString(user.role) !== 'JobSeeker') return;

    try {
      if (isFavorited) {
        await api.delete(`/favorites/${jobId}`);
      } else {
        await api.post(`/favorites/${jobId}`);
      }
      
      // Update suggestions
      setSuggestions(prev => prev.map(suggestion => 
        suggestion.jobId === jobId 
          ? { ...suggestion, isFavorited: !isFavorited }
          : suggestion
      ));
    } catch (error) {
      console.error('Error updating favorite:', error);
    }
  };

  const getMatchScoreColor = (percentage: number) => {
    if (percentage >= 80) return '#059669'; // Green
    if (percentage >= 60) return '#0891b2'; // Blue
    if (percentage >= 40) return '#ea580c'; // Orange
    return '#6b7280'; // Gray
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return null;
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    return `Up to $${max?.toLocaleString()}`;
  };

  const userRole = user ? getRoleString(user.role) : null;

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '3.75rem', marginBottom: '1rem' }}>🔒</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
          Please Log In
        </h2>
        <p style={{ color: '#6b7280' }}>You need to be logged in to view job suggestions.</p>
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
        <div>Loading suggestions...</div>
      </div>
    );
  }

  if (userCVs.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '3.75rem', marginBottom: '1rem' }}>📄</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
          No CV Found
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
          You need to create a CV first to get personalized job suggestions based on your skills.
        </p>
        <button
          onClick={() => window.location.href = '/cv'}
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.375rem',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Create Your CV
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827' }}>
          🎯 Job Suggestions
        </h1>
        
        {userCVs.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
              Based on CV:
            </label>
            <select
              value={selectedCVId || ''}
              onChange={(e) => setSelectedCVId(parseInt(e.target.value))}
              style={{
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                outline: 'none',
                backgroundColor: 'white'
              }}
            >
              {userCVs.map(cv => (
                <option key={cv.cvId} value={cv.cvId}>
                  CV #{cv.cvId} ({new Date(cv.createdAt).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {selectedCVId && (
        <div style={{
          backgroundColor: '#f0f9ff',
          padding: '1rem',
          borderRadius: '0.5rem',
          border: '1px solid #0ea5e9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🧠</span>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#0c4a6e' }}>
              How Job Suggestions Work
            </h3>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#0c4a6e', margin: 0 }}>
            We match your CV skills with job requirements to find the best opportunities for you. 
            Higher match percentages indicate better skill alignment!
          </p>
        </div>
      )}

      {generatingsuggestions ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginRight: '1rem'
          }}></div>
          <span>Analyzing your skills and generating suggestions...</span>
        </div>
      ) : suggestions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3.75rem', marginBottom: '1rem' }}>🔍</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
            No Suggestions Available
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
            We couldn't find any job suggestions at the moment. Try updating your CV with more skills or check back later.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={() => window.location.href = '/cv'}
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Update CV
            </button>
            <button
              onClick={() => window.location.href = '/jobs'}
              style={{
                backgroundColor: '#6b7280',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Browse All Jobs
            </button>
          </div>
        </div>
      ) : (
        <>
          <div style={{
            backgroundColor: 'white',
            padding: '1rem',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                  Found {suggestions.length} Job Suggestions
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                  Sorted by skill match relevance
                </p>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <div style={{ width: '12px', height: '12px', backgroundColor: '#059669', borderRadius: '50%' }}></div>
                  <span>Excellent (80%+)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <div style={{ width: '12px', height: '12px', backgroundColor: '#0891b2', borderRadius: '50%' }}></div>
                  <span>Good (60%+)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <div style={{ width: '12px', height: '12px', backgroundColor: '#ea580c', borderRadius: '50%' }}></div>
                  <span>Fair (40%+)</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '1.5rem'
          }}>
            {suggestions.map((suggestion) => (
              <div key={suggestion.jobId} style={{
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                padding: '1.5rem',
                border: `2px solid ${getMatchScoreColor(suggestion.matchPercentage)}20`,
                position: 'relative'
              }}>
                {/* Match Score Badge */}
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  backgroundColor: getMatchScoreColor(suggestion.matchPercentage),
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  {suggestion.matchPercentage}% Match
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', paddingRight: '4rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827' }}>
                    {suggestion.title}
                  </h3>
                  <button
                    onClick={() => handleFavorite(suggestion.jobId, suggestion.isFavorited)}
                    style={{
                      fontSize: '1.25rem',
                      color: suggestion.isFavorited ? '#dc2626' : '#9ca3af',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    aria-label={suggestion.isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    ♥
                  </button>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ color: '#6b7280', fontWeight: '500', marginBottom: '0.25rem' }}>
                    {suggestion.companyName}
                  </p>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    {suggestion.departmentName}
                  </p>
                  {suggestion.location && (
                    <p style={{ color: '#6b7280', fontSize: '0.875rem', display: 'flex', alignItems: 'center', marginTop: '0.25rem' }}>
                      <span style={{ marginRight: '0.25rem' }}>📍</span>
                      {suggestion.location}
                    </p>
                  )}
                  {formatSalary(suggestion.salaryMin, suggestion.salaryMax) && (
                    <p style={{ color: '#6b7280', fontSize: '0.875rem', display: 'flex', alignItems: 'center', marginTop: '0.25rem' }}>
                      <span style={{ marginRight: '0.25rem' }}>💰</span>
                      {formatSalary(suggestion.salaryMin, suggestion.salaryMax)}
                    </p>
                  )}
                </div>

                {/* Reason for Suggestion */}
                <div style={{
                  backgroundColor: `${getMatchScoreColor(suggestion.matchPercentage)}10`,
                  padding: '0.75rem',
                  borderRadius: '0.375rem',
                  marginBottom: '1rem',
                  border: `1px solid ${getMatchScoreColor(suggestion.matchPercentage)}30`
                }}>
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: getMatchScoreColor(suggestion.matchPercentage),
                    fontWeight: '500',
                    margin: 0
                  }}>
                    ✨ {suggestion.reasonForSuggestion}
                  </p>
                </div>

                <p style={{ 
                  color: '#374151', 
                  fontSize: '0.875rem', 
                  marginBottom: '1rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {suggestion.description}
                </p>

                {/* Skill Matching Section */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', margin: 0 }}>
                      Skills Required ({suggestion.totalSkillsRequired})
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {suggestion.matchingSkills.length} matching
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                    {suggestion.skills.map((skill) => {
                      const isMatching = suggestion.matchingSkills.includes(skill);
                      return (
                        <span key={skill} style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: isMatching ? '#dcfce7' : '#f3f4f6',
                          color: isMatching ? '#166534' : '#6b7280',
                          fontSize: '0.75rem',
                          borderRadius: '9999px',
                          border: isMatching ? '1px solid #bbf7d0' : '1px solid #e5e7eb',
                          fontWeight: isMatching ? '500' : '400'
                        }}>
                          {isMatching && '✓ '}{skill}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {suggestion.hasApplied ? (
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
                      onClick={() => handleApply(suggestion.jobId)}
                      disabled={applyingIds.has(suggestion.jobId)}
                      style={{
                        width: '100%',
                        backgroundColor: applyingIds.has(suggestion.jobId) ? '#9ca3af' : getMatchScoreColor(suggestion.matchPercentage),
                        color: 'white',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.375rem',
                        border: 'none',
                        cursor: applyingIds.has(suggestion.jobId) ? 'not-allowed' : 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      {applyingIds.has(suggestion.jobId) ? 'Applying...' : 'Apply Now'}
                    </button>
                  )}
                </div>

                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                  <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                    Posted {new Date(suggestion.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SuggestionsPage;