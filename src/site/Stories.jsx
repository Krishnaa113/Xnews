import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { StoryCard } from './Cards.jsx';

export function Stories() {
  const [list, setList] = useState(null);
  useEffect(() => { api('/stories').then(setList); }, []);
  if (!list) return <div className="loading">लोड हो रहा है...</div>;
  return (
    <div className="container listing">
      <div className="sec-head"><h2>वेब स्टोरीज़</h2></div>
      {list.length ? <div className="reel-grid">{list.map((s) => <StoryCard key={s.id} s={s} />)}</div> : <div className="empty">कोई स्टोरी नहीं</div>}
    </div>
  );
}

// full-screen story viewer with auto-advance
export function StoryView() {
  const { id } = useParams();
  const nav = useNavigate();
  const [s, setS] = useState(null);
  const [i, setI] = useState(0);

  useEffect(() => { api('/stories/' + id).then(setS).catch(() => nav('/web-stories')); }, [id, nav]);
  useEffect(() => {
    if (!s) return;
    const t = setTimeout(() => (i < s.slides.length - 1 ? setI(i + 1) : nav('/web-stories')), 5000);
    return () => clearTimeout(t);
  }, [s, i, nav]);

  if (!s) return <div className="story-view" />;
  const slide = s.slides[i] || {};
  return (
    <div className="story-view">
      <div className="story-frame">
        <div className="bars">{s.slides.map((_, k) => <span key={k} className={k < i ? 'done' : k === i ? 'run' : ''} />)}</div>
        <Link to="/web-stories" className="close">✕</Link>
        <img src={slide.image} alt="" />
        <div className="story-text"><h3>{s.title}</h3><p>{slide.text}</p></div>
        <button className="tap l" onClick={() => setI(Math.max(0, i - 1))} />
        <button className="tap r" onClick={() => (i < s.slides.length - 1 ? setI(i + 1) : nav('/web-stories'))} />
      </div>
    </div>
  );
}
