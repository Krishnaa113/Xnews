import { useEffect, useState } from 'react';
import { Link, useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { BigCard, Cat3, ReelCard, Pager } from './Cards.jsx';

// one page for category / videos / reels / search / tag listings
export default function Listing({ kind }) {
  const { slug, tag } = useParams();
  const [sp] = useSearchParams();
  const q = sp.get('q') || '';
  const { categories } = useOutletContext();
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);

  const cat = categories.find((c) => c.slug === slug);
  const title = { category: cat?.name, video: 'वीडियो', reel: 'रील्स', search: `खोज: "${q}"`, tag: '#' + tag }[kind];
  const subs = cat ? categories.filter((c) => c.parent === cat.id) : [];

  useEffect(() => { setPage(1); }, [kind, slug, q, tag]);
  useEffect(() => {
    const p = new URLSearchParams({ page, limit: kind === 'reel' ? 20 : 12 });
    if (kind === 'category') p.set('category', slug);
    if (kind === 'video' || kind === 'reel') p.set('type', kind);
    if (kind === 'search') p.set('q', q);
    if (kind === 'tag') p.set('tag', tag);
    setData(null);
    api('/articles?' + p).then(setData);
    window.scrollTo(0, 0);
  }, [kind, slug, q, tag, page]);

  return (
    <div className="container listing">
      <div className="sec-head"><h2>{title}</h2></div>
      {subs.length > 0 && (
        <div className="chips">{subs.map((s) => <Link key={s.id} to={'/category/' + s.slug}>{s.name}</Link>)}</div>
      )}
      {!data ? <div className="loading">लोड हो रहा है...</div>
        : !data.items.length ? <div className="empty">कोई ख़बर नहीं मिली</div>
        : kind === 'reel' ? <div className="reel-grid">{data.items.map((a) => <ReelCard key={a.id} a={a} />)}</div>
        : kind === 'video' ? <div className="grid4">{data.items.map((a) => <BigCard key={a.id} a={a} />)}</div>
        : <Cat3 items={data.items} />}
      {data && <Pager page={data.page} pages={data.pages} onPage={setPage} />}
    </div>
  );
}
