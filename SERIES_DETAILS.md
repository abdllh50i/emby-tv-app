# Series Details Page - New Feature

## Overview
The new Series Details page shows seasons and episodes when a TV series is clicked, instead of going directly to the video player.

## Features

### 1. Series Information
- Large backdrop image with gradient overlay
- Series poster thumbnail
- Title, year, rating, and season count
- Full series description

### 2. Season Navigation
- Tab-based season selector
- Click any season to view its episodes
- Active season highlighted in blue

### 3. Episode List
- Grid/List view of all episodes
- Each episode shows:
  - Episode thumbnail/screenshot
  - Episode number and title
  - Runtime duration
  - Episode description
  - Watched indicator (checkmark if already played)

### 4. Keyboard Navigation
- **Arrow Up/Down**: Navigate through episodes
- **Enter**: Play selected episode
- **Escape**: Return to home

### 5. Responsive Design
- Adapts to all screen sizes
- Touch and keyboard friendly
- TV remote compatible

## User Flow

### Before (Issue):
```
Home → Click Series → Video Player (Wrong! No way to select episodes)
```

### After (Fixed):
```
Home → Click Series → Series Details → Select Season → Select Episode → Video Player ✓
Home → Click Movie → Video Player ✓
```

## Navigation Logic

```javascript
// Smart routing in Home.jsx
const handleItemClick = (item) => {
  if (item.Type === 'Series') {
    // Navigate to series details page
    navigate(`/series/${item.Id}`);
  } else {
    // Navigate directly to player for movies
    navigate(`/player/${item.Id}`);
  }
};
```

## API Integration

New Emby service methods:
- `getSeasons(seriesId)` - Fetch all seasons for a series
- `getEpisodes(seasonId)` - Fetch all episodes for a season

## Screenshots Flow

1. **Home Page**: User browses TV shows
2. **Click on Series**: Navigates to Series Details
3. **Series Details**: Shows seasons and episodes
4. **Select Episode**: Click episode to play
5. **Video Player**: Auto-plays selected episode

## Technical Details

- Component: `src/pages/SeriesDetails.jsx`
- Styling: `src/pages/SeriesDetails.css`
- Route: `/series/:itemId`
- Dependencies: React Router, Framer Motion, Emby API
