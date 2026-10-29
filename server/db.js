import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const DATA_DIR = path.resolve('data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export function hashPassword(pw, salt = crypto.randomBytes(8).toString('hex')) {
  return salt + ':' + crypto.scryptSync(pw, salt, 32).toString('hex');
}
export function checkPassword(pw, stored) {
  const [salt] = stored.split(':');
  return hashPassword(pw, salt) === stored;
}

const img = (seed) => `https://picsum.photos/seed/${seed}/800/450`;
const now = Date.now();
const day = 86400000;

function seed() {
  const categories = [
    ['आज कल', 'aaj-kal', null, 'main'],
    ['खेती-किसानी', 'kheti-kisani', null, 'main'],
    ['किसान कनेक्शन', 'kisan', 2, 'main'],
    ['पशुधन', 'pashudhan', 2, 'main'],
    ['मंडी भाव', 'mandi-bhav', 2, 'main'],
    ['बागवानी', 'bagwani', 2, 'main'],
    ['हाईटेक खेती', 'hitech-kheti', 2, 'main'],
    ['मछलीपालन', 'machhli-palan', 2, 'main'],
    ['हमारे हीरो', 'hamare-hero', null, 'main'],
    ['बात पते की', 'baat-pate-ki', null, 'main'],
    ['करियर', 'career', null, 'main'],
    ['स्कूल', 'school', 11, 'main'],
    ['शिक्षक', 'teacher', 11, 'main'],
    ['नौकरियाँ', 'jobs', 11, 'main'],
    ['रूरल टीवी', 'rural-tv', null, 'main'],
    ['राजनीति', 'rajniti', null, 'more'],
    ['लोक संगीत', 'lok-sangeet', null, 'more'],
    ['संवाद', 'samvad', null, 'more'],
    ['सेहत', 'sehat', null, 'more'],
    ['ग्राउंड रिपोर्ट', 'ground-report', null, 'more'],
    ['बजट 2026', 'budget-2026', null, 'more'],
  ].map(([name, slug, parent, menu], i) => ({ id: i + 1, name, slug, parent, menu, order: i + 1 }));

  const samples = [
    [2, 'article', 'धान की कटाई के बाद पराली से खाद बनाने का आसान तरीका', 'पराली जलाने की जगह किसान इसे खेत में ही सड़ाकर अच्छी जैविक खाद बना सकते हैं।'],
    [3, 'article', 'छोटे किसानों के लिए नई सिंचाई योजना, जानिए कैसे करें आवेदन', 'ड्रिप और स्प्रिंकलर सिंचाई पर सब्सिडी के लिए ऑनलाइन आवेदन शुरू हो गए हैं।'],
    [4, 'article', 'सर्दियों में पशुओं की देखभाल: इन बातों का रखें ध्यान', 'ठंड के मौसम में दुधारू पशुओं का दूध उत्पादन बनाए रखने के लिए सही आहार ज़रूरी है।'],
    [5, 'article', 'आज के मंडी भाव: गेहूं, सरसों और आलू के दाम', 'प्रमुख मंडियों में आज फसलों के भाव में हल्की तेज़ी देखी गई।'],
    [6, 'article', 'घर की छत पर सब्ज़ी उगाने के पाँच आसान तरीके', 'कम जगह में भी ताज़ी सब्ज़ियाँ उगाई जा सकती हैं, बस सही गमले और मिट्टी चाहिए।'],
    [7, 'article', 'ड्रोन से कीटनाशक छिड़काव: किसानों का समय और पैसा दोनों बचा', 'गाँवों में ड्रोन तकनीक तेज़ी से लोकप्रिय हो रही है।'],
    [9, 'article', 'गाँव की बेटी ने खोला सिलाई केंद्र, 50 महिलाओं को दिया रोज़गार', 'एक छोटी सी शुरुआत ने पूरे गाँव की तस्वीर बदल दी।'],
    [10, 'article', 'मिट्टी की जाँच क्यों है ज़रूरी? जानिए विशेषज्ञ की राय', 'मिट्टी की सेहत जाने बिना खाद डालना पैसे की बर्बादी हो सकता है।'],
    [12, 'article', 'सरकारी स्कूल के बच्चों ने बनाया सौर ऊर्जा से चलने वाला पंप', 'विज्ञान मेले में इन बच्चों के मॉडल को पहला स्थान मिला।'],
    [19, 'article', 'बदलते मौसम में बच्चों को सर्दी-खांसी से कैसे बचाएं', 'घरेलू नुस्खे और डॉक्टर की सलाह, दोनों जानिए।'],
    [1, 'article', 'ग्रामीण सड़कों के लिए नया बजट मंज़ूर, हज़ारों गाँवों को फ़ायदा', 'अगले दो साल में पक्की सड़कें बनाने का लक्ष्य रखा गया है।'],
    [20, 'article', 'ग्राउंड रिपोर्ट: बुंदेलखंड में पानी की कहानी', 'तालाबों को फिर से ज़िंदा करने की कोशिश में जुटे ग्रामीण।'],
    [15, 'video', 'वीडियो: जैविक खेती से दोगुनी कमाई करने वाले किसान की कहानी', 'देखिए कैसे एक किसान ने रासायनिक खाद छोड़कर अपनी आमदनी बढ़ाई।'],
    [15, 'video', 'वीडियो: गाँव का हाट बाज़ार, एक दिन की झलक', 'साप्ताहिक हाट की रौनक और कहानियाँ।'],
    [15, 'video', 'वीडियो: मधुमक्खी पालन कैसे शुरू करें', 'कम लागत में शुरू होने वाला मुनाफ़े का काम।'],
    [15, 'video', 'वीडियो: पुराने बीजों को बचाने की मुहिम', 'देसी बीज बैंक चलाने वाली महिलाओं से मिलिए।'],
    [15, 'reel', 'खेत में सुबह की शुरुआत', 'एक मिनट की झलक।'],
    [15, 'reel', 'मिट्टी के बर्तन बनाने की कला', 'कुम्हार के चाक की कहानी।'],
    [15, 'reel', 'गाँव का मेला', 'रंग, झूले और मिठाइयाँ।'],
    [15, 'reel', 'नदी किनारे शाम', 'सुकून के कुछ पल।'],
  ];
  const articles = samples.map(([category, type, title, summary], i) => ({
    id: i + 1,
    title,
    summary,
    content: `<p>${summary}</p><p>यह एक नमूना ख़बर है। एडमिन पैनल में जाकर आप इसे बदल सकते हैं या हटा सकते हैं और अपनी ख़बरें जोड़ सकते हैं।</p><h2>मुख्य बातें</h2><ul><li>पहली मुख्य बात</li><li>दूसरी मुख्य बात</li></ul>`,
    image: img('gaon' + (i + 1)),
    category,
    type,
    videoUrl: type === 'article' ? '' : 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    author: 'संवाददाता',
    tags: [],
    featured: i === 0,
    breaking: i < 3,
    status: 'published',
    date: new Date(now - i * day / 3).toISOString(),
    views: 0,
  }));

  const stories = [1, 2, 3, 4, 5].map((n) => ({
    id: n,
    title: ['सर्दियों की फसलें', 'देसी गाय की नस्लें', 'घर पर खाद बनाएं', 'गाँव के त्योहार', 'पानी बचाने के उपाय'][n - 1],
    cover: `https://picsum.photos/seed/story${n}/400/700`,
    slides: [1, 2, 3].map((s) => ({ image: `https://picsum.photos/seed/story${n}-${s}/400/700`, text: `स्लाइड ${s}: यहाँ कहानी का टेक्स्ट लिखें` })),
    status: 'published',
    date: new Date(now - n * day).toISOString(),
  }));

  const banners = [
    { id: 1, title: 'हमारे यूट्यूब चैनल से जुड़ें', image: 'https://picsum.photos/seed/banner1/1200/250', link: 'https://youtube.com', active: true },
    { id: 2, title: 'व्हाट्सऐप चैनल पर ख़बरें पाएं', image: 'https://picsum.photos/seed/banner2/1200/250', link: 'https://whatsapp.com', active: true },
  ];

  const sections = [
    { title: 'रूरल टीवी', type: 'videos', style: 'carousel', limit: 10 },
    { title: 'रील्स', type: 'reels', style: 'reels', limit: 10 },
    { title: 'ताज़ा ख़बरें', type: 'latest', style: 'lead', limit: 7 },
    { title: 'खेती-किसानी', type: 'category', category: 2, style: 'list', limit: 5 },
    { title: 'वेब स्टोरीज़', type: 'stories', style: 'stories', limit: 10 },
    { title: '', type: 'banner', bannerId: 1 },
    { title: 'पशुधन', type: 'category', category: 4, style: 'grid', limit: 4 },
    { title: 'हमारे हीरो', type: 'category', category: 9, style: 'grid', limit: 4 },
    { title: 'मंडी भाव', type: 'category', category: 5, style: 'grid', limit: 4 },
    { title: '', type: 'banner', bannerId: 2 },
    { title: 'सेहत', type: 'category', category: 19, style: 'list', limit: 4 },
    { title: 'बात पते की', type: 'category', category: 10, style: 'list', limit: 4 },
    { title: 'ग्राउंड रिपोर्ट', type: 'category', category: 20, style: 'carousel', limit: 8 },
  ].map((s, i) => ({ id: i + 1, active: true, order: i + 1, category: null, bannerId: null, limit: 6, ...s }));

  const pages = [
    ['हमारे बारे में', 'about'],
    ['प्राइवेसी पॉलिसी', 'privacy'],
    ['नियम और शर्तें', 'terms'],
    ['संपर्क करें', 'contact'],
  ].map(([title, slug], i) => ({ id: i + 1, title, slug, content: `<p>${title} — यह पेज एडमिन पैनल से बदला जा सकता है।</p>` }));

  return {
    settings: {
      siteName: 'गाँव की आवाज़',
      tagline: 'गाँव की ख़बरें, गाँव की ज़ुबानी',
      logo: '',
      email: 'contact@example.com',
      phone: '+91 00000 00000',
      address: 'लखनऊ, उत्तर प्रदेश',
      about: 'ग्रामीण भारत की ख़बरें, कहानियाँ और जानकारी।',
      copyright: '© 2026 गाँव की आवाज़। सर्वाधिकार सुरक्षित।',
      showTicker: true,
      social: { facebook: '#', instagram: '#', x: '#', youtube: '#', linkedin: '#', whatsapp: '#' },
    },
    admin: { username: 'admin', password: hashPassword('admin123') },
    categories, articles, stories, banners, sections, pages,
  };
}

