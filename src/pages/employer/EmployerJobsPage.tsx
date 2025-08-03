import React, { useState, useEffect } from 'react';
import { Job, Skill, Department } from '../../types';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { getRoleString } from '../../types';

interface CreateJobForm {
  title: string;
  description: string;
  location: string;
  salaryMin: string;
  salaryMax: string;
  departmentId: string;
  skillIds: number[];
}

const EmployerJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const { user } = useAuth();

  const [formData, setFormData] = useState<CreateJobForm>({
    title: '',
    description: '',
    location: '',
    salaryMin: '',
    salaryMax: '',
    departmentId: '',
    skillIds: []
  });

  useEffect(() => {
    if (user && getRoleString(user.role) === 'Employer') {
      fetchEmployerJobs();
      fetchSkills();
      fetchDepartments();
    } else if (user) {
      setLoading(false);
    }
  }, [user]);

  const fetchEmployerJobs = async () => {
    try {
      // This would be a specific endpoint for employer's jobs
      const response = await api.get('/jobs/employer');
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching employer jobs:', error);
      // Fallback: get all jobs and filter by company (for now)
      try {
        const allJobsResponse = await api.get('/jobs');
        const userJobs = allJobsResponse.data.filter((job: Job) => 
          job.companyName === user?.companyName
        );
        setJobs(userJobs);
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
      }
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

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      salaryMin: '',
      salaryMax: '',
      departmentId: '',
      skillIds: []
    });
    setEditingJob(null);
    setShowCreateForm(false);
  };

  const handleEdit = (job: Job) => {
    if (job.isFilled) {
      alert('Cannot edit filled positions. This job has already been filled.');
      return;
    }

    setEditingJob(job);
    setFormData({
      title: job.title,
      description: job.description,
      location: job.location || '',
      salaryMin: job.salaryMin?.toString() || '',
      salaryMax: job.salaryMax?.toString() || '',
      departmentId: departments.find(d => d.name === job.departmentName)?.departmentId.toString() || '',
      skillIds: [] // Would need to map skill names back to IDs
    });
    setShowCreateForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const submitData = {
      title: formData.title,
      description: formData.description,
      location: formData.location || null,
      salaryMin: formData.salaryMin ? parseFloat(formData.salaryMin) : null,
      salaryMax: formData.salaryMax ? parseFloat(formData.salaryMax) : null,
      departmentId: parseInt(formData.departmentId),
      skillIds: formData.skillIds
    };

    try {
      if (editingJob) {
        await api.put(`/jobs/${editingJob.jobId}`, submitData);
      } else {
        await api.post('/jobs', submitData);
      }
      
      resetForm();
      fetchEmployerJobs();
      alert(editingJob ? 'Job updated successfully!' : 'Job created successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error saving job');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (jobId: number, jobTitle: string) => {
    const job = jobs.find(j => j.jobId === jobId);
    
    if (job?.isFilled) {
      alert('Cannot delete filled positions. This job has already been filled and has an assigned employee.');
      return;
    }

    const confirmMessage = `Are you sure you want to delete the job "${jobTitle}"? This will also remove all applications for this job.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setDeletingIds(prev => new Set(prev).add(jobId));

    try {
      await api.delete(`/jobs/${jobId}`);
      setJobs(prev => prev.filter(job => job.jobId !== jobId));
      alert(`Job "${jobTitle}" has been deleted successfully.`);
    } catch (error: any) {
      console.error('Error deleting job:', error);
      alert('Error deleting job: ' + (error.response?.data?.message || error.message));
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
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

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Salary not specified';
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
        <p style={{ color: '#6b7280' }}>You need to be logged in to manage jobs.</p>
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
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
            My Job Postings
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
            {user.companyName} • {jobs.length} active {jobs.length === 1 ? 'job' : 'jobs'}
            {jobs.filter(job => job.isFilled).length > 0 && (
              <span style={{ color: '#10b981', marginLeft: '0.5rem' }}>
                • {jobs.filter(job => job.isFilled).length} filled
              </span>
            )}
          </p>
        </div>
        
        <button
          onClick={() => {
            resetForm();
            setShowCreateForm(true);
          }}
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.375rem',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span style={{ fontSize: '1.25rem' }}>+</span>
          Post New Job
        </button>
      </div>

      {/* Create/Edit Job Form */}
      {showCreateForm && (
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>
              {editingJob ? 'Edit Job Posting' : 'Create New Job Posting'}
            </h2>
            <button
              onClick={resetForm}
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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                Job Title *
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
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g., Senior Software Engineer"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                Job Description *
              </label>
              <textarea
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  outline: 'none',
                  minHeight: '120px',
                  resize: 'vertical'
                }}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe the role, responsibilities, and requirements..."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Location
                </label>
                <input
                  type="text"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    outline: 'none'
                  }}
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="e.g., New York, NY"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Min Salary ($)
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
                  value={formData.salaryMin}
                  onChange={(e) => setFormData({...formData, salaryMin: e.target.value})}
                  placeholder="50000"
                  min="0"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Max Salary ($)
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
                  value={formData.salaryMax}
                  onChange={(e) => setFormData({...formData, salaryMax: e.target.value})}
                  placeholder="80000"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                Department *
              </label>
              <select
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  outline: 'none',
                  backgroundColor: 'white'
                }}
                value={formData.departmentId}
                onChange={(e) => setFormData({...formData, departmentId: e.target.value})}
              >
                <option value="">Select a department</option>
                {departments.map((dept) => (
                  <option key={dept.departmentId} value={dept.departmentId}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                Required Skills ({formData.skillIds.length} selected)
              </label>
              <div style={{
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                padding: '1rem',
                maxHeight: '200px',
                overflowY: 'auto',
                backgroundColor: '#fafafa'
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
                        cursor: 'pointer',
                        backgroundColor: formData.skillIds.includes(skill.skillId) ? '#eff6ff' : 'transparent'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.skillIds.includes(skill.skillId)}
                        onChange={() => toggleSkill(skill.skillId)}
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
                  padding: '0.75rem 2rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontWeight: '500'
                }}
              >
                {submitting 
                  ? (editingJob ? 'Updating...' : 'Creating...') 
                  : (editingJob ? 'Update Job' : 'Create Job')
                }
              </button>
              <button
                type="button"
                onClick={resetForm}
                style={{
                  backgroundColor: '#6b7280',
                  color: 'white',
                  padding: '0.75rem 2rem',
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
        </div>
      )}

      {/* Jobs List */}
      {jobs.length === 0 && !showCreateForm ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📢</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
            No Job Postings Yet
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
            Start attracting top talent by posting your first job opening. 
            Reach qualified candidates and grow your team.
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '0.375rem',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            Post Your First Job
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {jobs.map((job) => (
            <div key={job.jobId} style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              padding: '1.5rem',
              border: job.isFilled ? '2px solid #10b981' : '1px solid #e5e7eb',
              opacity: job.isFilled ? 0.8 : 1
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                      {job.title}
                    </h3>
                    {job.isFilled && (
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: '#d1fae5',
                        color: '#065f46',
                        fontSize: '0.75rem',
                        borderRadius: '9999px',
                        border: '1px solid #10b981',
                        fontWeight: '500'
                      }}>
                        FILLED ✓
                      </span>
                    )}
                  </div>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0.25rem 0' }}>
                    {job.departmentName} • Posted {new Date(job.createdAt).toLocaleDateString()}
                    {job.isFilled && <span style={{ color: '#10b981', marginLeft: '0.5rem' }}>• Position Filled</span>}
                  </p>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleEdit(job)}
                    disabled={job.isFilled}
                    style={{
                      backgroundColor: job.isFilled ? '#d1d5db' : '#f3f4f6',
                      color: job.isFilled ? '#6b7280' : '#374151',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      border: 'none',
                      cursor: job.isFilled ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem'
                    }}
                    title={job.isFilled ? "Cannot edit filled positions" : "Edit job"}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(job.jobId, job.title)}
                    disabled={job.isFilled || deletingIds.has(job.jobId)}
                    style={{
                      backgroundColor: job.isFilled || deletingIds.has(job.jobId) ? '#d1d5db' : '#dc2626',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      border: 'none',
                      cursor: job.isFilled || deletingIds.has(job.jobId) ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem'
                    }}
                    title={job.isFilled ? "Cannot delete filled positions" : "Delete job"}
                  >
                    {deletingIds.has(job.jobId) ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <strong style={{ color: '#374151', fontSize: '0.875rem' }}>Location:</strong>
                  <span style={{ color: '#6b7280', fontSize: '0.875rem', marginLeft: '0.5rem' }}>
                    {job.location || 'Not specified'}
                  </span>
                </div>
                <div>
                  <strong style={{ color: '#374151', fontSize: '0.875rem' }}>Salary:</strong>
                  <span style={{ color: '#6b7280', fontSize: '0.875rem', marginLeft: '0.5rem' }}>
                    {formatSalary(job.salaryMin, job.salaryMax)}
                  </span>
                </div>
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
                {job.description}
              </p>

              {job.skills.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong style={{ color: '#374151', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
                    Required Skills:
                  </strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {job.skills.map((skill) => (
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

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                  <span>👁️ Views: {Math.floor(Math.random() * 100) + 20}</span>
                  <span>📝 Applications: {Math.floor(Math.random() * 15) + 1}</span>
                  {job.isFilled && <span style={{ color: '#10b981' }}>✅ Position Filled</span>}
                </div>
                <button
                  onClick={() => window.location.href = `/employer/applications?jobId=${job.jobId}`}
                  style={{
                    backgroundColor: job.isFilled ? '#10b981' : '#059669',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  {job.isFilled ? 'View Hired Candidate' : 'View Applications'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployerJobsPage;