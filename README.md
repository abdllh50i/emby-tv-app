# Emby TV App

A modern, Apple TV-inspired React application for browsing and playing media from your Emby server. Features smooth animations, full remote control support, and a beautiful user interface.

## Features

### 🎬 Complete Media Experience
- **Account Selection Interface**: Secure login and user profile selection
- **Media Browsing**: Browse movies and TV shows with a Netflix/Apple TV-style interface
- **Custom Video Player**: Full-featured media player with:
  - Subtitle support (multiple languages)
  - Playback controls (play/pause, seek, volume)
  - Keyboard navigation
  - Full-screen mode
  - Progress tracking

### 🎮 Full Remote Control Support
- Navigate with keyboard/remote:
  - Arrow keys for navigation
  - Enter to select
  - Space/K to play/pause
  - F for fullscreen
  - M to mute/unmute
  - Escape to go back
  - Left/Right arrows to skip ±10 seconds
  - Up/Down arrows for volume control

### 🎨 Apple TV-Like Design
- Smooth animations using Framer Motion
- Card-based media layout with hover effects
- Gradient backgrounds and glassmorphism effects
- Responsive design for all screen sizes
- Dark theme optimized for TV viewing

### 🔌 Emby API Integration
- Full integration with Emby server
- Real-time playback reporting
- Media metadata retrieval
- Subtitle streaming
- Secure authentication

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Framer Motion** - Animations
- **Axios** - HTTP client for API calls
- **CSS3** - Styling with modern features

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- An Emby server (local or remote)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/abdllh50i/emby-tv-app.git
cd emby-tv-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:3000`

### Connecting to Emby

1. On the login screen, enter your Emby server URL (e.g., `http://192.168.1.100:8096`)
2. Click "Connect"
3. Select your user profile
4. Enter your password
5. Start browsing your media library!

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Project Structure

```
emby-tv-app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── MediaCard.jsx    # Media card component
│   │   └── MediaRow.jsx     # Horizontal scrolling row
│   ├── pages/               # Page components
│   │   ├── AccountSelection.jsx  # Login/user selection
│   │   ├── Home.jsx         # Main browsing interface
│   │   └── VideoPlayer.jsx  # Video playback
│   ├── services/            # API services
│   │   └── embyService.js   # Emby API integration
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # App entry point
│   └── index.css            # Global styles
├── index.html               # HTML template
├── package.json             # Dependencies
└── vite.config.js           # Vite configuration
```

## Keyboard Shortcuts

### Navigation
- **Arrow Keys**: Navigate through items
- **Enter**: Select item
- **Escape**: Go back

### Video Player
- **Space / K**: Play/Pause
- **F**: Toggle fullscreen
- **M**: Mute/Unmute
- **Left Arrow**: Rewind 10 seconds
- **Right Arrow**: Forward 10 seconds
- **Up Arrow**: Increase volume
- **Down Arrow**: Decrease volume

## Configuration

### Emby Server Connection

The app stores your server URL and authentication token in localStorage. To change servers:
1. Sign out from the current account
2. Enter a new server URL on the login screen

### Customization

You can customize colors and styling by editing the CSS variables in `src/index.css`:

```css
:root {
  --bg-primary: #000000;
  --bg-secondary: #1a1a1a;
  --bg-card: #2a2a2a;
  --text-primary: #ffffff;
  --text-secondary: #a0a0a0;
  --accent-color: #0071e3;
  --focus-ring: rgba(0, 113, 227, 0.6);
  --card-hover: #3a3a3a;
}
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- Inspired by Apple TV's interface design
- Built for the Emby media server community
