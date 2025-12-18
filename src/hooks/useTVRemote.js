import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for TV remote control navigation
 * Handles directional navigation, selection, and back actions
 */
export const useTVRemote = (options = {}) => {
  const {
    onUp,
    onDown,
    onLeft,
    onRight,
    onSelect,
    onBack,
    onPlayPause,
    enabled = true,
  } = options;

  const handleKeyDown = useCallback((e) => {
    if (!enabled) return;

    // Prevent default browser behavior for arrow keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' '].includes(e.key)) {
      e.preventDefault();
    }

    switch (e.key) {
      case 'ArrowUp':
        onUp?.();
        break;
      case 'ArrowDown':
        onDown?.();
        break;
      case 'ArrowLeft':
        onLeft?.();
        break;
      case 'ArrowRight':
        onRight?.();
        break;
      case 'Enter':
        onSelect?.();
        break;
      case 'Escape':
      case 'Backspace':
        onBack?.();
        break;
      case ' ':
      case 'k':
      case 'K':
        onPlayPause?.();
        break;
      default:
        break;
    }
  }, [enabled, onUp, onDown, onLeft, onRight, onSelect, onBack, onPlayPause]);

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [enabled, handleKeyDown]);
};

/**
 * Hook for managing grid navigation (like media cards)
 */
export const useGridNavigation = (items, columns, onItemSelect) => {
  const [focusedIndex, setFocusedIndex] = useState(0);

  const moveUp = useCallback(() => {
    setFocusedIndex(prev => Math.max(0, prev - columns));
  }, [columns]);

  const moveDown = useCallback(() => {
    setFocusedIndex(prev => Math.min(items.length - 1, prev + columns));
  }, [items.length, columns]);

  const moveLeft = useCallback(() => {
    setFocusedIndex(prev => Math.max(0, prev - 1));
  }, []);

  const moveRight = useCallback(() => {
    setFocusedIndex(prev => Math.min(items.length - 1, prev + 1));
  }, [items.length]);

  const selectItem = useCallback(() => {
    if (items[focusedIndex]) {
      onItemSelect(items[focusedIndex]);
    }
  }, [items, focusedIndex, onItemSelect]);

  useTVRemote({
    onUp: moveUp,
    onDown: moveDown,
    onLeft: moveLeft,
    onRight: moveRight,
    onSelect: selectItem,
    enabled: items.length > 0,
  });

  return { focusedIndex, setFocusedIndex };
};

export default { useTVRemote, useGridNavigation };
