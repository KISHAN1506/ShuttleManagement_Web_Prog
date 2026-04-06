import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="notfound-page">
      <div className="notfound-card">
        <p className="notfound-kicker">Route Error</p>
        <div className="notfound-icon-wrap">
          <div className="notfound-icon">
            <img
              src={`${import.meta.env.BASE_URL}logo.svg`}
              alt="VIT Shuttle"
              className="notfound-logo"
            />
          </div>
        </div>
        <h1 className="notfound-code">404</h1>
        <h2 className="notfound-title">Page Not Found</h2>
        <p className="notfound-copy">
          This stop does not exist on the current route map. Use one of the
          quick actions below.
        </p>
        <div className="notfound-actions">
          <button
            className="notfound-btn notfound-btn-primary"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>
          <button
            className="notfound-btn notfound-btn-secondary"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
}
