import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const navLinks = [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/routes', label: 'Routes' },
        { path: '/stops', label: 'Bus Stops' },
        { path: '/feedback', label: 'Feedback' },
    ];

    return (
        <nav className="navbar">
            <div className="nav-brand" onClick={() => navigate('/dashboard')}>
                <span className="nav-logo">🚌</span>
                <span>VIT Shuttle</span>
            </div>

            <div className="nav-links">
                {navLinks.map((link) => (
                    <button
                        key={link.path}
                        className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                        onClick={() => navigate(link.path)}
                    >
                        {link.label}
                    </button>
                ))}
            </div>

            <div className="nav-user">
                <div className="user-avatar" title="Profile">👤</div>
                <button className="btn-logout" onClick={handleLogout} title="Logout">
                    ↪
                </button>
            </div>
        </nav>
    );
}
