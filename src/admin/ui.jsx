import { useEffect, useRef, useState } from 'react';
import { uploadFile } from '../api.js';

export function ImageField({ label = 'Photo', value, onChange, accept = 'image/*' }) {
  const [busy, setBusy] = useState(false);
  const pick = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setBusy(true);
    try { onChange(await uploadFile(f)); } catch (err) { alert(err.message); }
    setBusy(false);
    e.target.value = '';
  };
  return (
    <div className="field">
      <label>{label}</label>
      <div className="img-field">
        {value && (accept.startsWith('video') ? <video src={value} /> : <img src={value} alt="" />)}
        <div>
          <label className="btn light">
            {busy ? 'Uploading...' : value ? 'Change' : '📷 Upload'}
            <input type="file" accept={accept} onChange={pick} hidden />
          </label>
          {value && <button type="button" className="btn light danger" onClick={() => onChange('')}>Delete</button>}
          <input className="small" placeholder="or paste a link (URL)" value={value || ''} onChange={(e) => onChange(e.target.value)} />
        </div>
      </div>
    </div>
  );
}

// minimal rich-text editor built on contentEditable
export function Editor({ value, onChange }) {
  const ref = useRef();
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) ref.current.innerHTML = value || '';
  }, [value]);

  const cmd = (c, arg) => {
    ref.current.focus();
    document.execCommand(c, false, arg);
    onChange(ref.current.innerHTML);
  };
  const addImage = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try { cmd('insertImage', await uploadFile(f)); } catch (err) { alert(err.message); }
    e.target.value = '';
  };
  const addLink = () => { const u = prompt('Enter link (URL):'); if (u) cmd('createLink', u); };
  const addYoutube = () => {
    const u = prompt('Enter YouTube video link:');
    const id = u?.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/)?.[1];
    if (id) cmd('insertHTML', `<div class="video"><iframe src="https://www.youtube.com/embed/${id}" allowfullscreen></iframe></div><p></p>`);
  };

  const B = ({ c, arg, children, title }) => (
    <button type="button" title={title} onMouseDown={(e) => { e.preventDefault(); cmd(c, arg); }}>{children}</button>
  );

  return (
    <div className="editor">
      <div className="toolbar">
        <B c="bold" title="Bold"><b>B</b></B>
        <B c="italic" title="Italic"><i>I</i></B>
        <B c="underline" title="Underline"><u>U</u></B>
        <B c="formatBlock" arg="H2" title="Large heading">H2</B>
        <B c="formatBlock" arg="H3" title="Small heading">H3</B>
        <B c="formatBlock" arg="P" title="Normal text">¶</B>
        <B c="formatBlock" arg="BLOCKQUOTE" title="Quote">❝</B>
        <B c="insertUnorderedList" title="Bullet list">• List</B>
        <B c="insertOrderedList" title="Numbered list">1. List</B>
        <button type="button" onClick={addLink}>🔗 Link</button>
        <label className="tb-btn">🖼 Photo<input type="file" accept="image/*" hidden onChange={addImage} /></label>
        <button type="button" onClick={addYoutube}>▶ YouTube</button>
        <B c="removeFormat" title="Clear formatting">✕</B>
      </div>
      <div ref={ref} className="editable content" contentEditable suppressContentEditableWarning onInput={() => onChange(ref.current.innerHTML)} />
    </div>
  );
}

export function Modal({ title, onClose, children }) {
  return (
    <div className="modal-bg" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head"><h3>{title}</h3><button onClick={onClose}>✕</button></div>
        {children}
      </div>
    </div>
  );
}

export const toast = (msg) => {
  const d = document.createElement('div');
  d.className = 'toast';
  d.textContent = msg;
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 2200);
};
