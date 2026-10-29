import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api.js';

export default function Page() {
  const { slug } = useParams();
  const [p, setP] = useState(null);
  useEffect(() => { api('/pages/' + slug).then(setP).catch(() => setP({ title: 'पेज नहीं मिला', content: '' })); }, [slug]);
  if (!p) return <div className="loading">लोड हो रहा है...</div>;
  return (
    <div className="container static-page">
      <h1>{p.title}</h1>
      <div className="content" dangerouslySetInnerHTML={{ __html: p.content }} />
    </div>
  );
}
