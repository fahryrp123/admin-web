/* ===== GUARD ===== */
(() => {
  const token = localStorage.getItem('smy_token');
  let isAdmin = false;
  try {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role === 'admin' || payload.role === 'Admin') {
        isAdmin = true;
      }
    }
  } catch(e) {}

  if (!token || !isAdmin) {
    localStorage.removeItem('smy_token');
    localStorage.removeItem('smy_user');
    document.cookie = "smy_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = '/login';
  }
})();

/* ===== STATE ===== */
let currentPage = 'dashboard';
const PER_PAGE = 10;
let carsPage = 1, rentalsPage = 1, customersPage = 1;
let rentalStatusFilter = '';
let leafletMap = null, carMarkers = [];

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
  setTopbarDate();
  loadSidebarUser();
  setupNav();
  setupSidebar();
  navigate('dashboard');
  document.getElementById('btn-logout').onclick = doLogout;
  document.getElementById('btn-logout-profile').onclick = doLogout;
  
  const profileForm = document.getElementById('profile-edit-form');
  if (profileForm) profileForm.onsubmit = handleProfileSave;
});

function setTopbarDate() {
  document.getElementById('topbar-date').textContent =
    new Date().toLocaleDateString('id-ID', { weekday:'long', day:'2-digit', month:'long', year:'numeric' });
}

function loadSidebarUser() {
  const u = JSON.parse(localStorage.getItem('smy_user') || '{}');
  const name = u.name || u.email || 'Admin';
  const phone = u.number_phone || u.phone || '-';
  document.getElementById('sidebar-uname').textContent = name;
  document.getElementById('sidebar-avatar').textContent = avatarLetter(name);
  document.getElementById('profile-avatar-big').textContent = avatarLetter(name);
  document.getElementById('profile-name').textContent = name;
  document.getElementById('pi-name').textContent = name;
  document.getElementById('profile-email').textContent = u.email || '-';
  document.getElementById('pi-email').textContent = u.email || '-';
  document.getElementById('pi-phone').textContent = phone;

  // Try to fetch fresh profile
  Auth.profile().then(r => {
    if (!r || !r.ok) return;
    const d = r.data?.data || r.data || {};
    if (!d.name) return;
    localStorage.setItem('smy_user', JSON.stringify(d));
    const n = d.name;
    document.getElementById('sidebar-uname').textContent = n;
    document.getElementById('sidebar-avatar').textContent = avatarLetter(n);
    document.getElementById('profile-avatar-big').textContent = avatarLetter(n);
    document.getElementById('profile-name').textContent = n;
    document.getElementById('pi-name').textContent = n;
    document.getElementById('pi-email').textContent = d.email || '-';
    document.getElementById('pi-phone').textContent = d.number_phone || d.phone || '-';
  }).catch(() => {});
}

async function doLogout() {
  await Auth.logout().catch(() => {});
  localStorage.removeItem('smy_token');
  localStorage.removeItem('smy_user');
  document.cookie = "smy_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  window.location.href = '/login';
}

/* ===== NAVIGATION ===== */
function setupNav() {
  document.querySelectorAll('.nav-item[data-page]').forEach(btn =>
    btn.addEventListener('click', () => navigate(btn.dataset.page)));
}

function navigate(page) {
  currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + page)?.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  document.getElementById('nav-' + page)?.classList.add('active');
  const titles = {
    dashboard:'Dashboard', cars:'Kelola Mobil',
    rentals:'Reservasi', tracking:'Tracking Kendaraan',
    customers:'Pelanggan', profile:'Profil Admin'
  };
  document.getElementById('topbar-title').textContent = titles[page] || page;
  closeSidebar();
  const loaders = { dashboard: loadDashboard, cars: loadCars, rentals: loadRentals, tracking: loadTracking, customers: loadCustomers, profile: loadProfile };
  if (loaders[page]) loaders[page]();
}

function refreshPage() { navigate(currentPage); }

/* ===== SIDEBAR ===== */
function setupSidebar() {
  document.getElementById('topbar-toggle').onclick = () => {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('sidebar-overlay').classList.add('open');
  };
  document.getElementById('sidebar-overlay').onclick = closeSidebar;
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('open');
}

/* ===== MODAL ===== */
function openModal(id) { 
  document.getElementById(id).classList.add('open'); 
  document.body.style.overflow = 'hidden';
}
function closeModal(id) { 
  document.getElementById(id).classList.remove('open'); 
  document.body.style.overflow = '';
}
function openImageModal(url) {
  document.getElementById('image-viewer-img').src = url;
  openModal('image-viewer-modal');
}
window.openModal = openModal;
window.closeModal = closeModal;
window.openImageModal = openImageModal;

