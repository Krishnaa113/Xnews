import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, youtubeId } from '../api.js';
import { Editor, ImageField, toast } from './ui.jsx';

// datetime-local wants local time "YYYY-MM-DDTHH:mm"
const toLocal = (iso) => { const d = new Date(iso); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };

const EMPTY = { title: '', summary: '', content: '', image: '', category: '', type: 'article', videoUrl: '', author: '', tags: [], featured: false, breaking: false, status: 'published' };

export default function ArticleEdit() {
  const { id } = useParams();
  const isNew = id === 'new';
  const nav = useNavigate();
  const [a, setA] = useState(null);
  const [cats, setCats] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api('/admin/categories').then(setCats);
    if (isNew) setA({ ...EMPTY, date: new Date().toISOString() });
    else api('/admin/articles/' + id).then(setA);
  }, [id, isNew]);

  if (!a) return <p>Loading...</p>;
  const set = (k) => (e) => setA({ ...a, [k]: e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e });

  const save = async (status) => {
    if (!a.title.trim()) return alert('Enter a title');
    if (!a.category) return alert('Choose a category');
    if (a.type !== 'article' && !a.videoUrl) return alert('Add a video link or upload a video');
    let image = a.image;
    // auto thumbnail from YouTube if no photo given
    if (!image && youtubeId(a.videoUrl)) image = `https://img.youtube.com/vi/${youtubeId(a.videoUrl)}/hqdefault.jpg`;
    const body = { ...a, image, status, category: +a.category };
    setSaving(true);
    try {
      await api(isNew ? '/admin/articles' : '/admin/articles/' + id, { method: isNew ? 'POST' : 'PUT', body });
      toast(status === 'published' ? 'Article published ✔' : 'Draft saved ✔');
      nav('/admin/articles');
    } catch (e) { alert(e.message); }
    setSaving(false);
  };

  const parents = cats.filter((c) => !c.parent);

  return (
    <>
      <div className="a-head"><h1>{isNew ? 'Add New Article' : 'Edit Article'}</h1></div>
      <div className="edit-grid">
        <div className="card">
          <div className="field">
            <label>Title (Headline) *</label>
            <input className="title-input" value={a.title} onChange={set('title')} placeholder="Write the article title here" />
          </div>
          <div className="field">
            <label>Subheading</label>
            <textarea rows="3" value={a.summary} onChange={set('summary')} placeholder="Line shown under the headline — cards show at most 3 lines" />
            <small>{a.summary.length} characters • cards show the first 3 lines, the article page shows it all</small>
          </div>
          <div className="field">
            <label>Full Article</label>
            <Editor value={a.content} onChange={set('content')} />
          </div>
        </div>

        <div>
          <div className="card publish-box">
            <button className="btn big" disabled={saving} onClick={() => save('published')}>✔ Publish</button>
            <button className="btn light" disabled={saving} onClick={() => save('draft')}>Save as Draft</button>
            <button className="btn light" onClick={() => nav('/admin/articles')}>Cancel</button>
          </div>
          <div className="card">
            <div className="field">
              <label>Type</label>
              <div className="seg">
                {[['article', '📰 Article'], ['video', '🎬 Video'], ['reel', '📱 Reel']].map(([k, v]) => (
                  <button key={k} type="button" className={a.type === k ? 'on' : ''} onClick={() => setA({ ...a, type: k })}>{v}</button>
                ))}
              </div>
            </div>
            {a.type !== 'article' && (
              <>
                <div className="field">
                  <label>YouTube Link *</label>
                  <input value={a.videoUrl} onChange={set('videoUrl')} placeholder="https://youtube.com/watch?v=..." />
                </div>
                <ImageField label="Or upload a video file" accept="video/*" value={youtubeId(a.videoUrl) ? '' : a.videoUrl} onChange={set('videoUrl')} />
              </>
            )}
            <div className="field">
              <label>Category *</label>
              <select value={a.category} onChange={set('category')}>
                <option value="">— Select —</option>
                {parents.map((p) => [
                  <option key={p.id} value={p.id}>{p.name}</option>,
                  ...cats.filter((c) => c.parent === p.id).map((c) => <option key={c.id} value={c.id}>&nbsp;&nbsp;↳ {c.name}</option>),
                ])}
              </select>
            </div>
            <ImageField label={a.type === 'article' ? 'Main Photo' : 'Thumbnail (leave empty to use the YouTube one)'} value={a.image} onChange={set('image')} />
            <div className="field"><label>Author / Reporter</label><input value={a.author} onChange={set('author')} /></div>
            <div className="field">
              <label>Tags (comma separated)</label>
              <input value={(a.tags || []).join(', ')} onChange={(e) => setA({ ...a, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })} />
            </div>
            <div className="field">
              <label>Date & Time</label>
              <input type="datetime-local" value={toLocal(a.date)} onChange={(e) => setA({ ...a, date: new Date(e.target.value).toISOString() })} />
              <small>A future date publishes the article at that time</small>
            </div>
            <label className="check"><input type="checkbox" checked={a.featured} onChange={set('featured')} /> Featured (top of the homepage)</label>
            <label className="check"><input type="checkbox" checked={a.breaking} onChange={set('breaking')} /> Show in breaking news ticker</label>
          </div>
        </div>
      </div>
    </>
  );
}
