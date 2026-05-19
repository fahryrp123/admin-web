/* ===== CUSTOMERS MODULE ===== */
let allCustomers = [];

async function loadCustomers(page = 1) {
  customersPage = page;
  document.getElementById('customers-loading').style.display = 'flex';
  const res = await Users.list('per_page=200');
  document.getElementById('customers-loading').style.display = 'none';
  allCustomers = extractList(res);
  setupCustomerFilters();
  renderCustomers();
}

function getFilteredCustomers() {
  const q = (document.getElementById('customer-search').value || '').toLowerCase();
  return allCustomers.filter(u => {
    const name = (u.name || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    return !q || name.includes(q) || email.includes(q);
  });
}

function renderCustomers() {
  const filtered = getFilteredCustomers();
  const start = (customersPage - 1) * PER_PAGE;
  const slice = filtered.slice(start, start + PER_PAGE);
  const tbody = document.getElementById('customers-body');
  if (!slice.length) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><i class="fas fa-users"></i><h3>Tidak ada pelanggan</h3><p>Belum ada data pengguna terdaftar.</p></div></td></tr>`;
    document.getElementById('customers-pagination').innerHTML = '';
    return;
  }
  tbody.innerHTML = slice.map(u => `<tr>
    <td><div style="display:flex;align-items:center;gap:12px;">
      <div class="avatar">${avatarLetter(u.name || 'U')}</div>
      <div>
        <div style="font-weight:600;font-size:13px;">${u.name || '-'}</div>
        <div style="font-size:11px;color:#94a3b8;">ID: ${u.id || ''}</div>
      </div>
    </div></td>
    <td style="font-size:13px;">${u.email || '-'}</td>
    <td style="font-size:13px;">${u.phone || u.no_hp || u.no_telp || '-'}</td>
    <td style="font-size:13px;">${formatDate(u.created_at)}</td>
    <td><span class="badge badge-orange">${u.rentals_count ?? '-'} sewa</span></td>
    <td>
      <div style="display:flex;gap:6px;">
        <button class="btn btn-secondary btn-icon btn-sm" title="Detail" onclick="viewCustomer(${u.id})"><i class="fas fa-eye"></i></button>
        <button class="btn btn-danger btn-icon btn-sm" title="Hapus" onclick="deleteCustomer(${u.id},'${(u.name||'').replace(/'/g,'\\\'')}}')"><i class="fas fa-trash"></i></button>
      </div>
    </td>
  </tr>`).join('');
  renderPagination('customers-pagination', filtered.length, customersPage, PER_PAGE, 'loadCustomers');
}

function setupCustomerFilters() {
  document.getElementById('customer-search').oninput = () => { customersPage = 1; renderCustomers(); };
}

window.viewCustomer = async function(id) {
  openModal('customer-modal-overlay');
  document.getElementById('customer-detail-body').innerHTML = '<div style="text-align:center;padding:40px;"><div class="spinner"></div></div>';
  const res = await Users.get(id);
  const u = res?.data?.data || res?.data || {};
  const rentals = u.rentals || [];
  document.getElementById('customer-detail-body').innerHTML = `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;">
      <div style="width:60px;height:60px;border-radius:16px;background:linear-gradient(135deg,#3b82f6,#2563eb);display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:22px;">${avatarLetter(u.name||'U')}</div>
      <div>
        <div style="font-size:17px;font-weight:700;">${u.name || '-'}</div>
        <div style="font-size:13px;color:#64748b;">${u.email || ''}</div>
        <div style="margin-top:4px;">${statusBadge('active')}</div>
      </div>
    </div>
    <div style="background:#f8fafc;border-radius:12px;padding:16px;margin-bottom:16px;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
        <div><div style="font-size:11px;color:#94a3b8;font-weight:600;">No. HP</div><div style="font-size:13px;font-weight:500;">${u.phone || u.no_hp || '-'}</div></div>
        <div><div style="font-size:11px;color:#94a3b8;font-weight:600;">Bergabung</div><div style="font-size:13px;font-weight:500;">${formatDate(u.created_at)}</div></div>
        <div><div style="font-size:11px;color:#94a3b8;font-weight:600;">Alamat</div><div style="font-size:13px;font-weight:500;">${u.address || u.alamat || '-'}</div></div>
        <div><div style="font-size:11px;color:#94a3b8;font-weight:600;">Total Sewa</div><div style="font-size:13px;font-weight:600;color:#f97316;">${rentals.length} kali</div></div>
      </div>
    </div>
    ${rentals.length ? `
    <div style="font-size:12px;font-weight:700;color:#64748b;margin-bottom:8px;">RIWAYAT SEWA</div>
    <div style="max-height:200px;overflow-y:auto;">
      ${rentals.slice(0,5).map(r => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:6px;">
          <div>
            <div style="font-size:13px;font-weight:600;">${r.car?.name || '-'}</div>
            <div style="font-size:11px;color:#94a3b8;">${formatDate(r.start_date)} – ${formatDate(r.end_date)}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:13px;font-weight:700;color:#f97316;">${formatRp(r.total_price)}</div>
            ${statusBadge(r.status)}
          </div>
        </div>`).join('')}
    </div>` : '<div style="text-align:center;color:#94a3b8;font-size:13px;padding:16px;">Belum ada riwayat sewa</div>'}
  `;
};

