import express from 'express';
import multer from 'multer';
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { load, save, nextId, hashPassword, checkPassword } from './db.js';

const db = load();
const app = express();
const PORT = process.env.PORT || 3000;
const UPLOADS = path.resolve('data/uploads');
fs.mkdirSync(UPLOADS, { recursive: true });

app.use(express.json({ limit: '5mb' }));
app.use('/uploads', express.static(UPLOADS));

// ---------- helpers ----------
const published = () =>
  db.articles
    .filter((a) => a.status === 'published' && new Date(a.date) <= new Date())
    .sort((a, b) => new Date(b.date) - new Date(a.date));

const catWithChildren = (id) => [id, ...db.categories.filter((c) => c.parent === id).map((c) => c.id)];

const card = (a) => {
  const { content, ...rest } = a;
  return { ...rest, categoryName: db.categories.find((c) => c.id === a.category)?.name || '' };
};

function queryArticles({ category, type, q, tag, page = 1, limit = 12 }) {
  let list = published();
  if (category) {
    const cat = db.categories.find((c) => c.slug === category || String(c.id) === String(category));
    const ids = cat ? catWithChildren(cat.id) : [];
    list = list.filter((a) => ids.includes(a.category));
  }
  if (type) list = list.filter((a) => a.type === type);
  if (tag) list = list.filter((a) => a.tags?.includes(tag));
  if (q) {
    const s = q.toLowerCase();
    list = list.filter((a) => (a.title + ' ' + a.summary + ' ' + (a.tags || []).join(' ')).toLowerCase().includes(s));
  }
  page = +page; limit = +limit;
  return { total: list.length, page, pages: Math.ceil(list.length / limit), items: list.slice((page - 1) * limit, page * limit).map(card) };
}

// ---------- public API ----------
app.get('/api/site', (req, res) => {
  res.json({
    settings: db.settings,
    categories: [...db.categories].sort((a, b) => a.order - b.order),
    pages: db.pages.map(({ id, title, slug }) => ({ id, title, slug })),
    breaking: published().filter((a) => a.breaking).slice(0, 10).map(({ id, title }) => ({ id, title })),
    sideAds: db.banners.filter((b) => b.active && (b.position === 'left' || b.position === 'right')),
  });
});

app.get('/api/home', (req, res) => {
  const sections = db.sections
    .filter((s) => s.active)
    .sort((a, b) => a.order - b.order)
    .map((s) => {
      const limit = s.limit || 6;
      let items = [];
      if (s.type === 'latest') items = published().filter((a) => a.type === 'article').sort((a, b) => b.featured - a.featured).slice(0, limit).map(card);
      if (s.type === 'videos') items = published().filter((a) => a.type === 'video').slice(0, limit).map(card);
      if (s.type === 'reels') items = published().filter((a) => a.type === 'reel').slice(0, limit).map(card);
      if (s.type === 'category') items = queryArticles({ category: s.category, limit }).items;
      if (s.type === 'stories') items = db.stories.filter((x) => x.status === 'published').sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit);
      if (s.type === 'banner') items = db.banners.filter((b) => b.active && b.id === s.bannerId);
      const cat = db.categories.find((c) => c.id === s.category);
      return { ...s, slug: cat?.slug, items };
    })
    .filter((s) => s.items.length);
  res.json(sections);
});

app.get('/api/articles', (req, res) => res.json(queryArticles(req.query)));

app.get('/api/articles/:id', (req, res) => {
  const a = db.articles.find((x) => x.id === +req.params.id && x.status === 'published');
  if (!a) return res.status(404).json({ error: 'ख़बर नहीं मिली' });
  a.views = (a.views || 0) + 1;
  save();
  const related = published().filter((x) => x.category === a.category && x.id !== a.id).slice(0, 4).map(card);
  res.json({ ...card(a), content: a.content, related });
});

app.get('/api/stories', (req, res) => res.json(db.stories.filter((s) => s.status === 'published').sort((a, b) => new Date(b.date) - new Date(a.date))));
app.get('/api/stories/:id', (req, res) => {
  const s = db.stories.find((x) => x.id === +req.params.id);
  s ? res.json(s) : res.status(404).json({ error: 'नहीं मिला' });
});

app.get('/api/pages/:slug', (req, res) => {
  const p = db.pages.find((x) => x.slug === req.params.slug);
  p ? res.json(p) : res.status(404).json({ error: 'पेज नहीं मिला' });
});