/* ===== PAGINATION ===== */
function renderPagination(containerId, total, current, perPage, onChangeFn) {
  const pages = Math.ceil(total / perPage);
  const el = document.getElementById(containerId);
  if (!el || pages <= 1) { if(el) el.innerHTML = ''; return; }
  let html = `<span class="pagination-info">Total ${total} data</span>`;
  html += `<button class="page-btn" ${current===1?'disabled':''} onclick="${onChangeFn}(${current-1})"><i class="fas fa-chevron-left"></i></button>`;
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i-current) <= 1)
      html += `<button class="page-btn ${i===current?'active':''}" onclick="${onChangeFn}(${i})">${i}</button>`;
    else if (Math.abs(i-current) === 2)
      html += `<span style="padding:0 4px;color:#94a3b8">…</span>`;
  }
  html += `<button class="page-btn" ${current===pages?'disabled':''} onclick="${onChangeFn}(${current+1})"><i class="fas fa-chevron-right"></i></button>`;
  el.innerHTML = html;
}

/* ===== EXTRACT LIST HELPER ===== */
function extractList(res) {
  if (!res || !res.ok) return [];
  const d = res.data;
  // Handle paginated: { status, data: { data: [...] } }
  if (d?.data?.data && Array.isArray(d.data.data)) return d.data.data;
  // Handle { status, data: [...] }
  if (d?.data && Array.isArray(d.data)) return d.data;
  // Handle { data: [...] }
  if (Array.isArray(d?.data)) return d.data;
  // Handle direct array
  if (Array.isArray(d)) return d;
  return [];
}

/* ===== DASHBOARD ===== */
let chartTrend = null, chartFleet = null;

let dashboardLastHash = '';
let dashboardPollTimer = null;

async function loadDashboard(silent = false) {
  const carsRes = await Cars.listAll();
  let rentalsRes = await Rentals.listAll();
  if (!rentalsRes || !rentalsRes.ok) {
    rentalsRes = await Rentals.list();
  }
  const usersRes = await Users.list('per_page=1'); // Just to get the total length if possible, or all list

  const cars    = extractList(carsRes);
  const rentals = extractList(rentalsRes);
  const users   = extractList(usersRes);

  const newHash = JSON.stringify({ c: cars.length, r: rentals.length, rs: rentals.map(x=>x.status||x.reservations_status), cs: cars.map(x=>x.availability_status) });
  if (silent && newHash === dashboardLastHash) return;
  dashboardLastHash = newHash;

  const active    = cars.filter(c => carStatus(c) === 'rented').length;
  const avail     = cars.filter(c => carStatus(c) === 'available').length;
  const pending   = rentals.filter(r => {
    const s = r.reservations_status || r.payment_status || '';
    return s === 'pending' || s === 'Waiting_payment' || s === 'waiting_payment';
  }).length;
  const completed = rentals.filter(r => r.reservations_status === 'completed' || r.payment_status === 'paid').length;

  const animateValue = (id, start, end, duration) => {
    const obj = document.getElementById(id);
    if (!obj) return;
    if (silent) { obj.textContent = end; return; }
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutQuart
      const ease = 1 - Math.pow(1 - progress, 4);
      obj.innerHTML = Math.floor(ease * (end - start) + start);
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  };

  animateValue('stat-cars', 0, cars.length, 1200);
  animateValue('stat-active', 0, active, 1200);
  animateValue('stat-pending', 0, pending, 1200);
  animateValue('stat-rentals', 0, rentals.length, 1200);
  animateValue('stat-completed', 0, completed, 1200);
  animateValue('stat-avail', 0, avail, 1200);
  animateValue('stat-users', 0, users.length, 1200);

  // Make pending card clickable to jump to Rentals
  const pendCard = document.getElementById('stat-pending')?.closest('.stat-card');
  if (pendCard) {
    pendCard.style.cursor = 'pointer';
    pendCard.onclick = () => {
      navigate('rentals');
      setTimeout(() => {
        const filter = document.getElementById('rental-status-filter');
        if (filter) { filter.value = 'pending'; filter.dispatchEvent(new Event('change')); }
      }, 500);
    };
  }

  const pendBadge = document.getElementById('pending-badge');
  if (pendBadge && pending > 0) { pendBadge.style.display=''; pendBadge.textContent = pending; }

  renderRecentRentals(rentals.slice(0,8), cars);
  renderCharts(rentals, cars);
}

function renderRecentRentals(list, cars) {
  const tbody = document.getElementById('recent-rentals-body');
  if (!list.length) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:24px;color:#94a3b8">Belum ada data reservasi</td></tr>'; return; }
  tbody.innerHTML = list.map(r => {
    const car = r.car || cars.find(c => c.id === r.data_car_id) || {};
    const user = r.user || {};
    const userName = user.name || `Pengguna #${r.user_id}`;
    return `<tr>
      <td><div style="display:flex;align-items:center;gap:10px;">
        <div class="avatar">${avatarLetter(userName)}</div>
        <div style="font-weight:600;font-size:13px;">${userName}</div>
      </div></td>
      <td>${carDisplayName(car)}</td>
      <td>${formatDate(r.start_date, false)}</td>
      <td style="font-weight:700;color:#f97316;">${formatRp(r.total_price)}</td>
      <td>${statusBadge(r.reservations_status || r.payment_status || 'pending')}</td>
    </tr>`;
  }).join('');
}

