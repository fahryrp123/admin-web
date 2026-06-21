/* ===== CARS MODULE =====
   API fields: name_car, kategori, transmisi, year_of_car, price,
               passenger_capacity, model, description, plate_number,
               image, availability_status
*/
let allCars = [];
let currentCarView = 'table';

let carsLastHash = '';
let carsPollTimer = null;

async function loadCars(page = 1, silent = false) {
  carsPage = page;
  if (!silent) document.getElementById('cars-loading').style.display = 'flex';
  
  const res = await Cars.listAll();
  let all = extractList(res);
  
  try {
    const rr = await Rentals.listAll();
    window.globalRentals = extractList(rr);
  } catch(e) {}
  
  if (!silent) document.getElementById('cars-loading').style.display = 'none';

  const newHash = JSON.stringify(all);
  if (silent && newHash === carsLastHash) return;
  carsLastHash = newHash;
  
  document.getElementById('cars-loading').style.display = 'none';
  allCars = all;
  updateCarStats();
  if (!silent) setupCarFilters();
  renderCars();
}

function updateCarStats() {
  const total = allCars.length;
  const avail = allCars.filter(c => carStatus(c) === 'available').length;
  const rented = allCars.filter(c => carStatus(c) === 'rented').length;
  const maint = allCars.filter(c => carStatus(c) === 'maintenance').length;
  
  if (document.getElementById('cars-stat-total')) {
    document.getElementById('cars-stat-total').textContent = total;
    document.getElementById('cars-stat-avail').textContent = avail;
    document.getElementById('cars-stat-rented').textContent = rented;
    document.getElementById('cars-stat-maint').textContent = maint;
  }
}

function getFilteredCars() {
  const q  = (document.getElementById('car-search').value || '').toLowerCase();
  const st = document.getElementById('car-status-filter').value;
  const cat = document.getElementById('car-category-filter').value.toLowerCase();
  return allCars.filter(c => {
    const name  = (c.name_car || '').toLowerCase();
    const plate = (c.plate_number || '').toLowerCase();
    const kat   = (c.kategori || '').toLowerCase();
    const matchQ   = !q  || name.includes(q) || plate.includes(q);
    const matchSt  = !st || carStatus(c) === st;
    const matchCat = !cat|| kat.includes(cat);
    return matchQ && matchSt && matchCat;
  });
}

function buildCategories() {
  const cats = [...new Set(allCars.map(c => c.kategori).filter(Boolean))];
  const sel = document.getElementById('car-category-filter');
  sel.innerHTML = '<option value="">Semua Kategori</option>' +
    cats.map(c => `<option value="${c}">${c}</option>`).join('');
}

