import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useCrud } from './useCrud.js';
import { Modal } from './ui.jsx';

const TYPES = { latest: 'Latest news (all)', category: 'News from a category', videos: 'Videos', reels: 'Reels', stories: 'Web Stories', banner: 'Banner' };
const STYLES = {
  lead3: 'Three columns (big story in middle)',
  cat3: '3 big stories + small list below',
  grid: 'Grid (4 columns)',
  carousel: 'Slider (with dots)',
  list: 'List (photo on left)',
};
const VIDEO_STYLES = { hero: 'Large video slider (top of page)', carousel: 'Slider (with dots)' };
const stylesFor = (type) => (type === 'videos' ? VIDEO_STYLES : ['latest', 'category'].includes(type) ? STYLES : null);

export default function Sections() {
  const { list, save, remove, move } = useCrud('sections');
  const [cats, setCats] = useState([]);
  const [banners, setBanners] = useState([]);
  const [edit, setEdit] = useState(null);
  useEffect(() => { api('/admin/categories').then(setCats); api('/admin/banners').then(setBanners); }, []);

  const label = (s) =>
    s.type === 'category' ? cats.find((c) => c.id === s.category)?.name
    : s.type === 'banner' ? banners.find((b) => b.id === s.bannerId)?.title : '';

  const submit = async (e) => {
    e.preventDefault();
    await save({ ...edit, category: edit.category ? +edit.category : null, bannerId: edit.bannerId ? +edit.bannerId : null, limit: +edit.limit, order: edit.order ?? list.length + 1 });
    setEdit(null);
  };
  const editStyles = edit && stylesFor(edit.type);

  return (
    <>
      <div className="a-head">
        <h1>Homepage Sections</h1>
        <button className="btn" onClick={() => setEdit({ title: '', type: 'category', style: 'cat3', category: '', bannerId: '', limit: 6, active: true })}>➕ New Section</button>
      </div>
      <p className="hint">Sections show on the homepage top to bottom in this order. Use ↑ ↓ to reorder.</p>
      <div className="card">
        <table className="tbl">
          <thead><tr><th>Order</th><th>Title</th><th>Content</th><th>Design</th><th>Count</th><th>Active</th><th></th></tr></thead>
          <tbody>
            {list.map((s, i) => (
              <tr key={s.id} className={s.active ? '' : 'off'}>
                <td className="order"><button onClick={() => move(i, -1)}>↑</button><button onClick={() => move(i, 1)}>↓</button></td>
                <td><b>{s.title || '—'}</b></td>
                <td>{TYPES[s.type]}{label(s) && `: ${label(s)}`}</td>
                <td>{stylesFor(s.type)?.[s.style] || '—'}</td>
                <td>{s.type === 'banner' ? '—' : s.limit}</td>
                <td><input type="checkbox" checked={s.active} onChange={(e) => save({ id: s.id, active: e.target.checked })} /></td>
                <td className="actions">
                  <button className="btn light" onClick={() => setEdit({ ...s, category: s.category || '', bannerId: s.bannerId || '' })}>✏️ Edit</button>
                  <button className="btn light danger" onClick={() => remove(s, s.title || TYPES[s.type])}>🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {edit && (
        <Modal title={edit.id ? 'Edit Section' : 'New Section'} onClose={() => setEdit(null)}>
          <form onSubmit={submit}>
            <div className="field"><label>Section title</label><input value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></div>
            <div className="field">
              <label>Content</label>
              <select value={edit.type} onChange={(e) => {
                const type = e.target.value;
                const st = stylesFor(type);
                setEdit({ ...edit, type, style: st && !st[edit.style] ? Object.keys(st)[0] : edit.style });
              }}>
                {Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            {edit.type === 'category' && (
              <div className="field">
                <label>Category</label>
                <select required value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })}>
                  <option value="">— Select —</option>
                  {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}
            {edit.type === 'banner' && (
              <div className="field">
                <label>Banner</label>
                <select required value={edit.bannerId} onChange={(e) => setEdit({ ...edit, bannerId: e.target.value })}>
                  <option value="">— Select —</option>
                  {banners.filter((b) => (b.position || 'home') === 'home').map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
                </select>
              </div>
            )}
            {editStyles && (
              <div className="field">
                <label>Design</label>
                <select value={edit.style} onChange={(e) => setEdit({ ...edit, style: e.target.value })}>
                  {Object.entries(editStyles).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            )}
            {edit.type !== 'banner' && (
              <div className="field"><label>Number of items</label><input type="number" min="1" max="30" value={edit.limit} onChange={(e) => setEdit({ ...edit, limit: e.target.value })} /></div>
            )}
            <button className="btn">Save</button>
          </form>
        </Modal>
      )}
    </>
  );
}
