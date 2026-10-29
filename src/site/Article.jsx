import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, hindiDate, youtubeId } from '../api.js';
import { SideCard } from './Cards.jsx';

function Video({ url, vertical }) {
  const yt = youtubeId(url);
  if (yt) return <div className={'video' + (vertical ? ' vertical' : '')}><iframe src={`https://www.youtube.com/embed/${yt}`} allowFullScreen title="video" /></div>;
  return <video className={'video-file' + (vertical ? ' vertical' : '')} src={url} controls />;
}

export default function Article() {
  const { id } = useParams();
  const [a, setA] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    setA(null);
    api('/articles/' + id).then((d) => { setA(d); document.title = d.title; }).catch((e) => setErr(e.message));
  }, [id]);

  if (err) return <div className="container empty">{err}</div>;
  if (!a) return <div className="loading">लोड हो रहा है...</div>;

  const url = encodeURIComponent(location.href);
  const text = encodeURIComponent(a.title);

  return (
    <div className="container article-page">
      <article>
        <div className="crumbs"><Link to="/">होम</Link> › {a.categoryName}</div>
        <h1>{a.title}</h1>
        {a.summary && <p className="dek">{a.summary}</p>}
        <div className="meta big">
          {a.author && <span>✍️ {a.author}</span>}
          <span>📅 {hindiDate(a.date)}</span>
          <span>👁 {a.views}</span>
        </div>
        <div className="share">
          <span>शेयर करें:</span>
          <a href={`https://wa.me/?text=${text}%20${url}`} target="_blank" rel="noreferrer" className="wa">WhatsApp</a>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${url}`} target="_blank" rel="noreferrer" className="fb">Facebook</a>
          <a href={`https://twitter.com/intent/tweet?text=${text}&url=${url}`} target="_blank" rel="noreferrer" className="tw">X</a>
          <button onClick={() => { navigator.clipboard.writeText(location.href); alert('लिंक कॉपी हो गया'); }}>🔗 लिंक</button>
        </div>
        {a.type !== 'article' && a.videoUrl ? <Video url={a.videoUrl} vertical={a.type === 'reel'} /> : a.image && <img className="hero" src={a.image} alt="" />}
        <div className="content" dangerouslySetInnerHTML={{ __html: a.content }} />
        {a.tags?.length > 0 && (
          <div className="tags">{a.tags.map((t) => <Link key={t} to={'/tag/' + encodeURIComponent(t)}>#{t}</Link>)}</div>
        )}
      </article>
      {a.related.length > 0 && (
        <aside>
          <div className="sec-head"><h2>संबंधित ख़बरें</h2></div>
          <div className="related">{a.related.map((r) => <SideCard key={r.id} a={r} />)}</div>
        </aside>
      )}
    </div>
  );
}
