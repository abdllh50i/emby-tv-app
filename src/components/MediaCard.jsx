import { motion } from 'framer-motion';
import embyService from '../services/embyService';
import './MediaCard.css';

function MediaCard({ item, onClick, index = 0, isFocused = false }) {
  const imageUrl = embyService.getImageUrl(item.Id, 'Primary', 400);

  return (
    <motion.div
      className={`media-card ${isFocused ? 'focused' : ''}`}
      onClick={() => onClick(item)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: index * 0.05, 
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      whileHover={{ 
        scale: 1.12, 
        y: -15,
        zIndex: 10,
        boxShadow: '0 20px 60px rgba(0, 113, 227, 0.4)',
        transition: { duration: 0.3, ease: 'easeOut' }
      }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="card-image-wrapper">
        <img
          src={imageUrl}
          alt={item.Name}
          className="card-image"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="450"%3E%3Crect width="300" height="450" fill="%232a2a2a"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23666" font-size="20" font-family="Arial"%3ENo Image%3C/text%3E%3C/svg%3E';
          }}
        />
        <div className="card-overlay">
          <div className="card-play-icon">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="card-info">
        <h3 className="card-title">{item.Name}</h3>
        <div className="card-meta">
          {item.ProductionYear && (
            <span className="card-year">{item.ProductionYear}</span>
          )}
          {item.Type && (
            <span className="card-type">{item.Type}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default MediaCard;