let db;
export function load() {
  if (!fs.existsSync(DB_FILE)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    db = seed();
    save();
  } else {
    db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  }
  migrate();
  return db;
}

// upgrade older data files to the newer homepage layout
function migrate() {
  if ((db.version || 1) >= 2) return;
  for (const s of db.sections) {
    if (s.type === 'videos') s.style = 'hero';
    if (s.type === 'latest') { s.style = 'lead3'; s.limit = Math.max(s.limit, 7); }
    if (s.type === 'category' && s.style !== 'carousel') { s.style = 'cat3'; s.limit = Math.max(s.limit, 9); }
  }
  db.banners.forEach((b) => (b.position ||= 'home'));
  const id = nextId(db.banners);
  db.banners.push(
    { id, title: 'बायां साइड विज्ञापन', image: 'https://picsum.photos/seed/sideadl/200/750', link: '#', active: true, position: 'left' },
    { id: id + 1, title: 'दायां साइड विज्ञापन', image: 'https://picsum.photos/seed/sideadr/200/750', link: '#', active: true, position: 'right' },
  );
  db.version = 2;
  save();
}

export function save() {
  // write to temp then rename so a crash never leaves a half-written file
  fs.writeFileSync(DB_FILE + '.tmp', JSON.stringify(db, null, 2));
  fs.renameSync(DB_FILE + '.tmp', DB_FILE);
}

export const nextId = (list) => list.reduce((m, x) => Math.max(m, x.id), 0) + 1;
