import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function Sidebar({ active }) {
    const navigate = useNavigate();
    const links = [
        { path: '/dashboard', label: 'Overview', icon: '⊞' },
        { path: '/stops', label: 'Live Map', icon: '◈' },
        { path: '/dashboard#schedule', label: 'Schedule', icon: '◷' },
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

export default function Feedback() {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [message, setMessage] = useState('');
    const [feedbacks, setFeedbacks] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => { fetchFeedbacks(); }, []);

    const fetchFeedbacks = async () => {
        try {
            const { data } = await api.get('/feedback');
            setFeedbacks(data.feedbacks || []);
        } catch { }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) { setError('Please select a rating'); return; }
        setSubmitting(true);
        setError('');
        try {
            await api.post('/feedback', { rating, message });
            setSuccess('Thank you for your feedback!');
            setRating(0);
            setMessage('');
            fetchFeedbacks();
            setTimeout(() => setSuccess(''), 4000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit feedback');
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = (count, interactive = false) =>
        Array.from({ length: 5 }, (_, i) => (
            <span
                key={i}
                className={`star ${interactive ? 'interactive' : 'small'} ${i < (interactive ? (hoverRating || rating) : count) ? 'filled' : ''}`}
                onClick={interactive ? () => setRating(i + 1) : undefined}
                onMouseEnter={interactive ? () => setHoverRating(i + 1) : undefined}
                onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
            >
                {i < (interactive ? (hoverRating || rating) : count) ? '★' : '☆'}
            </span>
        ));

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Helper: get initials from name/email
    const initials = (str = '') => {
        const parts = str.split(/[\s.@]/);
        return (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this feedback?')) return;
        try {
            await api.delete(`/feedback/${id}`);
            fetchFeedbacks();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete feedback');
        }
    };

    const totalCount = feedbacks.length;
    const avgRating = totalCount > 0
        ? (feedbacks.reduce((s, f) => s + f.rating, 0) / totalCount).toFixed(1)
        : '4.8';

    return (
        <div className="page-wrapper">
            <Sidebar active="Announcements" />
            <div className="main-content">
                <div className="feedback-page">
                    <div className="page-header">
                        <h1>Campus Voice</h1>
                        <p>Help us refine the "Ethereal Navigator" experience. Your feedback directly impacts the Smart Campus Initiative.</p>
                    </div>

                    <div className="feedback-layout">
                        {/* ── Form side ── */}
                        <div>
                            <div className="feedback-form-card">
                                <h2>Share Your Experience</h2>

                                {success && <div className="success-message">{success}</div>}
                                {error && <div className="error-message">{error}</div>}

                                <form onSubmit={handleSubmit}>
                                    <div className="rating-section">
                                        <label className="rating-label">Overall Satisfaction</label>
                                        <div className="stars-container">
                                            {renderStars(rating, true)}
                                        </div>
                                    </div>

                                    <div className="feedback-select-row">
                                        <div className="fb-form-group">
                                            <label className="fb-label">Route Experienced</label>
                                            <select className="fb-select">
                                                <option>Female Hostel</option>
                                            </select>
                                        </div>
                                        <div className="fb-form-group">
                                            <label className="fb-label">Category</label>
                                            <select className="fb-select">
                                                <option>Punctuality</option>
                                                <option>Driver</option>
                                                <option>Cleanliness</option>
                                                <option>App Experience</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="fb-form-group">
                                        <label className="fb-label">Detailed Comments</label>
                                        <textarea
                                            className="fb-textarea"
                                            placeholder="Tell us what went well or what we could improve..."
                                            value={message}
                                            onChange={e => setMessage(e.target.value)}
                                            maxLength={500}
                                            rows={4}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <button type="submit" className="btn-submit-feedback" disabled={submitting}>
                                            {submitting ? <span className="spinner" /> : <>Submit Feedback ➜</>}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <div className="feedback-promo-card">
                                Your voice shapes the future of campus mobility.
                            </div>
                        </div>

                        {/* ── Feedback list side ── */}
                        <div>
                            <div className="feedback-list-card">
                                <div className="feedback-list-header">
                                    <div className="feedback-list-title">
                                        💬 Recent Feedback
                                    </div>
                                    <span className="live-badge">LIVE UPDATES</span>
                                </div>

                                {feedbacks.length === 0 ? (
                                    <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No feedback yet. Be the first!</p>
                                ) : (
                                    feedbacks.slice(0, 5).map((fb, i) => (
                                        <div key={fb.id} className="feedback-item" style={{ animationDelay: `${i * 0.06}s` }}>
                                            <div className="feedback-item-top">
                                                <div className="feedback-avatar" style={{ background: `hsl(${(i * 47) % 360}, 60%, 85%)`, color: `hsl(${(i * 47) % 360}, 60%, 35%)` }}>
                                                    {initials(fb.user_name || fb.user_email).toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <div className="feedback-author-name">{fb.user_name || fb.user_email?.split('@')[0]}</div>
                                                    <div className="feedback-meta">
                                                        {new Date(fb.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                    </div>
                                                </div>
                                                <div className="feedback-stars">
                                                    <div className="stars-container">{renderStars(fb.rating)}</div>
                                                </div>
                                                {(fb.user_id === user.id || fb.user_email === user.email) && (
                                                    <button 
                                                        className="btn-delete-feedback" 
                                                        onClick={() => handleDelete(fb.id)}
                                                        title="Delete feedback"
                                                    >
                                                        🗑️
                                                    </button>
                                                )}
                                            </div>
                                            {fb.message && <p className="feedback-quote">{fb.message}</p>}
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="satisfaction-banner">
                                <div>
                                    <div className="satisfaction-score">{avgRating}</div>
                                    <div className="satisfaction-label">Global Satisfaction</div>
                                </div>
                                <div className="satisfaction-count">
                                    {Math.max(1200, totalCount * 10)}+ Reviews
                                    <div className="satisfaction-period">This Semester</div>
                                </div>
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
