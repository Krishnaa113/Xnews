import { useState } from 'react';
import { enDate } from '../api.js';
import { useCrud } from './useCrud.js';
import { ImageField, Modal } from './ui.jsx';

export default function AdminStories() {
  const { list, save, remove } = useCrud('stories', (a, b) => new Date(b.date) - new Date(a.date));
  const [edit, setEdit] = useState(null);

  const setSlide = (i, k, v) => setEdit({ ...edit, slides: edit.slides.map((s, j) => (j === i ? { ...s, [k]: v } : s)) });
  const submit = async (e) => {
    e.preventDefault();
    const slides = edit.slides.filter((s) => s.image);
    if (!slides.length) return alert('Add a photo to at least one slide');
    await save({ ...edit, slides, cover: edit.cover || slides[0].image });
    setEdit(null);
  };

  return (
    <>
      <div className="a-head">
        <h1>Web Stories</h1>
        <button className="btn" onClick={() => setEdit({ title: '', cover: '', slides: [{ image: '', text: '' }], status: 'published', date: new Date().toISOString() })}>➕ New Story</button>
      </div>
      <div className="story-admin-grid">
        {list.map((s) => (
          <div key={s.id} className="card story-item">
            <img src={s.cover} alt="" />
            <b>{s.title}</b>
            <small>{s.slides.length} slides • {enDate(s.date)} • {s.status === 'published' ? 'Published' : 'Draft'}</small>
            <div className="actions">
              <button className="btn light" onClick={() => setEdit(s)}>✏️ Edit</button>
              <button className="btn light danger" onClick={() => remove(s, s.title)}>🗑</button>
            </div>
          </div>
        ))}
      </div>
      {edit && (
        <Modal title={edit.id ? 'Edit Story' : 'New Web Story'} onClose={() => setEdit(null)}>
          <form onSubmit={submit}>
            <div className="field"><label>Title *</label><input required value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></div>
            <ImageField label="Cover photo (leave empty to use the first slide)" value={edit.cover} onChange={(v) => setEdit({ ...edit, cover: v })} />
            <h4>Slides</h4>
            {edit.slides.map((s, i) => (
              <div key={i} className="slide-box">
                <div className="slide-head">Slide {i + 1}
                  {edit.slides.length > 1 && <button type="button" className="btn light danger" onClick={() => setEdit({ ...edit, slides: edit.slides.filter((_, j) => j !== i) })}>Delete</button>}
                </div>
                <ImageField value={s.image} onChange={(v) => setSlide(i, 'image', v)} />
                <div className="field"><label>Text</label><textarea rows="2" value={s.text} onChange={(e) => setSlide(i, 'text', e.target.value)} /></div>
              </div>
            ))}
            <button type="button" className="btn light" onClick={() => setEdit({ ...edit, slides: [...edit.slides, { image: '', text: '' }] })}>➕ Add Slide</button>
            <label className="check"><input type="checkbox" checked={edit.status === 'published'} onChange={(e) => setEdit({ ...edit, status: e.target.checked ? 'published' : 'draft' })} /> Publish</label>
            <button className="btn">Save</button>
          </form>
        </Modal>
      )}
    </>
  );
}
