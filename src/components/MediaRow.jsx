import { useRef, useState, useEffect } from 'react';
import MediaCard from './MediaCard';
import './MediaRow.css';

function MediaRow({ title, items, onItemClick }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', checkScroll);
      return () => scrollElement.removeEventListener('scroll', checkScroll);
    }
  }, [items]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      const targetScroll = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth',
      });
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (focusedIndex === -1) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (focusedIndex > 0) {
            setFocusedIndex(focusedIndex - 1);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (focusedIndex < items.length - 1) {
            setFocusedIndex(focusedIndex + 1);
          }
          break;
        case 'Enter':
          e.preventDefault();
          if (items[focusedIndex]) {
            onItemClick(items[focusedIndex]);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, items, onItemClick]);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="media-row">
      <h2 className="row-title">{title}</h2>
      <div className="row-container">
        {canScrollLeft && (
          <button
            className="scroll-button scroll-left"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </button>
        )}
        <div className="row-scroll" ref={scrollRef}>
          <div className="row-content">
            {items.map((item, index) => (
              <MediaCard
                key={item.Id}
                item={item}
                onClick={onItemClick}
                index={index}
                isFocused={focusedIndex === index}
              />
            ))}
          </div>
        </div>
        {canScrollRight && (
          <button
            className="scroll-button scroll-right"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default MediaRow;
