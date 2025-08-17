import React from 'react';
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
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;
