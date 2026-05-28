import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [bikes, setBikes] = useState([]);
  const [allActivities, setAllActivities] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [bikeImages, setBikeImages] = useState({});
  const navigate = useNavigate();

  useEffect(() => { load(); }, []);

  async function load() {
    const [s, b, a] = await Promise.all([
      window.api.activities.stats(),
      window.api.bikes.getAll(),
      window.api.activities.getAll()
    ]);
    setStats(s);
    setBikes(b);
    setAllActivities(a);           // FIX: store ALL activities for chart
    setRecentActivities(a.slice(0, 5)); // only 5 for the table
    const imgs = {};
    for (const bike of b) {
      if (bike.image_path) {
        imgs[bike.id] = await window.api.fs.imageToBase64(bike.image_path);
      }
    }
    setBikeImages(imgs);
  }

  // FIX: use allActivities (not just recent 5) for the monthly chart
  const monthly = {};
  allActivities.forEach(a => {
    const m = a.date ? a.date.substring(0, 7) : 'N/A';
    monthly[m] = (monthly[m] || 0) + (a.distance_km || 0);
  });
  const chartData = Object.entries(monthly)
    .map(([m, km]) => ({ mese: m, km: Math.round(km * 10) / 10 }))
    .sort((a, b) => a.mese.localeCompare(b.mese))
    .slice(-12); // last 12 months

  function formatDuration(sec) {
    if (!sec) return '-';
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  return (
    <div className="page">
      <h1>Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats ? Math.round(stats.total_km) : 0}</div>
          <div className="stat-label">KM Totali</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats ? stats.count : 0}</div>
          <div className="stat-label">Attivita</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats ? Math.round(stats.total_elev) : 0} m</div>
          <div className="stat-label">Dislivello Totale</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{bikes.length}</div>
          <div className="stat-label">Bici</div>
        </div>
      </div>

      <div className="card">
        <h3>KM per mese</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="mese" />
              <YAxis />
              <Tooltip formatter={(v) => [`${v} km`, 'Distanza']} />
              <Bar dataKey="km" fill="var(--accent)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-state">
            <span style={{fontSize:32}}>📊</span>
            <p>Nessun dato</p>
          </div>
        )}
      </div>

      <div className="card">
        <h3>Le mie bici</h3>
        {bikes.length === 0 ? (
          <div className="empty-state">
            <span style={{fontSize:32}}>🚲</span>
            <p>Nessuna bici</p>
          </div>
        ) : bikes.map(b => (
          <div key={b.id} onClick={() => navigate(`/bikes/${b.id}`)} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:'1px solid var(--border)',cursor:'pointer'}}>
            {bikeImages[b.id]
              ? <img src={bikeImages[b.id]} alt={b.name} style={{width:48,height:48,objectFit:'cover',borderRadius:8}} />
              : <span style={{fontSize:32}}>🚲</span>}
            <div style={{flex:1}}>
              <div style={{fontWeight:600}}>{b.name}</div>
              <div style={{color:'var(--text-secondary)',fontSize:13}}>{b.brand} {b.model}</div>
            </div>
            <div style={{fontWeight:600,color:'var(--accent)'}}>{Math.round(b.total_km || 0)} km</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3>Ultime attivita</h3>
        {recentActivities.length === 0 ? (
          <div className="empty-state">
            <span style={{fontSize:32}}>🗺️</span>
            <p>Nessuna attivita</p>
          </div>
        ) : (
          <table className="table">
            <thead><tr>
              <th>Data</th><th>Nome</th><th>Bici</th><th>KM</th><th>Durata</th><th>Dislivello</th><th>HR avg</th><th>Watt avg</th>
            </tr></thead>
            <tbody>
              {recentActivities.map(a => (
                <tr key={a.id} onClick={() => navigate(`/activities/${a.id}`)} style={{cursor:'pointer'}}>
                  <td>{a.date||'-'}</td>
                  <td>{a.name}</td>
                  <td>{a.bike_name||'-'}</td>
                  <td>{a.distance_km ? Math.round(a.distance_km*10)/10 : '-'}</td>
                  <td>{formatDuration(a.duration_sec)}</td>
                  <td>{a.elevation_m ? Math.round(a.elevation_m)+'m' : '-'}</td>
                  <td>{a.avg_hr||'-'}</td>
                  <td>{a.avg_watts ? Math.round(a.avg_watts)+'W' : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
