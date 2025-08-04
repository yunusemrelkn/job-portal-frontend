import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getRoleString } from '../../types';
import api from '../../services/api';

interface User {
  userId: number;
  name: string;
  surname: string;
  email: string;
  phone?: string;
  role: string;
  companyId?: number;
  companyName?: string;
  createdAt: string;
}

interface Company {
  companyId: number;
  name: string;
}

interface CreateUserForm {
  name: string;
  surname: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  companyId: string;
}

const AdminUsersPage: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  
  const [formData, setFormData] = useState<CreateUserForm>({
    name: '',
    surname: '',
    email: '',
    phone: '',
    password: '',
    role: 'JobSeeker',
    companyId: ''
  });

  useEffect(() => {
    if (user && getRoleString(user.role) === 'Admin') {
      fetchUsers();
      fetchCompanies();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter !== 'all') params.append('role', roleFilter);

      const response = await api.get(`/admin/users?${params.toString()}`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/admin/companies');
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const handleSearch = () => {
    setLoading(true);
    fetchUsers();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      surname: '',
      email: '',
      phone: '',
      password: '',
      role: 'JobSeeker',
      companyId: ''
    });
    setShowCreateForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const submitData = {
        ...formData,
        companyId: formData.companyId ? parseInt(formData.companyId) : null
      };

      await api.post('/admin/users', submitData);
      resetForm();
      fetchUsers();
      alert('User created successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error creating user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingIds(prev => new Set(prev).add(userId));

    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u.userId !== userId));
      alert('User deleted successfully');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error deleting user');
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await api.put(`/admin/users/${userId}/role`, newRole, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      setUsers(prev => prev.map(u => 
        u.userId === userId ? { ...u, role: newRole } : u
      ));
      
      alert('User role updated successfully');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error updating user role');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return { bg: '#fef3c7', text: '#92400e', border: '#fbbf24' };
      case 'Employer': return { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' };
      case 'JobSeeker': return { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' };
      default: return { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
            User Management
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
            Manage system users and their roles
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateForm(true)}
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
          Add New User
        </button>
      </div>

      {/* Search and Filters */}
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
              Search Users
            </label>
            <input
              type="text"
              placeholder="Search by name, surname, or email..."
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                outline: 'none'
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
              Filter by Role
            </label>
            <select
              style={{
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                outline: 'none',
                backgroundColor: 'white'
              }}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Employer">Employer</option>
              <option value="JobSeeker">Job Seeker</option>
            </select>
          </div>

          <button
            onClick={handleSearch}
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
            Search
          </button>

          <button
            onClick={() => {
              setSearchTerm('');
              setRoleFilter('all');
              fetchUsers();
            }}
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
            Reset
          </button>
        </div>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>Create New User</h2>
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
                  First Name *
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
                  Last Name *
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Email *
                </label>
                <input
                  type="email"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    outline: 'none'
                  }}
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Phone
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
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Password *
                </label>
                <input
                  type="password"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    outline: 'none'
                  }}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Role *
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
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="JobSeeker">Job Seeker</option>
                  <option value="Employer">Employer</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>

            {formData.role === 'Employer' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Company
                </label>
                <select
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    outline: 'none',
                    backgroundColor: 'white'
                  }}
                  value={formData.companyId}
                  onChange={(e) => setFormData({...formData, companyId: e.target.value})}
                >
                  <option value="">Select a company (optional)</option>
                  {companies.map((company) => (
                    <option key={company.companyId} value={company.companyId}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

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
                {submitting ? 'Creating...' : 'Create User'}
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

      {/* Users List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div>Loading users...</div>
        </div>
      ) : users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
            No Users Found
          </h3>
          <p style={{ color: '#6b7280' }}>
            {searchTerm || roleFilter !== 'all' ? 'Try adjusting your search filters.' : 'Start by creating your first user.'}
          </p>
        </div>
      ) : (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                    User
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                    Role
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                    Company
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                    Joined
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((userItem) => (
                  <tr key={userItem.userId} style={{ borderTop: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>
                          {userItem.name} {userItem.surname}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          {userItem.email}
                        </div>
                        {userItem.phone && (
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            {userItem.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <select
                        value={userItem.role}
                        onChange={(e) => handleRoleChange(userItem.userId, e.target.value)}
                        style={{
                          ...getRoleColor(userItem.role),
                          backgroundColor: getRoleColor(userItem.role).bg,
                          color: getRoleColor(userItem.role).text,
                          border: `1px solid ${getRoleColor(userItem.role).border}`,
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          outline: 'none'
                        }}
                      >
                        <option value="JobSeeker">Job Seeker</option>
                        <option value="Employer">Employer</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ fontSize: '0.875rem', color: '#374151' }}>
                        {userItem.companyName || 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        {formatDate(userItem.createdAt)}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button
                        onClick={() => handleDeleteUser(userItem.userId, `${userItem.name} ${userItem.surname}`)}
                        disabled={deletingIds.has(userItem.userId)}
                        style={{
                          backgroundColor: deletingIds.has(userItem.userId) ? '#d1d5db' : '#dc2626',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.375rem',
                          border: 'none',
                          cursor: deletingIds.has(userItem.userId) ? 'not-allowed' : 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: '500'
                        }}
                      >
                        {deletingIds.has(userItem.userId) ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary */}
      {users.length > 0 && (
        <div style={{
          backgroundColor: '#f9fafb',
          padding: '1rem',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          color: '#6b7280',
          textAlign: 'center'
        }}>
          Showing {users.length} user{users.length !== 1 ? 's' : ''} 
          {(searchTerm || roleFilter !== 'all') && ' matching your filters'}
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;