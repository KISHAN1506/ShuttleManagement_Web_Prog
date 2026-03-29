# VIT Shuttle Tracker - Frontend

This is the React frontend for the VIT Shuttle Management project. It features a premium custom design system called "Oceanic Pulse" built with plain CSS, delivering a dark glassmorphism aesthetic with Teal and Coral accents.

## Development

The frontend is built with **React** and **Vite**.

### Start Dev Server

```bash
npm install
npm run dev
```

The app will start on `http://localhost:5173`.

### API Proxy Configuration

To prevent CORS issues during development, the Vite config (`vite.config.js`) defines a proxy. All API calls made to `/api/*` are automatically forwarded to the backend running on `http://localhost:5001`.

```javascript
// Example API call from frontend components
import api from '../api';

const fetchFeedback = async () => {
  const response = await api.get('/feedback/recent');
  console.log(response.data);
};
```

## Design System Highlights (`src/index.css`)

- **Root Tokens:** Fully tokenized CSS using `:root` variables for colors, spacing, and transitions.
- **Glassmorphism:** Reusable `.glass-card` class providing a semi-transparent surface with `blur(24px)`.
- **Gradients:** Interactive gradients specifically defined for `.btn-primary` and hover states.
- **Typography:** Uses Google Fonts `Space Grotesk` (headings) and `Inter` (body/UI).

## Maps integration

The dashboard features real-time map integration powered by **Leaflet** and `react-leaflet`. The map styles have been overridden in `index.css` to match the dark theme and custom tooltip/popup styling.
