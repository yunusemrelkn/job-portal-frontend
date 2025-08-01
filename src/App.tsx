import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JobsPage from './pages/JobsPage';
import CVPage from './pages/CVPage';
import ApplicationsPage from './pages/ApplicationsPage';
import FavoritesPage from './pages/FavoritesPage';
import SuggestionsPage from './pages/SuggestionsPage';
import ProfilePage from './pages/ProfilePage';
import { getRoleString } from './types';
import './App.css';

// Loading Component
const LoadingSpinner: React.FC = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
    flexDirection: 'column',
    gap: '1rem'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '4px solid #f3f4f6',
      borderTop: '4px solid #2563eb',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
    <p style={{ color: '#6b7280' }}>Loading...</p>
  </div>
);

// Protected Route Component
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  allowedRoles?: string[];
  requireAuth?: boolean;
}> = ({ 
  children, 
  allowedRoles,
  requireAuth = true
}) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (requireAuth && !user) {
    console.log('Redirecting to login - no user');
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && user) {
    const userRoleString = getRoleString(user.role);
    
    console.log('Role check:', {
      userRole: user.role,
      userRoleString,
      allowedRoles,
      hasAccess: allowedRoles.includes(userRoleString)
    });
    
    if (!allowedRoles.includes(userRoleString)) {
      console.log('Access denied - role not allowed:', userRoleString, 'allowed:', allowedRoles);
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          textAlign: 'center',
          padding: '2rem'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚫</div>
          <h2 style={{ color: '#dc2626', marginBottom: '0.5rem' }}>Access Denied</h2>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
            You need {allowedRoles.join(' or ')} role to access this page.
          </p>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
            Your current role: {userRoleString}
          </p>
          <button
            onClick={() => window.history.back()}
            style={{
              backgroundColor: '#6b7280',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.375rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Go Back
          </button>
        </div>
      );
    }
  }
  
  return <>{children}</>;
};

// Main App Component
const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            
            <Route 
              path="/cv" 
              element={
                <ProtectedRoute allowedRoles={['JobSeeker']}>
                  <CVPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/applications" 
              element={
                <ProtectedRoute allowedRoles={['JobSeeker']}>
                  <ApplicationsPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/favorites" 
              element={
                <ProtectedRoute allowedRoles={['JobSeeker']}>
                  <FavoritesPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/suggestions" 
              element={
                <ProtectedRoute allowedRoles={['JobSeeker']}>
                  <SuggestionsPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            
            {/* Employer routes */}
            <Route 
              path="/employer/jobs" 
              element={
                <ProtectedRoute allowedRoles={['Employer']}>
                  <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <h2>Employer Jobs Dashboard</h2>
                    <p>Coming soon - manage your job postings here</p>
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/employer/applications" 
              element={
                <ProtectedRoute allowedRoles={['Employer']}>
                  <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <h2>Employer Applications Dashboard</h2>
                    <p>Coming soon - manage job applications here</p>
                  </div>
                </ProtectedRoute>
              } 
            />
            
            {/* Admin routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <h2>Admin Dashboard</h2>
                    <p>Coming soon - system administration panel</p>
                  </div>
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
};

export default App;