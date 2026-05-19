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
      window.location.href = '/login';
      return;
    }
    const text = await res.text();
    try { return { ok: res.ok, status: res.status, data: JSON.parse(text) }; }
    catch { return { ok: res.ok, status: res.status, data: text }; }
  } catch(e) {
    return { ok: false, status: 0, data: { message: 'Gagal terhubung ke server.' } };
  }
}

/* ---- AUTH ---- */
const Auth = {
  login: (login, password) =>
    apiFetch('/login', { method: 'POST', body: JSON.stringify({ login, password }) }),
  logout: () => apiFetch('/logout', { method: 'POST' }),
  profile: () => apiFetch('/show-profile'),
};

/* ---- CARS  ----
   GET    /show             → list all cars
   GET    /show/{id}        → car detail
   POST   /add-car          → create (multipart)
   POST   /edit-car/{id}    → update (multipart)
   DELETE /deleteCar/{id}   → delete
*/
const Cars = {
  list: () => apiFetch('/show'),
  get:  (id) => apiFetch('/show/' + id),
  create: (fd) => apiFetch('/add-car', { method: 'POST', body: fd, isForm: true }),
  update: (id, fd) => apiFetch('/edit-car/' + id, { method: 'POST', body: fd, isForm: true }),
  delete: (id) => apiFetch('/deleteCar/' + id, { method: 'DELETE' }),
};

/* ---- RESERVATIONS ----
   GET   /history-reservation        → list (customer own / admin all)
   GET   /all-reservation            → admin: all reservations (may exist)
   PATCH /cancel-reservasi/{id}      → cancel
   PATCH /approve-refund/{id}        → approve refund
*/
const Rentals = {
  list: () => apiFetch('/history-reservation'),
  listAll: () => apiFetch('/all-reservation'),
  cancel: (id) => apiFetch('/cancel-reservasi/' + id, { method: 'PATCH' }),
  approveRefund: (id) => apiFetch('/approve-refund/' + id, { method: 'PATCH' }),
  updateStatus: (id, status) =>
    apiFetch('/reservation/' + id + '/status', { method: 'PATCH', body: JSON.stringify({ status }) }),
};

/* ---- USERS ----
   GET    /show-profile              → current user profile
   POST   /update-profile            → update own profile
   DELETE /delete-account            → delete own account
   (no admin user list endpoint in docs – we'll use what's available)
*/
const Users = {
  profile: () => apiFetch('/show-profile'),
  updateProfile: (fd) => apiFetch('/update-profile', { method: 'POST', body: fd, isForm: true }),
};

/* ---- IMAGE URL ---- */
function imgUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return IMG_BASE + path;
}

/* ---- TOAST ---- */
function toast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const icons = { success:'fa-check-circle', error:'fa-times-circle', info:'fa-info-circle', warning:'fa-exclamation-triangle' };
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<i class="fas ${icons[type]||icons.info} toast-icon"></i><span class="toast-msg">${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => { el.classList.add('hide'); setTimeout(() => el.remove(), 300); }, 3200);
}

/* ---- FORMAT ---- */
function formatRp(n) {
  if (n == null || n === '') return '-';
  return 'Rp ' + Number(n).toLocaleString('id-ID');
}
function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' });
}
function formatDateTime(d) {
  if (!d) return '-';
  return new Date(d).toLocaleString('id-ID', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
}
function ucFirst(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : '-'; }

function statusBadge(status) {
  const map = {
    pending:    ['badge-warning',   'fa-clock',            'Menunggu'],
    confirmed:  ['badge-info',      'fa-check',            'Dikonfirmasi'],
    active:     ['badge-success',   'fa-car',              'Aktif'],
    completed:  ['badge-secondary', 'fa-flag-checkered',   'Selesai'],
    cancelled:  ['badge-danger',    'fa-times',            'Dibatalkan'],
    rejected:   ['badge-danger',    'fa-ban',              'Ditolak'],
    available:  ['badge-success',   'fa-check-circle',     'Tersedia'],
    rented:     ['badge-orange',    'fa-key',              'Disewa'],
    maintenance:['badge-warning',   'fa-wrench',           'Servis'],
    none:       ['badge-secondary', 'fa-minus-circle',     'Tidak Ada'],
    approved:   ['badge-success',   'fa-check-double',     'Disetujui'],
  };
  const [cls, icon, label] = map[status] || ['badge-secondary','fa-circle', ucFirst(status)];
  return `<span class="badge ${cls}"><i class="fas ${icon}"></i>${label}</span>`;
}

function avatarLetter(name) {
  if (!name) return '?';
  return name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
}

/* ---- CONFIRM ---- */
function confirmAction(title, msg, onConfirm, danger = true) {
  const overlay = document.getElementById('confirm-overlay');
  document.getElementById('confirm-icon').innerHTML  = danger ? '⚠️' : 'ℹ️';
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-msg').textContent   = msg;
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
function carStatus(c) { return c.availability_status || c.status || 'available'; }
function carPrice(c) { return c.price || c.price_per_day || 0; }
function carYear(c) { return c.year_of_car || c.year || '-'; }
function carPassengers(c) { return c.passenger_capacity || c.seat_capacity || '-'; }
