import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import api from '../api';
import 'leaflet/dist/leaflet.css';

// ── Icons ──────────────────────────────────────────
const busIcon = new L.DivIcon({
    html: '<div class="bus-marker">🚌</div>',
    className: 'custom-bus-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
});
const nearestBusIcon = new L.DivIcon({
    html: '<div class="bus-marker nearest-bus-marker">🚌</div>',
    className: 'custom-bus-icon',
    iconSize: [38, 38],
    iconAnchor: [19, 19],
});
const studentIcon = new L.DivIcon({
    html: '<div class="student-marker">📍</div>',
    className: 'custom-student-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
});
const stopIcon = new L.DivIcon({
    html: '<div class="stop-marker">🚏</div>',
    className: 'custom-stop-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
});

const ROUTE_STOPS = [
    { name: 'Main Gate', lat: 12.96920, lng: 79.15590 },
    { name: 'SMV Block', lat: 12.97040, lng: 79.15720 },
    { name: 'Women\'s J Block', lat: 12.97180, lng: 79.15800 },
    { name: 'Technology Tower', lat: 12.97210, lng: 79.15740 },
    { name: 'Silver Jubilee tower', lat: 12.97150, lng: 79.15550 },
    { name: 'PRP Block', lat: 12.96980, lng: 79.15420 },
];

function Sidebar({ active }) {
    const navigate = useNavigate();

    const links = [
        { path: '/dashboard', label: 'Overview', icon: '⊞' },
        { path: '/dashboard#map', label: 'Live Map', icon: '◈' },
        { path: '/dashboard#schedule', label: 'Schedule', icon: '◷' },
        { path: '/dashboard#alerts', label: 'Announcements', icon: '◉' },
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-title">Shuttle Control</div>
                <div className="sidebar-sub">Smart Campus Initiative</div>
            </div>
            {links.map(l => (
                <button
                    key={l.label}
                    className={`sidebar-link ${active === l.label ? 'active' : ''}`}
                    onClick={() => navigate(l.path)}
                >
                    <span className="s-icon">{l.icon}</span>
                    {l.label}
                </button>
            ))}
        </div>
    );
}

const SCHEDULE = [
    { code: 'FH', route: 'Female Hostel', dest: 'To: Women\'s J Block', time: '09:15 AM', stop: 'Main Gate' },
    { code: 'FH', route: 'Female Hostel', dest: 'To: Technology Tower', time: '09:30 AM', stop: 'Women\'s J Block' },
    { code: 'FH', route: 'Female Hostel', dest: 'To: Main Gate', time: '09:45 AM', stop: 'SMV Block' },
];

