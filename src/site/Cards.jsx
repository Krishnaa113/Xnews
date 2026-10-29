import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { shortDate } from '../api.js';

export const Meta = ({ a, noAuthor }) => (
  <div className="meta">
    <span>{shortDate(a.date)}</span>
    {!noAuthor && a.author && <span>By <b>{a.author}</b></span>}
  </div>
);

const Thumb = ({ a, ratio = 'wide' }) => (
  <div className={'thumb ' + ratio}>
    <img src={a.image} alt="" loading="lazy" />
    {a.type === 'video' && <span className="play">▶</span>}
  </div>
);

// subheading under headlines, clamped to 3 lines
const Sub = ({ a }) => (a.summary ? <p className="sub">{a.summary}</p> : null);

// left column of the 3-column block: image, category, one-line title
export const SmallCard = ({ a }) => (
  <Link to={'/news/' + a.id} className="small-card">
    <Thumb a={a} />
    <span className="cat">{a.categoryName}</span>
    <h3 className="clamp1">{a.title}</h3>
  </Link>
);

// big card: image, headline, 3-line subheading, date + author
export const BigCard = ({ a, large }) => (
  <Link to={'/news/' + a.id} className={'big-card' + (large ? ' large' : '')}>
    <Thumb a={a} ratio={large ? 'wide' : 'photo'} />
    {large && <Meta a={a} />}
    <h3 className="clamp2">{a.title}</h3>
    <Sub a={a} />
    {!large && <Meta a={a} />}
  </Link>
);

// right column: taller image, 2-line title, date + author
export const SideCard = ({ a }) => (
  <Link to={'/news/' + a.id} className="side-card">
    <Thumb a={a} ratio="tall" />
    <h3 className="clamp2">{a.title}</h3>
    <Meta a={a} />
  </Link>
);

// small row: thumbnail left, 2-line title, date
export const ThumbRow = ({ a }) => (
  <Link to={'/news/' + a.id} className="thumb-row">
    <Thumb a={a} ratio="photo" />
    <div>
      <h4 className="clamp2">{a.title}</h4>
      <Meta a={a} noAuthor />
    </div>
  </Link>
);

export const ListCard = ({ a }) => (
  <Link to={'/news/' + a.id} className="list-card">
    <Thumb a={a} />
    <div>
      <h3 className="clamp2">{a.title}</h3>
      <Sub a={a} />
      <Meta a={a} />
    </div>
  </Link>
);

export const ReelCard = ({ a }) => (
  <Link to={'/news/' + a.id} className="reel-card">
    <img src={a.image} alt="" loading="lazy" />
    <span className="reel-play">▶</span>
    <h4 className="clamp2">{a.title}</h4>
  </Link>
);

export const StoryCard = ({ s }) => (
  <Link to={'/web-stories/' + s.id} className="reel-card story">
    <img src={s.cover} alt="" loading="lazy" />
    <h4 className="clamp2">{s.title}</h4>
  </Link>
);

// 3 big cards on top, the rest as small rows in 3 columns
export function Cat3({ items }) {
  return (
    <>
      <div className="cat3-top">{items.slice(0, 3).map((a) => <BigCard key={a.id} a={a} />)}</div>
      {items.length > 3 && <div className="cat3-rows">{items.slice(3).map((a) => <ThumbRow key={a.id} a={a} />)}</div>}
    </>
  );
}

export function Dots({ n, active, onPick }) {
  if (n <= 1) return null;
  return (
    <div className="dots">
      {Array.from({ length: n }, (_, k) => <button key={k} className={k === active ? 'on' : ''} onClick={() => onPick(k)} aria-label={'पेज ' + (k + 1)} />)}
    </div>
  );
}

// horizontal scroller paged by dots, like the reels row
export function Slider({ children, className = '' }) {
  const ref = useRef();
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(0);
  useEffect(() => {
    const el = ref.current;
    const update = () => {
      setPages(Math.max(1, Math.ceil(el.scrollWidth / el.clientWidth - 0.01)));
      setPage(Math.round(el.scrollLeft / el.clientWidth));
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { el.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [children]);
  return (
    <div className={'slider ' + className}>
      <div className="slider-track" ref={ref}>{children}</div>
      <Dots n={pages} active={page} onPick={(p) => ref.current.scrollTo({ left: p * ref.current.clientWidth, behavior: 'smooth' })} />
    </div>
  );
}

export function Pager({ page, pages, onPage }) {
  if (pages <= 1) return null;
  return (
    <div className="pager">
      <button disabled={page <= 1} onClick={() => onPage(page - 1)}>‹ पिछला</button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <button key={p} className={p === page ? 'on' : ''} onClick={() => onPage(p)}>{p}</button>
      ))}
      <button disabled={page >= pages} onClick={() => onPage(page + 1)}>अगला ›</button>
    </div>
  );
}