function renderCars() {
  const filtered = getFilteredCars();
  const start = (carsPage-1)*PER_PAGE;
  const slice = filtered.slice(start, start+PER_PAGE);
  const tbody = document.getElementById('cars-body');
  const gridWrap = document.getElementById('cars-grid-wrapper');
  const tableWrap = document.querySelector('#page-cars .table-wrapper');

  if (currentCarView === 'table') {
    tableWrap.style.display = 'block';
    gridWrap.style.display = 'none';
    
    if (!slice.length) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state">
        <i class="fas fa-car"></i><h3>Tidak ada kendaraan</h3>
        <p>Belum ada data atau tidak sesuai filter.</p></div></td></tr>`;
      document.getElementById('cars-pagination').innerHTML = '';
      return;
    }
  
    tbody.innerHTML = slice.map(c => {
      const img = c.image_url || imgUrl(c.image);
      const imgEl = img
        ? `<img src="${img}" class="car-img" style="object-fit:cover;">`
        : `<div class="car-img-placeholder"><i class="fas fa-car"></i></div>`;
        
      const st = carStatus(c);
      let bg = '#dcfce7', color = '#166534', border = '#bbf7d0', label = 'Tersedia';
      if (st === 'rented') {
        bg = '#ffedd5'; color = '#c2410c'; border = '#fed7aa'; label = 'Disewa';
      } else if (st === 'maintenance') {
        bg = '#fee2e2'; color = '#b91c1c'; border = '#fecaca'; label = 'Servis';
      } else if (st === 'pending_cash') {
        bg = '#fef9c3'; color = '#854d0e'; border = '#fef08a'; label = 'Menunggu Cash';
      } else if (st === 'pending') {
        bg = '#fef9c3'; color = '#854d0e'; border = '#fef08a'; label = 'Menunggu';
      } else if (st === 'approved') {
        bg = '#dbeafe'; color = '#1e40af'; border = '#bfdbfe'; label = 'Disetujui';
      }

      let statusHtml = '';
      if (st === 'available' || st === 'maintenance') {
        statusHtml = `
          <select style="padding:6px 12px; font-size:11.5px; font-weight:700; height:auto; width:100px; border-radius:99px; cursor:pointer; background-color:${bg}; color:${color}; border:1px solid ${border}; outline:none; text-transform:uppercase; letter-spacing:0.5px; transition:all 0.2s;" onchange="updateCarStatus(${c.id}, this.value)">
            <option value="available" ${st==='available'?'selected':''} style="background:white;color:black;">Tersedia</option>
            <option value="maintenance" ${st==='maintenance'?'selected':''} style="background:white;color:black;">Servis</option>
          </select>
        `;
      } else {
        statusHtml = `
          <span style="display:inline-block; padding:6px 12px; font-size:11.5px; font-weight:700; border-radius:99px; background-color:${bg}; color:${color}; border:1px solid ${border}; text-transform:uppercase; letter-spacing:0.5px; text-align:center; min-width:100px;">
            ${label}
          </span>
        `;
      }
      
      return `<tr>
        <td><div class="car-info">
          <div style="position:relative;cursor:pointer" onclick="openCarDetail(${c.id})">${imgEl}</div>
          <div>
            <div class="car-name" style="cursor:pointer" onclick="openCarDetail(${c.id})">${c.name_car || '-'}</div>
            <div class="car-meta">${c.kategori || ''} · ${c.transmisi || ''}</div>
          </div>
        </div></td>
        <td><code style="background:#f1f5f9;padding:2px 8px;border-radius:6px;font-size:12px;">${c.plate_number||'-'}</code></td>
        <td>${c.kategori||'-'}</td>
        <td style="font-weight:600;color:#f97316;">${formatRp(c.price)}</td>
        <td>${c.year_of_car||'-'}</td>
        <td>${statusHtml}</td>
        <td>
          <div style="display:flex;gap:6px;">
            <button class="btn btn-secondary btn-icon btn-sm" title="Edit" onclick="openEditCar(${c.id})"><i class="fas fa-edit"></i></button>
            <button class="btn btn-danger btn-icon btn-sm" title="Hapus" onclick="deleteCar(${c.id},'${(c.name_car||'').replace(/'/g,"\\'")}')"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>`;
    }).join('');
  } else {
    // GRID VIEW
    tableWrap.style.display = 'none';
    gridWrap.style.display = 'grid';
    
    if (!slice.length) {
      gridWrap.innerHTML = `<div style="grid-column: 1/-1"><div class="empty-state">
        <i class="fas fa-car"></i><h3>Tidak ada kendaraan</h3>
        <p>Belum ada data atau tidak sesuai filter.</p></div></div>`;
      document.getElementById('cars-pagination').innerHTML = '';
      return;
    }

    gridWrap.innerHTML = slice.map(c => {
      const img = c.image_url || imgUrl(c.image);
      const imgEl = img
        ? `<img src="${img}" alt="${c.name_car}">`
        : `<div class="car-card-placeholder"><i class="fas fa-car"></i></div>`;
      
      const st = carStatus(c);
      let bg = '#dcfce7', color = '#166534', border = '#bbf7d0', label = 'Tersedia';
      if (st === 'rented') {
        bg = '#ffedd5'; color = '#c2410c'; border = '#fed7aa'; label = 'Disewa';
      } else if (st === 'maintenance') {
        bg = '#fee2e2'; color = '#b91c1c'; border = '#fecaca'; label = 'Servis';
      } else if (st === 'pending_cash') {
        bg = '#fef9c3'; color = '#854d0e'; border = '#fef08a'; label = 'Menunggu Cash';
      } else if (st === 'pending') {
        bg = '#fef9c3'; color = '#854d0e'; border = '#fef08a'; label = 'Menunggu';
      } else if (st === 'approved') {
        bg = '#dbeafe'; color = '#1e40af'; border = '#bfdbfe'; label = 'Disetujui';
      }

      let gridStatusHtml = '';
      if (st === 'available' || st === 'maintenance') {
        gridStatusHtml = `
          <select onclick="event.stopPropagation()" onchange="updateCarStatus(${c.id}, this.value)" style="position:absolute; top:12px; right:12px; padding:4px 10px; font-size:11px; font-weight:700; height:auto; width:auto; border-radius:20px; cursor:pointer; background-color:rgba(255,255,255,0.9); color:${color}; border:1px solid ${border}; outline:none; text-transform:uppercase; letter-spacing:0.5px; transition:all 0.2s; backdrop-filter:blur(4px);">
            <option value="available" ${st==='available'?'selected':''} style="color:black;">Tersedia</option>
            <option value="maintenance" ${st==='maintenance'?'selected':''} style="color:black;">Servis</option>
          </select>
        `;
      } else {
        gridStatusHtml = `
          <span onclick="event.stopPropagation()" style="position:absolute; top:12px; right:12px; padding:4px 10px; font-size:11px; font-weight:700; border-radius:20px; background-color:${bg}; color:${color}; border:1px solid ${border}; text-transform:uppercase; letter-spacing:0.5px; backdrop-filter:blur(4px);">
            ${label}
          </span>
        `;
      }
      
      return `
        <div class="car-card">
          <div class="car-card-img-container" onclick="openCarDetail(${c.id})">
            ${imgEl}
            ${gridStatusHtml}
          </div>
          <div class="car-card-body">
            <h3 class="car-card-title" onclick="openCarDetail(${c.id})">${c.name_car || '-'}</h3>
            <div class="car-card-plate">${c.plate_number || '-'}</div>
            
            <div class="car-card-specs">
              <div class="car-card-spec-item" title="Transmisi"><i class="fas fa-cogs"></i> ${c.transmisi || '-'}</div>
              <div class="car-card-spec-item" title="Kapasitas"><i class="fas fa-user-friends"></i> ${c.passenger_capacity || '-'}</div>
              <div class="car-card-spec-item" title="Tahun"><i class="far fa-calendar-alt"></i> ${c.year_of_car || '-'}</div>
            </div>
            
            <div class="car-card-footer">
              <div class="car-card-price">${formatRp(c.price)}<span> /hari</span></div>
              <div style="display:flex;gap:6px;">
                <button class="btn btn-secondary btn-icon btn-sm" onclick="openEditCar(${c.id})" title="Edit"><i class="fas fa-edit"></i></button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  renderPagination('cars-pagination', filtered.length, carsPage, PER_PAGE, 'loadCars');
}

window.toggleCarView = function(mode) {
  currentCarView = mode;
  const btnTable = document.getElementById('btn-view-table');
  const btnGrid = document.getElementById('btn-view-grid');
  
  if (mode === 'table') {
    btnTable.className = 'btn btn-primary btn-icon';
    btnGrid.className = 'btn btn-secondary btn-icon';
  } else {
    btnTable.className = 'btn btn-secondary btn-icon';
    btnGrid.className = 'btn btn-primary btn-icon';
  }
  
  renderCars();
};

window.openCarDetail = function(id) {
  const c = allCars.find(x => x.id == id);
  if (!c) return;
  
  const st = carStatus(c);
  const bg = st === 'available' ? '#dcfce7' : st === 'rented' ? '#ffedd5' : '#fee2e2';
  const color = st === 'available' ? '#166534' : st === 'rented' ? '#c2410c' : '#b91c1c';
  const stLabel = st === 'available' ? 'Tersedia' : st === 'rented' ? 'Sedang Disewa' : 'Sedang Servis';

  document.getElementById('detail-img').src = c.image_url || imgUrl(c.image);
  document.getElementById('detail-badge-status').textContent = stLabel;
  document.getElementById('detail-badge-status').style.backgroundColor = bg;
  document.getElementById('detail-badge-status').style.color = color;
  
  document.getElementById('detail-name').textContent = c.name_car || '-';
  document.getElementById('detail-plate').textContent = c.plate_number || '-';
  document.getElementById('detail-kategori').textContent = c.kategori || '-';
  document.getElementById('detail-year').textContent = c.year_of_car || '-';
  document.getElementById('detail-trans').textContent = c.transmisi || '-';
  document.getElementById('detail-seat').textContent = (c.passenger_capacity || '-') + ' Orang';
  document.getElementById('detail-price').textContent = formatRp(c.price) + ' / hari';
  document.getElementById('detail-desc').textContent = c.description || 'Tidak ada deskripsi.';
  
  document.getElementById('btn-detail-edit').onclick = () => {
    closeCarDetail();
    openEditCar(c.id);
  };
  
  document.getElementById('car-detail-overlay').classList.add('open');
  document.getElementById('car-detail-drawer').classList.add('open');
  document.body.style.overflow = 'hidden';
};

window.closeCarDetail = function() {
  document.getElementById('car-detail-overlay').classList.remove('open');
  document.getElementById('car-detail-drawer').classList.remove('open');
  document.body.style.overflow = '';
};

function setupCarFilters() {
  buildCategories();
  const carSearch = document.getElementById('car-search');
  const carStatusF = document.getElementById('car-status-filter');
  const carCatF = document.getElementById('car-category-filter');
  // Remove old listeners by cloning
  [carSearch, carStatusF, carCatF].forEach(el => {
    const clone = el.cloneNode(true);
    el.parentNode.replaceChild(clone, el);
  });
  document.getElementById('car-search').oninput = () => { carsPage=1; renderCars(); };
  document.getElementById('car-status-filter').onchange = () => { carsPage=1; renderCars(); };
  document.getElementById('car-category-filter').onchange = () => { carsPage=1; renderCars(); };
}

/* ===== ADD CAR MODAL ===== */
document.getElementById('btn-add-car').onclick = () => {
  document.getElementById('car-id').value = '';
  document.getElementById('car-form').reset();
  document.getElementById('car-status').disabled = false;
  document.getElementById('img-preview').style.display = 'none';
  document.getElementById('car-modal-title').textContent = 'Tambah Mobil Baru';
  openModal('car-modal-overlay');
};

/* ===== EDIT CAR ===== */
window.openEditCar = async function(id) {
  document.getElementById('car-modal-title').textContent = 'Edit Data Mobil';
  document.getElementById('car-id').value = id;
  openModal('car-modal-overlay');

  const res = await Cars.get(id);
  const c = res?.data?.data || res?.data || {};
  document.getElementById('car-name').value        = c.name_car || '';
  document.getElementById('car-plate').value       = c.plate_number || '';
  document.getElementById('car-year').value        = c.year_of_car || '';
  document.getElementById('car-price').value       = c.price || '';
  document.getElementById('car-seat').value        = c.passenger_capacity || '';
  document.getElementById('car-transmission').value = c.transmisi || '';
  document.getElementById('car-kategori').value    = c.kategori || '';
  document.getElementById('car-model').value       = c.model || '';
  document.getElementById('car-desc').value        = c.description || '';
  
  const st = carStatus(c);
  const statusSelect = document.getElementById('car-status');
  statusSelect.value = (st === 'available' || st === 'maintenance') ? st : 'rented';
  statusSelect.disabled = (st !== 'available' && st !== 'maintenance');

  const img = imgUrl(c.image);
  const prev = document.getElementById('img-preview');
  if (img) { prev.src = img; prev.style.display = 'block'; }
  else prev.style.display = 'none';
};

/* ===== IMAGE PREVIEW ===== */
document.getElementById('car-image').addEventListener('change', function() {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      const prev = document.getElementById('img-preview');
      prev.src = e.target.result;
      prev.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
});

/* ===== SAVE CAR ===== */
document.getElementById('car-save-btn').onclick = async () => {
  const id = document.getElementById('car-id').value;
  const newStatus = document.getElementById('car-status').value;

  const fd = new FormData();

  if (id) {
    const c = allCars.find(x => x.id == id);
    if (c) {
      const currentSt = carStatus(c);
      const isReserved = (currentSt !== 'available' && currentSt !== 'maintenance');
      if (isReserved) {
        fd.append('availability_status', c.availability_status || 'available');
        fd.append('status', c.availability_status || 'available');
      } else {
        if (newStatus === 'rented') {
          toast('Status "Disewa" hanya bisa aktif otomatis melalui transaksi reservasi.', 'warning');
          return;
        }
        fd.append('availability_status', newStatus);
        fd.append('status', newStatus);
      }
    }
  } else {
    if (newStatus === 'rented') {
      toast('Status mobil baru tidak bisa langsung "Disewa".', 'warning');
      return;
    }
    fd.append('availability_status', newStatus);
    fd.append('status', newStatus);
  }

  // Map form fields to API field names
  const fields = {
    name_car:          'car-name',
    plate_number:      'car-plate',
    year_of_car:       'car-year',
    price:             'car-price',
    passenger_capacity:'car-seat',
    transmisi:         'car-transmission',
    kategori:          'car-kategori',
    model:             'car-model',
    description:       'car-desc'
  };
  for (const [key, elId] of Object.entries(fields)) {
    const v = document.getElementById(elId)?.value;
    if (v) fd.append(key, v);
  }
  const imgFile = document.getElementById('car-image').files[0];
  
  if (!id && !imgFile) {
    toast('Foto mobil wajib diupload!', 'error');
    return;
  }
  
  if (imgFile) fd.append('image', imgFile);

  const btn = document.getElementById('car-save-btn');
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner"></div> Menyimpan...';

  const res = id ? await Cars.update(id, fd) : await Cars.create(fd);
  btn.disabled = false;
  btn.innerHTML = '<i class="fas fa-save"></i> Simpan';

  if (res && res.ok) {
    toast(id ? 'Mobil berhasil diperbarui!' : 'Mobil berhasil ditambahkan!');
    closeModal('car-modal-overlay');
    loadCars(carsPage);
  } else {
    const errMsg = res?.data?.message || (typeof res?.data === 'string' ? res.data.substring(0,100) : 'Gagal menyimpan.');
    toast(errMsg, 'error');
  }
};

/* ===== DELETE CAR ===== */
window.deleteCar = function(id, name) {
  confirmAction('Hapus Mobil', `Hapus "${name}" secara permanen?`, async () => {
    const res = await Cars.delete(id);
    if (res && res.ok) { toast('Mobil berhasil dihapus!'); loadCars(carsPage); }
    else toast(res?.data?.message || 'Gagal menghapus.', 'error');
  });
};

window.updateCarStatus = async function(id, newStatus) {
  const c = allCars.find(x => x.id === id);
  if (!c) return;

  const currentSt = carStatus(c);

  if (newStatus === 'rented' && currentSt !== 'rented') {
    toast('Status "Disewa" hanya bisa aktif otomatis melalui transaksi reservasi.', 'warning');
    renderCars();
    return;
  }

  if (currentSt === 'rented' && newStatus !== 'rented') {
    toast('Kendaraan sedang disewa. Selesaikan reservasi pada halaman Reservasi untuk mengubah status.', 'warning');
    renderCars();
    return;
  }

  const fd = new FormData();
  fd.append('_method', 'PUT'); // Explicitly add method spoofing in body
  const fields = ['name_car', 'plate_number', 'year_of_car', 'price', 'passenger_capacity', 'transmisi', 'kategori', 'model', 'description'];
  fields.forEach(f => {
    if (c[f]) fd.append(f, c[f]);
  });
  fd.append('availability_status', newStatus);
  fd.append('status', newStatus);
  
  toast('Menyimpan status...');
  // Use FormData with Cars.update to match backend multipart rules
  const res = await Cars.update(id, fd);
  
  if (res && res.ok) {
    toast('Status berhasil diperbarui!');
    loadCars(carsPage);
  } else {
    const errMsg = res?.data?.message || (typeof res?.data === 'string' ? res.data.substring(0,100) : 'Server Error');
    toast('Gagal: ' + errMsg, 'error');
    loadCars(carsPage);
  }
};

window.loadCars = loadCars;

window.loadCars = loadCars;
// ===== REALTIME SILENT POLLING =====
if (window.carsPollTimer) clearInterval(window.carsPollTimer);
window.carsPollTimer = setInterval(() => {
  const page = document.getElementById('cars-page');
  if (page && page.style.display !== 'none') {
    loadCars(carsPage, true);
  }
}, 10000);
