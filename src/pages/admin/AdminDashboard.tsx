import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getRoleString } from '../../types';
import api from '../../services/api';

interface DashboardStats {
  totalUsers: number;
  jobSeekers: number;
  employers: number;
  admins: number;
  totalCompanies: number;
  totalJobs: number;
  activeJobs: number;
  filledJobs: number;
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
  companiesBySector: { sector: string; count: number }[];
  jobsByDepartment: { department: string; count: number }[];
  recentUsers: any[];
  recentJobs: any[];
  recentApplications: any[];
  userGrowth: { total: number; last30Days: number; last7Days: number };
  jobGrowth: { total: number; last30Days: number; last7Days: number };
  applicationGrowth: { total: number; last30Days: number; last7Days: number };
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && getRoleString(user.role) === 'Admin') {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return '#f59e0b';
      case 'Accepted': return '#10b981';
      case 'Rejected': return '#ef4444';
      default: return '#6b7280';
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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem' }}>
        <div>Loading dashboard...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p>Failed to load dashboard data.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
            Admin Dashboard
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
            System overview and management
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
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
          Refresh Data
        </button>
      </div>

      {/* Main Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              backgroundColor: '#eff6ff',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '1.5rem' }}>👥</span>
            </div>
            <div>
              <h3 style={{ fontSize: '2rem', fontWeight: '700', color: '#111827', margin: 0 }}>
                {stats.totalUsers}
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Total Users</p>
              <p style={{ fontSize: '0.75rem', color: '#10b981', margin: '0.25rem 0 0 0' }}>
                +{stats.userGrowth.last7Days} this week
              </p>
            </div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
            <span style={{ color: '#2563eb' }}>👤 {stats.jobSeekers} Job Seekers</span>
            <span style={{ color: '#f59e0b' }}>🏢 {stats.employers} Employers</span>
            <span style={{ color: '#ef4444' }}>👑 {stats.admins} Admins</span>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              backgroundColor: '#fef3c7',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '1.5rem' }}>🏢</span>
            </div>
            <div>
              <h3 style={{ fontSize: '2rem', fontWeight: '700', color: '#111827', margin: 0 }}>
                {stats.totalCompanies}
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Total Companies</p>
              <p style={{ fontSize: '0.75rem', color: '#10b981', margin: '0.25rem 0 0 0' }}>
                Across {stats.companiesBySector.length} sectors
              </p>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              backgroundColor: '#f0fdf4',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '1.5rem' }}>💼</span>
            </div>
            <div>
              <h3 style={{ fontSize: '2rem', fontWeight: '700', color: '#111827', margin: 0 }}>
                {stats.totalJobs}
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Total Jobs</p>
              <p style={{ fontSize: '0.75rem', color: '#10b981', margin: '0.25rem 0 0 0' }}>
                +{stats.jobGrowth.last7Days} this week
              </p>
            </div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
            <span style={{ color: '#10b981' }}>✅ {stats.activeJobs} Active</span>
            <span style={{ color: '#6b7280' }}>🔒 {stats.filledJobs} Filled</span>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              backgroundColor: '#fce7f3',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '1.5rem' }}>📄</span>
            </div>
            <div>
              <h3 style={{ fontSize: '2rem', fontWeight: '700', color: '#111827', margin: 0 }}>
                {stats.totalApplications}
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Total Applications</p>
              <p style={{ fontSize: '0.75rem', color: '#10b981', margin: '0.25rem 0 0 0' }}>
                +{stats.applicationGrowth.last7Days} this week
              </p>
            </div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
            <span style={{ color: '#f59e0b' }}>⏳ {stats.pendingApplications} Pending</span>
            <span style={{ color: '#10b981' }}>✅ {stats.acceptedApplications} Accepted</span>
            <span style={{ color: '#ef4444' }}>❌ {stats.rejectedApplications} Rejected</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Companies by Sector */}
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#111827' }}>
            Companies by Sector
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stats.companiesBySector.map((item, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: '#374151' }}>{item.sector}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: `${(item.count / Math.max(...stats.companiesBySector.map(s => s.count))) * 100}px`,
                    height: '8px',
                    backgroundColor: '#3b82f6',
                    borderRadius: '4px',
                    minWidth: '20px'
                  }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827', minWidth: '20px' }}>
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Jobs by Department */}
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#111827' }}>
            Jobs by Department
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stats.jobsByDepartment.slice(0, 6).map((item, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: '#374151' }}>{item.department}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: `${(item.count / Math.max(...stats.jobsByDepartment.map(d => d.count))) * 100}px`,
                    height: '8px',
                    backgroundColor: '#10b981',
                    borderRadius: '4px',
                    minWidth: '20px'
                  }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827', minWidth: '20px' }}>
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Recent Users */}
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0, color: '#111827' }}>
              Recent Users
            </h3>
            <button
              onClick={() => window.location.href = '/admin/users'}
              style={{
                fontSize: '0.75rem',
                color: '#2563eb',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              View All →
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stats.recentUsers.map((user, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.375rem'
              }}>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', margin: 0, color: '#111827' }}>
                    {user.name} {user.surname}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
                    {user.email}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '9999px',
                    backgroundColor: user.role === 'Admin' ? '#fef3c7' : user.role === 'Employer' ? '#eff6ff' : '#f0fdf4',
                    color: user.role === 'Admin' ? '#92400e' : user.role === 'Employer' ? '#1e40af' : '#15803d'
                  }}>
                    {user.role}
                  </span>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Jobs */}
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0, color: '#111827' }}>
              Recent Jobs
            </h3>
            <button
              onClick={() => window.location.href = '/admin/jobs'}
              style={{
                fontSize: '0.75rem',
                color: '#2563eb',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              View All →
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stats.recentJobs.map((job, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.375rem'
              }}>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', margin: 0, color: '#111827' }}>
                    {job.title}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
                    {job.company} • {job.department}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {job.isFilled && (
                    <span style={{
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '9999px',
                      backgroundColor: '#d1fae5',
                      color: '#065f46'
                    }}>
                      FILLED
                    </span>
                  )}
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                    {formatDate(job.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Applications */}
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0, color: '#111827' }}>
              Recent Applications
            </h3>
            <button
              onClick={() => window.location.href = '/admin/applications'}
              style={{
                fontSize: '0.75rem',
                color: '#2563eb',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              View All →
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stats.recentApplications.map((application, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.375rem'
              }}>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', margin: 0, color: '#111827' }}>
                    {application.applicant}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
                    Applied for: {application.job}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '9999px',
                    backgroundColor: application.status === 'Pending' ? '#fef3c7' : 
                                   application.status === 'Accepted' ? '#d1fae5' : '#fee2e2',
                    color: getStatusColor(application.status)
                  }}>
                    {application.status}
                  </span>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                    {formatDate(application.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#111827' }}>
          Quick Actions
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <button
            onClick={() => window.location.href = '/admin/users'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#1e40af'
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>👥</span>
            Manage Users
          </button>
          
          <button
            onClick={() => window.location.href = '/admin/companies'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem',
              backgroundColor: '#fef3c7',
              border: '1px solid #fbbf24',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#92400e'
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>🏢</span>
            Manage Companies
          </button>
          
          <button
            onClick={() => window.location.href = '/admin/jobs'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#15803d'
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>💼</span>
            Manage Jobs
          </button>
          
          <button
            onClick={() => window.location.href = '/admin/applications'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem',
              backgroundColor: '#fce7f3',
              border: '1px solid #f9a8d4',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#be185d'
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>📄</span>
            View Applications
          </button>
          
          <button
            onClick={() => window.location.href = '/admin/system'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem',
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151'
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>⚙️</span>
            System Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;