function renderCharts(rentals, cars) {
  // Trend: count by day (last 7 days)
  const days = [], counts = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate()-i);
    days.push(d.toLocaleDateString('id-ID',{weekday:'short'}));
    counts.push(rentals.filter(r => {
      const rd = new Date(r.created_at || r.start_date || '');
      return rd.toDateString() === d.toDateString();
    }).length);
  }
  if (chartTrend) chartTrend.destroy();
  chartTrend = new Chart(document.getElementById('chart-trend'), {
    type: 'line',
    data: { labels: days, datasets: [{
      label: 'Reservasi', data: counts,
      borderColor:'#f97316', backgroundColor:'rgba(249,115,22,0.1)',
      tension: 0.4, fill: true, pointBackgroundColor:'#f97316', pointRadius: 5
    }]},
    options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true,ticks:{stepSize:1}}} }
  });

  // Fleet donut
  const avail = cars.filter(c=>carStatus(c)==='available').length;
  const rented = cars.filter(c=>carStatus(c)==='rented').length;
  const maint  = cars.filter(c=>carStatus(c)==='maintenance').length;
  if (chartFleet) chartFleet.destroy();
  chartFleet = new Chart(document.getElementById('chart-fleet'), {
    type: 'doughnut',
    data: {
      labels: ['Tersedia','Disewa','Servis'],
      datasets:[{ data:[avail,rented,maint], backgroundColor:['#22c55e','#f97316','#eab308'], borderWidth:0 }]
    },
    options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'bottom'}}, cutout:'65%' }
  });
}

window.navigate  = navigate;
window.openModal = openModal;
window.closeModal = closeModal;
window.renderPagination = renderPagination;
window.extractList = extractList;

function loadProfile() {
  const u = JSON.parse(localStorage.getItem('smy_user') || '{}');
  document.getElementById('profile-edit-name').value = u.name || '';
  document.getElementById('profile-edit-phone').value = u.number_phone || u.phone || '';
  document.getElementById('profile-edit-password').value = '';
}

async function handleProfileSave(e) {
  e.preventDefault();
  const name = document.getElementById('profile-edit-name').value.trim();
  const phone = document.getElementById('profile-edit-phone').value.trim();
  const password = document.getElementById('profile-edit-password').value;

  if (!name) {
    toast('Nama tidak boleh kosong!', 'error');
    return;
  }

  const fd = new FormData();
  fd.append('name', name);
  fd.append('number_phone', phone);
  fd.append('phone', phone);
  if (password) {
    if (password.length < 8) {
      toast('Kata sandi baru minimal 8 karakter!', 'error');
      return;
    }
    fd.append('password', password);
    fd.append('password_confirmation', password);
  }

  const btn = document.getElementById('profile-save-btn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Menyimpan...';

  const res = await Users.updateProfile(fd);
  btn.disabled = false;
  btn.innerHTML = '<i class="fas fa-save"></i> Simpan Perubahan';

  if (res && res.ok) {
    toast('Profil berhasil diperbarui!');
    await loadSidebarUser();
  } else {
    const errMsg = res?.data?.message || 'Gagal memperbarui profil.';
    toast(errMsg, 'error');
  }
}

window.loadProfile = loadProfile;
window.handleProfileSave = handleProfileSave;

// ===== REALTIME SILENT POLLING =====
function playNotifySound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch(e) {}
}

let lastKnownRentalIds = new Set();
let globalRentalsHash = '';
let isFirstSync = true;

async function globalRealtimeSync() {
  if (!getToken()) return;
  try {
    let res = await Rentals.listAll();
    if (!res || !res.ok) res = await Rentals.list();
    const list = extractList(res);
    if (!list.length) return;

    const currentIds = new Set(list.map(r => String(r.id)));
    if (isFirstSync) {
      lastKnownRentalIds = currentIds;
      isFirstSync = false;
    } else {
      let newCount = 0;
      for (const r of list) {
        if (!lastKnownRentalIds.has(String(r.id))) {
          newCount++;
          lastKnownRentalIds.add(String(r.id));
          const cName = r.user?.name || r.name || 'Pelanggan';
          toast(`Notifikasi: Reservasi Baru dari ${cName}! (#${r.id})`, 'info');
          playNotifySound();
        }
      }
    }

    const newHash = JSON.stringify(list.map(r => ({id: r.id, s: r.status, rs: r.reservations_status, ps: r.payment_status})));
    if (newHash !== globalRentalsHash) {
      globalRentalsHash = newHash;
      if (!isFirstSync) {
        if (currentPage === 'dashboard') loadDashboard(true);
        else if (currentPage === 'rentals') loadRentals(rentalsPage, true);
      }
    }
  } catch(e) {}
}

if (window.globalPollTimer) clearInterval(window.globalPollTimer);
window.globalPollTimer = setInterval(globalRealtimeSync, 10000);

