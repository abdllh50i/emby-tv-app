import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import embyService from '../services/embyService';
import './VideoPlayer.css';

function VideoPlayer() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const progressInterval = useRef(null);
  const controlsTimeout = useRef(null);

  const [itemDetails, setItemDetails] = useState(null);
  const [streamUrl, setStreamUrl] = useState('');
  const [subtitles, setSubtitles] = useState([]);
  const [selectedSubtitle, setSelectedSubtitle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);

  useEffect(() => {
    fetchMediaData();
    // Capture video ref for cleanup
    const videoElement = videoRef.current;
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
      // Report playback stopped with saved ref
      if (videoElement) {
        const positionTicks = Math.floor(videoElement.currentTime * 10000000);
        embyService.reportPlaybackStopped(itemId, positionTicks);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId]);

  const fetchMediaData = async () => {
    try {
      setLoading(true);
      const details = await embyService.getItemDetails(itemId);
      setItemDetails(details);

      const playbackInfo = await embyService.getPlaybackInfo(itemId);
      if (!playbackInfo.MediaSources || playbackInfo.MediaSources.length === 0) {
        throw new Error('No media sources available');
      }
      const mediaSource = playbackInfo.MediaSources[0];
      const url = embyService.getStreamUrl(itemId, mediaSource.Id);
      setStreamUrl(url);

      const subtitlesList = await embyService.getSubtitles(itemId);
      setSubtitles(subtitlesList);

      setLoading(false);
    } catch (err) {
      console.error('Error loading media:', err);
      setError('Failed to load media. Please try again.');
      setLoading(false);
    }
  };

  // Attempt to play video when stream URL is set
  useEffect(() => {
    if (streamUrl && videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Video started playing successfully
            console.log('Video playback started');
          })
          .catch((error) => {
            // Autoplay was prevented, user needs to interact
            console.log('Autoplay prevented:', error);
            setShowControls(true);
          });
      }
    }
  }, [streamUrl]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
        embyService.reportPlaybackStart(itemId, Math.floor(currentTime * 10000000));
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      setIsMuted(newMuted);
      videoRef.current.muted = newMuted;
    }
  };

  const toggleFullscreen = () => {
    const container = document.querySelector('.video-player');
    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const selectSubtitle = (subtitle) => {
    setSelectedSubtitle(subtitle);
    setShowSubtitleMenu(false);
    
    // Remove existing text tracks
    if (videoRef.current) {
      const tracks = videoRef.current.textTracks;
      for (let i = 0; i < tracks.length; i++) {
        tracks[i].mode = 'disabled';
      }
    }
  };

  const disableSubtitles = () => {
    setSelectedSubtitle(null);
    setShowSubtitleMenu(false);
    if (videoRef.current) {
      const tracks = videoRef.current.textTracks;
      for (let i = 0; i < tracks.length; i++) {
        tracks[i].mode = 'disabled';
      }
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    if (isPlaying) {
      controlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const handleBack = () => {
    navigate('/home');
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, currentTime - 10);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime = Math.min(duration, currentTime + 10);
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (videoRef.current) {
            const newVolume = Math.min(1, volume + 0.1);
            setVolume(newVolume);
            videoRef.current.volume = newVolume;
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (videoRef.current) {
            const newVolume = Math.max(0, volume - 0.1);
            setVolume(newVolume);
            videoRef.current.volume = newVolume;
          }
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'Escape':
          if (!isFullscreen) {
            handleBack();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, currentTime, duration, volume, isFullscreen]);

  // Progress reporting
  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = setInterval(() => {
        if (videoRef.current) {
          const positionTicks = Math.floor(videoRef.current.currentTime * 10000000);
          embyService.reportPlaybackProgress(itemId, positionTicks, false);
        }
      }, 10000); // Report every 10 seconds
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    }
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isPlaying, itemId]);

  if (loading) {
    return (
      <div className="player-loading">
        <div className="spinner"></div>
        <p>Loading media...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="player-error">
        <p>{error}</p>
        <button onClick={handleBack}>Back to Home</button>
      </div>
    );
  }

  return (
    <div 
      className="video-player" 
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="video-element"
        src={streamUrl}
        autoPlay
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        crossOrigin="anonymous"
      >
        {selectedSubtitle && (
          <track
            kind="subtitles"
            src={selectedSubtitle.url}
            srcLang={selectedSubtitle.language}
            label={selectedSubtitle.displayTitle}
            default
          />
        )}
      </video>

      <AnimatePresence>
        {showControls && (
          <motion.div
            className="player-controls"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Top Bar */}
            <div className="controls-top">
              <button className="back-button" onClick={handleBack}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                </svg>
              </button>
              <div className="video-info">
                <h2 className="video-title">{itemDetails?.Name}</h2>
                {itemDetails?.ProductionYear && (
                  <span className="video-year">{itemDetails.ProductionYear}</span>
                )}
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="controls-bottom">
              {/* Progress Bar */}
              <div className="progress-bar" onClick={handleSeek}>
                <div 
                  className="progress-filled"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                ></div>
              </div>

              {/* Control Buttons */}
              <div className="controls-buttons">
                <div className="controls-left">
                  <button className="control-button" onClick={handlePlayPause}>
                    {isPlaying ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>

                  <button 
                    className="control-button" 
                    onClick={() => videoRef.current && (videoRef.current.currentTime -= 10)}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                    </svg>
                  </button>

                  <button 
                    className="control-button" 
                    onClick={() => videoRef.current && (videoRef.current.currentTime += 10)}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z" />
                    </svg>
                  </button>

                  <button className="control-button" onClick={toggleMute}>
                    {isMuted || volume === 0 ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                      </svg>
                    )}
                  </button>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="volume-slider"
                  />

                  <span className="time-display">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="controls-right">
                  <button 
                    className="control-button"
                    onClick={() => setShowSubtitleMenu(!showSubtitleMenu)}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM4 12h4v2H4v-2zm10 6H4v-2h10v2zm6 0h-4v-2h4v2zm0-4H10v-2h10v2z" />
                    </svg>
                  </button>

                  <button className="control-button" onClick={toggleFullscreen}>
                    {isFullscreen ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Subtitle Menu */}
            {showSubtitleMenu && (
              <motion.div
                className="subtitle-menu"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <h3>Subtitles</h3>
                <button 
                  className={`subtitle-option ${!selectedSubtitle ? 'active' : ''}`}
                  onClick={disableSubtitles}
                >
                  Off
                </button>
                {subtitles.map((subtitle, index) => (
                  <button
                    key={index}
                    className={`subtitle-option ${selectedSubtitle?.index === subtitle.index ? 'active' : ''}`}
                    onClick={() => selectSubtitle(subtitle)}
                  >
                    {subtitle.displayTitle}
                  </button>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default VideoPlayer;
