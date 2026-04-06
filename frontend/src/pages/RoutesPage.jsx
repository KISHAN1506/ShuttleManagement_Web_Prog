import Sidebar from "../components/Sidebar";

export default function RoutesPage() {
  const routes = [
    {
      code: "FH",
      name: "Female Hostel",
      desc: "Main Gate ➔ Women's J Block ➔ TT ➔ SMV ➔ PRP",
      freq: "Every 15 mins",
    },
  ];

  return (
    <div className="page-wrapper">
      <Sidebar />
      <div className="main-content">
        <div className="stops-page">
          <div className="stops-page-header">
            <div className="stops-eyebrow">Transit Network</div>
            <div className="stops-title">Active Routes</div>
            <div className="stops-sub">
              View all operational shuttle routes, their pathways, and typical
              frequencies across the campus.
            </div>
          </div>

          <div className="routes-list">
            {routes.map((Route) => (
              <div key={Route.code} className="route-card">
                <div className="route-main">
                  <div className="route-code-badge">{Route.code}</div>
                  <div>
                    <div className="route-name">{Route.name}</div>
                    <div className="route-path">{Route.desc}</div>
                  </div>
                </div>
                <div className="route-frequency-block">
                  <div className="route-frequency-value">{Route.freq}</div>
                  <div className="route-frequency-label">Frequency</div>
                </div>
              </div>
            ))}
          </div>

          <div className="footer routes-footer">
            <span>© 2026 VIT Shuttle. Smart Campus Initiative.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
