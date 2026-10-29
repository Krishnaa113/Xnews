import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { ImageField, toast } from './ui.jsx';

const SOCIAL = { facebook: 'Facebook', instagram: 'Instagram', x: 'X (Twitter)', youtube: 'YouTube', linkedin: 'LinkedIn', whatsapp: 'WhatsApp' };

export default function Settings() {
  const [s, setS] = useState(null);
  const [acc, setAcc] = useState({ username: '', oldPassword: '', newPassword: '' });
  useEffect(() => { api('/site').then((d) => setS(d.settings)); }, []);
  if (!s) return <p>Loading...</p>;

  const F = ({ k, label, area }) => (
    <div className="field">
      <label>{label}</label>
      {area ? <textarea rows="3" defaultValue={s[k]} onBlur={(e) => setS({ ...s, [k]: e.target.value })} />
        : <input defaultValue={s[k]} onBlur={(e) => setS({ ...s, [k]: e.target.value })} />}
    </div>
  );

  const saveSettings = async () => { await api('/admin/settings', { method: 'PUT', body: s }); toast('Settings saved ✔'); };
  const saveAccount = async (e) => {
    e.preventDefault();
    try {
      await api('/admin/account', { method: 'PUT', body: acc });
      toast('Account updated ✔');
      setAcc({ username: '', oldPassword: '', newPassword: '' });
    } catch (err) { alert(err.message); }
  };

  return (
    <>
      <div className="a-head"><h1>Website Settings</h1><button className="btn big" onClick={saveSettings}>✔ Save</button></div>
      <div className="edit-grid even">
        <div className="card">
          <h3>Site Info</h3>
          <F k="siteName" label="Website name" />
          <F k="tagline" label="Tagline" />
          <ImageField label="Logo" value={s.logo} onChange={(v) => setS({ ...s, logo: v })} />
          <F k="about" label="Footer about text" area />
          <F k="copyright" label="Copyright line" />
          <label className="check"><input type="checkbox" checked={s.showTicker} onChange={(e) => setS({ ...s, showTicker: e.target.checked })} /> Show breaking news ticker</label>
        </div>
        <div>
          <div className="card">
            <h3>Contact</h3>
            <F k="address" label="Address" />
            <F k="email" label="Email" />
            <F k="phone" label="Phone" />
          </div>
          <div className="card">
            <h3>Social Media Links</h3>
            <small>Leave empty to hide that icon</small>
            {Object.entries(SOCIAL).map(([k, label]) => (
              <div className="field" key={k}>
                <label>{label}</label>
                <input defaultValue={s.social?.[k]} onBlur={(e) => setS({ ...s, social: { ...s.social, [k]: e.target.value } })} placeholder="https://..." />
              </div>
            ))}
          </div>
        </div>
      </div>
      <form className="card" onSubmit={saveAccount} style={{ maxWidth: 480 }}>
        <h3>Change Admin Username / Password</h3>
        <div className="field"><label>New username (optional)</label><input value={acc.username} onChange={(e) => setAcc({ ...acc, username: e.target.value })} /></div>
        <div className="field"><label>Current password *</label><input type="password" required value={acc.oldPassword} onChange={(e) => setAcc({ ...acc, oldPassword: e.target.value })} /></div>
        <div className="field"><label>New password</label><input type="password" value={acc.newPassword} onChange={(e) => setAcc({ ...acc, newPassword: e.target.value })} /></div>
        <button className="btn">Update</button>
      </form>
    </>
  );
}
