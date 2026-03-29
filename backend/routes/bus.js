const express = require('express');
const db = require('../db');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

const FARE_PER_TRIP = 20; // ₹20 flat fare

// Route waypoints: Main Gate → SMV → J Block → TT → SJT → PRP → Main Gate (loop)
const ROUTE_WAYPOINTS = [
    { lat: 12.96920, lng: 79.15590 }, // 0  Main Gate
    { lat: 12.96960, lng: 79.15620 }, // 1
    { lat: 12.97000, lng: 79.15660 }, // 2
    { lat: 12.97040, lng: 79.15720 }, // 3  SMV Block
    { lat: 12.97080, lng: 79.15750 }, // 4
    { lat: 12.97130, lng: 79.15770 }, // 5
    { lat: 12.97180, lng: 79.15800 }, // 6  J Block
    { lat: 12.97200, lng: 79.15780 }, // 7
    { lat: 12.97210, lng: 79.15740 }, // 8  Technology Tower (TT)
    { lat: 12.97200, lng: 79.15690 }, // 9
    { lat: 12.97180, lng: 79.15640 }, // 10
    { lat: 12.97160, lng: 79.15600 }, // 11
    { lat: 12.97150, lng: 79.15550 }, // 12 SJT Block
    { lat: 12.97130, lng: 79.15510 }, // 13
    { lat: 12.97100, lng: 79.15480 }, // 14
    { lat: 12.97060, lng: 79.15460 }, // 15
    { lat: 12.97020, lng: 79.15440 }, // 16
    { lat: 12.96980, lng: 79.15420 }, // 17 PRP Block
    { lat: 12.96950, lng: 79.15440 }, // 18
    { lat: 12.96930, lng: 79.15470 }, // 19
    { lat: 12.96910, lng: 79.15510 }, // 20
    { lat: 12.96900, lng: 79.15540 }, // 21
    { lat: 12.96905, lng: 79.15570 }, // 22
    { lat: 12.96920, lng: 79.15590 }, // 23 Back to Main Gate
];

// Load all shuttle waypoint indices from DB
const shuttleState = {};
const allBuses = db.prepare('SELECT bus_name, waypoint_index FROM bus_locations').all();
for (const bus of allBuses) {
    shuttleState[bus.bus_name] = bus.waypoint_index || 0;
}

// Simulate all 10 shuttles moving every 3 seconds
setInterval(() => {
    const updateBus = db.prepare(
        'UPDATE bus_locations SET latitude = ?, longitude = ?, waypoint_index = ?, updated_at = CURRENT_TIMESTAMP WHERE bus_name = ?'
    );
    const moveAll = db.transaction(() => {
        for (const busName of Object.keys(shuttleState)) {
            shuttleState[busName] = (shuttleState[busName] + 1) % ROUTE_WAYPOINTS.length;
            const wp = ROUTE_WAYPOINTS[shuttleState[busName]];
            // Small jitter for realism
            const lat = wp.lat + (Math.random() - 0.5) * 0.0001;
            const lng = wp.lng + (Math.random() - 0.5) * 0.0001;
            updateBus.run(lat, lng, shuttleState[busName], busName);
        }
    });
    moveAll();
}, 3000);

// Haversine formula — returns distance in metres
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ETA calculation: assume 20 km/h on campus
function etaMinutes(distanceMeters) {
    const minutes = Math.round((distanceMeters / 1000 / 20) * 60);
    return Math.max(1, minutes);
}

