import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AccountSelection from './pages/AccountSelection';
import Home from './pages/Home';
import SeriesDetails from './pages/SeriesDetails';
import VideoPlayer from './pages/VideoPlayer';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAccountSelection, setShowAccountSelection] = useState(true);

  useEffect(() => {
    // Always start at account selection page, but check if user was authenticated
    const token = localStorage.getItem('emby_token');
    const userId = localStorage.getItem('emby_userId');
    if (token && userId) {
      // User was authenticated before, but we still show account selection
      // They can auto-login if they're remembered
      setShowAccountSelection(true);
    }
  }, []);

  const handleLogin = (token, userId, serverUrl) => {
    localStorage.setItem('emby_token', token);
    localStorage.setItem('emby_userId', userId);
    localStorage.setItem('emby_serverUrl', serverUrl);
    setIsAuthenticated(true);
    setShowAccountSelection(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('emby_token');
    localStorage.removeItem('emby_userId');
    // Keep serverUrl and remembered users so they can auto-login next time
    setIsAuthenticated(false);
    setShowAccountSelection(true);
  };

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
                <Navigate to="/home" replace /> : 
                <AccountSelection onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/home" 
            element={
              isAuthenticated ? 
                <Home onLogout={handleLogout} /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/series/:itemId" 
            element={
              isAuthenticated ? 
                <SeriesDetails /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/player/:itemId" 
            element={
              isAuthenticated ? 
                <VideoPlayer /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
