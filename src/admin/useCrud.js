import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { toast } from './ui.jsx';

// list + save + delete for one admin collection
export function useCrud(col, sort = (a, b) => (a.order ?? a.id) - (b.order ?? b.id)) {
  const [list, setList] = useState([]);
  const load = () => api('/admin/' + col).then((l) => setList([...l].sort(sort)));
  useEffect(() => { load(); }, [col]); // eslint-disable-line

  const save = async (item) => {
    const { id, ...body } = item;
    await api(id ? `/admin/${col}/${id}` : '/admin/' + col, { method: id ? 'PUT' : 'POST', body });
    toast('सेव हो गया ✔');
    load();
  };
  const remove = async (item, name) => {
    if (!confirm(`"${name}" हटाना है?`)) return;
    await api(`/admin/${col}/${item.id}`, { method: 'DELETE' });
    toast('हटा दिया गया');
    load();
  };
  // swap order with neighbour (for ↑ ↓ buttons)
  const move = async (i, dir) => {
    const a = list[i], b = list[i + dir];
    if (!b) return;
    await Promise.all([
      api(`/admin/${col}/${a.id}`, { method: 'PUT', body: { order: b.order } }),
      api(`/admin/${col}/${b.id}`, { method: 'PUT', body: { order: a.order } }),
    ]);
    load();
  };
  return { list, save, remove, move, load };
}
