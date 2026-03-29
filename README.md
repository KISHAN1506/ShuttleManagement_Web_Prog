# VIT Shuttle Tracker

A premium, full-stack application for tracking campus shuttles in real-time. Built with React, Vite, Node.js, and Express, featuring a modern glassmorphism UI.

## Features

- **Live Shuttle Tracking:** Interactive Leaflet map showing real-time bus locations and routes.
- **Nearest Shuttle ETA:** Automatic calculation of the nearest shuttle and its estimated time of arrival.
- **Route Selection:** View all bus stops and select destinations to see specific ETAs.
- **Feedback System:** Submit and view real-time feedback with interactive star ratings.
- **Premium UI / UX:** Built with a custom "Oceanic Pulse" (Teal + Coral) design system featuring dark glassmorphism, fluid animations, and gradient accents.
- **Authentication:** Secure JWT-based login and registration system for VIT students.

## Tech Stack

### Frontend (`/frontend`)
- React 18
- Vite
- React Router DOM
- Leaflet (Maps)
- Axios

### Backend (`/backend`)
- Node.js & Express
- SQLite (better-sqlite3)
- JSON Web Tokens (JWT) for Authentication
- bcryptjs for Password Hashing

## Project Structure

```
vit-shuttle-management/
├── frontend/             # React SPA
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route pages (Dashboard, Login, BusStops, Feedback)
│   │   ├── api.js        # Axios instance with interceptors
│   │   └── index.css     # Global styles & "Oceanic Pulse" design system tokens
│   ├── package.json
│   └── vite.config.js    # Vite config with backend proxy
│
└── backend/              # Node/Express API
    ├── routes/           # API endpoints (auth, bus, feedback)
    ├── db.js             # SQLite database init & seeding
    ├── server.js         # Express app setup
    └── .env              # Environment variables
```

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm

### 1. Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory (if not exists):
```env
PORT=5001
JWT_SECRET=vit_shuttle_secret_key_2024
FRONTEND_URL=http://localhost:5173
```

Start the backend server (it will automatically create and seed the SQLite database):
```bash
npm start
```
*The backend API will run on `http://localhost:5001`.*

### 2. Setup Frontend
In a new terminal:
```bash
cd frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```
*The frontend will run on `http://localhost:5173` and automatically proxy API requests to the backend.*

## Design System: "Oceanic Pulse"

The frontend UI is built from scratch with a custom design system generated in Stitch MCP:
- **Colors:** Deep Navy surfaces (`#0b1521`), Vibrant Teal primary (`#22d3ee`), Warm Coral secondary (`#fb7185`), Amber tertiary (`#fbbf24`).
- **Typography:** Display headlines in *Space Grotesk*, body text in *Inter*.
- **Aesthetic:** Dark glassmorphism (`backdrop-filter`), smooth glow shadows, and bold gradients (`linear-gradient(135deg, #22d3ee 0%, #fb7185 100%)`).

## Author
Kishan Agarwal
