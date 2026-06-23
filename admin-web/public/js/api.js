/* ===== API MODULE ===== */
const API_BASE = 'https://sewamobilyuk-api.exponic.site/api';
const IMG_BASE = 'https://sewamobilyuk-api.exponic.site/storage/';

function getToken() { return localStorage.getItem('smy_token'); }

function authHeaders(isForm = false) {
  const h = { 'Accept': 'application/json' };
  if (getToken()) h['Authorization'] = 'Bearer ' + getToken();
  if (!isForm) h['Content-Type'] = 'application/json';
  return h;
}

async function apiFetch(path, options = {}) {
  const url = API_BASE + path;
  const isForm = options.isForm;
  delete options.isForm;
  try {
    const res = await fetch(url, { headers: authHeaders(isForm), ...options });
    if (res.status === 401) {
      localStorage.removeItem('smy_token');
      localStorage.removeItem('smy_user');
      document.cookie = "smy_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.href = '/login';
      return;
    }
    const text = await res.text();
    try {
      const parsed = JSON.parse(text);
      if (res.ok && parsed.status === 'error') {
        return { ok: false, status: res.status, data: parsed };
      }
      return { ok: res.ok, status: res.status, data: parsed };
    }
    catch { return { ok: res.ok, status: res.status, data: text }; }
  } catch (e) {
    return { ok: false, status: 0, data: { message: 'Gagal terhubung ke server.' } };
  }
}

/* ---- AUTH ---- */
const Auth = {
  login: (login, password) =>
    apiFetch('/login', { method: 'POST', body: JSON.stringify({ login, password }) }),
  logout: () => apiFetch('/logout', { method: 'POST' }),
  profile: () => apiFetch('/showProfile'),
};

/* ---- CARS  ----
   GET    /show             → list all cars
   GET    /show/{id}        → car detail
   POST   /add-car          → create (multipart)
   POST   /updateCar/{id}    → update (multipart)
   DELETE /deleteCar/{id}   → delete
*/
const Cars = {
  list: (p = 1) => apiFetch('/show?page=' + p),
  listAll: async () => {
    let all = [], cp = 1;
    while (true) {
      const r = await apiFetch('/show?page=' + cp);
      let list = [];
      if (r.data?.data?.data && Array.isArray(r.data.data.data)) list = r.data.data.data;
      else if (Array.isArray(r.data?.data)) list = r.data.data;
      else if (Array.isArray(r.data)) list = r.data;

      if (!list.length) break;
      all = all.concat(list);

      const d = r.data?.data;
      if (d && d.last_page && cp >= d.last_page) break;
      if (!d || !d.last_page) break;
      cp++;
    }
    return { ok: true, data: all };
  },
  get: (id) => apiFetch('/show/' + id),
  create: (fd) => apiFetch('/add-car', { method: 'POST', body: fd, isForm: true }),
  update: (id, fd) => apiFetch('/updateCar/' + id + '?_method=PUT', { method: 'POST', body: fd, isForm: true }),
  delete: (id) => apiFetch('/deleteCar/' + id, { method: 'DELETE' }),
};

/* ---- BRANCHES ---- */
const Branches = {
  list: () => apiFetch('/branch')
};

