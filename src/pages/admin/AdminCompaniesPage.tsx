// src/pages/admin/AdminCompaniesPage.tsx - Company Management
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getRoleString } from '../../types';
import api from '../../services/api';

interface Company {
  companyId: number;
  name: string;
  description?: string;
  location?: string;
  sectorName: string;
  employeeCount: number;
  jobCount: number;
}

interface Sector {
  sectorId: number;
  name: string;
}

interface CompanyForm {
  name: string;
  description: string;
  location: string;
  sectorId: string;
}

const AdminCompaniesPage: React.FC = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  
  const [formData, setFormData] = useState<CompanyForm>({
    name: '',
    description: '',
    location: '',
    sectorId: ''
  });

  useEffect(() => {
    if (user && getRoleString(user.role) === 'Admin') {
      fetchCompanies();
      fetchSectors();
    }
  }, [user]);

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/admin/companies');
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSectors = async () => {
    try {
      const response = await api.get('/admin/sectors');
      setSectors(response.data);
    } catch (error) {
      console.error('Error fetching sectors:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      location: '',
      sectorId: ''
    });
    setEditingCompany(null);
    setShowCreateForm(false);
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      description: company.description || '',
      location: company.location || '',
      sectorId: sectors.find(s => s.name === company.sectorName)?.sectorId.toString() || ''
    });
    setShowCreateForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const submitData = {
        ...formData,
        sectorId: parseInt(formData.sectorId)
      };

      if (editingCompany) {
        await api.put(`/admin/companies/${editingCompany.companyId}`, submitData);
      } else {
        await api.post('/admin/companies', submitData);
      }
      
      resetForm();
      fetchCompanies();
      alert(editingCompany ? 'Company updated successfully!' : 'Company created successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error saving company');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (companyId: number, companyName: string, employeeCount: number, jobCount: number) => {
    if (employeeCount > 0 || jobCount > 0) {
      alert(`Cannot delete "${companyName}" because it has ${employeeCount} employees and ${jobCount} job postings. Please remove all employees and jobs first.`);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${companyName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingIds(prev => new Set(prev).add(companyId));

    try {
      await api.delete(`/admin/companies/${companyId}`);
      setCompanies(prev => prev.filter(c => c.companyId !== companyId));
      alert(`Company "${companyName}" has been deleted successfully.`);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error deleting company');
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(companyId);
        return newSet;
      });
    }
  };

  if (!user || getRoleString(user.role) !== 'Admin') {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '3.75rem', marginBottom: '1rem' }}>⚠️</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
          Access Denied
        </h2>
        <p style={{ color: '#6b7280' }}>This page is only accessible to administrators.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
            Company Management
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
            Manage companies and their information
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
          Add New Company
        </button>
      </div>

      {/* Create/Edit Company Form */}
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
              {editingCompany ? 'Edit Company' : 'Create New Company'}
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Company Name *
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
                  placeholder="e.g., TechCorp Solutions"
                />
              </div>

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
                  placeholder="e.g., San Francisco, CA"
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                Sector *
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
                value={formData.sectorId}
                onChange={(e) => setFormData({...formData, sectorId: e.target.value})}
              >
                <option value="">Select a sector</option>
                {sectors.map((sector) => (
                  <option key={sector.sectorId} value={sector.sectorId}>
                    {sector.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                Description
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
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe the company's business and activities..."
              />
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
                  ? (editingCompany ? 'Updating...' : 'Creating...') 
                  : (editingCompany ? 'Update Company' : 'Create Company')
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

      {/* Companies List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div>Loading companies...</div>
        </div>
      ) : companies.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏢</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
            No Companies Yet
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
            Start building your job portal by adding companies that will post job opportunities.
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
            Add Your First Company
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
          {companies.map((company) => (
            <div key={company.companyId} style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              padding: '1.5rem',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                    {company.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: '#eff6ff',
                      color: '#1e40af',
                      fontSize: '0.75rem',
                      borderRadius: '9999px',
                      border: '1px solid #bfdbfe'
                    }}>
                      {company.sectorName}
                    </span>
                    {company.location && (
                      <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        📍 {company.location}
                      </span>
                    )}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleEdit(company)}
                    style={{
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(company.companyId, company.name, company.employeeCount, company.jobCount)}
                    disabled={deletingIds.has(company.companyId)}
                    style={{
                      backgroundColor: deletingIds.has(company.companyId) ? '#9ca3af' : '#dc2626',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      border: 'none',
                      cursor: deletingIds.has(company.companyId) ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    {deletingIds.has(company.companyId) ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>

              {company.description && (
                <p style={{ 
                  color: '#374151', 
                  fontSize: '0.875rem', 
                  marginBottom: '1rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {company.description}
                </p>
              )}

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span>👥</span>
                    {company.employeeCount} employees
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span>💼</span>
                    {company.jobCount} jobs
                  </span>
                </div>
                <button
                  onClick={() => window.location.href = `/admin/jobs?companyId=${company.companyId}`}
                  style={{
                    backgroundColor: '#059669',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  View Jobs
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {companies.length > 0 && (
        <div style={{
          backgroundColor: '#f9fafb',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
            Company Summary
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>
                {companies.length}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Companies</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2563eb' }}>
                {companies.reduce((sum, c) => sum + c.employeeCount, 0)}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Employees</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>
                {companies.reduce((sum, c) => sum + c.jobCount, 0)}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Jobs</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f59e0b' }}>
                {new Set(companies.map(c => c.sectorName)).size}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Sectors</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCompaniesPage;