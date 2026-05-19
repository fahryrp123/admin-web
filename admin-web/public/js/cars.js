/* ===== CARS MODULE =====
   API fields: name_car, kategori, transmisi, year_of_car, price,
               passenger_capacity, model, description, plate_number,
               image, availability_status
*/
let allCars = [];

async function loadCars(page = 1) {
  carsPage = page;
  document.getElementById('cars-loading').style.display = 'flex';
  const res = await Cars.list();
  document.getElementById('cars-loading').style.display = 'none';
  allCars = extractList(res);
  setupCarFilters();
  renderCars();
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

  if (!slice.length) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state">
      <i class="fas fa-car"></i><h3>Tidak ada kendaraan</h3>
      <p>Belum ada data atau tidak sesuai filter.</p></div></td></tr>`;
    document.getElementById('cars-pagination').innerHTML = '';
    return;
  }

  tbody.innerHTML = slice.map(c => {
    const img = imgUrl(c.image);
    const imgEl = img
      ? `<img src="${img}" class="car-img" onerror="this.style.display='none';this.nextSibling.style.display='flex'">
         <div class="car-img-placeholder" style="display:none"><i class="fas fa-car"></i></div>`
      : `<div class="car-img-placeholder"><i class="fas fa-car"></i></div>`;
    return `<tr>
      <td><div class="car-info">
        <div style="position:relative;">${imgEl}</div>
        <div>
          <div class="car-name">${c.name_car || '-'}</div>
          <div class="car-meta">${c.kategori || ''} · ${c.transmisi || ''}</div>
        </div>
      </div></td>
      <td><code style="background:#f1f5f9;padding:2px 8px;border-radius:6px;font-size:12px;">${c.plate_number||'-'}</code></td>
      <td>${c.kategori||'-'}</td>
      <td style="font-weight:600;color:#f97316;">${formatRp(c.price)}</td>
      <td>${c.year_of_car||'-'}</td>
      <td>${statusBadge(carStatus(c))}</td>
      <td>
        <div style="display:flex;gap:6px;">
          <button class="btn btn-secondary btn-icon btn-sm" title="Edit" onclick="openEditCar(${c.id})"><i class="fas fa-edit"></i></button>
          <button class="btn btn-danger btn-icon btn-sm" title="Hapus" onclick="deleteCar(${c.id},'${(c.name_car||'').replace(/'/g,"\\'")}')"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>`;
  }).join('');
  renderPagination('cars-pagination', filtered.length, carsPage, PER_PAGE, 'loadCars');
}

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
  document.getElementById('car-status').value      = c.availability_status || 'available';

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
  const fd = new FormData();
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
    description:       'car-desc',
    availability_status:'car-status',
  };
  for (const [key, elId] of Object.entries(fields)) {
    const v = document.getElementById(elId)?.value;
    if (v) fd.append(key, v);
  }
  const imgFile = document.getElementById('car-image').files[0];
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

window.loadCars = loadCars;
