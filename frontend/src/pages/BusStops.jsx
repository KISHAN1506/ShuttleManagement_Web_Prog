import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api';

const STOP_ICONS = ['📍', '🎓', '🍽️', '📚', '🏢', '⚽'];
const STOP_DESCS = [
    'Entrance Plaza, North Campus',
    'Engineering Dept, Central Hub',
    'Student Activity Center',
    'Quiet Zone, South Campus',
    'Tech Tower, East Wing',
    'Stadium Entrance',
];

function Sidebar({ active }) {
    const navigate = useNavigate();
    const links = [
        { path: '/dashboard', label: 'Overview', icon: '⊞' },
        { path: '/stops', label: 'Live Map', icon: '◈' },
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

export default function BusStops() {
    const [stops, setStops] = useState([]);
    const [selectedStopId, setSelectedStopId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [view, setView] = useState('grid');

    useEffect(() => {
        api.get('/bus/stops')
            .then(r => {
                setStops(r.data.stops || []);
                setSelectedStopId(r.data.selected_stop_id);
                setLoading(false);
            })
            .catch(() => {
                setError('Failed to load bus stops');
                setLoading(false);
            });
    }, []);

    const handleSelect = async (stopId) => {
        try {
            await api.post('/bus/select-stop', { stop_id: stopId });
            setSelectedStopId(stopId);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to select stop');
        }
    };

    return (
        <div className="page-wrapper">
            <Sidebar active="Live Map" />
            <div className="main-content">
                <div className="stops-page">
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div className="stops-page-header">
                            <div className="stops-eyebrow">Campus Network</div>
                            <div className="stops-title">Bus Stops</div>
                            <div className="stops-sub">Find the nearest shuttle pick-up point and check live distances from your current location.</div>
                        </div>
                        <div className="stops-view-toggle" style={{ marginTop: 0 }}>
                            <button className={`view-btn ${view === 'grid' ? 'active' : ''}`} onClick={() => setView('grid')}>Grid View</button>
                            <button className={`view-btn ${view === 'map' ? 'active' : ''}`} onClick={() => setView('map')}>Map View</button>
                        </div>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>Loading stops…</div>
                    ) : (
                        <div className="stops-grid">
                            {stops.map((stop, i) => (
                                <div
                                    key={stop.id}
                                    className={`stop-card ${selectedStopId === stop.id ? 'selected' : ''}`}
                                >
                                    <div className="stop-card-top">
                                        <div className="stop-icon-wrap">{STOP_ICONS[i] || '🚏'}</div>
                                        <div className="stop-distance">
                                            <div className="stop-dist-val">{(0.2 + i * 0.6).toFixed(1)}</div>
                                            <div className="stop-dist-unit">Kilometers Away</div>
                                        </div>
                                    </div>
                                    <div className="stop-name">{stop.name}</div>
                                    <div className="stop-desc">{STOP_DESCS[i] || 'Campus Stop'}</div>
                                    <button
                                        className={`btn-select-stop ${selectedStopId === stop.id ? 'selected' : ''}`}
                                        onClick={() => handleSelect(stop.id)}
                                    >
                                        {selectedStopId === stop.id ? '✓ Selected Stop' : 'Select Stop →'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Network status card */}
                    <div className="network-card">
                        <div>
                            <div className="network-live">
                                <span className="network-live-dot" />
                                Live Network Active
                            </div>
                            <div className="network-title">Currently tracking {buses_count()} shuttles across 8 campus zones. All stops are operational.</div>
                            <div style={{ display: 'flex', alignItems: 'center', marginTop: '16px' }}>
                                <div className="network-avatars">
                                    {['JD', 'MS', '+4'].map((a, i) => (
                                        <div key={i} className={`avatar-circle ${i === 2 ? 'avatar-more' : ''}`}>{a}</div>
                                    ))}
                                </div>
                                <span className="network-users">2.4k Users Online</span>
                            </div>
                        </div>
                    </div>

                    <div className="footer" style={{ marginTop: '24px', padding: '16px 0 0', borderTop: '1px solid #e5e7eb' }}>
                        <span>© 2024 VIT Shuttle. Smart Campus Initiative.</span>
                        <div className="footer-links">
                            <a href="#">Privacy Policy</a>
                            <a href="#">Terms of Service</a>
                            <a href="#">Contact Support</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function buses_count() { return 12; }
