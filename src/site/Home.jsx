import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { SmallCard, BigCard, SideCard, ListCard, ReelCard, StoryCard, Cat3, Dots, Slider } from './Cards.jsx';

// big centre video with previous/next peeking at the sides
function HeroSlider({ items }) {
  const [i, setI] = useState(0);
  const n = items.length;
  useEffect(() => {
    const t = setTimeout(() => setI((i + 1) % n), 7000);
    return () => clearTimeout(t);
  }, [i, n]);
  const at = (k) => items[(k + n) % n];
  const cur = items[i];
  return (
    <section className="hero-slider">
      <div className={'hero-stage' + (n > 1 ? '' : ' single')}>
        {n > 1 && (
          <button className="hero-side" onClick={() => setI((i - 1 + n) % n)}>
            <img src={at(i - 1).image} alt="" /><span className="hero-arrow">‹</span>
          </button>
        )}
        <Link to={'/news/' + cur.id} className="hero-main">
          <img src={cur.image} alt="" />
          <span className="hero-play">▶</span>
          <span className="hero-cap">{cur.title}</span>
        </Link>
        {n > 1 && (
          <button className="hero-side" onClick={() => setI((i + 1) % n)}>
            <img src={at(i + 1).image} alt="" /><span className="hero-arrow">›</span>
          </button>
        )}
      </div>
      <Link to={'/news/' + cur.id} className="hero-title">{cur.title}</Link>
      <Dots n={n} active={i} onPick={setI} />
    </section>
  );
}

// left: small cards | centre: lead story | right: side cards
function Lead3({ items }) {
  const [main, ...rest] = items;
  return (
    <div className="lead3">
      <div className="lead3-col">{rest.slice(0, 3).map((a) => <SmallCard key={a.id} a={a} />)}</div>
      <div className="lead3-col center"><BigCard a={main} large /></div>
      <div className="lead3-col">{rest.slice(3, 6).map((a) => <SideCard key={a.id} a={a} />)}</div>
    </div>
  );
}

const moreLink = (s) => ({ category: '/category/' + s.slug, videos: '/videos', reels: '/reels', stories: '/web-stories' })[s.type];

function Section({ s }) {
  if (s.type === 'banner') {
    const b = s.items[0];
    return (
      <a className="banner" href={b.link || '#'} target={b.link?.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
        <img src={b.image} alt={b.title} />
      </a>
    );
  }
  if (s.type === 'videos' && s.style === 'hero') return <HeroSlider items={s.items} />;

  const head = s.title && (
    <div className="sec-head">
      <h2>{s.title}</h2>
      {moreLink(s) && <Link to={moreLink(s)}>सभी देखें ›</Link>}
    </div>
  );

  if (s.type === 'reels' || s.type === 'stories') {
    return (
      <section className="home-section grey-box">
        {head}
        <Slider className="reels">
          {s.type === 'reels' ? s.items.map((a) => <ReelCard key={a.id} a={a} />) : s.items.map((x) => <StoryCard key={x.id} s={x} />)}
        </Slider>
      </section>
    );
  }

  const body = {
    lead3: () => <Lead3 items={s.items} />,
    cat3: () => <Cat3 items={s.items} />,
    grid: () => <div className="grid4">{s.items.map((a) => <BigCard key={a.id} a={a} />)}</div>,
    carousel: () => <Slider className="cards">{s.items.map((a) => <BigCard key={a.id} a={a} />)}</Slider>,
    list: () => <div className="list">{s.items.map((a) => <ListCard key={a.id} a={a} />)}</div>,
  }[s.style] || (() => <Cat3 items={s.items} />);

  return (
    <section className="home-section">
      {head}
      {body()}
    </section>
  );
}

export default function Home() {
  const [sections, setSections] = useState(null);
  useEffect(() => { api('/home').then(setSections); }, []);
  if (!sections) return <div className="loading">लोड हो रहा है...</div>;
  if (!sections.length) return <div className="container empty">अभी कोई ख़बर नहीं है। एडमिन पैनल से ख़बरें जोड़ें।</div>;
  return <div className="container">{sections.map((s) => <Section key={s.id} s={s} />)}</div>;
}
