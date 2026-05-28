import React, { useEffect, useState } from 'react';

const CATS = ['Trasmissione','Freni','Ruote','Sella','Manubrio','Ammortizzatori','Elettronica','Altro'];
const EMPTY = { bike_id:'', name:'', brand:'', model:'', category:'', installed_date:'', installed_km:0, max_km:'', notes:'', retired:0 };

export default function Components() {
  const [items, setItems] = useState([]);
  const [bikes, setBikes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [filterBike, setFilterBike] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    const [c, b] = await Promise.all([window.api.components.getAll(), window.api.bikes.getAll()]);
    setItems(c);
    setBikes(b);
  }

  function openAdd() { setForm(EMPTY); setEditId(null); setShowModal(true); }
  function openEdit(item) { setForm({...item, retired: item.retired||0}); setEditId(item.id); setShowModal(true); }

  async function handleSave() {
    if (!form.name) return;
    const data = {...form, bike_id: form.bike_id||null, max_km: form.max_km||null, retired: form.retired?1:0};
    if (editId) await window.api.components.update(editId, data);
    else await window.api.components.create(data);
    setShowModal(false);
    load();
  }

  async function handleDelete(id) {
    if (!confirm('Eliminare?')) return;
    await window.api.components.delete(id);
    load();
  }

  const filtered = filterBike ? items.filter(i => String(i.bike_id) === filterBike) : items;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Componenti</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Aggiungi</button>
      </div>

      <div style={{marginBottom:16,display:'flex',gap:12}}>
        <select className="form-control" style={{width:200}} value={filterBike} onChange={e=>setFilterBike(e.target.value)}>
          <option value="">Tutte le bici</option>
          {bikes.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">🔧</div><div className="empty-state-text">Nessun componente</div></div>
        ) : (
          <table>
            <thead><tr><th>Nome</th><th>Bici</th><th>Categoria</th><th>Marca/Modello</th><th>Installato</th><th>KM inst.</th><th>KM max</th><th>Stato</th><th></th></tr></thead>
            <tbody>
              {filtered.map(item => {
                const bike = bikes.find(b => b.id === item.bike_id);
                const kmUsed = bike ? (bike.total_km||0) - (item.installed_km||0) : null;
                const pct = item.max_km && kmUsed !== null ? Math.min(100, kmUsed/item.max_km*100) : null;
                const color = pct===null?'var(--accent2)':pct>90?'var(--danger)':pct>70?'var(--warning)':'var(--success)';
                return (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.bike_name||'-'}</td>
                    <td>{item.category||'-'}</td>
                    <td>{[item.brand,item.model].filter(Boolean).join(' ')}</td>
                    <td>{item.installed_date||'-'}</td>
                    <td>{item.installed_km||0}</td>
                    <td>{item.max_km||'-'}</td>
                    <td>
                      {item.retired ? <span className="badge badge-gray">Ritirato</span> : (
                        pct !== null ? (
                          <div style={{display:'flex',alignItems:'center',gap:6}}>
                            <div className="progress-bar" style={{width:80}}>
                              <div className="progress-fill" style={{width:`${pct}%`,background:color}} />
                            </div>
                            <span style={{fontSize:11,color}}>{Math.round(pct)}%</span>
                          </div>
                        ) : <span className="badge badge-green">OK</span>
                      )}
                    </td>
                    <td style={{display:'flex',gap:6}}>
                      <button className="btn btn-secondary btn-sm" onClick={()=>openEdit(item)}>Modifica</button>
                      <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(item.id)}>X</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editId?'Modifica Componente':'Nuovo Componente'}</span>
              <button className="modal-close" onClick={()=>setShowModal(false)}>x</button>
            </div>
            <div className="form-group">
              <label className="form-label">Bici</label>
              <select className="form-control" value={form.bike_id||''} onChange={e=>setForm(f=>({...f,bike_id:e.target.value}))}>
                <option value="">Nessuna</option>
                {bikes.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            {[['name','Nome *'],['brand','Marca'],['model','Modello']].map(([k,l])=>(
              <div className="form-group" key={k}>
                <label className="form-label">{l}</label>
                <input className="form-control" value={form[k]||''} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} />
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">Categoria</label>
              <select className="form-control" value={form.category||''} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
                <option value="">Seleziona...</option>
                {CATS.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Data installazione</label>
                <input type="date" className="form-control" value={form.installed_date||''} onChange={e=>setForm(f=>({...f,installed_date:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">KM a installazione</label>
                <input type="number" className="form-control" value={form.installed_km||0} onChange={e=>setForm(f=>({...f,installed_km:e.target.value}))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">KM massimi (vita utile)</label>
              <input type="number" className="form-control" placeholder="es. 5000" value={form.max_km||''} onChange={e=>setForm(f=>({...f,max_km:e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Note</label>
              <textarea className="form-control" rows={2} value={form.notes||''} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} />
            </div>
            {editId && (
              <div className="form-group">
                <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}>
                  <input type="checkbox" checked={!!form.retired} onChange={e=>setForm(f=>({...f,retired:e.target.checked?1:0}))} />
                  Componente ritirato
                </label>
              </div>
            )}
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
