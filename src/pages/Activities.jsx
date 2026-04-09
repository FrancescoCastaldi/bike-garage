import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseGPX } from '../utils/gpxParser';

const EMPTY = { bike_id:'', name:'', date:'', distance_km:'', duration_sec:'', elevation_m:'', avg_hr:'', max_hr:'', avg_watts:'', max_watts:'', avg_speed:'', max_speed:'', notes:'', gpx_data:'' };

export default function Activities() {
  const [items, setItems] = useState([]);
  const [bikes, setBikes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [filterBike, setFilterBike] = useState('');
  const [gpxParsed, setGpxParsed] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { load(); }, []);

  async function load() {
    const [a, b] = await Promise.all([window.api.activities.getAll(), window.api.bikes.getAll()]);
    setItems(a);
    setBikes(b);
  }

  function openAdd() { setForm({...EMPTY, date: new Date().toISOString().split('T')[0]}); setEditId(null); setGpxParsed(null); setShowModal(true); }
  function openEdit(item) { setForm({...item}); setEditId(item.id); setGpxParsed(null); setShowModal(true); }

  async function handleImportGPX() {
    const path = await window.api.dialog.openFile([{name:'GPX',extensions:['gpx']}]);
    if (!path) return;
    const xml = await window.api.fs.readFile(path);
    const parsed = parseGPX(xml);
    setGpxParsed(parsed);
    setForm(f => ({
      ...f,
      name: parsed.name || f.name,
      date: parsed.date || f.date,
      distance_km: parsed.distance_km ? Math.round(parsed.distance_km*100)/100 : f.distance_km,
      duration_sec: parsed.duration_sec || f.duration_sec,
      elevation_m: parsed.elevation_m ? Math.round(parsed.elevation_m) : f.elevation_m,
      avg_hr: parsed.avg_hr || f.avg_hr,
      max_hr: parsed.max_hr || f.max_hr,
      avg_watts: parsed.avg_watts || f.avg_watts,
      max_watts: parsed.max_watts || f.max_watts,
      avg_speed: parsed.avg_speed ? Math.round(parsed.avg_speed*10)/10 : f.avg_speed,
      max_speed: parsed.max_speed ? Math.round(parsed.max_speed*10)/10 : f.max_speed,
      gpx_data: xml
    }));
  }

  async function handleSave() {
    if (!form.name) return;
    const data = {
      ...form,
      bike_id: form.bike_id||null,
      distance_km: parseFloat(form.distance_km)||null,
      duration_sec: parseInt(form.duration_sec)||null,
      elevation_m: parseFloat(form.elevation_m)||null,
      avg_hr: parseInt(form.avg_hr)||null,
      max_hr: parseInt(form.max_hr)||null,
      avg_watts: parseFloat(form.avg_watts)||null,
      max_watts: parseFloat(form.max_watts)||null,
      avg_speed: parseFloat(form.avg_speed)||null,
      max_speed: parseFloat(form.max_speed)||null,
    };
    if (editId) await window.api.activities.update(editId, data);
    else {
      const newId = await window.api.activities.create(data);
      if (data.bike_id) await window.api.bikes.updateKm(data.bike_id);
    }
    setShowModal(false);
    load();
  }

  async function handleDelete(id) {
    if (!confirm('Eliminare attivita?')) return;
    await window.api.activities.delete(id);
    load();
  }

  function formatDuration(sec) {
    if (!sec) return '-';
    const h = Math.floor(sec/3600), m = Math.floor((sec%3600)/60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  const filtered = filterBike ? items.filter(i => String(i.bike_id) === filterBike) : items;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Attivita</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Nuova Attivita</button>
      </div>

      <div style={{marginBottom:16}}>
        <select className="form-control" style={{width:200}} value={filterBike} onChange={e=>setFilterBike(e.target.value)}>
          <option value="">Tutte le bici</option>
          {bikes.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">🗺️</div><div className="empty-state-text">Nessuna attivita</div></div>
        ) : (
          <table>
            <thead><tr><th>Data</th><th>Nome</th><th>Bici</th><th>KM</th><th>Durata</th><th>Dislivello</th><th>HR avg</th><th>Watt avg</th><th>Vel avg</th><th></th></tr></thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id} className="activity-row" onClick={()=>navigate(`/activities/${item.id}`)}>
                  <td>{item.date||'-'}</td>
                  <td>{item.name}</td>
                  <td>{item.bike_name||'-'}</td>
                  <td>{item.distance_km?Math.round(item.distance_km*10)/10:'-'}</td>
                  <td>{formatDuration(item.duration_sec)}</td>
                  <td>{item.elevation_m?Math.round(item.elevation_m)+'m':'-'}</td>
                  <td>{item.avg_hr?item.avg_hr+' bpm':'-'}</td>
                  <td>{item.avg_watts?Math.round(item.avg_watts)+'W':'-'}</td>
                  <td>{item.avg_speed?item.avg_speed+' km/h':'-'}</td>
                  <td onClick={e=>e.stopPropagation()} style={{display:'flex',gap:6}}>
                    <button className="btn btn-secondary btn-sm" onClick={()=>openEdit(item)}>Modifica</button>
                    <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(item.id)}>X</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editId?'Modifica Attivita':'Nuova Attivita'}</span>
              <button className="modal-close" onClick={()=>setShowModal(false)}>x</button>
            </div>

            <div className="form-group">
              <div className="gpx-parse-area" onClick={handleImportGPX}>
                <div style={{fontSize:24}}>🗺️</div>
                <div style={{marginTop:8,fontWeight:600}}>Importa file GPX</div>
                <div style={{color:'var(--text2)',fontSize:12,marginTop:4}}>Clicca per selezionare un file .gpx</div>
                {gpxParsed && <div style={{marginTop:8,color:'var(--success)',fontSize:12}}>GPX importato: {gpxParsed.pointsCount} punti, {Math.round((gpxParsed.distance_km||0)*10)/10} km</div>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Bici</label>
              <select className="form-control" value={form.bike_id||''} onChange={e=>setForm(f=>({...f,bike_id:e.target.value}))}>
                <option value="">Nessuna</option>
                {bikes.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Nome *</label>
              <input className="form-control" value={form.name||''} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Data</label>
              <input type="date" className="form-control" value={form.date||''} onChange={e=>setForm(f=>({...f,date:e.target.value}))} />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Distanza (km)</label>
                <input type="number" step="0.01" className="form-control" value={form.distance_km||''} onChange={e=>setForm(f=>({...f,distance_km:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Durata (secondi)</label>
                <input type="number" className="form-control" value={form.duration_sec||''} onChange={e=>setForm(f=>({...f,duration_sec:e.target.value}))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Dislivello (m)</label>
              <input type="number" className="form-control" value={form.elevation_m||''} onChange={e=>setForm(f=>({...f,elevation_m:e.target.value}))} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">FC media (bpm)</label>
                <input type="number" className="form-control" value={form.avg_hr||''} onChange={e=>setForm(f=>({...f,avg_hr:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">FC max (bpm)</label>
                <input type="number" className="form-control" value={form.max_hr||''} onChange={e=>setForm(f=>({...f,max_hr:e.target.value}))} />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Potenza media (W)</label>
                <input type="number" className="form-control" value={form.avg_watts||''} onChange={e=>setForm(f=>({...f,avg_watts:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Potenza max (W)</label>
                <input type="number" className="form-control" value={form.max_watts||''} onChange={e=>setForm(f=>({...f,max_watts:e.target.value}))} />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Velocita media (km/h)</label>
                <input type="number" step="0.1" className="form-control" value={form.avg_speed||''} onChange={e=>setForm(f=>({...f,avg_speed:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Velocita max (km/h)</label>
                <input type="number" step="0.1" className="form-control" value={form.max_speed||''} onChange={e=>setForm(f=>({...f,max_speed:e.target.value}))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Note</label>
              <textarea className="form-control" rows={2} value={form.notes||''} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} />
            </div>
            <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
              <button className="btn btn-secondary" onClick={()=>setShowModal(false)}>Annulla</button>
              <button className="btn btn-primary" onClick={handleSave}>Salva</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
