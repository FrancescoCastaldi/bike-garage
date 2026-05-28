import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EMPTY_BIKE = { name:'', brand:'', model:'', year:'', color:'', description:'', image_path:'' };

export default function Bikes() {
  const [bikes, setBikes] = useState([]);
  const [bikeImages, setBikeImages] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_BIKE);
  const [editId, setEditId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { load(); }, []);

  async function load() {
    const b = await window.api.bikes.getAll();
    setBikes(b);
    const imgs = {};
    for (const bike of b) {
      if (bike.image_path) imgs[bike.id] = await window.api.fs.imageToBase64(bike.image_path);
    }
    setBikeImages(imgs);
  }

  function openAdd() { setForm(EMPTY_BIKE); setEditId(null); setShowModal(true); }
  function openEdit(bike, e) { e.stopPropagation(); setForm({...bike}); setEditId(bike.id); setShowModal(true); }

  async function handlePickImage() {
    const p = await window.api.dialog.openImage();
    if (p) setForm(f => ({...f, image_path: p}));
  }

  async function handleSave() {
    if (!form.name) return;
    if (editId) await window.api.bikes.update(editId, form);
    else await window.api.bikes.create(form);
    setShowModal(false);
    load();
  }

  async function handleDelete(id, e) {
    e.stopPropagation();
    if (!confirm('Eliminare questa bici?')) return;
    await window.api.bikes.delete(id);
    load();
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Le Mie Bici</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Aggiungi Bici</button>
      </div>

      {bikes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🚲</div>
          <div className="empty-state-text">Nessuna bici. Aggiungi la tua prima bici!</div>
        </div>
      ) : (
        <div className="grid-3">
          {bikes.map(bike => (
            <div key={bike.id} className="bike-card" onClick={() => navigate(`/bikes/${bike.id}`)}>
              <div className="bike-card-img">
                {bikeImages[bike.id]
                  ? <img src={bikeImages[bike.id]} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                  : <span>🚲</span>}
              </div>
              <div className="bike-card-body">
                <div className="bike-card-name">{bike.name}</div>
                <div className="bike-card-sub">{[bike.brand, bike.model, bike.year].filter(Boolean).join(' - ')}</div>
                <div className="bike-card-km">{Math.round(bike.total_km || 0)} km</div>
                <div style={{display:'flex', gap:8, marginTop:12}}>
                  <button className="btn btn-secondary btn-sm" onClick={e => openEdit(bike, e)}>Modifica</button>
                  <button className="btn btn-danger btn-sm" onClick={e => handleDelete(bike.id, e)}>Elimina</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editId ? 'Modifica Bici' : 'Nuova Bici'}</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>x</button>
            </div>
            <div className="form-group">
              <label className="form-label">Immagine</label>
              <div className="image-picker">
                <div className="image-preview" onClick={handlePickImage} style={{cursor:'pointer'}}>
                  {form.image_path
                    ? <img src={`data:image/jpeg;base64,placeholder`} style={{width:'100%',height:'100%',objectFit:'cover'}} id="preview-img" />
                    : <span>🚲</span>}
                </div>
                <button className="btn btn-secondary btn-sm" onClick={handlePickImage}>Scegli Foto</button>
                {form.image_path && <span style={{fontSize:11,color:'var(--text2)',wordBreak:'break-all'}}>{form.image_path.split(/[\\/]/).pop()}</span>}
              </div>
            </div>
            {[['name','Nome *'],['brand','Marca'],['model','Modello'],['year','Anno'],['color','Colore']].map(([k,l]) => (
              <div className="form-group" key={k}>
                <label className="form-label">{l}</label>
                <input className="form-control" value={form[k]||''} onChange={e => setForm(f=>({...f,[k]:e.target.value}))} />
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">Note</label>
              <textarea className="form-control" rows={3} value={form.description||''} onChange={e => setForm(f=>({...f,description:e.target.value}))} />
            </div>
            <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Annulla</button>
              <button className="btn btn-primary" onClick={handleSave}>Salva</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