window.deleteCustomer = function(id, name) {
  confirmAction('Hapus Pelanggan', `Hapus akun "${name}" secara permanen?`, async () => {
    const res = await Users.delete(id);
    if (res?.ok) { toast('Pelanggan dihapus.'); loadCustomers(customersPage); }
    else toast(res?.data?.message || 'Gagal menghapus.', 'error');
  });
};

window.loadCustomers = loadCustomers;

/* ===== TRACKING MODULE ===== */
const CITIES = [
  { name: 'Jakarta Pusat', lat: -6.2088, lng: 106.8456 },
  { name: 'Jakarta Selatan', lat: -6.2615, lng: 106.8106 },
  { name: 'Bandung', lat: -6.9175, lng: 107.6191 },
  { name: 'Surabaya', lat: -7.2575, lng: 112.7521 },
  { name: 'Yogyakarta', lat: -7.7956, lng: 110.3695 },
];

function loadTracking() {
  if (!leafletMap) {
    leafletMap = L.map('map').setView([-6.2088, 106.8456], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(leafletMap);
  }
  refreshTracking();
  document.getElementById('btn-refresh-map').onclick = refreshTracking;
}

async function refreshTracking() {
  const res = await Cars.list('per_page=100');
  const cars = extractList(res);
  const activeCars = cars.filter(c => c.status === 'rented' || c.status === 'active');
  const allShown = cars.slice(0, 12);

  carMarkers.forEach(m => m.remove());
  carMarkers = [];

  const listEl = document.getElementById('tracking-list');
  if (!allShown.length) {
    listEl.innerHTML = '<div style="text-align:center;padding:20px;color:#94a3b8;font-size:13px;">Tidak ada kendaraan aktif.</div>';
    return;
  }

  listEl.innerHTML = '';
  allShown.forEach((c, i) => {
    const city = CITIES[i % CITIES.length];
    const jitter = (Math.random() - 0.5) * 0.08;
    const lat = city.lat + jitter;
    const lng = city.lng + jitter;
    const isActive = c.status === 'rented' || c.status === 'active';
    const color = isActive ? '#22c55e' : '#eab308';
    const icon = L.divIcon({
      html: `<div style="background:${color};color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.2);border:2px solid white;"><i class='fas fa-car'></i></div>`,
      className: '', iconSize: [32, 32], iconAnchor: [16, 16]
    });
    const marker = L.marker([lat, lng], { icon }).addTo(leafletMap);
    marker.bindPopup(`<div style="font-family:Inter,sans-serif;min-width:160px;">
      <div style="font-weight:700;font-size:14px;">${c.name || c.brand || '-'}</div>
      <div style="font-size:12px;color:#64748b;margin:4px 0;">${c.license_plate || c.plat || ''}</div>
      <div>${statusBadge(c.status)}</div>
      <div style="font-size:11px;color:#94a3b8;margin-top:6px;"><i class='fas fa-map-marker-alt'></i> ${city.name}</div>
    </div>`);
    carMarkers.push(marker);

    const item = document.createElement('div');
    item.style.cssText = 'display:flex;align-items:center;gap:10px;padding:10px;border:1px solid #e2e8f0;border-radius:10px;cursor:pointer;transition:background 0.2s;';
    item.onmouseover = () => item.style.background = '#f8fafc';
    item.onmouseout = () => item.style.background = '';
    item.onclick = () => { leafletMap.setView([lat, lng], 14); marker.openPopup(); };
    item.innerHTML = `
      <div style="width:36px;height:36px;border-radius:10px;background:${isActive?'#f0fdf4':'#fefce8'};display:flex;align-items:center;justify-content:center;font-size:15px;color:${color};flex-shrink:0;"><i class="fas fa-car"></i></div>
      <div style="flex:1;min-width:0;">
        <div style="font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${c.name || c.brand || '-'}</div>
        <div style="font-size:11px;color:#94a3b8;">${c.license_plate || c.plat || ''}</div>
      </div>
      <span class="status-dot ${isActive?'dot-green':'dot-yellow'}"></span>`;
    listEl.appendChild(item);
  });
}

window.loadTracking = loadTracking;
