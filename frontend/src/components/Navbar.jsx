import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const THEME_KEY = "vit-shuttle-theme";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);
  const [currentUser, setCurrentUser] = useState({});

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) {
      setIsDark(savedTheme === "dark");
      return;
    }
    setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setCurrentUser(user && typeof user === "object" ? user : {});
    } catch {
      setCurrentUser({});
    }
  }, []);

  useEffect(() => {
    document.body.classList.toggle("theme-dark", isDark);
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  }, [isDark]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navLinks = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/routes", label: "Routes" },
    { path: "/stops", label: "Bus Stops" },
    { path: "/feedback", label: "Feedback" },
  ];

  const displayName =
    currentUser.name || currentUser.email?.split("@")[0] || "Guest";

  const avatarInitials = displayName
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "GU";

  return (
    <nav className="navbar">
      <div className="nav-brand" onClick={() => navigate("/dashboard")}>
        <img
          src={`${import.meta.env.BASE_URL}logo.svg`}
          alt="VIT Shuttle"
          className="nav-logo"
        />
        <span>VIT Shuttle</span>
      </div>

      <div className="nav-links">
        {navLinks.map((link) => (
          <button
            key={link.path}
            className={`nav-link ${location.pathname === link.path ? "active" : ""}`}
            onClick={() => navigate(link.path)}
          >
            {link.label}
          </button>
        ))}
      </div>

      <div className="nav-user">
        <button
          className={`btn-theme ${isDark ? "active" : ""}`}
          onClick={() => setIsDark((value) => !value)}
          title="Toggle dark mode"
          aria-label="Toggle dark mode"
        >
          ◐
        </button>
        <div className="nav-user-name" title={displayName}>
          {displayName}
        </div>
        <div className="user-avatar" title={displayName}>
          {avatarInitials}
        </div>
        <button className="btn-logout" onClick={handleLogout} title="Logout">
          ↪
        </button>
      </div>
    </nav>
  );
}
