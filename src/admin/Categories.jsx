import { useState } from 'react';
import { useCrud } from './useCrud.js';
import { Modal } from './ui.jsx';

const MENU = { main: 'Main menu', more: '"More" menu', none: 'Not in menu' };
const slugify = (s) => s.trim().toLowerCase().replace(/[\s_]+/g, '-').replace(/[^\p{L}\p{M}\p{N}-]/gu, '');

export default function Categories() {
  const { list, save, remove, move } = useCrud('categories');
  const [edit, setEdit] = useState(null);

  // show parents with their children right below
  const ordered = list.filter((c) => !c.parent).flatMap((p) => [p, ...list.filter((c) => c.parent === p.id)]);

  const submit = async (e) => {
    e.preventDefault();
    await save({ ...edit, slug: edit.slug || slugify(edit.name), parent: edit.parent ? +edit.parent : null, order: edit.order ?? list.length + 1 });
    setEdit(null);
  };

  return (
    <>
      <div className="a-head">
        <h1>Categories & Menu</h1>
        <button className="btn" onClick={() => setEdit({ name: '', slug: '', parent: '', menu: 'main' })}>➕ New Category</button>
      </div>
      <p className="hint">Categories created here appear in the website's top menu. Choosing a "Parent category" puts it in that dropdown.</p>
      <div className="card">
        <table className="tbl">
          <thead><tr><th>Order</th><th>Name</th><th>Link</th><th>Placement</th><th></th></tr></thead>
          <tbody>
            {ordered.map((c) => {
              const i = list.indexOf(c);
              return (
                <tr key={c.id}>
                  <td className="order"><button onClick={() => move(i, -1)}>↑</button><button onClick={() => move(i, 1)}>↓</button></td>
                  <td>{c.parent ? <span className="indent">↳ {c.name}</span> : <b>{c.name}</b>}</td>
                  <td><a href={'/category/' + c.slug} target="_blank">/category/{c.slug}</a></td>
                  <td>{c.parent ? 'In dropdown' : MENU[c.menu]}</td>
                  <td className="actions">
                    <button className="btn light" onClick={() => setEdit({ ...c, parent: c.parent || '' })}>✏️ Edit</button>
                    <button className="btn light danger" onClick={() => remove(c, c.name)}>🗑</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {edit && (
        <Modal title={edit.id ? 'Edit Category' : 'New Category'} onClose={() => setEdit(null)}>
          <form onSubmit={submit}>
            <div className="field"><label>Name *</label><input required value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} autoFocus /></div>
            <div className="field"><label>URL slug (English, optional)</label><input value={edit.slug} onChange={(e) => setEdit({ ...edit, slug: slugify(e.target.value) })} placeholder="e.g. kheti" /></div>
            <div className="field">
              <label>Parent category (for dropdown)</label>
              <select value={edit.parent} onChange={(e) => setEdit({ ...edit, parent: e.target.value })}>
                <option value="">— None (top level) —</option>
                {list.filter((c) => !c.parent && c.id !== edit.id).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {!edit.parent && (
              <div className="field">
                <label>Menu placement</label>
                <select value={edit.menu} onChange={(e) => setEdit({ ...edit, menu: e.target.value })}>
                  {Object.entries(MENU).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            )}
            <button className="btn">Save</button>
          </form>
        </Modal>
      )}
    </>
  );
}
