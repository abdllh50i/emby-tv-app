import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import embyService from '../services/embyService';
import './SeriesDetails.css';

function SeriesDetails() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [seriesDetails, setSeriesDetails] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [focusedEpisodeIndex, setFocusedEpisodeIndex] = useState(0);

  useEffect(() => {
    fetchSeriesData();
  }, [itemId]);

  useEffect(() => {
    if (selectedSeason) {
      fetchEpisodes(selectedSeason.Id);
    }
  }, [selectedSeason]);

  const fetchSeriesData = async () => {
    try {
      setLoading(true);
      const details = await embyService.getItemDetails(itemId);
      setSeriesDetails(details);

      // Fetch seasons
      const seasonsData = await embyService.getSeasons(itemId);
      setSeasons(seasonsData);
      
      // Select first season by default
      if (seasonsData.length > 0) {
        setSelectedSeason(seasonsData[0]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching series data:', error);
      setLoading(false);
    }
  };

  const fetchEpisodes = async (seasonId) => {
    try {
      const episodesData = await embyService.getEpisodes(seasonId);
      setEpisodes(episodesData);
      setFocusedEpisodeIndex(0);
    } catch (error) {
      console.error('Error fetching episodes:', error);
    }
  };

  const handleSeasonSelect = (season) => {
    setSelectedSeason(season);
  };

  const handleEpisodeClick = (episode) => {
    navigate(`/player/${episode.Id}`);
  };

  const handleBack = () => {
    navigate('/home');
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setFocusedEpisodeIndex((prev) => Math.max(0, prev - 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedEpisodeIndex((prev) => Math.min(episodes.length - 1, prev + 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (episodes[focusedEpisodeIndex]) {
            handleEpisodeClick(episodes[focusedEpisodeIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          handleBack();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [episodes, focusedEpisodeIndex]);

  if (loading) {
    return (
      <div className="series-loading">
        <div className="spinner"></div>
        <p>Loading series...</p>
      </div>
    );
  }

  return (
    <div className="series-details">
      {/* Header */}
      <div className="series-header">
        <button className="back-btn" onClick={handleBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
          Back
        </button>
      </div>

      {/* Series Info */}
      {seriesDetails && (
        <div className="series-info-section">
          <div
            className="series-backdrop"
            style={{
              backgroundImage: `url(${embyService.getBackdropUrl(seriesDetails.Id, 0, 1920)})`,
            }}
          >
            <div className="backdrop-overlay"></div>
          </div>
          <div className="series-info-content">
            <div className="series-poster">
              <img
                src={embyService.getImageUrl(seriesDetails.Id, 'Primary', 400)}
                alt={seriesDetails.Name}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <div className="series-meta">
              <h1 className="series-title">{seriesDetails.Name}</h1>
              <div className="series-details-meta">
                {seriesDetails.ProductionYear && (
                  <span className="meta-item">{seriesDetails.ProductionYear}</span>
                )}
                {seriesDetails.OfficialRating && (
                  <span className="meta-item">{seriesDetails.OfficialRating}</span>
                )}
                {seasons.length > 0 && (
                  <span className="meta-item">{seasons.length} Season{seasons.length > 1 ? 's' : ''}</span>
                )}
              </div>
              {seriesDetails.Overview && (
                <p className="series-overview">{seriesDetails.Overview}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Seasons Selector */}
      <div className="seasons-section">
        <div className="seasons-tabs">
          {seasons.map((season) => (
            <button
              key={season.Id}
              className={`season-tab ${selectedSeason?.Id === season.Id ? 'active' : ''}`}
              onClick={() => handleSeasonSelect(season)}
            >
              {season.Name}
            </button>
          ))}
        </div>
      </div>

      {/* Episodes List */}
      <div className="episodes-section">
        <h2 className="episodes-title">Episodes</h2>
        <div className="episodes-list">
          {episodes.map((episode, index) => (
            <motion.div
              key={episode.Id}
              className={`episode-card ${focusedEpisodeIndex === index ? 'focused' : ''}`}
              onClick={() => handleEpisodeClick(episode)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="episode-image">
                <img
                  src={embyService.getImageUrl(episode.Id, 'Primary', 400)}
                  alt={episode.Name}
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225"%3E%3Crect width="400" height="225" fill="%232a2a2a"/%3E%3C/svg%3E';
                  }}
                />
                <div className="episode-number">
                  {episode.IndexNumber}
                </div>
                {episode.UserData?.Played && (
                  <div className="played-indicator">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="episode-info">
                <h3 className="episode-title">
                  {episode.IndexNumber}. {episode.Name}
                </h3>
                {episode.RunTimeTicks && (
                  <span className="episode-runtime">
                    {Math.floor(episode.RunTimeTicks / 600000000)} min
                  </span>
                )}
                {episode.Overview && (
                  <p className="episode-overview">
                    {episode.Overview.length > 150
                      ? episode.Overview.substring(0, 150) + '...'
                      : episode.Overview}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SeriesDetails;
