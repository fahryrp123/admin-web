/* ===== GUARD ===== */
if (!localStorage.getItem('smy_token')) window.location.href = '/login';

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
  document.getElementById('refresh-btn').onclick = refreshPage;
  document.getElementById('btn-logout').onclick = doLogout;
  document.getElementById('btn-logout-profile').onclick = doLogout;
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
  const loaders = { dashboard: loadDashboard, cars: loadCars, rentals: loadRentals, tracking: loadTracking, customers: loadCustomers };
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
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

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

async function loadDashboard() {
  const [carsRes, rentalsRes] = await Promise.all([
    Cars.list(),
    Rentals.listAll().catch(() => Rentals.list()),
  ]);

  const cars    = extractList(carsRes);
  const rentals = extractList(rentalsRes);

  const active    = cars.filter(c => carStatus(c) === 'rented').length;
  const avail     = cars.filter(c => carStatus(c) === 'available').length;
  const pending   = rentals.filter(r => (r.reservations_status || r.payment_status) === 'pending').length;
  const completed = rentals.filter(r => r.reservations_status === 'completed' || r.payment_status === 'paid').length;

  document.getElementById('stat-cars').textContent     = cars.length;
  document.getElementById('stat-active').textContent   = active;
  document.getElementById('stat-pending').textContent  = pending;
  document.getElementById('stat-rentals').textContent  = rentals.length;
  document.getElementById('stat-completed').textContent = completed;
  document.getElementById('stat-avail').textContent    = avail;

  const pendBadge = document.getElementById('pending-badge');
  if (pending > 0) { pendBadge.style.display=''; pendBadge.textContent = pending; }

  renderRecentRentals(rentals.slice(0,8), cars);
  renderCharts(rentals, cars);
}

function renderRecentRentals(list, cars) {
  const tbody = document.getElementById('recent-rentals-body');
  if (!list.length) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:24px;color:#94a3b8">Belum ada data reservasi</td></tr>'; return; }
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
      <td>${formatDate(r.start_date)}</td>
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
