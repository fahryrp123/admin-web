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
    <td style="font-size:13px;">${formatDate(u.created_at)}</td>
    <td style="font-size:13px; font-weight:600; color:#f97316;">
      ${window.globalRentals ? window.globalRentals.filter(r => (r.user && r.user.id === u.id) || r.user_id === u.id || r.id_user === u.id).length : (u.rentals || []).length} sewa
    </td>
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
  let u = allCustomers.find(c => c.id === id);
  if (!u) {
    // Fallback: reload list and try again
    const res = await Users.list();
    allCustomers = extractList(res);
    u = allCustomers.find(c => c.id === id) || {};
  }
  const rentals = window.globalRentals ? window.globalRentals.filter(r => (r.user && r.user.id === id) || r.user_id === id || r.id_user === id) : (u.rentals || []);
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
        <div><div style="font-size:11px;color:#94a3b8;font-weight:600;">No. HP</div><div style="font-size:13px;font-weight:500;">${u.phone || u.no_hp || u.phone_number || u.no_telp || '-'}</div></div>
        <div><div style="font-size:11px;color:#94a3b8;font-weight:600;">Bergabung</div><div style="font-size:13px;font-weight:500;">${formatDate(u.created_at)}</div></div>
        <div><div style="font-size:11px;color:#94a3b8;font-weight:600;">Alamat</div><div style="font-size:13px;font-weight:500;">${u.address || u.alamat || '-'}</div></div>
        <div><div style="font-size:11px;color:#94a3b8;font-weight:600;">Total Sewa</div><div style="font-size:13px;font-weight:600;color:#f97316;">${rentals.length} kali</div></div>
      </div>
    </div>
    ${rentals.length ? `
    <div style="font-size:12px;font-weight:700;color:#64748b;margin-bottom:8px;">RIWAYAT SEWA</div>
    <div style="max-height:200px;overflow-y:auto;">
      ${rentals.slice(0,5).map(r => {
        const c = r.car || r.mobil || r.vehicle || {};
        const cName = c.name_car || c.name || r.name_car || r.car_name || '-';
        const st = r.status || r.reservations_status || r.payment_status || 'UNKNOWN';
        return `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:6px;">
          <div>
            <div style="font-size:13px;font-weight:600;">${cName}</div>
            <div style="font-size:11px;color:#94a3b8;">${formatDate(r.start_date)} - ${formatDate(r.end_date)}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:13px;font-weight:700;color:#f97316;">${formatRp(r.total_price)}</div>
            ${statusBadge(st)}
          </div>
        </div>`;
      }).join('')}
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


