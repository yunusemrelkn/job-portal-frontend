import React, { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getRoleString } from '../types';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <nav style={{ 
        backgroundColor: 'white', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        padding: '0 1rem'
      }}>
        <div style={{ 
          maxWidth: '1280px', 
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '64px'
        }}>
          <div>
            <button 
              onClick={() => navigate('/')}
              style={{ 
                fontSize: '1.25rem', 
                fontWeight: 'bold', 
                color: '#2563eb',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              JobSeeker
            </button>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {user ? (
              <>
                <button 
                  onClick={() => navigate('/jobs')}
                  style={{ 
                    color: '#374151', 
                    textDecoration: 'none',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Jobs
                </button>
                
                {user && getRoleString(user.role) === 'JobSeeker' && (
                  <>
                    <button 
                      onClick={() => navigate('/favorites')}
                      style={{ 
                        color: '#374151', 
                        textDecoration: 'none',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Favorites
                    </button>
                    <button 
                      onClick={() => navigate('/applications')}
                      style={{ 
                        color: '#374151', 
                        textDecoration: 'none',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      My Applications
                    </button>
                    <button 
                      onClick={() => navigate('/cv')}
                      style={{ 
                        color: '#374151', 
                        textDecoration: 'none',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      My CV
                    </button>
                  </>
                )}
                
                {user && getRoleString(user.role) === 'Employer' && (
                  <>
                    <button 
                      onClick={() => navigate('/employer/jobs')}
                      style={{ 
                        color: '#374151', 
                        textDecoration: 'none',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      My Jobs
                    </button>
                    <button 
                      onClick={() => navigate('/employer/applications')}
                      style={{ 
                        color: '#374151', 
                        textDecoration: 'none',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Applications
                    </button>
                  </>
                )}
                
                {user && getRoleString(user.role) === 'Admin' && (
                  <button 
                    onClick={() => navigate('/admin')}
                    style={{ 
                      color: '#374151', 
                      textDecoration: 'none',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Admin Panel
                  </button>
                )}
                
                <button 
                  onClick={() => navigate('/profile')}
                  style={{ 
                    color: '#374151', 
                    textDecoration: 'none',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Profile
                </button>
                
                <span style={{ color: '#6b7280' }}>
                  {user.name} {user.surname}
                </span>
                
                <button
                  onClick={handleLogout}
                  style={{
                    backgroundColor: '#dc2626',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/login')}
                  style={{ 
                    color: '#374151', 
                    textDecoration: 'none',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Login
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  style={{
                    backgroundColor: '#2563eb',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
      
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1rem' }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;