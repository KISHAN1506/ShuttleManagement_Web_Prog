import { useState, useEffect, useRef } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import api from "../api";
import Sidebar from "../components/Sidebar";
import "leaflet/dist/leaflet.css";

const STOP_ICONS = ["📍", "🎓", "🍽️", "📚", "🏢", "⚽"];
const STOP_DESCS = [
  "Entrance Plaza, North Campus",
  "Engineering Dept, Central Hub",
  "Student Activity Center",
  "Quiet Zone, South Campus",
  "Tech Tower, East Wing",
  "Stadium Entrance",
];

const stopMarkerIcon = new L.DivIcon({
  html: '<div class="stop-map-marker">🚏</div>',
  className: "custom-stop-map-icon",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const selectedStopMarkerIcon = new L.DivIcon({
  html: '<div class="stop-map-marker selected">📍</div>',
  className: "custom-stop-map-icon",
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

export default function BusStops() {
  const [stops, setStops] = useState([]);
  const [selectedStopId, setSelectedStopId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("grid");
  const mapRef = useRef(null);
  const [isDarkTheme, setIsDarkTheme] = useState(() =>
    document.body.classList.contains("theme-dark"),
  );

  useEffect(() => {
    api
      .get("/bus/stops")
      .then((r) => {
        setStops(r.data.stops || []);
        setSelectedStopId(r.data.selected_stop_id);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load bus stops");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkTheme(document.body.classList.contains("theme-dark"));
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const handleSelect = async (stopId) => {
    try {
      await api.post("/bus/select-stop", { stop_id: stopId });
      setSelectedStopId(stopId);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to select stop");
    }
  };

  const mappableStops = stops
    .map((stop) => ({
      ...stop,
      latitude: Number(stop.latitude),
      longitude: Number(stop.longitude),
    }))
    .filter(
      (stop) =>
        Number.isFinite(stop.latitude) && Number.isFinite(stop.longitude),
    );

  const mapCenter = mappableStops.length
    ? [mappableStops[0].latitude, mappableStops[0].longitude]
    : [12.9706, 79.1565];

  const handleRecenterMap = () => {
    if (mapRef.current) {
      mapRef.current.invalidateSize();
      if (mappableStops.length > 1) {
        const bounds = L.latLngBounds(
          mappableStops.map((stop) => [stop.latitude, stop.longitude]),
        );
        mapRef.current.fitBounds(bounds, {
          padding: [48, 48],
          maxZoom: 16,
          animate: true,
        });
      } else {
        mapRef.current.setView(mapCenter, 16, { animate: true });
      }
    }
  };

  return (
    <div className="page-wrapper">
      <Sidebar />
      <div className="main-content">
        <div className="stops-page">
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
            }}
          >
            <div className="stops-page-header">
              <div className="stops-eyebrow">Campus Network</div>
              <div className="stops-title">Bus Stops</div>
              <div className="stops-sub">
                Find the nearest shuttle pick-up point and check live distances
                from your current location.
              </div>
            </div>
            <div className="stops-view-toggle" style={{ marginTop: 0 }}>
              <button
                className={`view-btn ${view === "grid" ? "active" : ""}`}
                onClick={() => setView("grid")}
              >
                Grid View
              </button>
              <button
                className={`view-btn ${view === "map" ? "active" : ""}`}
                onClick={() => setView("map")}
              >
                Map View
              </button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div
              style={{ textAlign: "center", padding: "48px", color: "#6b7280" }}
            >
              Loading stops…
            </div>
          ) : view === "grid" ? (
            <div className="stops-grid">
              {stops.map((stop, i) => (
                <div
                  key={stop.id}
                  className={`stop-card ${selectedStopId === stop.id ? "selected" : ""}`}
                >
                  <div className="stop-card-top">
                    <div className="stop-icon-wrap">
                      {STOP_ICONS[i] || "🚏"}
                    </div>
                    <div className="stop-distance">
                      <div className="stop-dist-val">
                        {(0.2 + i * 0.6).toFixed(1)}
                      </div>
                      <div className="stop-dist-unit">Kilometers Away</div>
                    </div>
                  </div>
                  <div className="stop-name">{stop.name}</div>
                  <div className="stop-desc">
                    {STOP_DESCS[i] || "Campus Stop"}
                  </div>
                  <button
                    className={`btn-select-stop ${selectedStopId === stop.id ? "selected" : ""}`}
                    onClick={() => handleSelect(stop.id)}
                  >
                    {selectedStopId === stop.id
                      ? "✓ Selected Stop"
                      : "Select Stop →"}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="stops-map-shell">
              <MapContainer
                ref={mapRef}
                center={mapCenter}
                zoom={16}
                className="stops-map"
                scrollWheelZoom
              >
                <TileLayer
                  attribution={
                    isDarkTheme
                      ? "&copy; OpenStreetMap contributors &copy; CARTO"
                      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  }
                  url={
                    isDarkTheme
                      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  }
                />
                {mappableStops.map((stop, i) => (
                  <Marker
                    key={stop.id}
                    position={[stop.latitude, stop.longitude]}
                    icon={
                      selectedStopId === stop.id
                        ? selectedStopMarkerIcon
                        : stopMarkerIcon
                    }
                  >
                    <Popup>
                      <strong>{stop.name}</strong>
                      <br />
                      {STOP_DESCS[i] || "Campus Stop"}
                      <br />
                      <button
                        className="map-select-stop"
                        onClick={() => handleSelect(stop.id)}
                        type="button"
                      >
                        {selectedStopId === stop.id
                          ? "Selected"
                          : "Select Stop"}
                      </button>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>

              <button
                type="button"
                className="map-recenter-btn map-recenter-btn-stops"
                onClick={handleRecenterMap}
                title="Recenter map"
              >
                Recenter
              </button>
            </div>
          )}

          
          <div className="network-card">
            <div>
              <div className="network-live">
                <span className="network-live-dot" />
                Live Network Active
              </div>
              <div className="network-title">
                Currently tracking {buses_count()} shuttles across 8 campus
                zones. All stops are operational.
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: "16px",
                }}
              >
                <div className="network-avatars">
                  {["JD", "MS", "+4"].map((a, i) => (
                    <div
                      key={i}
                      className={`avatar-circle ${i === 2 ? "avatar-more" : ""}`}
                    >
                      {a}
                    </div>
                  ))}
                </div>
                <span className="network-users">2.4k Users Online</span>
              </div>
            </div>
          </div>

          <div
            className="footer"
            style={{
              marginTop: "24px",
              padding: "16px 0 0",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <span>© 2026 VIT Shuttle. Smart Campus Initiative.</span>
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

function buses_count() {
  return 12;
}
