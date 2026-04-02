# 🚌 VIT Shuttle Tracker

A full-stack, real-time campus shuttle tracking application for VIT Vellore students. Built with **React + Vite** on the frontend and **Node.js + Express + SQLite** on the backend, featuring a premium "Oceanic Pulse" dark glassmorphism UI.

---

## ✨ Features

| Feature                      | Description                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------------ |
| 🗺️ **Live Shuttle Tracking** | Interactive Leaflet map with 10 real-time shuttle locations updating every 3 seconds |
| ⏱️ **ETA Calculation**       | Haversine-based nearest shuttle detection and estimated arrival time                 |
| 🛣️ **Route View**            | Visual campus route loop: Main Gate → SMV → J Block → TT → SJT → PRP                 |
| 🚏 **Bus Stop Selection**    | Browse all 6 stops; select your default boarding stop for personalised ETAs          |
| 💬 **Feedback System**       | Submit star-rated feedback; view and delete your own entries                         |
| 🔐 **JWT Authentication**    | Secure register/login flow with bcrypt password hashing                              |
| 💰 **Fare Display**          | Flat ₹20 fare shown alongside destination ETA                                        |
| 🔴 **404 Page**              | Friendly not-found screen for unknown routes                                         |

---

## 🛠️ Tech Stack

### Frontend (`/frontend`)

- **React 18** — Component-based SPA
- **Vite** — Lightning-fast dev server & bundler
- **React Router DOM v6** — Client-side routing with protected routes
- **Leaflet / react-leaflet** — Interactive map rendering
- **Axios** — HTTP client with JWT interceptor
- **Vanilla CSS** — Custom "Oceanic Pulse" design system (no Tailwind)

### Backend (`/backend`)

- **Node.js & Express** — REST API server
- **better-sqlite3** — Embedded SQLite database (WAL mode)
- **JSON Web Tokens (JWT)** — Stateless auth tokens
- **bcryptjs** — Password hashing
- **dotenv** — Environment variable management

---

## 📁 Project Structure

```
Shuttle_Management_Project_Web_Prog/
├── frontend/                     # React SPA
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx         # Register / Login form
│   │   │   ├── Dashboard.jsx     # Live map + ETA cards
│   │   │   ├── RoutesPage.jsx    # Route overview & stop list
│   │   │   ├── BusStops.jsx      # Stop browser + selection
│   │   │   ├── Feedback.jsx      # Submit & manage feedback
│   │   │   └── NotFound.jsx      # 404 screen
│   │   ├── components/
│   │   │   └── Navbar.jsx        # Top navigation bar
│   │   ├── api.js                # Axios instance with auth interceptor
│   │   ├── App.jsx               # Router + protected-route wrapper
│   │   ├── index.css             # Global styles & design tokens
│   │   └── main.jsx              # React entry point
│   ├── package.json
│   └── vite.config.js            # Dev server + /api proxy to :5001
│
└── backend/                      # Express REST API
    ├── routes/
    │   ├── auth.js               # POST /api/auth/register, /login
    │   ├── bus.js                # GET /location, /stops, /eta; POST /select-stop
    │   └── feedback.js           # GET, POST, DELETE /api/feedback
    ├── middleware/
    │   └── auth.js               # JWT verification middleware
    ├── db.js                     # SQLite init, table creation & seeding
    ├── server.js                 # Express app + CORS setup
    ├── shuttle.db                # SQLite database file (auto-created)
    └── .env                      # Environment variables (not committed)
```

---

## 📡 API Endpoints

### Auth — `/api/auth`

| Method | Endpoint    | Description                  |
| ------ | ----------- | ---------------------------- |
| `POST` | `/register` | Create a new student account |
| `POST` | `/login`    | Authenticate and receive JWT |

### Bus — `/api/bus` _(requires JWT)_

| Method | Endpoint       | Description                                |
| ------ | -------------- | ------------------------------------------ |
| `GET`  | `/location`    | All 10 shuttle positions + route waypoints |
| `GET`  | `/stops`       | All 6 bus stops + user's selected stop     |
| `POST` | `/select-stop` | Set the user's default boarding stop       |
| `GET`  | `/eta`         | Nearest bus ETA + optional destination ETA |

### Feedback — `/api/feedback` _(requires JWT)_

| Method   | Endpoint | Description                      |
| -------- | -------- | -------------------------------- |
| `GET`    | `/`      | Fetch all feedback entries       |
| `POST`   | `/`      | Submit a new star-rated feedback |
| `DELETE` | `/:id`   | Delete own feedback entry        |

### Health

| Method | Endpoint      | Description           |
| ------ | ------------- | --------------------- |
| `GET`  | `/api/health` | Server liveness check |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or later
- **npm** v9 or later

---

### 1. Clone the Repository

```bash
git clone https://github.com/KISHAN1506/ShuttleManagement_Web_Prog.git
cd ShuttleManagement_Web_Prog
```

---

### 2. Configure & Start the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/` (already included in the repo for local dev):

```env
PORT=5001
JWT_SECRET=vit_shuttle_secret_key_2024
FRONTEND_URL=http://localhost:5173
```

Start the server:

```bash
npm start
```

> The API will be available at **http://localhost:5001**  
> SQLite tables and seed data are created automatically on first run.

---

### 3. Start the Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

> The app will be available at **http://localhost:5173**  
> Vite automatically proxies all `/api/*` requests to the backend on port 5001.

---

## 🌐 GitHub Pages Deployment

This repository includes a GitHub Pages workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) that builds the React app from `frontend/` and publishes it to Pages on every push to `main`.

The frontend is configured for the repository subpath `/ShuttleManagement_Web_Prog/`, and the SPA fallback files in `frontend/index.html` and `frontend/public/404.html` keep client-side routes working on refresh.

Important: GitHub Pages can host the frontend only. The login, shuttle, and feedback features still require the Express API in `backend/` to be deployed separately. If you host the backend elsewhere, set `VITE_API_BASE_URL` as a GitHub repository variable so the Pages build points to the live API.

---

## 🎨 Design System — "Oceanic Pulse"

A custom dark design system built in vanilla CSS with design tokens.

| Token               | Value                    | Usage                                    |
| ------------------- | ------------------------ | ---------------------------------------- |
| `--color-bg`        | `#0b1521`                | Deep Navy — page background              |
| `--color-surface`   | `rgba(255,255,255,0.06)` | Glassmorphism card surfaces              |
| `--color-primary`   | `#22d3ee`                | Vibrant Teal — primary actions & accents |
| `--color-secondary` | `#fb7185`                | Warm Coral — secondary highlights        |
| `--color-tertiary`  | `#fbbf24`                | Amber — warnings & ratings               |
| `--font-display`    | _Space Grotesk_          | Headlines & brand text                   |
| `--font-body`       | _Inter_                  | Body copy & UI labels                    |

**Aesthetic:** Dark glassmorphism (`backdrop-filter: blur`), smooth glow box-shadows, bold linear gradients, and subtle entrance animations.

---

## 🗺️ Campus Route

The shuttle follows a fixed **6-stop loop** with 24 GPS waypoints, simulated at 20 km/h:

```
Main Gate → SMV Block → J Block → Technology Tower → SJT Block → PRP Block → (repeat)
```

10 shuttles are seeded in the database, evenly spaced across the route, and advance one waypoint every **3 seconds**.

---

## 👤 Author

**Kishan Agarwal** — VIT Vellore  
Web Programming Project, 2024–25
