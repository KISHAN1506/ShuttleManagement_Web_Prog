import { useNavigate } from 'react-router-dom';

function Sidebar({ active }) {
    const navigate = useNavigate();
    const links = [
        { path: '/dashboard', label: 'Overview', icon: '⊞' },
        { path: '/routes', label: 'All Routes', icon: '◈' },
        { path: '/stops', label: 'Live Map', icon: '◷' },
        { path: '/feedback', label: 'Announcements', icon: '◉' },
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

export default function RoutesPage() {
    const routes = [
        { code: 'FH', name: 'Female Hostel', desc: 'Main Gate ➔ Women\'s J Block ➔ TT ➔ SMV ➔ PRP', freq: 'Every 15 mins' },
    ];

    return (
        <div className="page-wrapper">
            <Sidebar active="All Routes" />
            <div className="main-content">
                <div className="stops-page">
                    <div className="stops-page-header">
                        <div className="stops-eyebrow">Transit Network</div>
                        <div className="stops-title">Active Routes</div>
                        <div className="stops-sub">View all operational shuttle routes, their pathways, and typical frequencies across the campus.</div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {routes.map(Route => (
                            <div key={Route.code} className="stop-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div className="stop-icon-wrap" style={{ width: '50px', height: '50px', fontSize: '1.2rem', fontWeight: 800 }}>
                                        {Route.code}
                                    </div>
                                    <div>
                                        <div className="stop-name" style={{ fontSize: '1.2rem' }}>{Route.name}</div>
                                        <div className="stop-desc" style={{ marginBottom: 0 }}>{Route.desc}</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div className="stop-dist-val" style={{ fontSize: '1.1rem', color: '#0d9488' }}>{Route.freq}</div>
                                    <div className="stop-dist-unit">Frequency</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="footer" style={{ marginTop: '40px', padding: '16px 0 0', borderTop: '1px solid #e5e7eb' }}>
                        <span>© 2024 VIT Shuttle. Smart Campus Initiative.</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
