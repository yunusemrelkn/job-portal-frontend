import React, { ReactNode, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { getRoleString } from '../types';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const userRole = user ? getRoleString(user.role) : null;

  const navLinkStyle = (path: string) => ({
    color: isActive(path) ? '#2563eb' : '#374151',
    textDecoration: 'none',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: isActive(path) ? '600' : '500',
    backgroundColor: isActive(path) ? '#eff6ff' : 'transparent',
    transition: 'all 0.2s ease-in-out'
  });

  const mobileNavLinkStyle = (path: string) => ({
    ...navLinkStyle(path),
    display: 'block',
    width: '100%',
    textAlign: 'left' as const,
    padding: '0.75rem 1rem',
    borderRadius: '0'
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Navigation Bar */}
      <nav style={{ 
        backgroundColor: 'white', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ 
          maxWidth: '1280px', 
          margin: '0 auto',
          padding: '0 1rem'
        }}>
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '64px'
          }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button 
                onClick={() => handleNavigation('/')}
                style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold', 
                  color: '#2563eb',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span style={{ fontSize: '1.75rem' }}>💼</span>
                JobSeeker
              </button>
            </div>
            
            {/* Desktop Navigation */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem'
            }} className="desktop-nav">
              {user ? (
                <>
                  <button 
                    onClick={() => handleNavigation('/jobs')}
                    style={navLinkStyle('/jobs')}
                  >
                    Jobs
                  </button>
                  
                  {userRole === 'JobSeeker' && (
                    <>
                      <button 
                        onClick={() => handleNavigation('/suggestions')}
                        style={{
                          ...navLinkStyle('/suggestions'),
                          background: isActive('/suggestions') 
                            ? 'linear-gradient(135deg, #eff6ff, #dbeafe)' 
                            : 'transparent',
                          border: isActive('/suggestions') 
                            ? '1px solid #93c5fd' 
                            : '1px solid transparent'
                        }}
                      >
                        🎯 Suggestions
                      </button>
                      <button 
                        onClick={() => handleNavigation('/favorites')}
                        style={navLinkStyle('/favorites')}
                      >
                        Favorites
                      </button>
                      <button 
                        onClick={() => handleNavigation('/applications')}
                        style={navLinkStyle('/applications')}
                      >
                        Applications
                      </button>
                      <button 
                        onClick={() => handleNavigation('/cv')}
                        style={navLinkStyle('/cv')}
                      >
                        My CV
                      </button>
                    </>
                  )}
                  
                  {userRole === 'Employer' && (
                    <>
                      <button 
                        onClick={() => handleNavigation('/employer/jobs')}
                        style={navLinkStyle('/employer/jobs')}
                      >
                        My Jobs
                      </button>
                      <button 
                        onClick={() => handleNavigation('/employer/applications')}
                        style={navLinkStyle('/employer/applications')}
                      >
                        Applications
                      </button>
                    </>
                  )}
                  
                  {userRole === 'Admin' && (
                    <button 
                      onClick={() => handleNavigation('/admin')}
                      style={navLinkStyle('/admin')}
                    >
                      Admin Panel
                    </button>
                  )}
                  
                  {/* User Menu */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem',
                    marginLeft: '1rem',
                    paddingLeft: '1rem',
                    borderLeft: '1px solid #e5e7eb'
                  }}>
                    <button 
                      onClick={() => handleNavigation('/profile')}
                      style={{
                        ...navLinkStyle('/profile'),
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <span style={{ fontSize: '1.25rem' }}>👤</span>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.875rem', color: '#374151' }}>
                          {user.name} {user.surname}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          {userRole}
                        </span>
                      </div>
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      style={{
                        backgroundColor: '#dc2626',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.375rem',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => handleNavigation('/jobs')}
                    style={navLinkStyle('/jobs')}
                  >
                    Browse Jobs
                  </button>
                  <button 
                    onClick={() => handleNavigation('/login')}
                    style={navLinkStyle('/login')}
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => handleNavigation('/register')}
                    style={{
                      backgroundColor: '#2563eb',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    Register
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{
                display: 'none',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                gap: '4px'
              }}
              className="mobile-menu-button"
            >
              <span style={{
                width: '20px',
                height: '2px',
                backgroundColor: '#374151',
                transition: 'all 0.3s',
                transform: isMobileMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none'
              }}></span>
              <span style={{
                width: '20px',
                height: '2px',
                backgroundColor: '#374151',
                transition: 'all 0.3s',
                opacity: isMobileMenuOpen ? 0 : 1
              }}></span>
              <span style={{
                width: '20px',
                height: '2px',
                backgroundColor: '#374151',
                transition: 'all 0.3s',
                transform: isMobileMenuOpen ? 'rotate(-45deg) translate(7px, -6px)' : 'none'
              }}></span>
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div style={{
              display: 'block',
              backgroundColor: 'white',
              borderTop: '1px solid #e5e7eb',
              paddingBottom: '1rem'
            }} className="mobile-nav">
              {user ? (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {/* User Info */}
                  <div style={{
                    padding: '1rem',
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: '#f9fafb'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>👤</span>
                      <div>
                        <p style={{ fontWeight: '600', color: '#111827', margin: 0 }}>
                          {user.name} {user.surname}
                        </p>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                          {userRole} {user.companyName && `at ${user.companyName}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleNavigation('/jobs')}
                    style={mobileNavLinkStyle('/jobs')}
                  >
                    Jobs
                  </button>
                  
                  {userRole === 'JobSeeker' && (
                    <>
                      <button 
                        onClick={() => handleNavigation('/suggestions')}
                        style={{
                          ...mobileNavLinkStyle('/suggestions'),
                          background: isActive('/suggestions') 
                            ? 'linear-gradient(135deg, #eff6ff, #dbeafe)' 
                            : 'transparent'
                        }}
                      >
                        🎯 Job Suggestions
                      </button>
                      <button 
                        onClick={() => handleNavigation('/favorites')}
                        style={mobileNavLinkStyle('/favorites')}
                      >
                        Favorites
                      </button>
                      <button 
                        onClick={() => handleNavigation('/applications')}
                        style={mobileNavLinkStyle('/applications')}
                      >
                        Applications
                      </button>
                      <button 
                        onClick={() => handleNavigation('/cv')}
                        style={mobileNavLinkStyle('/cv')}
                      >
                        My CV
                      </button>
                    </>
                  )}
                  
                  {userRole === 'Employer' && (
                    <>
                      <button 
                        onClick={() => handleNavigation('/employer/jobs')}
                        style={mobileNavLinkStyle('/employer/jobs')}
                      >
                        My Jobs
                      </button>
                      <button 
                        onClick={() => handleNavigation('/employer/applications')}
                        style={mobileNavLinkStyle('/employer/applications')}
                      >
                        Applications
                      </button>
                    </>
                  )}
                  
                  {userRole === 'Admin' && (
                    <button 
                      onClick={() => handleNavigation('/admin')}
                      style={mobileNavLinkStyle('/admin')}
                    >
                      Admin Panel
                    </button>
                  )}
                  
                  <button 
                    onClick={() => handleNavigation('/profile')}
                    style={mobileNavLinkStyle('/profile')}
                  >
                    Profile Settings
                  </button>
                  
                  <div style={{ padding: '1rem', borderTop: '1px solid #e5e7eb' }}>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        padding: '0.75rem',
                        borderRadius: '0.375rem',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <button 
                    onClick={() => handleNavigation('/jobs')}
                    style={mobileNavLinkStyle('/jobs')}
                  >
                    Browse Jobs
                  </button>
                  <button 
                    onClick={() => handleNavigation('/login')}
                    style={mobileNavLinkStyle('/login')}
                  >
                    Login
                  </button>
                  <div style={{ padding: '1rem' }}>
                    <button 
                      onClick={() => handleNavigation('/register')}
                      style={{
                        width: '100%',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        padding: '0.75rem',
                        borderRadius: '0.375rem',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                    >
                      Register
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
      
      {/* Main Content */}
      <main style={{ 
        maxWidth: '1280px', 
        margin: '0 auto', 
        padding: '2rem 1rem',
        minHeight: 'calc(100vh - 64px)'
      }}>
        {children}
      </main>

      {/* Add CSS for mobile responsiveness */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-button {
            display: flex !important;
          }
          .mobile-nav {
            display: block !important;
          }
        }
        
        @media (min-width: 769px) {
          .mobile-nav {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;