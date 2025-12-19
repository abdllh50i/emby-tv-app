import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import embyService from '../services/embyService';
import './AccountSelection.css';

// Constants
const REMEMBERED_USERS_KEY = 'emby_rememberedUsers';
// Default server URL - can be overridden in production via environment variable
const DEFAULT_SERVER_URL = import.meta.env.VITE_DEFAULT_SERVER_URL || 'https://emby.abod-emby-server.online';

// Helper function to generate user key
const getUserKey = (serverUrl, userId) => `${serverUrl}_${userId}`;

function AccountSelection({ onLogin }) {
  const [serverUrl, setServerUrl] = useState(DEFAULT_SERVER_URL);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [rememberedUsers, setRememberedUsers] = useState({});
  const [serverConnected, setServerConnected] = useState(false);

  useEffect(() => {
    const savedServerUrl = localStorage.getItem('emby_serverUrl');
    const urlToUse = savedServerUrl || DEFAULT_SERVER_URL;
    setServerUrl(urlToUse);
    
    // Auto-connect to default/saved server
    fetchPublicUsers(urlToUse);
    
    // Load remembered users
    const savedRememberedUsers = localStorage.getItem(REMEMBERED_USERS_KEY);
    if (savedRememberedUsers) {
      try {
        setRememberedUsers(JSON.parse(savedRememberedUsers));
      } catch (e) {
        console.error('Failed to parse remembered users:', e);
      }
    }
  }, []);

  const fetchPublicUsers = async (url) => {
    try {
      setLoading(true);
      const publicUsers = await embyService.getPublicUsers(url);
      setUsers(publicUsers);
      setServerConnected(true);
      setError('');
    } catch (err) {
      setError('Failed to connect to server. Please check the URL.');
      setUsers([]);
      setServerConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const handleServerSubmit = (e) => {
    e.preventDefault();
    if (serverUrl.trim()) {
      localStorage.setItem('emby_serverUrl', serverUrl);
      fetchPublicUsers(serverUrl);
    }
  };

  const handleUserSelect = (user) => {
    // Check if user is remembered (has stored token)
    const userKey = getUserKey(serverUrl, user.Id);
    if (rememberedUsers[userKey]) {
      // Auto-login with stored credentials
      onLogin(rememberedUsers[userKey].token, user.Id, serverUrl);
    } else {
      // Show password input
      setSelectedUser(user);
      setShowPasswordInput(true);
      setPassword('');
      setError('');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setLoading(true);
      setError('');
      const authData = await embyService.authenticate(
        serverUrl,
        selectedUser.Name,
        password
      );
      
      // Save user as remembered
      const userKey = getUserKey(serverUrl, selectedUser.Id);
      const updatedRememberedUsers = {
        ...rememberedUsers,
        [userKey]: {
          token: authData.AccessToken,
          userName: selectedUser.Name,
          userId: selectedUser.Id,
        }
      };
      setRememberedUsers(updatedRememberedUsers);
      localStorage.setItem(REMEMBERED_USERS_KEY, JSON.stringify(updatedRememberedUsers));
      
      onLogin(authData.AccessToken, authData.User.Id, serverUrl);
    } catch (err) {
      setError('Invalid password. Please try again.');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setShowPasswordInput(false);
    setSelectedUser(null);
    setPassword('');
    setError('');
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showPasswordInput) {
        // In password view, Escape goes back
        if (e.key === 'Escape') {
          e.preventDefault();
          handleBack();
        }
        return;
      }

      if (!serverConnected || users.length === 0) return;

      const gridColumns = 3; // 3 users per row
      const totalUsers = users.length;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => {
            const newIndex = prev - gridColumns;
            return newIndex >= 0 ? newIndex : prev;
          });
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => {
            const newIndex = prev + gridColumns;
            return newIndex < totalUsers ? newIndex : prev;
          });
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setFocusedIndex((prev) => Math.max(0, prev - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setFocusedIndex((prev) => Math.min(totalUsers - 1, prev + 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (users[focusedIndex]) {
            handleUserSelect(users[focusedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          // Allow changing server
          setUsers([]);
          setServerConnected(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [users, focusedIndex, showPasswordInput, serverConnected]);

  return (
    <div className="account-selection">
      <motion.div
        className="account-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="logo">
          <h1>Emby TV</h1>
        </div>

        {!users.length ? (
          <motion.form
            onSubmit={handleServerSubmit}
            className="server-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2>Connect to Your Emby Server</h2>
            <input
              type="text"
              placeholder="Server URL (e.g., http://192.168.1.100:8096)"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              className="server-input"
              autoFocus
            />
            <motion.button
              type="submit"
              className="connect-button connect-button-hover"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
            >
              {loading ? 'Connecting...' : 'Connect'}
            </motion.button>
            {error && <p className="error-message">{error}</p>}
            <div className="keyboard-hint">
              <p>Press <kbd>Enter</kbd> to connect</p>
            </div>
          </motion.form>
        ) : showPasswordInput ? (
          <motion.form
            onSubmit={handleLogin}
            className="password-form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button type="button" onClick={handleBack} className="back-button">
              ← Back
            </button>
            <div className="selected-user">
              <div className="user-avatar">
                {selectedUser.PrimaryImageTag ? (
                  <img
                    src={embyService.getImageUrl(selectedUser.Id, 'Primary', 200)}
                    alt={selectedUser.Name}
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {selectedUser.Name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <h2>{selectedUser.Name}</h2>
            </div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="password-input"
              autoFocus
            />
            <motion.button
              type="submit"
              className="login-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </motion.button>
            {error && <p className="error-message">{error}</p>}
          </motion.form>
        ) : (
          <motion.div
            className="users-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2>Who&apos;s watching?</h2>
            <div className="users-list">
              {users.map((user, index) => {
                const userKey = getUserKey(serverUrl, user.Id);
                const isRemembered = rememberedUsers[userKey];
                
                return (
                  <motion.div
                    key={user.Id}
                    className={`user-card ${focusedIndex === index ? 'focused' : ''} ${isRemembered ? 'remembered' : ''}`}
                    onClick={() => handleUserSelect(user)}
                    whileHover={{ scale: 1.08, y: -8 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <div className="user-avatar">
                      {user.PrimaryImageTag ? (
                        <img
                          src={embyService.getImageUrl(user.Id, 'Primary', 200)}
                          alt={user.Name}
                        />
                      ) : (
                        <div className="avatar-placeholder">
                          {user.Name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {isRemembered && (
                        <div className="remembered-badge">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="user-name">{user.Name}</p>
                    {isRemembered && <p className="user-status">Auto-login</p>}
                  </motion.div>
                );
              })}
            </div>
            <div className="keyboard-hint">
              <p>
                Use <kbd>Arrow Keys</kbd> to navigate &nbsp;•&nbsp; Press <kbd>Enter</kbd> to select &nbsp;•&nbsp; Press <kbd>Esc</kbd> to change server
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default AccountSelection;
