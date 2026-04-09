import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [bikes, setBikes] = useState([]);
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
    setRecentActivities(a.slice(0,5));
    const imgs = {};
    for (const bike of b) {
      if (bike.image_path) {
        imgs[bike.id] = await window.api.fs.imageToBase64(bike.image_path);
      }
    }
    setBikeImages(imgs);
  }

  const monthly = {};
  recentActivities.forEach(a => {
    const m = a.date ? a.date.substring(0,7) : 'N/A';
    monthly[m] = (monthly[m] || 0) + (a.distance_km || 0);
  });
  const chartData = Object.entries(monthly).map(([m,km]) => ({ mese: m, km: Math.round(km*10)/10 })).sort((a,b)=>a.mese.localeCompare(b.mese));

  function formatDuration(sec) {
    if (!sec) return '-';
    const h = Math.floor(sec/3600);
    const m = Math.floor((sec%3600)/60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>

      <div className="grid-4" style={{marginBottom:24}}>
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

      <div className="grid-2">
        <div className="card">
          <h3 style={{marginBottom:16, fontSize:15}}>KM per mese</h3>
          {chartData.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="mese" stroke="#9090a8" tick={{fontSize:11}} />
                  <YAxis stroke="#9090a8" tick={{fontSize:11}} />
                  <Tooltip contentStyle={{background:'#1a1a22',border:'1px solid #2e2e3e',borderRadius:8}} />
                  <Bar dataKey="km" fill="#e84d1c" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <div className="empty-state"><div className="empty-state-icon">📊</div><div className="empty-state-text">Nessun dato</div></div>}
        </div>

        <div className="card">
          <h3 style={{marginBottom:16, fontSize:15}}>Le mie bici</h3>
          {bikes.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">🚲</div><div className="empty-state-text">Nessuna bici</div></div>
          ) : bikes.map(b => (
            <div key={b.id} onClick={() => navigate(`/bikes/${b.id}`)} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:'1px solid var(--border)',cursor:'pointer'}}>
              <div style={{width:48,height:48,borderRadius:8,background:'var(--bg3)',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',flexShrink:0}}>
                {bikeImages[b.id] ? <img src={bikeImages[b.id]} style={{width:'100%',height:'100%',objectFit:'cover'}} /> : <span style={{fontSize:24}}>🚲</span>}
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600}}>{b.name}</div>
                <div style={{color:'var(--text2)',fontSize:12}}>{b.brand} {b.model}</div>
              </div>
              <div style={{color:'var(--accent2)',fontWeight:700}}>{Math.round(b.total_km || 0)} km</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 style={{marginBottom:16, fontSize:15}}>Ultime attivita</h3>
        {recentActivities.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">🗺️</div><div className="empty-state-text">Nessuna attivita</div></div>
        ) : (
          <table>
            <thead><tr><th>Data</th><th>Nome</th><th>Bici</th><th>KM</th><th>Durata</th><th>Dislivello</th><th>HR avg</th><th>Watt avg</th></tr></thead>
            <tbody>
              {recentActivities.map(a => (
                <tr key={a.id} className="activity-row" onClick={() => navigate(`/activities/${a.id}`)}>
                  <td>{a.date || '-'}</td>
                  <td>{a.name}</td>
                  <td>{a.bike_name || '-'}</td>
                  <td>{a.distance_km ? Math.round(a.distance_km*10)/10 : '-'}</td>
                  <td>{formatDuration(a.duration_sec)}</td>
                  <td>{a.elevation_m ? Math.round(a.elevation_m) + 'm' : '-'}</td>
                  <td>{a.avg_hr || '-'}</td>
                  <td>{a.avg_watts ? Math.round(a.avg_watts) + 'W' : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
