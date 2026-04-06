const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'shuttle.db'));

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    selected_stop_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (selected_stop_id) REFERENCES bus_stops(id)
  );

  CREATE TABLE IF NOT EXISTS bus_stops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bus_locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bus_name TEXT NOT NULL UNIQUE,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    waypoint_index INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

const ROUTE_STOPS = [
  ['Main Gate', 12.96920, 79.15590],
  ['SMV Block', 12.97040, 79.15720],
  ['J Block', 12.97180, 79.15800],
  ['Technology Tower', 12.97210, 79.15740],
  ['SJT Block', 12.97150, 79.15550],
  ['PRP Block', 12.96980, 79.15420],
];

const stopCount = db.prepare('SELECT COUNT(*) as count FROM bus_stops').get();
if (stopCount.count === 0) {
  const insertStop = db.prepare('INSERT INTO bus_stops (name, latitude, longitude) VALUES (?, ?, ?)');
  const insertMany = db.transaction((stops) => {
    for (const stop of stops) insertStop.run(...stop);
  });
  insertMany(ROUTE_STOPS);
}

const TOTAL_WAYPOINTS = 24; // matches ROUTE_WAYPOINTS array in bus.js
const busCount = db.prepare('SELECT COUNT(*) as count FROM bus_locations').get();
if (busCount.count === 0) {
  const waypoints = [
    { lat: 12.96920, lng: 79.15590 }, // Main Gate
    { lat: 12.96960, lng: 79.15620 },
    { lat: 12.97000, lng: 79.15660 },
    { lat: 12.97040, lng: 79.15720 }, // SMV Block
    { lat: 12.97080, lng: 79.15750 },
    { lat: 12.97130, lng: 79.15770 },
    { lat: 12.97180, lng: 79.15800 }, // J Block
    { lat: 12.97200, lng: 79.15780 },
    { lat: 12.97210, lng: 79.15740 }, // Technology Tower
    { lat: 12.97200, lng: 79.15690 },
    { lat: 12.97180, lng: 79.15640 },
    { lat: 12.97160, lng: 79.15600 },
    { lat: 12.97150, lng: 79.15550 }, // SJT Block
    { lat: 12.97130, lng: 79.15510 },
    { lat: 12.97100, lng: 79.15480 },
    { lat: 12.97060, lng: 79.15460 },
    { lat: 12.97020, lng: 79.15440 },
    { lat: 12.96980, lng: 79.15420 }, // PRP Block
    { lat: 12.96950, lng: 79.15440 },
    { lat: 12.96930, lng: 79.15470 },
    { lat: 12.96910, lng: 79.15510 },
    { lat: 12.96900, lng: 79.15540 },
    { lat: 12.96905, lng: 79.15570 },
    { lat: 12.96920, lng: 79.15590 }, // Back to Main Gate
  ];

  const insertBus = db.prepare(
    'INSERT INTO bus_locations (bus_name, latitude, longitude, waypoint_index) VALUES (?, ?, ?, ?)'
  );
  const insertBuses = db.transaction(() => {
    for (let i = 1; i <= 10; i++) {
      const wpIndex = Math.floor(((i - 1) / 10) * waypoints.length);
      const wp = waypoints[wpIndex];
      insertBus.run(`VIT Shuttle ${i}`, wp.lat, wp.lng, wpIndex);
    }
  });
  insertBuses();
}

const feedbackCount = db.prepare('SELECT COUNT(*) as count FROM feedback').get();
if (feedbackCount.count === 0) {
  const demoUsers = [
    ['Aarav Sharma', 'aarav.sharma@vitstudent.ac.in'],
    ['Diya Nair', 'diya.nair@vitstudent.ac.in'],
    ['Karthik R', 'karthik.r@vitstudent.ac.in'],
    ['Meera Iyer', 'meera.iyer@vitstudent.ac.in'],
    ['Rohan Das', 'rohan.das@vitstudent.ac.in'],
    ['Sneha Gupta', 'sneha.gupta@vitstudent.ac.in'],
    ['Varun Menon', 'varun.menon@vitstudent.ac.in'],
    ['Priya S', 'priya.s@vitstudent.ac.in'],
    ['Nikhil Jain', 'nikhil.jain@vitstudent.ac.in'],
    ['Ananya Rao', 'ananya.rao@vitstudent.ac.in'],
  ];

  const reviews = [
    { rating: 5, message: 'Very punctual service this week. Great experience!' },
    { rating: 4, message: 'Buses are mostly on time, app tracking is helpful.' },
    { rating: 3, message: 'Decent overall, but evening frequency can improve.' },
    { rating: 2, message: 'Long wait near PRP Block during peak hours.' },
    { rating: 1, message: 'Bus skipped my stop once, please fix route discipline.' },
    { rating: 5, message: 'Clean buses and polite staff. Loved the smooth ride.' },
    { rating: 4, message: 'Good updates in the app. ETA feels accurate most times.' },
    { rating: 3, message: 'Service is okay, but crowding is high before classes.' },
    { rating: 2, message: 'Night shuttle was delayed today by around 20 minutes.' },
    { rating: 5, message: 'Excellent initiative for campus transport. Keep it up!' },
  ];

  const insertUser = db.prepare(
    'INSERT OR IGNORE INTO users (name, email, password_hash) VALUES (?, ?, ?)'
  );
  const getUserId = db.prepare('SELECT id FROM users WHERE email = ?');
  const insertFeedback = db.prepare(
    'INSERT INTO feedback (user_id, rating, message) VALUES (?, ?, ?)'
  );

  const seedFeedback = db.transaction(() => {
    for (let i = 0; i < reviews.length; i++) {
      const [name, email] = demoUsers[i];
      insertUser.run(name, email, '$2a$10$seeded.feedback.placeholder.hash.value');
      const user = getUserId.get(email);
      if (user) {
        insertFeedback.run(user.id, reviews[i].rating, reviews[i].message);
      }
    }
  });

  seedFeedback();
}

module.exports = db;