export default function Dashboard() {
    const [buses, setBuses] = useState([]);
    const [routeWaypoints, setRouteWaypoints] = useState([]);
    const [studentLocation, setStudentLocation] = useState(null);
    const [eta, setEta] = useState(null);
    const [stops, setStops] = useState([]);
    const [destStopId, setDestStopId] = useState('');
    const [error, setError] = useState('');
    const intervalRef = useRef(null);

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setStudentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => setStudentLocation({ lat: 12.9700, lng: 79.1565 })
            );
        } else {
            setStudentLocation({ lat: 12.9700, lng: 79.1565 });
        }
    }, []);

    useEffect(() => {
        api.get('/bus/stops').then(r => setStops(r.data.stops || [])).catch(() => { });
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const params = {};
                if (studentLocation) { params.lat = studentLocation.lat; params.lng = studentLocation.lng; }
                if (destStopId) params.dest_stop_id = destStopId;

                const [locRes, etaRes] = await Promise.all([
                    api.get('/bus/location'),
                    api.get('/bus/eta', { params }),
                ]);

                setBuses(locRes.data.buses || []);
                setRouteWaypoints((locRes.data.route_waypoints || []).map(wp => [wp.lat, wp.lng]));
                setEta(etaRes.data);
                setError('');
            } catch (err) {
                if (err.response?.status !== 401) setError('Failed to fetch shuttle data. Retrying...');
            }
        };

        fetchData();
        intervalRef.current = setInterval(fetchData, 3000);
        return () => clearInterval(intervalRef.current);
    }, [studentLocation, destStopId]);

    const mapCenter = studentLocation ? [studentLocation.lat, studentLocation.lng] : [12.9706, 79.1565];
    const nearestBusName = eta?.nearest_bus?.bus_name;
    const etaMin = eta?.nearest_bus?.eta_minutes ?? '—';

    return (
        <div className="page-wrapper">
            <Sidebar active="Overview" />
            <div className="main-content">
                <div className="dashboard-layout">
                    {/* ── Map area ── */}
                    <div className="dashboard-main">
                        <div className="map-wrap">
                            <MapContainer
                                center={mapCenter}
                                zoom={16}
                                style={{ height: '100%', width: '100%' }}
                                zoomControl={true}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                {routeWaypoints.length > 1 && (
                                    <Polyline
                                        positions={[...routeWaypoints, routeWaypoints[0]]}
                                        color="#14b8a6"
                                        weight={3}
                                        dashArray="8 5"
                                        opacity={0.8}
                                    />
                                )}
                                {ROUTE_STOPS.map(stop => (
                                    <Marker key={stop.name} position={[stop.lat, stop.lng]} icon={stopIcon}>
                                        <Popup><strong>{stop.name}</strong></Popup>
                                    </Marker>
                                ))}
                                {buses.map(bus => (
                                    <Marker
                                        key={bus.bus_name}
                                        position={[bus.latitude, bus.longitude]}
                                        icon={bus.bus_name === nearestBusName ? nearestBusIcon : busIcon}
                                        zIndexOffset={bus.bus_name === nearestBusName ? 1000 : 0}
                                    >
                                        <Popup>
                                            <strong>{bus.bus_name}</strong>
                                            {bus.bus_name === nearestBusName && <span className="nearest-tag"> ⭐ Nearest</span>}
                                        </Popup>
                                    </Marker>
                                ))}
                                {studentLocation && (
                                    <Marker position={[studentLocation.lat, studentLocation.lng]} icon={studentIcon}>
                                        <Popup><strong>Your Location</strong></Popup>
                                    </Marker>
                                )}
                                {eta?.nearest_bus && studentLocation && (
                                    <Polyline
                                        positions={[
                                            [eta.nearest_bus.latitude, eta.nearest_bus.longitude],
                                            [studentLocation.lat, studentLocation.lng],
                                        ]}
                                        color="#f43f5e"
                                        weight={2}
                                        dashArray="6 5"
                                        opacity={0.7}
                                    />
                                )}
                            </MapContainer>
                        </div>

                        {/* Floating ETA card */}
                        <div className="map-eta-card">
                            <div className="map-eta-label">Next Arrival</div>
                            <div className="map-eta-value">
                                <span className="map-eta-number">{String(etaMin).padStart(2, '0')}</span>
                                <span className="map-eta-unit">MIN</span>
                            </div>
                            <div className="map-eta-route">
                                Female Hostel • {eta?.stop?.name || 'Women\'s J Block'}
                            </div>
                            <div className="map-eta-bus">
                                <span>
                                    <span className="map-eta-dot" />
                                    {nearestBusName || 'Shuttle V-102'}
                                </span>
                                <span>{eta?.nearest_bus?.distance_meters ? `${eta.nearest_bus.distance_meters}m away` : '800m away'}</span>
                            </div>
                            <div className="map-progress">
                                <div className="map-progress-bar" />
                            </div>

                            {/* Destination selector */}
                            <select
                                className="dest-selector"
                                value={destStopId}
                                onChange={e => setDestStopId(e.target.value)}
                                style={{ marginBottom: '12px' }}
                            >
                                <option value="">Select destination stop…</option>
                                {stops.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>

                            <button className="map-notify-btn">
                                Notify Me 🚌
                            </button>
                        </div>

                        {error && (
                            <div style={{ position: 'absolute', bottom: 16, left: 16, zIndex: 1000 }}>
                                <div className="error-message">{error}</div>
                            </div>
                        )}
                    </div>

                    {/* ── Right panel ── */}
                    <div className="dashboard-right">
                        <div>
                            <div className="panel-section-title">Fleet Summary</div>
                            <div className="fleet-grid">
                                <div className="fleet-card">
                                    <div className="fleet-card-label">In Service</div>
                                    <div className="fleet-card-value">{buses.length || 10}</div>
                                </div>
                                <div className="fleet-card">
                                    <div className="fleet-card-label">Congestion</div>
                                    <div className="fleet-card-value good">Low</div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="panel-section-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                Upcoming Schedule
                                <span style={{ fontSize: '0.75rem', color: '#14b8a6', fontWeight: 600, cursor: 'pointer' }}>View All</span>
                            </div>
                            {SCHEDULE.map(s => (
                                <div key={s.code} className="schedule-item">
                                    <div className="schedule-badge">{s.code}</div>
                                    <div className="schedule-info">
                                        <div className="schedule-route">{s.route}</div>
                                        <div className="schedule-dest">{s.dest}</div>
                                    </div>
                                    <div className="schedule-time">
                                        <div className="schedule-time-val">{s.time}</div>
                                        <div className="schedule-stop">{s.stop}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div>
                            <div className="panel-section-title">System Updates</div>
                            <div className="alert-card warning">
                                <div className="alert-tag">⚠ Service Alert</div>
                                <div className="alert-text">Road maintenance near Technology Tower. Expect minor delays for the Female Hostel route.</div>
                                <div className="alert-time">Posted 2 hours ago</div>
                            </div>
                            <div className="alert-card info">
                                <div className="alert-tag info-tag">● New Update</div>
                                <div className="alert-text">Night shuttle frequency for Women's J Block increased for exam week starting tomorrow.</div>
                            </div>
                        </div>

                        <div className="footer" style={{ marginTop: 'auto', padding: '12px 0 0', borderTop: '1px solid #e5e7eb' }}>
                            <span>© 2024 VIT Shuttle</span>
                            <span style={{ display: 'flex', gap: 12 }}>
                                <a href="#" style={{ color: '#9ca3af', fontSize: '0.7rem' }}>Support</a>
                                <a href="#" style={{ color: '#9ca3af', fontSize: '0.7rem' }}>Privacy</a>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
