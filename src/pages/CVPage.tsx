import React, { useState, useEffect } from 'react';
import { CV, getRoleString, Skill } from '../types';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CVPage: React.FC = () => {
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCV, setEditingCV] = useState<CV | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    summary: '',
    experienceYears: '',
    educationLevel: '',
    skillsText: '',
    skillIds: [] as number[]
  });

  useEffect(() => {
    if (user && getRoleString(user.role) === 'JobSeeker') {
      fetchCVs();
      fetchSkills();
    }
  }, [user]);

  const fetchCVs = async () => {
    try {
      const response = await api.get('/cv');
      setCvs(response.data);
    } catch (error) {
      console.error('Error fetching CVs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSkills = async () => {
    try {
      const response = await api.get('/skills');
      setSkills(response.data);
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      summary: '',
      experienceYears: '',
      educationLevel: '',
      skillsText: '',
      skillIds: []
    });
    setEditingCV(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const submitData = {
      ...formData,
      experienceYears: formData.experienceYears ? parseInt(formData.experienceYears) : null
    };

    try {
      if (editingCV) {
        await api.put(`/cv/${editingCV.cvId}`, submitData);
      } else {
        await api.post('/cv', submitData);
      }
      
      resetForm();
      fetchCVs();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error saving CV');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (cv: CV) => {
    setEditingCV(cv);
    setFormData({
      summary: cv.summary || '',
      experienceYears: cv.experienceYears?.toString() || '',
      educationLevel: cv.educationLevel || '',
      skillsText: cv.skillsText || '',
      skillIds: []
    });
    setShowForm(true);
  };

  const handleDelete = async (cvId: number) => {
    if (window.confirm('Are you sure you want to delete this CV? This action cannot be undone.')) {
      try {
        await api.delete(`/cv/${cvId}`);
        fetchCVs();
      } catch (error) {
        console.error('Error deleting CV:', error);
        alert('Error deleting CV');
      }
    }
  };

  const toggleSkill = (skillId: number) => {
    setFormData(prev => ({
      ...prev,
      skillIds: prev.skillIds.includes(skillId)
        ? prev.skillIds.filter(id => id !== skillId)
        : [...prev.skillIds, skillId]
    }));
  };

  if (user && getRoleString(user.role) !== 'JobSeeker') {
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
        <div>Loading CVs...</div>
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
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827' }}>My CVs</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Create New CV
        </button>
      </div>

      {showForm && (
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
              {editingCV ? 'Edit CV' : 'Create New CV'}
            </h2>
            <button
              onClick={resetForm}
              style={{
                color: '#9ca3af',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.25rem'
              }}
              aria-label="Close form"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                Professional Summary
              </label>
              <textarea
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  outline: 'none',
                  minHeight: '100px',
                  resize: 'vertical'
                }}
                rows={4}
                value={formData.summary}
                onChange={(e) => setFormData({...formData, summary: e.target.value})}
                placeholder="Brief description of your professional background and career objectives..."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Years of Experience
                </label>
                <input
                  type="number"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    outline: 'none'
                  }}
                  value={formData.experienceYears}
                  onChange={(e) => setFormData({...formData, experienceYears: e.target.value})}
                  min="0"
                  max="50"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Education Level
                </label>
                <select
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    outline: 'none'
                  }}
                  value={formData.educationLevel}
                  onChange={(e) => setFormData({...formData, educationLevel: e.target.value})}
                >
                  <option value="">Select education level</option>
                  <option value="High School">High School</option>
                  <option value="Associate Degree">Associate Degree</option>
                  <option value="Bachelor's Degree">Bachelor's Degree</option>
                  <option value="Master's Degree">Master's Degree</option>
                  <option value="PhD">PhD</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                Skills Description
              </label>
              <textarea
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  outline: 'none',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
                rows={3}
                value={formData.skillsText}
                onChange={(e) => setFormData({...formData, skillsText: e.target.value})}
                placeholder="Describe your technical and soft skills, certifications, and areas of expertise..."
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                Select Skills ({formData.skillIds.length} selected)
              </label>
              <div style={{
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                padding: '1rem',
                maxHeight: '12rem',
                overflowY: 'auto'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '0.5rem'
                }}>
                  {skills.map((skill) => (
                    <label 
                      key={skill.skillId} 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem',
                        borderRadius: '0.25rem',
                        cursor: 'pointer'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.skillIds.includes(skill.skillId)}
                        onChange={() => toggleSkill(skill.skillId)}
                        style={{ marginRight: '0.5rem' }}
                      />
                      <span style={{ fontSize: '0.875rem' }}>{skill.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  backgroundColor: submitting ? '#9ca3af' : '#2563eb',
                  color: 'white',
                  padding: '0.5rem 1.5rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}
              >
                {submitting ? 'Saving...' : (editingCV ? 'Update CV' : 'Create CV')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                style={{
                  backgroundColor: '#d1d5db',
                  color: '#374151',
                  padding: '0.5rem 1.5rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {cvs.map((cv) => (
          <div key={cv.cvId} style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            padding: '1.5rem',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827' }}>
                CV #{cv.cvId}
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleEdit(cv)}
                  style={{
                    color: '#2563eb',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(cv.cvId)}
                  style={{
                    color: '#dc2626',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>

            {cv.summary && (
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontWeight: '500', color: '#111827', marginBottom: '0.5rem' }}>
                  Professional Summary
                </h4>
                <p style={{ color: '#374151', fontSize: '0.875rem', lineHeight: '1.5' }}>
                  {cv.summary}
                </p>
              </div>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              {cv.experienceYears !== null && cv.experienceYears !== undefined && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontWeight: '500', color: '#111827' }}>Experience: </span>
                  <span style={{ color: '#374151', marginLeft: '0.25rem' }}>
                    {cv.experienceYears} {cv.experienceYears === 1 ? 'year' : 'years'}
                  </span>
                </div>
              )}
              {cv.educationLevel && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontWeight: '500', color: '#111827' }}>Education: </span>
                  <span style={{ color: '#374151', marginLeft: '0.25rem' }}>{cv.educationLevel}</span>
                </div>
              )}
            </div>

            {cv.skillsText && (
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontWeight: '500', color: '#111827', marginBottom: '0.5rem' }}>
                  Skills Description
                </h4>
                <p style={{ color: '#374151', fontSize: '0.875rem', lineHeight: '1.5' }}>
                  {cv.skillsText}
                </p>
              </div>
            )}

            {cv.skills.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontWeight: '500', color: '#111827', marginBottom: '0.5rem' }}>
                  Skills
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {cv.skills.map((skill) => (
                    <span 
                      key={skill} 
                      style={{
                        padding: '0.5rem 0.75rem',
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        fontSize: '0.875rem',
                        borderRadius: '9999px'
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                Created on {new Date(cv.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {cvs.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3.75rem', marginBottom: '1rem' }}>📄</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
            No CVs Created Yet
          </h3>
          <p style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>
            Create your first CV to start applying for jobs and showcase your skills to employers.
          </p>
          <button
            onClick={() => setShowForm(true)}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.375rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Create Your First CV
          </button>
        </div>
      )}
    </div>
  );
};

export default CVPage;