/* ---- RESERVATIONS ----
   GET   /history-reservation        → list (customer own / admin all)
   GET   /all-reservation            → admin: all reservations (may exist)
   PATCH /cancel-reserv/{id}      → cancel
   PATCH /approve-refund/{id}        → approve refund
*/
const Rentals = {
  list: () => apiFetch('/history-reservation'),
  listAll: () => apiFetch('/reservations'),
  cancel: (id) => apiFetch('/cancel-reserv/' + id, { method: 'PATCH' }),
  approveRefund: (id) => apiFetch('/approve-refund/' + id, { method: 'PATCH', body: JSON.stringify({ id }) }),
  approve: (id) => apiFetch('/approve-reservasi/' + id, { method: 'PATCH', body: JSON.stringify({ id }) }),
  reject: (id, reason) => apiFetch('/rejected-reservation/' + id, { method: 'PATCH', body: JSON.stringify({ id, reason }) }),
  cashConfirm: (id, amount) => apiFetch('/cashConfirm/' + id, { method: 'PATCH', body: JSON.stringify({ amount }) }),
  startReserv: (id) => apiFetch('/startReserv/' + id, { method: 'PATCH' }),
  endReserv: (id) => {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000; // offset in milliseconds
    const localISOTime = (new Date(now - tzOffset)).toISOString().slice(0, 19).replace('T', ' ');
    return apiFetch('/confirmResevDone/' + id, {
      method: 'PATCH',
      body: JSON.stringify({ returned_at: localISOTime })
    });
  },
  detail: (id) => apiFetch('/reservation/' + id)
};

/* ---- USERS ----
   GET    /showProfile              → current user profile
   POST   /updateProfile            → update own profile
   DELETE /delete-account            → delete own account
   (no admin user list endpoint in docs – we'll use what's available)
*/
const Users = {
  list: () => apiFetch('/customer-profile'),
  get: (id) => apiFetch('/customer-profile'), // Admin API doesn't have a specific customer detail endpoint, falling back to list (or customer-profile handles it?)
  delete: (id) => apiFetch('/deleteAccount', { method: 'DELETE', body: JSON.stringify({ id }) }), // Mengirim ID di dalam body
  profile: () => apiFetch('/showProfile'),
  updateProfile: (fd) => apiFetch('/updateProfile', { method: 'POST', body: fd, isForm: true }),
};

/* ---- IMAGE URL ---- */
function imgUrl(path) {
  if (!path) return null;
  let finalPath = path;
  if (finalPath.includes('localhost') || finalPath.includes('127.0.0.1')) {
    finalPath = finalPath.replace(/http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, 'https://sewamobilyuk-api.exponic.site');
  }
  if (finalPath.startsWith('http')) return finalPath;
  return IMG_BASE + finalPath;
}

/* ---- TOAST ---- */
function toast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle', warning: 'fa-exclamation-triangle' };
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<i class="fas ${icons[type] || icons.info} toast-icon"></i><span class="toast-msg">${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => { el.classList.add('hide'); setTimeout(() => el.remove(), 300); }, 3200);
}

/* ---- FORMAT ---- */
function formatRp(n) {
  if (n == null || n === '') return '-';
  return 'Rp ' + Number(n).toLocaleString('id-ID');
}
function formatDate(d, useRelative = false) {
  if (!d) return '-';
  const dateObj = new Date(d);
  if (useRelative) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateObj);
    target.setHours(0, 0, 0, 0);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '<span style="color:#eab308;font-weight:700;">Hari Ini</span>';
    if (diffDays === 1) return '<span style="color:#3b82f6;font-weight:700;">Besok</span>';
    if (diffDays === -1) return '<span style="color:#ef4444;font-weight:700;">Kemarin</span>';
    if (diffDays > 1 && diffDays <= 7) return `<span style="font-weight:600;">${diffDays} Hari Lagi</span>`;
    if (diffDays < -1) return `<span style="color:#ef4444;font-weight:700;">Telat ${Math.abs(diffDays)} Hari</span>`;
  }
  return dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}
