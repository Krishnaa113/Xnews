const token = () => localStorage.getItem('adminToken');

export async function api(url, { method = 'GET', body } = {}) {
  const res = await fetch('/api' + url, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token() },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && url.startsWith('/admin')) {
    localStorage.removeItem('adminToken');
    location.href = '/admin/login';
  }
  if (!res.ok) throw new Error(data.error || 'कुछ गड़बड़ हुई');
  return data;
}

export async function uploadFile(file) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/admin/upload', { method: 'POST', headers: { Authorization: 'Bearer ' + token() }, body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'अपलोड नहीं हुआ');
  return data.url;
}

export function hindiDate(iso) {
  return new Date(iso).toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function shortDate(iso) {
  return new Date(iso).toLocaleDateString('hi-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function timeAgo(iso) {
  const m = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (m < 60) return `${Math.max(m, 1)} मिनट पहले`;
  if (m < 1440) return `${Math.floor(m / 60)} घंटे पहले`;
  if (m < 10080) return `${Math.floor(m / 1440)} दिन पहले`;
  return hindiDate(iso);
}

export function youtubeId(url = '') {
  const m = url.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/);
  return m ? m[1] : null;
}

export function enDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
