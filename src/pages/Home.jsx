import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
    navigate(`/player/${item.Id}`);
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
          <button className="logout-button" onClick={onLogout}>
            Sign Out
          </button>
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
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleItemClick(featuredItem)}
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
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
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
    </div>
  );
}

export default Home;
