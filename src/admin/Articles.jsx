import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, enDate } from '../api.js';
import { toast } from './ui.jsx';

const TYPES = { article: 'Article', video: 'Video', reel: 'Reel' };

export default function Articles() {
  const [list, setList] = useState([]);
  const [cats, setCats] = useState([]);
  const [f, setF] = useState({ q: '', type: '', category: '', status: '' });

  const load = () => api('/admin/articles').then((l) => setList(l.sort((a, b) => new Date(b.date) - new Date(a.date))));
  useEffect(() => { load(); api('/admin/categories').then(setCats); }, []);

  const del = async (a) => {
    if (!confirm(`"${a.title}" — delete this?`)) return;
    await api('/admin/articles/' + a.id, { method: 'DELETE' });
    toast('Deleted');
    load();
  };
  const toggle = async (a, key, val) => { await api('/admin/articles/' + a.id, { method: 'PUT', body: { [key]: val } }); load(); };

  const shown = list.filter((a) =>
    (!f.q || a.title.includes(f.q)) && (!f.type || a.type === f.type) &&
    (!f.category || a.category === +f.category) && (!f.status || a.status === f.status));

  return (
    <>
      <div className="a-head">
        <h1>All Articles ({shown.length})</h1>
        <Link to="/admin/articles/new" className="btn">➕ New Article</Link>
      </div>
      <div className="filters">
        <input placeholder="Search by title..." value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} />
        <select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
          <option value="">All types</option>
          {Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
          <option value="">All categories</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>
          <option value="">All</option><option value="published">Published</option><option value="draft">Draft</option>
        </select>
      </div>
      <div className="card">
        <table className="tbl">
          <thead><tr><th></th><th>Title</th><th>Category</th><th>Type</th><th>Date</th><th>Status</th><th>Breaking</th><th></th></tr></thead>
          <tbody>
            {shown.map((a) => (
              <tr key={a.id}>
                <td>{a.image && <img className="mini" src={a.image} alt="" />}</td>
                <td><Link to={'/admin/articles/' + a.id}><b>{a.title}</b></Link>{a.featured && <span className="pill">Featured</span>}</td>
                <td>{cats.find((c) => c.id === a.category)?.name}</td>
                <td>{TYPES[a.type]}</td>
                <td>{enDate(a.date)}</td>
                <td>
                  <button className={'pill ' + (a.status === 'published' ? 'green' : 'gray')} onClick={() => toggle(a, 'status', a.status === 'published' ? 'draft' : 'published')}>
                    {a.status === 'published' ? 'Published' : 'Draft'}
                  </button>
                </td>
                <td><input type="checkbox" checked={!!a.breaking} onChange={(e) => toggle(a, 'breaking', e.target.checked)} /></td>
                <td className="actions">
                  <Link to={'/admin/articles/' + a.id} className="btn light">✏️ Edit</Link>
                  <a href={'/news/' + a.id} target="_blank" className="btn light">👁</a>
                  <button className="btn light danger" onClick={() => del(a)}>🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!shown.length && <p className="empty">No articles found</p>}
      </div>
    </>
  );
}
