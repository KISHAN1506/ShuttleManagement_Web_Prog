import { useNavigate } from 'react-router-dom';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="notfound-page">
            <div className="notfound-icon">🚌💨</div>
            <h1>404</h1>
            <p>Oops! This route doesn't exist on our shuttle map.</p>
            <button className="btn-primary" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
            </button>
        </div>
    );
}
