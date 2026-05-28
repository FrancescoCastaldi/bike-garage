import React, { useEffect, useState } from 'react';

const CATS = ['Lubrificanti','Pulizia','Pneumatici','Camere d aria','Pastiglia freni','Cavi','Altro'];
const EMPTY = { bike_id:'', name:'', category:'', brand:'', quantity:1, unit:'pz', purchase_date:'', price:'', notes:'', used:0 };

export default function Consumables() {
  const [items, setItems] = useState([]);
  const [bikes, setBikes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [filterBike, setFilterBike] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    const [c, b] = await Promise.all([window.api.consumables.getAll(), window.api.bikes.getAll()]);
    setItems(c);
    setBikes(b);
  }

  function openAdd() { setForm(EMPTY); setEditId(null); setShowModal(true); }
  function openEdit(item) { setForm({...item}); setEditId(item.id); setShowModal(true); }

  async function handleSave() {
    if (!form.name) return;
    const data = {...form, bike_id: form.bike_id||null, price: form.price||null, used: form.used?1:0};
    if (editId) await window.api.consumables.update(editId, data);
    else await window.api.consumables.create(data);
    setShowModal(false);
    load();
  }

  async function handleDelete(id) {
    if (!confirm('Eliminare?')) return;
    await window.api.consumables.delete(id);
    load();
  }

  async function toggleUsed(item) {
    await window.api.consumables.update(item.id, {...item, used: item.used ? 0 : 1});
    load();
  }

  const filtered = filterBike ? items.filter(i => String(i.bike_id) === filterBike) : items;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Consumabili</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Aggiungi</button>
      </div>

      <div style={{marginBottom:16}}>
        <select className="form-control" style={{width:200}} value={filterBike} onChange={e=>setFilterBike(e.target.value)}>
          <option value="">Tutte le bici</option>
          {bikes.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">🧴</div><div className="empty-state-text">Nessun consumabile</div></div>
        ) : (
          <table>
            <thead><tr><th>Nome</th><th>Bici</th><th>Categoria</th><th>Marca</th><th>Qty</th><th>Prezzo</th><th>Acquisto</th><th>Stato</th><th></th></tr></thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.bike_name||'-'}</td>
                  <td>{item.category||'-'}</td>
                  <td>{item.brand||'-'}</td>
                  <td>{item.quantity} {item.unit}</td>
                  <td>{item.price ? `${item.price}` : '-'}</td>
                  <td>{item.purchase_date||'-'}</td>
                  <td>
                    <button onClick={()=>toggleUsed(item)} className={`badge ${item.used?'badge-gray':'badge-green'}`} style={{border:'none',cursor:'pointer'}}>
                      {item.used?'Usato':'Disponibile'}
                    </button>
                  </td>
                  <td style={{display:'flex',gap:6}}>
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
              <span className="modal-title">{editId?'Modifica Consumabile':'Nuovo Consumabile'}</span>
              <button className="modal-close" onClick={()=>setShowModal(false)}>x</button>
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
              <label className="form-label">Categoria</label>
              <select className="form-control" value={form.category||''} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
                <option value="">Seleziona...</option>
                {CATS.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Marca</label>
              <input className="form-control" value={form.brand||''} onChange={e=>setForm(f=>({...f,brand:e.target.value}))} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Quantita</label>
                <input type="number" className="form-control" value={form.quantity||1} onChange={e=>setForm(f=>({...f,quantity:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Unita</label>
                <select className="form-control" value={form.unit||'pz'} onChange={e=>setForm(f=>({...f,unit:e.target.value}))}>
                  {['pz','ml','gr','m','L'].map(u=><option key={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Data acquisto</label>
                <input type="date" className="form-control" value={form.purchase_date||''} onChange={e=>setForm(f=>({...f,purchase_date:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Prezzo (EUR)</label>
                <input type="number" step="0.01" className="form-control" value={form.price||''} onChange={e=>setForm(f=>({...f,price:e.target.value}))} />
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
