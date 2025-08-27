import React from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Builder from './Builder';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import GoogleCallback from './components/auth/GoogleCallback';
import { AuthProvider, useAuth } from './context/AuthContext';

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/signin" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignIn />
      } />
      
      {/* OAuth Callback Route */}
      <Route path="/auth/callback" element={<GoogleCallback />} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={
        isAuthenticated ? <Dashboard /> : <Navigate to="/signin" replace />
      } />
      
      {/* Builder Route - Protected */}
      <Route path="/builder" element={
        isAuthenticated ? <Builder /> : <Navigate to="/signin" replace />
      } />
      
      {/* Default Route */}
      <Route path="/" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/signin" replace />
      } />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-grid-pattern">
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
              loading: {
                duration: Infinity,
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
