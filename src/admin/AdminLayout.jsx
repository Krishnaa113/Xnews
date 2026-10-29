import { useState } from 'react';
import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';

const LINKS = [
  ['/admin', '📊 Dashboard', true],
  ['/admin/articles/new', '➕ Add New Article'],
  ['/admin/articles', '📰 All Articles / Videos'],
  ['/admin/categories', '🗂 Categories / Menu'],
  ['/admin/sections', '🏠 Homepage Sections'],
  ['/admin/stories', '📱 Web Stories'],
  ['/admin/banners', '🖼 Banners / Ads'],
  ['/admin/pages', '📄 Pages (About etc.)'],
  ['/admin/settings', '⚙️ Website Settings'],
];

export default function AdminLayout() {
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  if (!localStorage.getItem('adminToken')) return <Navigate to="/admin/login" />;
  const logout = () => { localStorage.removeItem('adminToken'); nav('/admin/login'); };

  return (
    <div className="admin">
      <aside className={open ? 'open' : ''} onClick={() => setOpen(false)}>
        <div className="a-brand">Admin Panel</div>
        {LINKS.map(([to, label, end]) => <NavLink key={to} to={to} end={end ?? to === '/admin/articles'}>{label}</NavLink>)}
        <a href="/" target="_blank">🌐 View Website</a>
        <button onClick={logout}>🚪 Log Out</button>
      </aside>
      <div className="a-main">
        <button className="a-burger" onClick={() => setOpen(!open)}>☰ Menu</button>
        <Outlet />
      </div>
    </div>
  );
}
