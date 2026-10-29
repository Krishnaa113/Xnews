import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api.js';

const SOCIAL = { facebook: 'f', instagram: '◎', x: '𝕏', youtube: '▶', linkedin: 'in', whatsapp: '✆' };

const Social = ({ s, big }) => (
  <div className={'social' + (big ? ' big' : '')}>
    {Object.entries(s.social || {}).filter(([, v]) => v).map(([k, v]) => (
      <a key={k} href={v} target="_blank" rel="noreferrer" title={k}>{SOCIAL[k]}</a>
    ))}
  </div>
);

export default function Layout() {
  const [site, setSite] = useState(null);
  const [drawer, setDrawer] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [closedAds, setClosedAds] = useState([]);
  const [q, setQ] = useState('');
  const nav = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => { api('/site').then(setSite); }, []);
  useEffect(() => { setDrawer(false); setSearchOpen(false); window.scrollTo(0, 0); }, [pathname]);
  useEffect(() => { if (site) document.title = site.settings.siteName; }, [site]);

  if (!site) return <div className="loading">लोड हो रहा है...</div>;
  const { settings: s, categories, pages, breaking, sideAds = [] } = site;
  const top = (menu) => categories.filter((c) => !c.parent && c.menu === menu);
  const kids = (id) => categories.filter((c) => c.parent === id);
  const ads = sideAds.filter((b) => !closedAds.includes(b.id));

  const search = (e) => {
    e.preventDefault();
    if (q.trim()) nav('/search?q=' + encodeURIComponent(q.trim()));
  };

  return (
    <div className={sideAds.length ? 'with-ads' : ''}>
      <header className="logo-row">
        <Link to="/" className="brand">
          {s.logo ? <img src={s.logo} alt={s.siteName} /> : <strong>{s.siteName}</strong>}
          <small>{s.tagline}</small>
        </Link>
      </header>

      <nav className="main-nav">
        <ul>
          <li><button className="icon-btn" onClick={() => setDrawer(true)} aria-label="मेन्यू">☰</button></li>
          {top('main').map((c) => (
            <li key={c.id} className={kids(c.id).length ? 'has-sub' : ''}>
              <Link to={'/category/' + c.slug}>{c.name}</Link>
              {kids(c.id).length > 0 && (
                <ul className="sub">{kids(c.id).map((k) => <li key={k.id}><Link to={'/category/' + k.slug}>{k.name}</Link></li>)}</ul>
              )}
            </li>
          ))}
          {top('more').length > 0 && (
            <li className="has-sub">
              <a href="#" onClick={(e) => e.preventDefault()}>More</a>
              <ul className="sub right">
                {top('more').map((c) => <li key={c.id}><Link to={'/category/' + c.slug}>{c.name}</Link></li>)}
                <li><Link to="/web-stories">वेब स्टोरीज़</Link></li>
                <li><Link to="/reels">रील्स</Link></li>
              </ul>
            </li>
          )}
          <li><button className="icon-btn" onClick={() => setSearchOpen(!searchOpen)} aria-label="खोजें">🔍︎</button></li>
        </ul>
        {searchOpen && (
          <form className="search-bar" onSubmit={search}>
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="ख़बरें खोजें..." />
            <button>खोजें</button>
          </form>
        )}
      </nav>

      {s.showTicker && breaking.length > 0 && (
        <div className="ticker">
          <div className="container ticker-in">
            <span className="ticker-label">ब्रेकिंग</span>
            <div className="ticker-track">
              <div className="ticker-move">
                {[...breaking, ...breaking].map((b, i) => <Link key={i} to={'/news/' + b.id}>{b.title}</Link>)}
              </div>
            </div>
          </div>
        </div>
      )}

      {drawer && (
        <div className="drawer-bg" onClick={() => setDrawer(false)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <button className="drawer-close" onClick={() => setDrawer(false)}>✕</button>
            <Link to="/" className="drawer-home">होम</Link>
            {categories.filter((c) => !c.parent && c.menu !== 'none').map((c) => (
              <div key={c.id} className="drawer-group">
                <Link to={'/category/' + c.slug}>{c.name}</Link>
                {kids(c.id).map((k) => <Link key={k.id} className="kid" to={'/category/' + k.slug}>{k.name}</Link>)}
              </div>
            ))}
            <div className="drawer-group">
              <Link to="/videos">वीडियो</Link>
              <Link to="/reels">रील्स</Link>
              <Link to="/web-stories">वेब स्टोरीज़</Link>
            </div>
            <Social s={s} />
          </div>
        </div>
      )}

      {/* zero-height sticky rail: ads start under the nav and stay pinned below it */}
      <div className="ad-rail">
        {ads.map((b) => (
          <div key={b.id} className={'side-ad ' + b.position}>
            <button onClick={() => setClosedAds([...closedAds, b.id])} aria-label="बंद करें">×</button>
            <a href={b.link || '#'} target="_blank" rel="noreferrer"><img src={b.image} alt={b.title} /></a>
          </div>
        ))}
      </div>

      <main><Outlet context={site} /></main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <h3>{s.siteName}</h3>
            <p>{s.about}</p>
            <p>📍 {s.address}<br />✉️ <a href={'mailto:' + s.email}>{s.email}</a><br />📞 {s.phone}</p>
          </div>
          <div>
            <h4>सेक्शन</h4>
            <ul>{categories.filter((c) => c.menu !== 'none').slice(0, 12).map((c) => <li key={c.id}><Link to={'/category/' + c.slug}>{c.name}</Link></li>)}</ul>
          </div>
          <div>
            <h4>जानकारी</h4>
            <ul>{pages.map((p) => <li key={p.id}><Link to={'/page/' + p.slug}>{p.title}</Link></li>)}</ul>
            <Social s={s} big />
          </div>
        </div>
        <div className="copy">{s.copyright}</div>
      </footer>
    </div>
  );
}
