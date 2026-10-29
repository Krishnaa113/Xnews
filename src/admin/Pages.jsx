import { useState } from 'react';
import { useCrud } from './useCrud.js';
import { Editor, Modal } from './ui.jsx';

export default function Pages() {
  const { list, save, remove } = useCrud('pages');
  const [edit, setEdit] = useState(null);
  const submit = async (e) => {
    e.preventDefault();
    await save({ ...edit, slug: edit.slug || 'page-' + Date.now() });
    setEdit(null);
  };

  return (
    <>
      <div className="a-head">
        <h1>Pages</h1>
        <button className="btn" onClick={() => setEdit({ title: '', slug: '', content: '' })}>➕ New Page</button>
      </div>
      <p className="hint">These pages appear in the website footer — e.g. About Us, Privacy Policy.</p>
      <div className="card">
        <table className="tbl">
          <tbody>
            {list.map((p) => (
              <tr key={p.id}>
                <td><b>{p.title}</b></td>
                <td><a href={'/page/' + p.slug} target="_blank">/page/{p.slug}</a></td>
                <td className="actions">
                  <button className="btn light" onClick={() => setEdit(p)}>✏️ Edit</button>
                  <button className="btn light danger" onClick={() => remove(p, p.title)}>🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {edit && (
        <Modal title={edit.id ? 'Edit Page' : 'New Page'} onClose={() => setEdit(null)}>
          <form onSubmit={submit}>
            <div className="field"><label>Title *</label><input required value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></div>
            <div className="field"><label>URL slug (English)</label><input value={edit.slug} onChange={(e) => setEdit({ ...edit, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} placeholder="about" /></div>
            <div className="field"><label>Content</label><Editor value={edit.content} onChange={(v) => setEdit({ ...edit, content: v })} /></div>
            <button className="btn">Save</button>
          </form>
        </Modal>
      )}
    </>
  );
}
