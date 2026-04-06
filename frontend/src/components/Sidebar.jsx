import { useNavigate, useLocation } from "react-router-dom";

const links = [
  { path: "/dashboard", label: "Overview", icon: "⊞" },
  { path: "/routes", label: "All Routes", icon: "◈" },
  { path: "/stops", label: "Bus Stops", icon: "◷" },
  { path: "/feedback", label: "Feedback", icon: "◉" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">Shuttle Control</div>
        <div className="sidebar-sub">Smart Campus Initiative</div>
      </div>
      {links.map((link) => (
        <button
          key={link.path}
          className={`sidebar-link ${location.pathname === link.path ? "active" : ""}`}
          onClick={() => navigate(link.path)}
        >
          <span className="s-icon">{link.icon}</span>
          {link.label}
        </button>
      ))}
    </div>
  );
}