function formatDateTime(d) {
  if (!d) return '-';
  return new Date(d).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function ucFirst(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : '-'; }

window.statusBadge = function (r) {
  if (!r) return '-';

  if (typeof r === 'string') {
    const l = r.toLowerCase();
    if (l === 'pending_cash') return '<span class="badge-pill pill-warning">Menunggu Cash</span>';
    if (l.includes('waiting') || l.includes('pending')) return '<span class="badge-pill pill-warning">Menunggu</span>';
    if (l === 'approved') return '<span class="badge-pill pill-primary">Disetujui</span>';
    if (l === 'active' || l === 'ongoing') return '<span class="badge-pill pill-success">Sedang Jalan</span>';
    if (l === 'completed' || l === 'selesai') return '<span class="badge-pill pill-success">Selesai</span>';
    if (l === 'cancelled' || l === 'dibatalkan' || l === 'failed') return '<span class="badge-pill pill-danger">Dibatalkan</span>';
    return `<span class="badge-pill pill-secondary">${r.toUpperCase()}</span>`;
  }

  const st = (r.status || r.reservations_status || r.payment_status || 'pending').toLowerCase();
  const pm = (r.payment_method || (r.payment && r.payment.payment_method) || '').toLowerCase();

  const isCash = (pm === 'cash' || pm === 'tunai' || st === 'pending_cash');

  if (isCash && (st.includes('pending') || st.includes('waiting') || st === 'pending_cash')) {
    return '<span class="badge-pill pill-warning">Menunggu Cash</span>';
  }

  if (st.includes('waiting') || st.includes('pending')) return '<span class="badge-pill pill-warning">Menunggu</span>';
  if (st === 'approved' || st === 'confirmed' || st.includes('konfirmasi') || st.includes('disetujui') || st.includes('lunas') || st.includes('dibayar') || st === 'paid') return '<span class="badge-pill pill-primary">Dikonfirmasi</span>';
  if (st === 'active' || st === 'ongoing' || st === 'on-going' || st === 'sedang disewa' || st.includes('jalan')) return '<span class="badge-pill pill-success">Sedang Jalan</span>';
  if (st === 'completed' || st === 'selesai') return '<span class="badge-pill pill-success">Selesai</span>';
  if (st === 'cancelled' || st === 'dibatalkan' || st === 'failed') return '<span class="badge-pill pill-danger">Dibatalkan</span>';

  const rawStatus = r.status || r.reservations_status || r.payment_status || 'UNKNOWN';
  return `<span class="badge-pill pill-secondary">${String(rawStatus).toUpperCase()}</span>`;
};

function avatarLetter(name) {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

/* ---- CONFIRM ---- */
function confirmAction(title, msg, onConfirm, danger = true) {
  const overlay = document.getElementById('confirm-overlay');
  document.getElementById('confirm-icon').innerHTML = danger ? '<i class="fas fa-exclamation-triangle" style="color: #ef4444;"></i>' : '<i class="fas fa-info-circle" style="color: #3b82f6;"></i>';
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-msg').textContent = msg;
  const okBtn = document.getElementById('confirm-ok');
  okBtn.className = 'btn ' + (danger ? 'btn-danger' : 'btn-primary');
  okBtn.textContent = 'Ya, Lanjutkan';
  overlay.classList.add('open');
  okBtn.onclick = () => { overlay.classList.remove('open'); onConfirm(); };
}

/* ---- CAR FIELD HELPERS ---- */
// Map API car object to display-friendly keys
function carDisplayName(c) { return c.name_car || c.name || '-'; }
function carPlate(c) { return c.plate_number || c.plat || '-'; }
function carStatus(c) {
  const rawStatus = (c.availability_status || c.status || 'available').toLowerCase();
  
  if (rawStatus.includes('maintenance')) return 'maintenance';
  if (rawStatus.includes('pending_cash')) return 'pending_cash';
  if (rawStatus.includes('waiting') || rawStatus.includes('pending')) return 'pending';
  if (rawStatus === 'approved' || rawStatus === 'confirmed' || rawStatus.includes('konfirmasi') || rawStatus.includes('disetujui')) return 'approved';
  
  // Treat booked as rented to map to existing UI styles if needed, otherwise return exactly what database says
  if (rawStatus === 'rented' || rawStatus === 'booked' || rawStatus === 'unavailable') return 'rented';
  
  return rawStatus === 'available' ? 'available' : rawStatus;
}
function carPrice(c) { return c.price || c.price_per_day || 0; }
function carYear(c) { return c.year_of_car || c.year || '-'; }
function carPassengers(c) { return c.passenger_capacity || c.seat_capacity || '-'; }
