import { useState } from 'react';
import { useCrud } from './useCrud.js';
import { ImageField, Modal } from './ui.jsx';

const POS = { home: 'Homepage banner', left: 'Left side ad', right: 'Right side ad' };

export default function Banners() {
  const { list, save, remove } = useCrud('banners');
  const [edit, setEdit] = useState(null);
  const submit = async (e) => {
    e.preventDefault();
    if (!edit.image) return alert('Add a banner image');
    await save(edit);
    setEdit(null);
  };

  return (
    <>
      <div className="a-head">
        <h1>Banners / Ads</h1>
        <button className="btn" onClick={() => setEdit({ title: '', image: '', link: '', active: true, position: 'home' })}>➕ New Banner</button>
      </div>
      <p className="hint">
        <b>Homepage banner</b> (1200 × 250): after creating, add it under "Homepage Sections".<br />
        <b>Left / right side ads</b> (200 × 750): shown automatically on both sides on large screens.
      </p>
      {list.map((b) => (
        <div key={b.id} className={'card banner-item' + (b.active ? '' : ' off')}>
          <img src={b.image} alt="" />
          <div>
            <b>{b.title}</b> <span className="pill">{POS[b.position || 'home']}</span>
            <small>{b.link}</small>
            <div className="actions">
              <label className="check"><input type="checkbox" checked={b.active} onChange={(e) => save({ id: b.id, active: e.target.checked })} /> Active</label>
              <button className="btn light" onClick={() => setEdit(b)}>✏️ Edit</button>
              <button className="btn light danger" onClick={() => remove(b, b.title)}>🗑</button>
            </div>
          </div>
        </div>
      ))}
      {edit && (
        <Modal title={edit.id ? 'Edit Banner' : 'New Banner'} onClose={() => setEdit(null)}>
          <form onSubmit={submit}>
            <div className="field"><label>Name *</label><input required value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></div>
            <div className="field">
              <label>Placement</label>
              <select value={edit.position || 'home'} onChange={(e) => setEdit({ ...edit, position: e.target.value })}>
                {Object.entries(POS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <ImageField label="Banner Image *" value={edit.image} onChange={(v) => setEdit({ ...edit, image: v })} />
            <div className="field"><label>Link (where a click goes)</label><input value={edit.link} onChange={(e) => setEdit({ ...edit, link: e.target.value })} placeholder="https://..." /></div>
            <button className="btn">Save</button>
          </form>
        </Modal>
      )}
    </>
  );
}
