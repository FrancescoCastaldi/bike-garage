import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function formatDuration(seconds) {
  if (!seconds) return '--';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
}

function formatDate(dateStr) {
  if (!dateStr) return '--';
  return new Date(dateStr).toLocaleDateString('it-IT', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

function formatSpeed(speed) {
  if (!speed) return '--';
  return speed.toFixed(1) + ' km/h';
}

function formatDistance(dist) {
  if (!dist) return '--';
  return (dist / 1000).toFixed(2) + ' km';
}

export default function ActivityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [gpxPoints, setGpxPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    window.electronAPI.getActivities()
      .then(activities => {
        const found = activities.find(a => String(a.id) === String(id));
        if (!found) {
          setError('Attivita\' non trovata.');
        } else {
          setActivity(found);
          if (found.gpx_data) {
            try {
              const parser = new DOMParser();
              const xml = parser.parseFromString(found.gpx_data, 'text/xml');
              const trkpts = xml.querySelectorAll('trkpt');
              const points = Array.from(trkpts).map(pt => ([
                parseFloat(pt.getAttribute('lat')),
                parseFloat(pt.getAttribute('lon'))
              ])).filter(p => !isNaN(p[0]) && !isNaN(p[1]));
              setGpxPoints(points);
            } catch (e) {
              console.error('GPX parse error:', e);
            }
          }
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const center = gpxPoints.length > 0
    ? [gpxPoints[Math.floor(gpxPoints.length / 2)][0], gpxPoints[Math.floor(gpxPoints.length / 2)][1]]
    : [45.4654, 9.1859];

  if (loading) return <div className="page"><p className="loading-text">Caricamento...</p></div>;
  if (error) return <div className="page"><p className="error-text">{error}</p></div>;
  if (!activity) return null;

  return (
    <div className="page activity-detail">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/activities')}>
          &larr; Torna alle Attivit&agrave;
        </button>
        <h1 className="page-title">{activity.name || 'Attivit\u00e0 senza nome'}</h1>
        <span className="activity-date">{formatDate(activity.date)}</span>
      </div>

      <div className="detail-stats-grid">
        <div className="detail-stat-card">
          <span className="stat-icon">&#128207;</span>
          <span className="stat-value">{formatDistance(activity.distance)}</span>
          <span className="stat-label">Distanza</span>
        </div>
        <div className="detail-stat-card">
          <span className="stat-icon">&#9201;</span>
          <span className="stat-value">{formatDuration(activity.duration)}</span>
          <span className="stat-label">Durata</span>
        </div>
        <div className="detail-stat-card">
          <span className="stat-icon">&#9889;</span>
          <span className="stat-value">{formatSpeed(activity.avg_speed)}</span>
          <span className="stat-label">Velocit&agrave; Media</span>
        </div>
        <div className="detail-stat-card">
          <span className="stat-icon">&#128200;</span>
          <span className="stat-value">{formatSpeed(activity.max_speed)}</span>
          <span className="stat-label">Velocit&agrave; Massima</span>
        </div>
        <div className="detail-stat-card">
          <span className="stat-icon">&#9968;</span>
          <span className="stat-value">{activity.elevation_gain ? Math.round(activity.elevation_gain) + ' m' : '--'}</span>
          <span className="stat-label">Dislivello</span>
        </div>
        <div className="detail-stat-card">
          <span className="stat-icon">&#128149;</span>
          <span className="stat-value">{activity.calories ? Math.round(activity.calories) : '--'}</span>
          <span className="stat-label">Calorie</span>
        </div>
      </div>

      {gpxPoints.length > 1 && (
        <div className="detail-map-section">
          <h2 className="section-title">Percorso</h2>
          <div className="map-container">
            <MapContainer
              center={center}
              zoom={13}
              style={{ height: '400px', width: '100%', borderRadius: '12px' }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Polyline positions={gpxPoints} color="#e74c3c" weight={3} />
            </MapContainer>
          </div>
        </div>
      )}

      {activity.notes && (
        <div className="detail-notes-section">
          <h2 className="section-title">Note</h2>
          <p className="notes-text">{activity.notes}</p>
        </div>
      )}
    </div>
  );
}
