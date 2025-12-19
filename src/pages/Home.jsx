import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import embyService from '../services/embyService';
import MediaRow from '../components/MediaRow';
import './Home.css';

function Home({ onLogout }) {
  const navigate = useNavigate();
  const [latestMovies, setLatestMovies] = useState([]);
  const [latestSeries, setLatestSeries] = useState([]);
  const [allMovies, setAllMovies] = useState([]);
  const [allSeries, setAllSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredItem, setFeaturedItem] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [activeSection, setActiveSection] = useState(0); // 0=hero, 1=row1, 2=row2, etc.
  const [activeRowIndex, setActiveRowIndex] = useState(-1);
  const heroPlayButtonRef = useRef(null);
  const rowRefs = useRef([]);

  useEffect(() => {
    fetchMediaData();
  }, []);

  const fetchMediaData = async () => {
    try {
      setLoading(true);
      
      // Fetch latest items
      const latest = await embyService.getLatestMedia('Movie,Series');
      const movies = latest.filter(item => item.Type === 'Movie');
      const series = latest.filter(item => item.Type === 'Series');
      
      setLatestMovies(movies.slice(0, 8));
      setLatestSeries(series.slice(0, 8));
      
      // Set featured item (first movie or series)
      if (latest.length > 0) {
        setFeaturedItem(latest[0]);
      }

      // Fetch all movies and series
      const allMoviesData = await embyService.getItemsByType('Movie', null, 20);
      const allSeriesData = await embyService.getItemsByType('Series', null, 20);
      
      setAllMovies(allMoviesData.Items || []);
      setAllSeries(allSeriesData.Items || []);
      
    } catch (error) {
      console.error('Error fetching media data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item) => {
    // Check if it's a series or movie
    if (item.Type === 'Series') {
      // Navigate to series details page to show seasons/episodes
      navigate(`/series/${item.Id}`);
    } else {
      // Navigate directly to player for movies
      navigate(`/player/${item.Id}`);
    }
  };

  // Enhanced keyboard navigation for the entire page
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't handle if help is showing
      if (showHelp) return;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (activeSection > 0) {
            setActiveSection(activeSection - 1);
            setActiveRowIndex(-1);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          const totalSections = 1 + (latestMovies.length > 0 ? 1 : 0) + (latestSeries.length > 0 ? 1 : 0) + 
                                (allMovies.length > 0 ? 1 : 0) + (allSeries.length > 0 ? 1 : 0);
          if (activeSection < totalSections - 1) {
            setActiveSection(activeSection + 1);
            setActiveRowIndex(activeSection > 0 ? 0 : -1);
          }
          break;
        case 'Enter':
          e.preventDefault();
          if (activeSection === 0 && featuredItem) {
            handleItemClick(featuredItem);
          } else if (activeSection > 0) {
            // Let MediaRow handle the Enter key
          }
          break;
        case 'Escape':
          e.preventDefault();
          if (activeSection > 0) {
            setActiveSection(0);
            setActiveRowIndex(-1);
          }
          break;
        case '?':
          e.preventDefault();
          setShowHelp(!showHelp);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSection, showHelp, featuredItem, latestMovies, latestSeries, allMovies, allSeries]);

  // Auto-focus hero play button when section is 0
  useEffect(() => {
    if (activeSection === 0 && heroPlayButtonRef.current) {
      heroPlayButtonRef.current.focus();
    }
  }, [activeSection]);

  if (loading) {
    return (
      <div className="home-loading">
        <div className="spinner"></div>
        <p>Loading your library...</p>
      </div>
    );
  }

  return (
    <div className="home">
      {/* Header */}
      <header className="home-header">
        <div className="header-content">
          <h1 className="app-title">Emby TV</h1>
          <nav className="nav-menu">
            <button className="nav-item active">Home</button>
            <button className="nav-item">Movies</button>
            <button className="nav-item">TV Shows</button>
            <button className="nav-item">Library</button>
          </nav>
          <div className="header-actions">
            <button className="help-button" onClick={() => setShowHelp(!showHelp)} title="Keyboard Shortcuts">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z" />
              </svg>
            </button>
            <button className="logout-button" onClick={onLogout}>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Featured Hero Section */}
      {featuredItem && (
        <motion.div
          className={`hero-section ${activeSection === 0 ? 'active' : ''}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div
            className="hero-background"
            style={{
              backgroundImage: `url(${embyService.getBackdropUrl(featuredItem.Id, 0, 1920)})`,
            }}
          >
            <div className="hero-overlay"></div>
          </div>
          <div className="hero-content">
            <motion.div
              className="hero-info"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="hero-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                Featured
              </div>
              <h2 className="hero-title">{featuredItem.Name}</h2>
              <div className="hero-meta">
                {featuredItem.ProductionYear && (
                  <span className="meta-item">{featuredItem.ProductionYear}</span>
                )}
                {featuredItem.OfficialRating && (
                  <span className="meta-item">{featuredItem.OfficialRating}</span>
                )}
                {featuredItem.RunTimeTicks && (
                  <span className="meta-item">
                    {Math.floor(featuredItem.RunTimeTicks / 600000000)} min
                  </span>
                )}
                {featuredItem.CommunityRating && (
                  <span className="meta-item">
                    ⭐ {featuredItem.CommunityRating.toFixed(1)}
                  </span>
                )}
              </div>
              {featuredItem.Overview && (
                <p className="hero-description">
                  {featuredItem.Overview.length > 250
                    ? featuredItem.Overview.substring(0, 250) + '...'
                    : featuredItem.Overview}
                </p>
              )}
              <div className="hero-actions">
                <motion.button
                  ref={heroPlayButtonRef}
                  className={`play-button ${activeSection === 0 ? 'focused' : ''}`}
                  whileHover={{ scale: 1.08, boxShadow: '0 12px 35px rgba(255, 255, 255, 0.35)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleItemClick(featuredItem)}
                  transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Play Now
                </motion.button>
                <motion.button
                  className="info-button"
                  whileHover={{ scale: 1.08, backgroundColor: 'rgba(255, 255, 255, 0.35)' }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                  </svg>
                  More Info
                </motion.button>
              </div>
              {activeSection === 0 && (
                <div className="hero-hint">
                  <kbd>↓</kbd> Browse Library • <kbd>Enter</kbd> Play • <kbd>?</kbd> Help
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Content Sections */}
      <div className="content-sections">
        {latestMovies.length > 0 && (
          <div className={`row-wrapper ${activeSection === 1 ? 'active-row' : ''}`}>
            <MediaRow
              ref={(el) => (rowRefs.current[0] = el)}
              title="Latest Movies"
              items={latestMovies}
              onItemClick={handleItemClick}
              isActive={activeSection === 1}
              initialFocusIndex={activeSection === 1 ? 0 : -1}
            />
          </div>
        )}

        {latestSeries.length > 0 && (
          <div className={`row-wrapper ${activeSection === (latestMovies.length > 0 ? 2 : 1) ? 'active-row' : ''}`}>
            <MediaRow
              ref={(el) => (rowRefs.current[1] = el)}
              title="Latest TV Shows"
              items={latestSeries}
              onItemClick={handleItemClick}
              isActive={activeSection === (latestMovies.length > 0 ? 2 : 1)}
              initialFocusIndex={activeSection === (latestMovies.length > 0 ? 2 : 1) ? 0 : -1}
            />
          </div>
        )}

        {allMovies.length > 0 && (
          <div className={`row-wrapper ${activeSection === (2 + (latestSeries.length > 0 ? 1 : 0)) ? 'active-row' : ''}`}>
            <MediaRow
              ref={(el) => (rowRefs.current[2] = el)}
              title="All Movies"
              items={allMovies}
              onItemClick={handleItemClick}
              isActive={activeSection === (2 + (latestSeries.length > 0 ? 1 : 0))}
              initialFocusIndex={activeSection === (2 + (latestSeries.length > 0 ? 1 : 0)) ? 0 : -1}
            />
          </div>
        )}

        {allSeries.length > 0 && (
          <div className={`row-wrapper ${activeSection === (3 + (latestSeries.length > 0 ? 1 : 0)) ? 'active-row' : ''}`}>
            <MediaRow
              ref={(el) => (rowRefs.current[3] = el)}
              title="All TV Shows"
              items={allSeries}
              onItemClick={handleItemClick}
              isActive={activeSection === (3 + (latestSeries.length > 0 ? 1 : 0))}
              initialFocusIndex={activeSection === (3 + (latestSeries.length > 0 ? 1 : 0)) ? 0 : -1}
            />
          </div>
        )}
      </div>

      {/* Help Overlay */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            className="help-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              className="help-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2>Remote Control / Keyboard Shortcuts</h2>
              <div className="shortcuts-grid">
                <div className="shortcut-item">
                  <div className="shortcut-key">Arrow Keys</div>
                  <div className="shortcut-desc">Navigate through items</div>
                </div>
                <div className="shortcut-item">
                  <div className="shortcut-key">Enter</div>
                  <div className="shortcut-desc">Select / Play</div>
                </div>
                <div className="shortcut-item">
                  <div className="shortcut-key">Escape</div>
                  <div className="shortcut-desc">Go Back</div>
                </div>
                <div className="shortcut-item">
                  <div className="shortcut-key">Space / K</div>
                  <div className="shortcut-desc">Play / Pause</div>
                </div>
                <div className="shortcut-item">
                  <div className="shortcut-key">F</div>
                  <div className="shortcut-desc">Fullscreen</div>
                </div>
                <div className="shortcut-item">
                  <div className="shortcut-key">M</div>
                  <div className="shortcut-desc">Mute / Unmute</div>
                </div>
                <div className="shortcut-item">
                  <div className="shortcut-key">Left / Right</div>
                  <div className="shortcut-desc">Skip ±10 seconds</div>
                </div>
                <div className="shortcut-item">
                  <div className="shortcut-key">Up / Down</div>
                  <div className="shortcut-desc">Volume Control</div>
                </div>
              </div>
              <button className="help-close" onClick={() => setShowHelp(false)}>
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Home;