// ─────────────────────────────────────────────
// GET /api/bus/location — all 10 shuttle locations
// ─────────────────────────────────────────────
router.get('/location', authenticateToken, (req, res) => {
    try {
        const buses = db.prepare('SELECT * FROM bus_locations').all();
        res.json({
            buses: buses.map((b) => ({
                bus_name: b.bus_name,
                latitude: b.latitude,
                longitude: b.longitude,
                waypoint_index: b.waypoint_index,
                updated_at: b.updated_at,
            })),
            route_waypoints: ROUTE_WAYPOINTS,
        });
    } catch (err) {
        console.error('Bus location error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ─────────────────────────────────────────────
// GET /api/bus/stops — all bus stops
// ─────────────────────────────────────────────
router.get('/stops', authenticateToken, (req, res) => {
    try {
        const stops = db.prepare('SELECT * FROM bus_stops').all();
        const user = db.prepare('SELECT selected_stop_id FROM users WHERE id = ?').get(req.user.id);
        res.json({ stops, selected_stop_id: user ? user.selected_stop_id : null });
    } catch (err) {
        console.error('Get stops error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ─────────────────────────────────────────────
// POST /api/bus/select-stop — select a bus stop
// ─────────────────────────────────────────────
router.post('/select-stop', authenticateToken, (req, res) => {
    try {
        const { stop_id } = req.body;
        if (!stop_id) return res.status(400).json({ error: 'Stop ID is required' });

        const stop = db.prepare('SELECT * FROM bus_stops WHERE id = ?').get(stop_id);
        if (!stop) return res.status(404).json({ error: 'Bus stop not found' });

        db.prepare('UPDATE users SET selected_stop_id = ? WHERE id = ?').run(stop_id, req.user.id);
        res.json({ message: 'Bus stop selected successfully', stop });
    } catch (err) {
        console.error('Select stop error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ─────────────────────────────────────────────
// GET /api/bus/eta — nearest shuttle info + destination ETA
// Query params:
//   lat, lng          — student's current location
//   dest_stop_id      — (optional) destination stop ID
// ─────────────────────────────────────────────
router.get('/eta', authenticateToken, (req, res) => {
    try {
        const { lat, lng, dest_stop_id } = req.query;
        const buses = db.prepare('SELECT * FROM bus_locations').all();

        // ── Nearest shuttle to student ──
        let nearestBus = null;
        let nearestDist = Infinity;

        if (lat && lng) {
            const sLat = parseFloat(lat);
            const sLng = parseFloat(lng);
            for (const bus of buses) {
                const dist = haversineDistance(bus.latitude, bus.longitude, sLat, sLng);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestBus = bus;
                }
            }
        }

        // ── ETA to user's selected stop (nearest bus → stop) ──
        const user = db.prepare('SELECT selected_stop_id FROM users WHERE id = ?').get(req.user.id);
        let stopInfo = null;
        if (user && user.selected_stop_id && nearestBus) {
            const stop = db.prepare('SELECT * FROM bus_stops WHERE id = ?').get(user.selected_stop_id);
            if (stop) {
                const dist = haversineDistance(nearestBus.latitude, nearestBus.longitude, stop.latitude, stop.longitude);
                stopInfo = {
                    id: stop.id,
                    name: stop.name,
                    distance_meters: Math.round(dist),
                    eta_minutes: etaMinutes(dist),
                };
            }
        }

        // ── Destination ETA (nearest bus → destination stop) ──
        let destinationInfo = null;
        if (dest_stop_id && nearestBus) {
            const destStop = db.prepare('SELECT * FROM bus_stops WHERE id = ?').get(parseInt(dest_stop_id));
            if (destStop) {
                const distToDest = haversineDistance(nearestBus.latitude, nearestBus.longitude, destStop.latitude, destStop.longitude);
                destinationInfo = {
                    id: destStop.id,
                    name: destStop.name,
                    distance_meters: Math.round(distToDest),
                    eta_minutes: etaMinutes(distToDest),
                    fare: FARE_PER_TRIP,
                };
            }
        }

        res.json({
            nearest_bus: nearestBus
                ? {
                    bus_name: nearestBus.bus_name,
                    latitude: nearestBus.latitude,
                    longitude: nearestBus.longitude,
                    distance_meters: Math.round(nearestDist),
                    eta_minutes: etaMinutes(nearestDist),
                }
                : null,
            stop: stopInfo,
            destination: destinationInfo,
            fare: FARE_PER_TRIP,
        });
    } catch (err) {
        console.error('ETA error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
