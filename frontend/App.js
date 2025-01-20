import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import Signup from './Signup';
import Login from './Login';
import Dashboard from "./Dashboard";
import NewsList from "./NewsList";
import NewsForm from "./NewsForm";
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';



function App() {
  // Initialize authentication state from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('token') ? true : false;
  });

  // Update authentication handlers
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');  // Remove the token
    setIsAuthenticated(false);  // Update state to reflect the user is logged out
  };

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
        />
        
        <Route 
          path="/signup" 
          element={!isAuthenticated ? <SignupRedirect /> : <Navigate to="/dashboard" replace />} 
        />
        
        <Route 
          path="/login" 
          element={
            !isAuthenticated ? (
              <Login onLoginSuccess={handleLoginSuccess} />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Dashboard onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/NewsList"
          element={
            isAuthenticated ? (
              <NewsListWithBack />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/NewsForm"
          element={
            isAuthenticated ? (
              <NewsFormWithBack />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

// Component to handle signup and redirect to login
function SignupRedirect() {
  const navigate = useNavigate();

  const handleSignupSuccess = () => {
    navigate('/login', { replace: true });
  };

  return <Signup onSignupSuccess={handleSignupSuccess} />;
}

// NewsList component with back navigation
function NewsListWithBack() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/dashboard", { replace: true });
  };

  return <NewsList onBack={handleBack} />;
}

// NewsForm component with back navigation
function NewsFormWithBack() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/NewsList", { replace: true });
  };

  return <NewsForm onBack={handleBack} />;
}

export default App;
