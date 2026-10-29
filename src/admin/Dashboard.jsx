import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

export default function Dashboard() {
  const [s, setS] = useState(null);
  useEffect(() => { api('/admin/stats').then(setS); }, []);
  if (!s) return <p>Loading...</p>;
  const tiles = [['Articles', s.articles], ['Videos', s.videos], ['Reels', s.reels], ['Drafts', s.drafts], ['Web Stories', s.stories], ['Categories', s.categories], ['Total Views', s.views]];
  return (
    <>
      <div className="a-head">
        <h1>Welcome 🙏</h1>
        <Link to="/admin/articles/new" className="btn big">➕ Add New Article</Link>
      </div>
      <div className="tiles">{tiles.map(([k, v]) => <div key={k} className="tile"><b>{v}</b><span>{k}</span></div>)}</div>
      <div className="card">
        <h3>Most Read Articles</h3>
        <table className="tbl">
          <tbody>{s.top.map((t) => <tr key={t.id}><td><Link to={'/admin/articles/' + t.id}>{t.title}</Link></td><td>{t.views} views</td></tr>)}</tbody>
        </table>
      </div>
      <div className="card help">
        <h3>How to use</h3>
        <ol>
          <li><b>Add New Article</b> — enter a title, photo and category, then press "Publish". For a video/reel, change the "Type" and add a YouTube link.</li>
          <li><b>Categories / Menu</b> — builds the menu at the top of the website.</li>
          <li><b>Homepage Sections</b> — choose which sections show on the homepage and in what order.</li>
          <li><b>Website Settings</b> — change the name, logo, address and social media links.</li>
        </ol>
      </div>
    </>
  );
}
