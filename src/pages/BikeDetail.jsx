import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function BikeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bike, setBike] = useState(null);
  const [bikeImg, setBikeImg] = useState(null);
  const [components, setComponents] = useState([]);
  const [consumables, setConsumables] = useState([]);
  const [activities, setActivities] = useState([]);
  const [tab, setTab] = useState('attivita');

  useEffect(() => { load(); }, [id]);

  async function load() {
    const [b, c, cons, acts] = await Promise.all([
      window.api.bikes.get(Number(id)),
      window.api.components.getAll(Number(id)),
      window.api.consumables.getAll(Number(id)),
      window.api.activities.getAll(Number(id))
    ]);
    setBike(b);
    setComponents(c);
    setConsumables(cons);
    setActivities(acts);
    if (b && b.image_path) {
      setBikeImg(await window.api.fs.imageToBase64(b.image_path));
    }
    if (b) await window.api.bikes.updateKm(Number(id));
  }

  function formatDuration(sec) {
    if (!sec) return '-';
    const h = Math.floor(sec/3600), m = Math.floor((sec%3600)/60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  const kmByMonth = {};
  activities.forEach(a => {
    const m = a.date ? a.date.substring(0,7) : 'N/A';
    kmByMonth[m] = (kmByMonth[m] || 0) + (a.distance_km || 0);
  });
  const chartData = Object.entries(kmByMonth).map(([m,km]) => ({mese:m, km:Math.round(km*10)/10})).sort((a,b)=>a.mese.localeCompare(b.mese)).slice(-12);

  if (!bike) return <div style={{padding:20}}>Caricamento...</div>;

  return (
    <div>
      <button className="back-btn" onClick={() => navigate('/bikes')}>&larr; Torna alle bici</button>
      <div className="card" style={{display:'flex',gap:24,alignItems:'flex-start'}}>
        <div style={{width:180,height:180,borderRadius:12,background:'var(--bg3)',overflow:'hidden',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:64}}>
          {bikeImg ? <img src={bikeImg} style={{width:'100%',height:'100%',objectFit:'cover'}} /> : '🚲'}
        </div>
        <div style={{flex:1}}>
          <h1 style={{fontSize:24,fontWeight:700,marginBottom:6}}>{bike.name}</h1>
          <div style={{color:'var(--text2)',marginBottom:12}}>{[bike.brand,bike.model,bike.year].filter(Boolean).join(' - ')}</div>
          <div className="grid-4">
            <div className="stat-card"><div className="stat-value">{Math.round(bike.total_km||0)}</div><div className="stat-label">KM totali</div></div>
            <div className="stat-card"><div className="stat-value">{activities.length}</div><div className="stat-label">Attivita</div></div>
            <div className="stat-card"><div className="stat-value">{components.filter(c=>!c.retired).length}</div><div className="stat-label">Componenti</div></div>
            <div className="stat-card"><div className="stat-value">{consumables.filter(c=>!c.used).length}</div><div className="stat-label">Consumabili</div></div>
          </div>
          {bike.description && <div style={{marginTop:12,color:'var(--text2)',fontSize:13}}>{bike.description}</div>}
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="card">
          <h3 style={{marginBottom:16,fontSize:15}}>KM per mese</h3>
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
        </div>
      )}

      <div className="tabs">
        {['attivita','componenti','consumabili'].map(t => (
          <button key={t} className={`tab${tab===t?' active':''}`} onClick={()=>setTab(t)}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'attivita' && (
        <div className="card">
          {activities.length === 0 ? <div className="empty-state"><div className="empty-state-icon">🗺️</div><div className="empty-state-text">Nessuna attivita</div></div> : (
            <table>
              <thead><tr><th>Data</th><th>Nome</th><th>KM</th><th>Durata</th><th>Dislivello</th><th>HR avg</th><th>Watt avg</th></tr></thead>
              <tbody>
                {activities.map(a => (
                  <tr key={a.id} className="activity-row" onClick={() => navigate(`/activities/${a.id}`)}>
                    <td>{a.date||'-'}</td><td>{a.name}</td>
                    <td>{a.distance_km?Math.round(a.distance_km*10)/10:'-'}</td>
                    <td>{formatDuration(a.duration_sec)}</td>
                    <td>{a.elevation_m?Math.round(a.elevation_m)+'m':'-'}</td>
                    <td>{a.avg_hr||'-'}</td>
                    <td>{a.avg_watts?Math.round(a.avg_watts)+'W':'-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'componenti' && (
        <div className="card">
          {components.length === 0 ? <div className="empty-state"><div className="empty-state-icon">🔧</div><div className="empty-state-text">Nessun componente</div></div> : (
            <table>
              <thead><tr><th>Componente</th><th>Categoria</th><th>Marca</th><th>Installato</th><th>KM inst.</th><th>KM max</th><th>Stato</th></tr></thead>
              <tbody>
                {components.map(c => {
                  const kmUsed = (bike.total_km||0) - (c.installed_km||0);
                  const pct = c.max_km ? Math.min(100, kmUsed/c.max_km*100) : null;
                  const color = pct===null?'var(--accent2)':pct>90?'var(--danger)':pct>70?'var(--warning)':'var(--success)';
                  return (
                    <tr key={c.id}>
                      <td>{c.name}</td><td>{c.category||'-'}</td><td>{c.brand||'-'}</td>
                      <td>{c.installed_date||'-'}</td><td>{c.installed_km||0}</td>
                      <td>{c.max_km||'-'}</td>
                      <td>
                        {c.retired ? <span className="badge badge-gray">Ritirato</span> : (
                          pct !== null ? (
                            <div style={{display:'flex',alignItems:'center',gap:8}}>
                              <div className="progress-bar" style={{flex:1}}>
                                <div className="progress-fill" style={{width:`${pct}%`,background:color}} />
                              </div>
                              <span style={{fontSize:11,color}}>{Math.round(pct)}%</span>
                            </div>
                          ) : <span className="badge badge-green">OK</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'consumabili' && (
        <div className="card">
          {consumables.length === 0 ? <div className="empty-state"><div className="empty-state-icon">🧴</div><div className="empty-state-text">Nessun consumabile</div></div> : (
            <table>
              <thead><tr><th>Nome</th><th>Categoria</th><th>Marca</th><th>Qty</th><th>Prezzo</th><th>Acquisto</th><th>Stato</th></tr></thead>
              <tbody>
                {consumables.map(c => (
                  <tr key={c.id}>
                    <td>{c.name}</td><td>{c.category||'-'}</td><td>{c.brand||'-'}</td>
                    <td>{c.quantity} {c.unit}</td><td>{c.price?`${c.price}`:'-'}</td>
                    <td>{c.purchase_date||'-'}</td>
                    <td>{c.used?<span className="badge badge-gray">Usato</span>:<span className="badge badge-green">Disponibile</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
