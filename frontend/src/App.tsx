import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Builder from './Builder';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';

const App: React.FC = () => {
  // TODO: Add authentication state management
  // Temporarily disabled for testing - will be enabled after API integration
  const isAuthenticated = true; // Changed from false to true for testing

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/signin" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignIn />
        } />
        
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
    </Router>
  );
};

export default App;
