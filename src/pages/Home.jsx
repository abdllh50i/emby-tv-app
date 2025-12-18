import { useState, useEffect } from 'react';
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
          className="hero-section"
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
              </div>
              {featuredItem.Overview && (
                <p className="hero-description">
                  {featuredItem.Overview.length > 200
                    ? featuredItem.Overview.substring(0, 200) + '...'
                    : featuredItem.Overview}
                </p>
              )}
              <div className="hero-actions">
                <motion.button
                  className="play-button"
                  whileHover={{ scale: 1.08, boxShadow: '0 10px 30px rgba(255, 255, 255, 0.3)' }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleItemClick(featuredItem)}
                  transition={{ duration: 0.2 }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Play
                </motion.button>
                <motion.button
                  className="info-button"
                  whileHover={{ scale: 1.08, backgroundColor: 'rgba(255, 255, 255, 0.35)' }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                >
                  More Info
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Content Sections */}
      <div className="content-sections">
        {latestMovies.length > 0 && (
          <MediaRow
            title="Latest Movies"
            items={latestMovies}
            onItemClick={handleItemClick}
          />
        )}

        {latestSeries.length > 0 && (
          <MediaRow
            title="Latest TV Shows"
            items={latestSeries}
            onItemClick={handleItemClick}
          />
        )}

        {allMovies.length > 0 && (
          <MediaRow
            title="All Movies"
            items={allMovies}
            onItemClick={handleItemClick}
          />
        )}

        {allSeries.length > 0 && (
          <MediaRow
            title="All TV Shows"
            items={allSeries}
            onItemClick={handleItemClick}
          />
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