// ---------- auth ----------
const tokens = new Set();
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username !== db.admin.username || !checkPassword(password || '', db.admin.password))
    return res.status(401).json({ error: 'Wrong username or password' });
  const t = crypto.randomBytes(24).toString('hex');
  tokens.add(t);
  res.json({ token: t });
});

const auth = (req, res, next) =>
  tokens.has((req.headers.authorization || '').replace('Bearer ', '')) ? next() : res.status(401).json({ error: 'Please log in' });

app.use('/api/admin', auth);

// ---------- admin API ----------
const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOADS,
    filename: (req, file, cb) => cb(null, Date.now() + '-' + crypto.randomBytes(4).toString('hex') + path.extname(file.originalname).toLowerCase()),
  }),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, /^(image|video)\//.test(file.mimetype)),
});
app.post('/api/admin/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Only photos/videos can be uploaded' });
  res.json({ url: '/uploads/' + req.file.filename });
});

app.get('/api/admin/stats', (req, res) => {
  res.json({
    articles: db.articles.filter((a) => a.type === 'article').length,
    videos: db.articles.filter((a) => a.type === 'video').length,
    reels: db.articles.filter((a) => a.type === 'reel').length,
    drafts: db.articles.filter((a) => a.status === 'draft').length,
    stories: db.stories.length,
    categories: db.categories.length,
    views: db.articles.reduce((s, a) => s + (a.views || 0), 0),
    top: [...db.articles].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5).map(({ id, title, views }) => ({ id, title, views })),
  });
});

app.put('/api/admin/settings', (req, res) => {
  db.settings = { ...db.settings, ...req.body };
  save();
  res.json(db.settings);
});

app.put('/api/admin/account', (req, res) => {
  const { username, oldPassword, newPassword } = req.body;
  if (!checkPassword(oldPassword || '', db.admin.password)) return res.status(400).json({ error: 'Current password is wrong' });
  if (username) db.admin.username = username;
  if (newPassword) {
    if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    db.admin.password = hashPassword(newPassword);
  }
  save();
  res.json({ ok: true });
});

// generic CRUD for every content type
const COLLECTIONS = ['articles', 'categories', 'stories', 'banners', 'sections', 'pages'];
app.param('col', (req, res, next, col) => (COLLECTIONS.includes(col) ? next() : res.status(404).json({ error: 'not found' })));

app.get('/api/admin/:col', (req, res) => res.json(db[req.params.col]));
app.get('/api/admin/:col/:id', (req, res) => {
  const item = db[req.params.col].find((x) => x.id === +req.params.id);
  item ? res.json(item) : res.status(404).json({ error: 'नहीं मिला' });
});
app.post('/api/admin/:col', (req, res) => {
  const list = db[req.params.col];
  const item = { ...req.body, id: nextId(list) };
  if (req.params.col === 'articles') item.views = 0;
  list.push(item);
  save();
  res.json(item);
});
app.put('/api/admin/:col/:id', (req, res) => {
  const list = db[req.params.col];
  const i = list.findIndex((x) => x.id === +req.params.id);
  if (i < 0) return res.status(404).json({ error: 'नहीं मिला' });
  list[i] = { ...list[i], ...req.body, id: list[i].id };
  save();
  res.json(list[i]);
});
app.delete('/api/admin/:col/:id', (req, res) => {
  const col = req.params.col;
  const id = +req.params.id;
  db[col] = db[col].filter((x) => x.id !== id);
  if (col === 'categories') db.categories.forEach((c) => c.parent === id && (c.parent = null));
  save();
  res.json({ ok: true });
});

// ---------- frontend ----------
const server = http.createServer(app);
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'));
  app.get('/{*any}', (req, res) => res.sendFile(path.resolve('dist/index.html')));
} else {
  const { createServer } = await import('vite');
  // hot-reload rides on the same port, so no extra 24678 port is needed
  const vite = await createServer({ server: { middlewareMode: true, hmr: { server } }, appType: 'spa' });
  app.use(vite.middlewares);
}

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') console.error(`\n  पोर्ट ${PORT} पहले से चल रहा है — वेबसाइट शायद पहले से खुली है: http://localhost:${PORT}\n`);
  else console.error(e);
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`\n  वेबसाइट:     http://localhost:${PORT}`);
  console.log(`  एडमिन पैनल:  http://localhost:${PORT}/admin  (admin / admin123)\n`);
});
