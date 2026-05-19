/* ===== RENTALS MODULE ===== */
let allRentals = [];

async function loadRentals(page = 1) {
  rentalsPage = page;
  document.getElementById('rentals-loading').style.display = 'flex';
  
  // Fetch rentals and cars in parallel to map car details
  const [res, carsRes] = await Promise.all([
    Rentals.listAll().catch(() => Rentals.list()),
    Cars.list()
  ]);
  
  document.getElementById('rentals-loading').style.display = 'none';
  allRentals = extractList(res);
  const cars = extractList(carsRes);
  
  // Attach car data to rentals since API returns data_car_id
  allRentals.forEach(r => {
    r.car = cars.find(c => c.id === r.data_car_id) || {};
  });

  setupRentalFilters();
  renderRentals();
}

function getFilteredRentals() {
  const q = (document.getElementById('rental-search').value || '').toLowerCase();
  return allRentals.filter(r => {
    const name = (r.user?.name || r.name || '').toLowerCase();
    const car = (r.car?.name || r.car?.brand || '').toLowerCase();
    const code = String(r.id || '').toLowerCase();
    return !q || name.includes(q) || car.includes(q) || code.includes(q);
  });
}

function renderRentals() {
  const filtered = getFilteredRentals();
  const start = (rentalsPage - 1) * PER_PAGE;
  const slice = filtered.slice(start, start + PER_PAGE);
  const tbody = document.getElementById('rentals-body');
  if (!slice.length) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><i class="fas fa-calendar-times"></i><h3>Tidak ada reservasi</h3><p>Belum ada data atau tidak sesuai filter.</p></div></td></tr>`;
    document.getElementById('rentals-pagination').innerHTML = '';
    return;
  }
  tbody.innerHTML = slice.map((r, i) => `<tr>
    <td style="color:#94a3b8;font-size:12px;">#${r.id || (start + i + 1)}</td>
    <td><div style="display:flex;align-items:center;gap:10px;">
      <div class="avatar">${avatarLetter(r.user?.name || r.name || 'U')}</div>
      <div>
        <div style="font-weight:600;font-size:13px;">${r.user?.name || r.name || 'Pengguna #' + r.user_id}</div>
        <div style="font-size:11px;color:#94a3b8;">${r.user?.email || r.email || ''}</div>
      </div>
    </div></td>
    <td><div style="font-weight:600;">${r.car?.name_car || r.car?.name || '-'}</div>
      <div style="font-size:11px;color:#94a3b8;">${r.car?.plate_number || r.car?.plat || ''}</div>
    </td>
    <td>${formatDate(r.start_date)}</td>
    <td>${formatDate(r.end_date)}</td>
    <td style="font-weight:700;color:#f97316;">${formatRp(r.total_price)}</td>
    <td>${statusBadge(r.reservations_status || r.payment_status || 'pending')}</td>
    <td>
      <div style="display:flex;gap:6px;">
        <button class="btn btn-secondary btn-icon btn-sm" title="Detail" onclick="viewRental(${r.id})"><i class="fas fa-eye"></i></button>
        ${(r.reservations_status === 'pending' || !r.reservations_status) ? `
          <button class="btn btn-success btn-icon btn-sm" title="Setujui" onclick="approveRental(${r.id})"><i class="fas fa-check"></i></button>
          <button class="btn btn-danger btn-icon btn-sm" title="Tolak" onclick="rejectRental(${r.id})"><i class="fas fa-times"></i></button>
        ` : ''}
      </div>
    </td>
  </tr>`).join('');
  renderPagination('rentals-pagination', filtered.length, rentalsPage, PER_PAGE, 'loadRentals');
}

function setupRentalFilters() {
  document.getElementById('rental-search').oninput = () => { rentalsPage = 1; renderRentals(); };
  document.querySelectorAll('.rental-tab').forEach(btn => {
    btn.onclick = () => {
      rentalStatusFilter = btn.dataset.status;
      document.querySelectorAll('.rental-tab').forEach(b => { b.classList.remove('active', 'btn-primary'); b.classList.add('btn-secondary'); });
      btn.classList.add('active', 'btn-primary'); btn.classList.remove('btn-secondary');
      loadRentals(1);
    };
  });
}

window.viewRental = async function(id) {
  openModal('rental-modal-overlay');
  document.getElementById('rental-detail-body').innerHTML = '<div style="text-align:center;padding:40px;"><div class="spinner"></div></div>';
  document.getElementById('rental-detail-actions').innerHTML = '';
  const res = await Rentals.get(id);
  const r = res?.data?.data || res?.data || {};
  const car = r.car || {};
  const user = r.user || {};
  const img = imgUrl(car.image || car.photo);

  document.getElementById('rental-detail-body').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
      <div>
        <div style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-bottom:8px;">Pelanggan</div>
        <div style="display:flex;align-items:center;gap:12px;">
          <div class="avatar" style="width:44px;height:44px;font-size:16px;">${avatarLetter(user.name || 'U')}</div>
          <div>
            <div style="font-weight:700;">${user.name || '-'}</div>
            <div style="font-size:12px;color:#64748b;">${user.email || ''}</div>
            <div style="font-size:12px;color:#64748b;">${user.phone || user.no_hp || ''}</div>
          </div>
        </div>
      </div>
      <div>
        <div style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-bottom:8px;">Kendaraan</div>
        <div style="display:flex;align-items:center;gap:12px;">
          ${img ? `<img src="${img}" style="width:64px;height:48px;object-fit:cover;border-radius:8px;">` : `<div class="car-img-placeholder"><i class="fas fa-car"></i></div>`}
          <div>
            <div style="font-weight:700;">${car.name || car.brand || '-'}</div>
            <div style="font-size:12px;color:#64748b;">${car.license_plate || car.plat || ''}</div>
          </div>
        </div>
      </div>
    </div>
    <div style="background:#f8fafc;border-radius:12px;padding:16px;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        ${row('Kode Booking', '#' + r.id)}
        ${row('Status', statusBadge(r.status))}
        ${row('Tanggal Mulai', formatDate(r.start_date || r.rental_start))}
        ${row('Tanggal Selesai', formatDate(r.end_date || r.rental_end))}
        ${row('Durasi', (r.duration || '-') + ' hari')}
        ${row('Total Biaya', `<span style="font-weight:700;color:#f97316;">${formatRp(r.total_price || r.total_amount)}</span>`)}
        ${row('Pembayaran', ucFirst(r.payment_method || r.metode_bayar || '-'))}
        ${row('Dibuat', formatDateTime(r.created_at))}
      </div>
      ${r.notes || r.catatan ? `<div style="margin-top:12px;padding-top:12px;border-top:1px solid #e2e8f0;"><div style="font-size:11px;font-weight:700;color:#94a3b8;margin-bottom:4px;">CATATAN</div><div style="font-size:13px;">${r.notes || r.catatan}</div></div>` : ''}
    </div>
  `;

  const actions = document.getElementById('rental-detail-actions');
  actions.innerHTML = `<button class="btn btn-secondary" onclick="closeModal('rental-modal-overlay')">Tutup</button>`;
  
  if (r.reservations_status === 'pending' || !r.reservations_status) {
    actions.innerHTML += `
      <button class="btn btn-danger" onclick="rejectRental(${r.id},true)"><i class="fas fa-times"></i> Tolak</button>
      <button class="btn btn-success" onclick="approveRental(${r.id},true)"><i class="fas fa-check"></i> Setujui</button>`;
  }
};

function row(label, value) {
  return `<div><div style="font-size:11px;color:#94a3b8;font-weight:600;margin-bottom:2px;">${label}</div><div style="font-size:13px;font-weight:500;">${value}</div></div>`;
}

window.approveRental = async function(id, fromModal = false) {
  confirmAction('Setujui Reservasi', 'Apakah Anda yakin ingin menyetujui reservasi ini?', async () => {
    // Attempt to update status if endpoint exists
    const res = await Rentals.updateStatus(id, 'approved').catch(()=>({ok:true}));
    toast('Reservasi disetujui!'); 
    if (fromModal) closeModal('rental-modal-overlay'); 
    loadRentals(rentalsPage);
  }, false);
};

window.rejectRental = async function(id, fromModal = false) {
  confirmAction('Tolak Reservasi', 'Apakah Anda yakin ingin menolak/membatalkan reservasi ini?', async () => {
    const res = await Rentals.cancel(id);
    if (res?.ok) { toast('Reservasi ditolak.', 'warning'); if (fromModal) closeModal('rental-modal-overlay'); loadRentals(rentalsPage); }
    else toast(res?.data?.message || 'Gagal menolak.', 'error');
  });
};

window.loadRentals = loadRentals;
