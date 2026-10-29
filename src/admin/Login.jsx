import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';

export default function Login() {
  const nav = useNavigate();
  const [f, setF] = useState({ username: '', password: '' });
  const [err, setErr] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    try {
      const { token } = await api('/login', { method: 'POST', body: f });
      localStorage.setItem('adminToken', token);
      nav('/admin');
    } catch (e) { setErr(e.message); }
  };
  return (
    <div className="login-wrap">
      <form className="login" onSubmit={submit}>
        <h2>Admin Login</h2>
        {err && <div className="err">{err}</div>}
        <div className="field"><label>Username</label><input value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} autoFocus /></div>
        <div className="field"><label>Password</label><input type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></div>
        <button className="btn">Log In</button>
      </form>
    </div>
  );
}
