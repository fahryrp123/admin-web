/* ===== RENTALS MODULE ===== */
let allRentals = [];

function extractList(resp) {
  if (!resp) return [];
  if (Array.isArray(resp)) return resp;
  if (resp.data) {
    if (Array.isArray(resp.data)) return resp.data;
    if (resp.data.data && Array.isArray(resp.data.data)) return resp.data.data;
  }
  return [];
}

let rentalsLastHash = '';
let rentalsPollTimer = null;

async function loadRentals(page = 1, silent = false) {
  rentalsPage = page;
  if (!silent) document.getElementById('rentals-loading').style.display = 'flex';

  // Fetch rentals and cars in parallel to map car details
  const [res, carsRes, branchRes] = await Promise.all([
    Rentals.listAll().catch(() => Rentals.list()),
    Cars.listAll().catch(() => Cars.list()),
    Branches.list().catch(() => null)
  ]);

  if (!silent) document.getElementById('rentals-loading').style.display = 'none';

  let newRentals = extractList(res);
  const cars = extractList(carsRes);
  allCars = cars;

  // Map cars to rentals
  newRentals = newRentals.map(r => {
    const cid = r.data_car_id || r.car_id || r.id_mobil || r.mobil_id || r.vehicle_id || r.id_kendaraan;
    if (!r.car && !r.mobil && cid) {
      r.car = cars.find(c => String(c.id) === String(cid)) || {};
    }

    const bid = r.branch_id || r.id_cabang;
    if (!r.branch_name && bid) {
      const b = (extractList(branchRes)).find(x => String(x.id) === String(bid));
      if (b) r.branch_name = b.name || b.branch_name || b.nama_cabang;
    }

    return r;
  });

  const newHash = JSON.stringify(newRentals);
  if (silent && newHash === rentalsLastHash) {
    return; // Tidak ada perubahan, lewati render
  }

  rentalsLastHash = newHash;
  allRentals = newRentals;
  window.globalRentals = newRentals;

  updateRentalStats();
  if (!silent) setupRentalFilters();
  renderRentals();
}

function updateRentalStats() {
  const todayStr = new Date().toISOString().split('T')[0];
  const totalToday = allRentals.filter(r => (r.start_date || '').startsWith(todayStr) || (r.end_date || '').startsWith(todayStr)).length;
  const pending = allRentals.filter(r => {
    const s = (r.status || r.reservations_status || r.payment_status || 'pending').toLowerCase();
    const pm = (r.payment_method || (r.payment && r.payment.payment_method) || '').toLowerCase();
    const isCash = (pm === 'cash' || pm === 'tunai' || s === 'pending_cash');
    if (isCash && (s.includes('pending') || s.includes('waiting') || s === 'pending_cash')) return true;
    return s.includes('waiting') || s.includes('pending');
  }).length;
  const active = allRentals.filter(r => {
    const s = (r.status || r.reservations_status || r.payment_status || 'pending').toLowerCase();
    return s === 'active' || s === 'ongoing' || s === 'on-going' || s === 'sedang disewa' || s.includes('jalan');
  }).length;
  const income = allRentals.reduce((sum, r) => {
    const s = (r.status || r.reservations_status || r.payment_status || 'pending').toLowerCase();
    if (s === 'active' || s === 'ongoing' || s === 'completed' || s === 'approved' || s === 'confirmed' || s.includes('konfirmasi') || s.includes('disetujui') || s.includes('selesai')) {
      return sum + (Number(r.total_price) || 0);
    }
    return sum;
  }, 0);

  if (document.getElementById('rentals-stat-today')) {
    document.getElementById('rentals-stat-today').textContent = totalToday;
    if (document.getElementById('rentals-stat-pending')) document.getElementById('rentals-stat-pending').textContent = pending;
    if (document.getElementById('rentals-stat-active')) document.getElementById('rentals-stat-active').textContent = active;
    if (document.getElementById('rentals-stat-income')) document.getElementById('rentals-stat-income').textContent = formatRp(income);
  }
}

function getFilteredRentals() {
  const q = (document.getElementById('rental-search').value || '').toLowerCase();
  const startFilter = document.getElementById('rental-filter-start')?.value || '';
  const endFilter = document.getElementById('rental-filter-end')?.value || '';

  return allRentals.filter(r => {
    const name = (r.user?.name || r.name || '').toLowerCase();
    const car = (r.car?.name || r.car?.brand || '').toLowerCase();
    const code = String(r.id || '').toLowerCase();
    const matchQ = !q || name.includes(q) || car.includes(q) || code.includes(q);

    // Date filtering
    let matchDate = true;
    if (startFilter) {
      const rStart = r.start_date ? r.start_date.split(' ')[0] : '';
      if (rStart < startFilter) matchDate = false;
    }
    if (endFilter) {
      const rStart = r.start_date ? r.start_date.split(' ')[0] : '';
      if (rStart > endFilter) matchDate = false;
    }

    // Status matching
    const rawStatus = (r.status || r.reservations_status || r.payment_status || 'pending').toLowerCase();
    let normStatus = 'pending';
    if (rawStatus === 'approved' || rawStatus === 'confirmed' || rawStatus.includes('konfirmasi') || rawStatus.includes('disetujui')) normStatus = 'approved';
    else if (rawStatus === 'active' || rawStatus === 'ongoing' || rawStatus === 'on-going' || rawStatus === 'sedang disewa' || rawStatus.includes('jalan')) normStatus = 'active';
    else if (rawStatus === 'completed' || rawStatus.includes('selesai')) normStatus = 'completed';
    else if (rawStatus === 'cancelled' || rawStatus.includes('batal') || rawStatus === 'failed') normStatus = 'cancelled';
    else if (rawStatus === 'rejected' || rawStatus.includes('tolak')) normStatus = 'rejected';

    const matchStatus = !rentalStatusFilter || normStatus === rentalStatusFilter.toLowerCase();

    return matchQ && matchDate && matchStatus;
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
  tbody.innerHTML = slice.map((r, i) => {
    const end = new Date(r.end_date); end.setHours(0, 0, 0, 0);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const st1 = (r.status || '').toLowerCase();
    const st2 = (r.reservations_status || '').toLowerCase();
    const st3 = (r.payment_status || '').toLowerCase();
    const stAll = st1 + ' ' + st2 + ' ' + st3;

    const isPending = stAll.includes('pending') || stAll.includes('waiting') || stAll.includes('menunggu') || (!st1 && !st2);
    const isApproved = stAll.includes('approved') || stAll.includes('confirmed') || stAll.includes('disetujui') || stAll.includes('konfirmasi') || stAll.includes('lunas') || stAll.includes('paid') || stAll.includes('dibayar');
    const isOngoing = stAll.includes('active') || stAll.includes('ongoing') || stAll.includes('on-going') || stAll.includes('jalan');

    let countdownText = '';
    let bgStyle = '';
    if (isOngoing) {
      const diffTime = end - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 0) {
        countdownText = `<div class="text-overdue">Terlambat ${Math.abs(diffDays)} Hari</div>`;
        bgStyle = 'background-color:#fef2f2; border-left: 3px solid #ef4444;';
      } else if (diffDays === 0) {
        countdownText = `<div class="text-today">Selesai Hari Ini</div>`;
      }
    }

    const customerName = r.user?.name || r.customer_name || r.name || 'Tanpa Nama';
    const customerEmail = r.user?.email || r.customer_email || r.email || '-';
    const customerPhone = r.user?.phone || r.user?.phone_number || r.customer_phone || '-';

    const carObj = r.car || r.mobil || r.vehicle;

    const pm = (r.payment_method || (r.payment && r.payment.payment_method) || (r.payments && r.payments.length ? r.payments[0].payment_method : '') || '').toLowerCase();

    // Quick check if there is a proof of payment image
    const pData = r.payment || (r.payments && r.payments.length ? r.payments[0] : null);
    let hasProof = false;
    if (pData) {
      let payloadProof = null;
      if (pData.payload) {
        try {
          const payloadObj = typeof pData.payload === 'string' ? JSON.parse(pData.payload) : pData.payload;
          payloadProof = payloadObj.proof_of_payment || payloadObj.bukti_pembayaran || payloadObj.bukti_transfer || payloadObj.receipt || payloadObj.image || payloadObj.file || payloadObj.attachment;
          if (!payloadProof) {
            for (let key in payloadObj) {
              if (typeof payloadObj[key] === 'string' && (payloadObj[key].includes('.jpg') || payloadObj[key].includes('.png') || payloadObj[key].includes('.jpeg') || payloadObj[key].includes('storage/') || payloadObj[key].startsWith('http'))) {
                payloadProof = payloadObj[key]; break;
              }
            }
          }
        } catch (e) { }
      }
      if (pData.proof_of_payment || pData.bukti_pembayaran || pData.payment_proof || pData.receipt || pData.image || pData.bukti_transfer || pData.file || pData.attachment || payloadProof) hasProof = true;
      if (!hasProof) {
        for (let key in pData) {
          if (typeof pData[key] === 'string' && (pData[key].includes('.jpg') || pData[key].includes('.png') || pData[key].includes('.jpeg') || pData[key].includes('storage/') || pData[key].startsWith('http'))) {
            hasProof = true; break;
          }
        }
      }
    }
    if (!hasProof) {
      if (r.proof_of_payment || r.bukti_pembayaran || r.payment_proof || r.receipt || r.bukti_transfer || r.file || r.attachment) hasProof = true;
      if (!hasProof) {
        for (let key in r) {
          if (typeof r[key] === 'string' && key !== 'ktp' && key !== 'sim' && key !== 'foto_ktp' && key !== 'foto_sim' && key !== 'image_ktp' && key !== 'image_sim' && key !== 'avatar' && key !== 'photo' && key !== 'image' && key !== 'foto') {
            if (r[key].includes('.jpg') || r[key].includes('.png') || r[key].includes('.jpeg') || r[key].includes('storage/')) {
              hasProof = true; break;
            }
          }
        }
      }
    }

    let pmBadge = '';
    if (pm === 'transfer' || pm === 'qris' || (hasProof && pm === 'cash')) {
      const displayPm = (pm === 'transfer' || pm === 'qris') ? pm.toUpperCase() : 'TRANSFER (Struk)';
      pmBadge = `<div style="font-size:10px; font-weight:700; color:#3b82f6; margin-top:4px;"><i class="fas fa-university"></i> ${displayPm}</div>`;
    } else if (pm === 'cash' || pm === 'tunai') {
      pmBadge = '<div style="font-size:10px; font-weight:700; color:#10b981; margin-top:4px;"><i class="fas fa-money-bill-wave"></i> CASH</div>';
    }

    let userAvatarHtml = avatarLetter(customerName);
    if (r.user) {
      const ppath = r.user.profile_picture || r.user.profile_photo_path || r.user.photo || r.user.avatar;
      if (ppath) userAvatarHtml = `<img src="${imgUrl(ppath)}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
    }

    return `<tr style="${bgStyle}" onclick="viewRental(${r.id})" style="cursor:pointer;">
    <td><span style="color:#3b82f6;font-size:13px;font-weight:700;">${r.no_reservasi || r.reservation_number || r.nomor_reservasi || ('RSV-' + r.id)}</span></td>
    <td>
      <div style="display:flex; align-items:center; gap:10px;">
        <div class="avatar bg-primary" style="color:white; padding:0; overflow:hidden;">${userAvatarHtml}</div>
        <div>
          <div style="font-weight:600;color:var(--text-main);">${customerName}</div>
          <div style="font-size:12px;color:var(--text-sub);">${customerEmail}</div>
          ${customerPhone !== '-' ? `<div style="font-size:12px;color:var(--text-sub);">${customerPhone}</div>` : ''}
        </div>
      </div>
    </td>
    <td>
      <div style="font-weight:600;">${carDisplayName(carObj)}</div>
      <div style="font-size:12px;color:var(--text-sub);">${carObj ? (carObj.plate_number || carObj.plat_nomor || carObj.nomor_polisi || '-') : '-'}</div>
    </td>
    <td>${formatDate(r.start_date, false)}</td>
    <td>${formatDate(r.end_date, false)} ${countdownText}</td>
    <td>
      <div style="font-weight:700;color:#f97316;">${formatRp(r.total_price)}</div>
      ${pmBadge}
    </td>
    <td>${statusBadge(r)}</td>
    <td>
      <div style="display:flex;gap:6px;">
        <button class="btn btn-secondary btn-icon btn-sm" title="Detail" onclick="viewRental(${r.id})"><i class="fas fa-eye"></i></button>
      </div>
    </td>
  </tr>`;
  }).join('');
  renderPagination('rentals-pagination', filtered.length, rentalsPage, PER_PAGE, 'loadRentals');
}

function setupRentalFilters() {
  document.getElementById('rental-search')?.addEventListener('input', () => { rentalsPage = 1; renderRentals(); });
  
  // Date filter change listeners
  const startF = document.getElementById('rental-filter-start');
  const endF = document.getElementById('rental-filter-end');
  const clearBtn = document.getElementById('btn-clear-rental-dates');
  
  document.getElementById('rental-filter-start')?.addEventListener('change', () => { rentalsPage = 1; renderRentals(); });
  document.getElementById('rental-filter-end')?.addEventListener('change', () => { rentalsPage = 1; renderRentals(); });

  if (clearBtn) {
    clearBtn.onclick = () => {
      if (startF) startF.value = '';
      if (endF) endF.value = '';
      rentalsPage = 1;
      renderRentals();
    };
  }

  document.querySelectorAll('.rental-tab').forEach(btn => {
    btn.onclick = () => {
      rentalStatusFilter = btn.dataset.status;
      document.querySelectorAll('.rental-tab').forEach(b => { b.classList.remove('active', 'btn-primary'); b.classList.add('btn-secondary'); });
      btn.classList.add('active', 'btn-primary'); btn.classList.remove('btn-secondary');
      loadRentals(1);
    };
  });
}

// ==== RENDER BADGE STATUS CERDAS (BISA CEK PAYMENT METHOD) ====
function carDisplayName(car) {
  if (!car) return '-';
  const brand = car.brand || car.merk || car.merk_mobil || '';
  const name = car.name_car || car.name || car.nama || car.model || car.nama_mobil || '';
  return `${brand} ${name}`.trim() || '-';
}

function statusBadge(r) {
  if (!r) return '-';

  if (typeof r === 'string') {
    const l = r.toLowerCase();
    if (l === 'pending_cash') return '<span class="badge-pill pill-warning">Menunggu Konfirmasi Cash</span>';
    if (l.includes('waiting') || l.includes('pending')) return '<span class="badge-pill pill-warning">Menunggu Konfirmasi</span>';
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
    return '<span class="badge-pill pill-warning">Menunggu Konfirmasi Cash</span>';
  }

  if (st.includes('waiting') || st.includes('pending')) return '<span class="badge-pill pill-warning">Menunggu Konfirmasi</span>';
  if (st === 'approved' || st === 'confirmed' || st.includes('konfirmasi') || st.includes('disetujui')) return '<span class="badge-pill pill-primary">Dikonfirmasi</span>';
  if (st === 'active' || st === 'ongoing' || st === 'on-going' || st === 'sedang disewa' || st.includes('jalan')) return '<span class="badge-pill pill-success">Sedang Jalan</span>';
  if (st === 'completed' || st === 'selesai') return '<span class="badge-pill pill-success">Selesai</span>';
  if (st === 'cancelled' || st === 'dibatalkan' || st === 'failed') return '<span class="badge-pill pill-danger">Dibatalkan</span>';

  const rawStatus = r.status || r.reservations_status || r.payment_status || 'UNKNOWN';
  return `<span class="badge-pill pill-secondary">${String(rawStatus).toUpperCase()}</span>`;
}

window.viewRental = async function (id) {
  const r = allRentals.find(x => String(x.id) === String(id)) || {};
  const car = r.car || r.mobil || r.vehicle || {};
  const user = r.user || {};
  const img = car.image_url || imgUrl(car.image || car.photo || car.foto);
  const pm = (r.payment_method || (r.payment && r.payment.payment_method) || (r.payments && r.payments.length ? r.payments[0].payment_method : '') || '').toLowerCase();

  const ktpUrl = imgUrl(user.id_card || r.ktp || r.foto_ktp || r.image_ktp || user.ktp || user.foto_ktp || user.image_ktp);
  const simUrl = imgUrl(user.drive_licence || r.sim || r.foto_sim || r.image_sim || user.sim || user.foto_sim || user.image_sim);
  
  const userPhone = user.number_phone || user.phone || user.no_hp || r.no_hp || r.phone || '-';
  const userAddress = user.address || user.alamat || r.address || r.alamat || '-';

  // Payment proofs
  let paymentHtml = '';
  let proofPath = null;

  const pData = r.payment || (r.payments && r.payments.length ? r.payments[0] : null);

  if (pData) {
    let payloadProof = null;
    if (pData.payload) {
      try {
        const payloadObj = typeof pData.payload === 'string' ? JSON.parse(pData.payload) : pData.payload;
        payloadProof = payloadObj.proof_of_payment || payloadObj.bukti_pembayaran || payloadObj.bukti_transfer || payloadObj.receipt || payloadObj.image || payloadObj.file || payloadObj.attachment;
        if (!payloadProof) {
          for (let key in payloadObj) {
            if (typeof payloadObj[key] === 'string' && (payloadObj[key].includes('.jpg') || payloadObj[key].includes('.png') || payloadObj[key].includes('.jpeg') || payloadObj[key].includes('storage/') || payloadObj[key].startsWith('http'))) {
              payloadProof = payloadObj[key];
              break;
            }
          }
        }
      } catch (e) { }
    }
    proofPath = pData.proof_of_payment || pData.bukti_pembayaran || pData.payment_proof || pData.receipt || pData.image || pData.image_pembayaran || pData.bukti_transfer || pData.file || pData.attachment || payloadProof;
    if (!proofPath) {
      for (let key in pData) {
        if (typeof pData[key] === 'string' && (pData[key].includes('.jpg') || pData[key].includes('.png') || pData[key].includes('.jpeg') || pData[key].includes('storage/') || pData[key].startsWith('http'))) {
          proofPath = pData[key];
          break;
        }
      }
    }
  }
  if (!proofPath) {
    proofPath = r.proof_of_payment || r.bukti_pembayaran || r.payment_proof || r.receipt || r.image_pembayaran || r.bukti_transfer || r.file || r.attachment;
    if (!proofPath) {
      for (let key in r) {
        if (typeof r[key] === 'string' && key !== 'ktp' && key !== 'sim' && key !== 'foto_ktp' && key !== 'foto_sim' && key !== 'image_ktp' && key !== 'image_sim' && key !== 'avatar' && key !== 'photo' && key !== 'image' && key !== 'foto') {
          if (r[key].includes('.jpg') || r[key].includes('.png') || r[key].includes('.jpeg') || r[key].includes('storage/')) {
            proofPath = r[key];
            break;
          }
        }
      }
    }
  }

  if (proofPath) {
    const pf = imgUrl(proofPath);
    paymentHtml = `<div style="margin-top:16px;border-top:1px solid var(--border);padding-top:16px;">
      <div style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-bottom:8px;">Bukti Pembayaran</div>
      <div class="proof-card">
        <img src="${pf}" onclick="openImageModal('${pf}')">
        <span>Struk Transfer</span>
      </div>
    </div>`;
  }

  document.getElementById('rental-drawer-content').innerHTML = `
    <div style="padding:24px;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px;">
        <div>
          <h2 style="margin:0 0 4px 0; font-size:24px;">${r.no_reservasi || r.reservation_number || r.nomor_reservasi || ('RSV-' + r.id)}</h2>
          <div style="color:#64748b; font-size:13px;">Dibuat: ${formatDate(r.created_at, false)}</div>
        </div>
        ${statusBadge(r)}
      </div>
      
      <div style="background:white; padding:16px; border-radius:12px; border:1px solid var(--border); margin-bottom:16px;">
        <div style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-bottom:12px;">Pelanggan</div>
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
          <div class="avatar" style="width:48px;height:48px;font-size:18px; padding:0; overflow:hidden;">
            ${(() => {
              const ppath = user.profile_picture || user.profile_photo_path || user.photo || user.avatar;
              if (ppath) return `<img src="${imgUrl(ppath)}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
              return avatarLetter(user.name || 'U');
            })()}
          </div>
          <div>
            <div style="font-weight:700; font-size:15px;">${user.name || '-'}</div>
            <div style="font-size:13px;color:#64748b;">${user.email || ''}</div>
          </div>
        </div>
        
        <div style="border-top:1px solid #f1f5f9; padding-top:12px; margin-bottom:12px; display:grid; grid-template-columns:1fr; gap:8px;">
          <div><span style="font-size:11px;color:#94a3b8;font-weight:600;display:block;">No. HP</span><span style="font-size:13px;font-weight:500;">${userPhone}</span></div>
          <div><span style="font-size:11px;color:#94a3b8;font-weight:600;display:block;">Alamat</span><span style="font-size:13px;font-weight:500;">${userAddress}</span></div>
        </div>
        
        ${(ktpUrl || simUrl) ? `
        <div class="proof-image-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
          <div class="proof-card">
            ${ktpUrl ? `<img src="${ktpUrl}" onclick="openImageModal('${ktpUrl}')" style="width:100%;height:100px;object-fit:contain;background:#f8fafc;border-radius:4px;cursor:zoom-in;">` : `<div style="height:100px;background:#f1f5f9;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#cbd5e1;"><i class="fas fa-id-card fa-2x"></i></div>`}
            <div style="font-size:11px;font-weight:600;color:#64748b;margin-top:8px;text-align:center;">FOTO KTP</div>
          </div>
          <div class="proof-card">
            ${simUrl ? `<img src="${simUrl}" onclick="openImageModal('${simUrl}')" style="width:100%;height:100px;object-fit:contain;background:#f8fafc;border-radius:4px;cursor:zoom-in;">` : `<div style="height:100px;background:#f1f5f9;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#cbd5e1;"><i class="fas fa-id-card fa-2x"></i></div>`}
            <div style="font-size:11px;font-weight:600;color:#64748b;margin-top:8px;text-align:center;">FOTO SIM</div>
          </div>
        </div>` : ''}
      </div>

      <div style="background:white; padding:16px; border-radius:12px; border:1px solid var(--border); margin-bottom:16px;">
        <div style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-bottom:12px;">Kendaraan & Waktu</div>
        <div style="display:flex;align-items:center;gap:12px; margin-bottom:16px;">
          ${img ? `<img src="${img}" style="width:72px;height:52px;object-fit:cover;border-radius:6px;">` : `<div class="car-img-placeholder" style="width:72px;height:52px;font-size:24px;"><i class="fas fa-car"></i></div>`}
          <div>
            <div style="font-weight:700; font-size:15px;">${car.name_car || car.name || car.brand || '-'}</div>
            <div style="font-size:13px;color:#64748b; font-family:monospace;">${car.plate_number || car.license_plate || car.plat || '-'}</div>
          </div>
        </div>
        
        ${(pm === 'cash' || pm === 'tunai') ? '' : `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
          ${row('Lokasi Ambil / Cabang', r.pickup_method === 'antar' || r.pickup_method === 'delivery' || r.pickupMethod === 'antar' ? (r.delivery_address || r.cust_address || r.address || userAddress || 'Diantar ke lokasi') : (r.branch_name || (r.branch && (r.branch.name || r.branch.branch_name)) || '-'))}
          ${row('Metode Ambil', (r.pickup_method || '').replace(/_/g, ' ').toUpperCase() || 'DI CABANG')}
        </div>
        `}
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          ${row('Mulai Sewa', formatDate(r.start_date, false))}
          ${row('Selesai Sewa', formatDate(r.end_date, false))}
        </div>
      </div>
      
      <div style="background:white; padding:16px; border-radius:12px; border:1px solid var(--border);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; padding-bottom:12px; border-bottom:1px solid #f1f5f9;">
          <div style="font-size:13px; color:#64748b;">Metode Pembayaran</div>
          <div style="font-size:13px; font-weight:700; color:#334155; text-transform:uppercase;">
            ${(pm === 'transfer' || pm === 'qris' || (proofPath && pm === 'cash')) ? `<i class="fas fa-university" style="color:#3b82f6;margin-right:4px;"></i> ${(pm === 'transfer' || pm === 'qris') ? pm : 'TRANSFER (STRUK)'}` : (pm === 'cash' || pm === 'tunai' ? '<i class="fas fa-money-bill-wave" style="color:#10b981;margin-right:4px;"></i> CASH' : (pm || '-'))}
          </div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="font-size:13px; color:#64748b;">Total Pembayaran</div>
          <div style="font-size:20px; font-weight:800; color:var(--primary);">${formatRp(r.total_price)}</div>
        </div>
        ${paymentHtml}
      </div>
    </div>
  `;

  const actions = document.getElementById('rental-drawer-actions');
  const st1 = (r.status || '').toLowerCase();
  const st2 = (r.reservations_status || '').toLowerCase();
  const st3 = (r.payment_status || '').toLowerCase();
  const stAll = st1 + ' ' + st2 + ' ' + st3;
  const paySt = st3;

  const isPending = stAll.includes('pending') || stAll.includes('waiting') || stAll.includes('menunggu') || (!st1 && !st2);
  const isApproved = stAll.includes('approved') || stAll.includes('confirmed') || stAll.includes('success') || stAll.includes('disetujui') || stAll.includes('konfirmasi') || stAll.includes('lunas') || stAll.includes('paid') || stAll.includes('dibayar');
  const isOngoing = stAll.includes('active') || stAll.includes('ongoing') || stAll.includes('on-going') || stAll.includes('jalan') || stAll.includes('sedang disewa');
  const isCancelled = stAll.includes('cancelled') || stAll.includes('batal') || stAll.includes('dibatalkan');

  let actionHtml = '';

  if (stAll.includes('pending_cash')) {
    actionHtml += `
      <button class="btn btn-danger" onclick="rejectRental(${r.id},true)"><i class="fas fa-times"></i> Batalkan</button>
      <button class="btn btn-primary" onclick="confirmCash(${r.id})"><i class="fas fa-money-bill-wave"></i> Konfirmasi Cash</button>
    `;
  } else if (isPending) {
    actionHtml += `
      <button class="btn btn-danger" onclick="rejectRental(${r.id},true)"><i class="fas fa-times"></i> Tolak</button>
      <button class="btn btn-success" onclick="approveRental(${r.id},true)"><i class="fas fa-check"></i> Setujui</button>
    `;
  }

  if (isApproved) {
    actionHtml += `<button class="btn btn-success" onclick="startReserv(${r.id})"><i class="fas fa-key"></i> Mulai Sewa</button>`;
  }

  if (isOngoing) {
    actionHtml += `
      <button class="btn btn-success" style="flex: 2; justify-content: center; font-size: 14px; padding: 12px;" onclick="endReserv(${r.id})"><i class="fas fa-flag-checkered"></i> Selesai Sewa</button>
    `;
  }

  if (isCancelled && paySt === 'paid') {
    actionHtml += `<button class="btn btn-warning" onclick="approveRefund(${r.id})"><i class="fas fa-undo"></i> Konfirmasi Refund</button>`;
  }

  if (!actionHtml.trim()) {
    actions.style.display = 'none';
  } else {
    actions.style.display = 'flex';
  }
  actions.innerHTML = actionHtml;

  document.getElementById('rental-detail-overlay').classList.add('open');
  document.getElementById('rental-detail-drawer').classList.add('open');
  document.body.style.overflow = 'hidden';
};

window.closeRentalDetail = function () {
  document.getElementById('rental-detail-overlay').classList.remove('open');
  document.getElementById('rental-detail-drawer').classList.remove('open');
  document.body.style.overflow = '';
};

function row(label, value) {
  return `<div><div style="font-size:11px;color:#94a3b8;font-weight:600;margin-bottom:2px;">${label}</div><div style="font-size:13px;font-weight:500;">${value}</div></div>`;
}

window.approveRental = async function (id, fromModal = false) {
  const target = allRentals.find(x => String(x.id) === String(id));
  if (target) {
    const cid = target.data_car_id || target.car_id || target.id_mobil || target.mobil_id || target.vehicle_id || target.id_kendaraan;
    const start = new Date(target.start_date).getTime();
    const end = new Date(target.end_date).getTime();

    if (cid && start && end) {
      // Cek apakah mobil ini sudah dipakai di reservasi lain pada tanggal yang tumpang tindih
      const overlap = allRentals.find(x => {
        if (String(x.id) === String(id)) return false; // Jangan cek diri sendiri

        const xcid = x.data_car_id || x.car_id || x.id_mobil || x.mobil_id || x.vehicle_id || x.id_kendaraan;
        if (String(xcid) !== String(cid)) return false; // Beda mobil

        const st = (x.status || x.reservations_status || x.payment_status || '').toLowerCase();
        // Hanya peduli dengan reservasi yang SUDAH DISETUJUI / BERJALAN
        if (st !== 'approved' && st !== 'confirmed' && st !== 'active' && st !== 'ongoing' && st !== 'on-going' && st !== 'sedang disewa' && !st.includes('jalan')) return false;

        const xstart = new Date(x.start_date).getTime();
        const xend = new Date(x.end_date).getTime();

        // Logika tumpang tindih waktu
        return (start <= xend) && (end >= xstart);
      });

      if (overlap) {
        alert(`Gagal (Double Booking)\nMobil ini sudah disewa (Reservasi #${overlap.id}) pada tanggal tersebut! Harap tolak reservasi ini atau hubungi pelanggan.`);
        return; // Hentikan proses persetujuan
      }
    }
  }

  confirmAction('Setujui Reservasi', 'Apakah Anda yakin ingin menyetujui reservasi ini?', async () => {
    const res = await Rentals.approve(id);
    if (res?.ok) {
      toast('Reservasi disetujui!');

      // Sinkronisasi status mobil ke database secara otomatis
      if (target) {
        const cid = target.data_car_id || target.car_id || target.id_mobil || target.mobil_id || target.vehicle_id || target.id_kendaraan;
        const car = allCars.find(c => String(c.id) === String(cid));
        if (car) {
          setTimeout(async () => {
            const fd = new FormData();
            fd.append('_method', 'PUT'); // Explicitly add method spoofing in body
            const fields = ['name_car', 'plate_number', 'year_of_car', 'price', 'passenger_capacity', 'transmisi', 'kategori', 'model', 'description'];
            fields.forEach(f => {
              if (car[f]) fd.append(f, car[f]);
            });
            fd.append('availability_status', 'rented');
            fd.append('status', 'rented');

            await Cars.update(car.id, fd).catch(e => console.error('Gagal update status mobil:', e));
          }, 500);
        }
      }

      if (fromModal) {
        closeModal('rental-modal-overlay');
        closeRentalDetail();
      }
      loadRentals(rentalsPage);
    }
    else toast(res?.data?.message || 'Gagal menyetujui.', 'error');
  }, false);
};

window.rejectRental = async function (id, fromModal = false) {
  document.getElementById('reject-reason-input').value = '';
  openModal('reject-modal-overlay');

  document.getElementById('btn-submit-reject').onclick = async () => {
    const reason = document.getElementById('reject-reason-input').value;
    if (!reason.trim()) { toast('Alasan penolakan wajib diisi!', 'error'); return; }

    const btn = document.getElementById('btn-submit-reject');
    btn.disabled = true;
    btn.textContent = 'Memproses...';

    const res = await Rentals.reject(id, reason);

    btn.disabled = false;
    btn.textContent = 'Tolak Reservasi';

    if (res?.ok) {
      toast('Reservasi berhasil ditolak.', 'warning');

      // Sinkronisasi status mobil ke database secara otomatis
      const target = allRentals.find(x => String(x.id) === String(id));
      if (target) {
        const cid = target.data_car_id || target.car_id || target.id_mobil || target.mobil_id || target.vehicle_id || target.id_kendaraan;
        const car = allCars.find(c => String(c.id) === String(cid));
        if (car) {
          setTimeout(async () => {
            const fd = new FormData();
            fd.append('_method', 'PUT');
            const fields = ['name_car', 'plate_number', 'year_of_car', 'price', 'passenger_capacity', 'transmisi', 'kategori', 'model', 'description'];
            fields.forEach(f => {
              if (car[f]) fd.append(f, car[f]);
            });
            fd.append('availability_status', 'available');
            fd.append('status', 'available');

            await Cars.update(car.id, fd).catch(e => console.error('Gagal update status mobil:', e));
          }, 500);
        }
      }

      closeModal('reject-modal-overlay');
      if (fromModal) {
        closeModal('rental-modal-overlay');
        closeRentalDetail();
      }
      loadRentals(rentalsPage);
    } else {
      toast(res?.data?.message || 'Gagal menolak.', 'error');
    }
  };
};

window.confirmCash = async function (id) {
  const r = allRentals.find(x => String(x.id) === String(id));
  const tagihan = r ? (Number(r.total_price) || 0) : 0;

  document.getElementById('cash-modal-tagihan').textContent = formatRp(tagihan);
  document.getElementById('cash-amount-input').value = '';
  openModal('cash-modal-overlay');

  document.getElementById('btn-submit-cash').onclick = async () => {
    const amountStr = document.getElementById('cash-amount-input').value;
    const amount = parseInt(amountStr.replace(/\D/g, ''), 10);

    if (isNaN(amount) || amount <= 0) {
      toast('Jumlah uang tidak valid.', 'error');
      return;
    }

    if (amount < tagihan) {
      toast(`Pembayaran Gagal: Uang yang dimasukkan (${formatRp(amount)}) KURANG dari tagihan (${formatRp(tagihan)}).`, 'error');
      return;
    } else if (amount > tagihan) {
      toast(`Informasi: Uang yang dimasukkan LEBIH. Kembalian: ${formatRp(amount - tagihan)}.`, 'warning');
    }

    const btn = document.getElementById('btn-submit-cash');
    btn.disabled = true;
    btn.textContent = 'Memproses...';

    // Coba ambil payment_id, jika tidak ada fallback ke reservation_id
    const paymentId = (r && r.payment && r.payment.id) ? r.payment.id : id;

    const res = await Rentals.cashConfirm(paymentId, amount);

    btn.disabled = false;
    btn.textContent = 'Konfirmasi Uang';

    if (res?.ok) {
      toast('Pembayaran cash berhasil dikonfirmasi!');
      
      // Auto-approve/confirm reservation immediately
      if (r) {
        const approveRes = await Rentals.approve(r.id);
        if (approveRes?.ok) {
          toast('Reservasi berhasil dikonfirmasi!');
          
          // Sinkronisasi status mobil ke database secara otomatis
          const cid = r.data_car_id || r.car_id || r.id_mobil || r.mobil_id || r.vehicle_id || r.id_kendaraan;
          const car = allCars.find(c => String(c.id) === String(cid));
          if (car) {
            setTimeout(async () => {
              const fd = new FormData();
              fd.append('_method', 'PUT'); // Explicitly add method spoofing in body
              const fields = ['name_car', 'plate_number', 'year_of_car', 'price', 'passenger_capacity', 'transmisi', 'kategori', 'model', 'description'];
              fields.forEach(f => {
                if (car[f]) fd.append(f, car[f]);
              });
              fd.append('availability_status', 'rented');
              fd.append('status', 'rented');

              await Cars.update(car.id, fd).catch(e => console.error('Gagal update status mobil:', e));
            }, 500);
          }
        } else {
          toast(approveRes?.data?.message || 'Gagal menyetujui reservasi secara otomatis.', 'error');
        }
      }

      closeModal('cash-modal-overlay');
      closeRentalDetail();
      loadRentals(rentalsPage);
    } else {
      toast(res?.data?.message || 'Gagal mengonfirmasi pembayaran cash.', 'error');
    }
  };
};

window.startReserv = async function (id) {
  const r = allRentals.find(x => String(x.id) === String(id));
  if (r) {
    const st3 = (r.payment_status || '').toLowerCase();
    const pm = (r.payment_method || (r.payment && r.payment.payment_method) || '').toLowerCase();
    // Aturan: Jika metode pembayaran cash/tunai dan masih pending, tidak bisa mulai sewa
    if ((pm === 'cash' || pm === 'tunai') && (st3 === 'pending_cash' || st3 === 'pending' || st3 === 'waiting' || st3 === 'unpaid')) {
      alert('Pelanggan belum melakukan pembayaran Cash. Harap konfirmasi pembayaran Cash terlebih dahulu sebelum memulai reservasi.');
      return;
    }
  }

  confirmAction('Mulai Reservasi', 'Apakah Anda yakin mobil sudah diserahkan dan reservasi dimulai?', async () => {
    const res = await Rentals.startReserv(id);
    if (res?.ok) {
      toast('Reservasi berhasil dimulai!');

      // Sinkronisasi status mobil ke database secara otomatis
      const r = allRentals.find(x => String(x.id) === String(id));
      if (r) {
        const car = r.car || r.mobil || {};
        const cid = car.id || r.data_car_id || r.car_id || r.id_mobil || r.mobil_id || r.vehicle_id;

        if (cid) {
          // Tunggu sebentar untuk memastikan backend selesai memproses startReserv
          // dan tidak terjadi race condition di database
          setTimeout(async () => {
            const fd = new FormData();
            fd.append('_method', 'PUT'); // Explicitly add method spoofing in body
            const fields = ['name_car', 'plate_number', 'year_of_car', 'price', 'passenger_capacity', 'transmisi', 'kategori', 'model', 'description'];
            fields.forEach(f => {
              if (car[f]) fd.append(f, car[f]);
            });
            fd.append('availability_status', 'rented');
            fd.append('status', 'rented');

            await Cars.update(cid, fd).catch(e => console.error('Gagal update status mobil:', e));
          }, 500);
        }
      }

      closeRentalDetail();
      loadRentals(rentalsPage);
    } else {
      toast(res?.data?.message || 'Gagal memulai reservasi.', 'error');
    }
  }, false);
};

window.endReserv = async function (id) {
  const r = allRentals.find(x => x.id === id);
  if (!r) return;

  const endDate = new Date(r.end_date);
  endDate.setHours(23, 59, 59, 999);
  const today = new Date();

  let title = 'Selesai Reservasi';
  let msg = 'Apakah Anda yakin mobil sudah dikembalikan dan reservasi diselesaikan?';
  let danger = false;

  if (today > endDate) {
    const diffTime = today.getTime() - endDate.getTime();
    const lateDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let pricePerDay = 0;
    if (r.car && (r.car.price_per_day || r.car.price)) {
      pricePerDay = Number(r.car.price_per_day || r.car.price);
    } else if (r.total_price) {
      // Perkiraan kasar jika data mobil tidak ikut terbawa
      const startD = new Date(r.start_date);
      const days = Math.ceil(Math.abs(endDate - startD) / (1000 * 60 * 60 * 24)) || 1;
      pricePerDay = Math.round(r.total_price / days);
    }

    const fine = lateDays * pricePerDay;
    title = 'Peringatan Keterlambatan!';
    danger = true;
    msg = `Peringatan: Pelanggan TELAT mengembalikan mobil selama ${lateDays} hari!\n\n`;
    if (fine > 0) {
      msg += `Estimasi Denda Keterlambatan: Rp ${fine.toLocaleString('id-ID')}\n\n`;
    }
    msg += `Pastikan denda telah dibayarkan oleh pelanggan sebelum menekan tombol Lanjutkan.`;
  }

  confirmAction(title, msg, async () => {
    const res = await Rentals.endReserv(id);
    if (res?.ok) {
      toast('Reservasi berhasil diselesaikan!');

      // Sinkronisasi status mobil ke database secara otomatis
      if (r) {
        const car = r.car || r.mobil || {};
        const cid = car.id || r.data_car_id || r.car_id || r.id_mobil || r.mobil_id || r.vehicle_id;

        if (cid) {
          setTimeout(async () => {
            const fd = new FormData();
            fd.append('_method', 'PUT');
            const fields = ['name_car', 'plate_number', 'year_of_car', 'price', 'passenger_capacity', 'transmisi', 'kategori', 'model', 'description'];
            fields.forEach(f => {
              if (car[f]) fd.append(f, car[f]);
            });
            fd.append('availability_status', 'available');
            fd.append('status', 'available');

            await Cars.update(cid, fd).catch(e => console.error('Gagal update status mobil:', e));
          }, 500);
        }
      }

      closeRentalDetail();
      loadRentals(rentalsPage);
    } else {
      toast(res?.data?.message || 'Gagal menyelesaikan reservasi.', 'error');
    }
  }, danger);
};

window.approveRefund = async function (id) {
  confirmAction('Konfirmasi Refund', 'Apakah Anda sudah mengembalikan dana pelanggan dan ingin mengonfirmasi refund ini?', async () => {
    const res = await Rentals.approveRefund(id);
    if (res?.ok) {
      toast('Refund berhasil dikonfirmasi!');
      closeRentalDetail();
      loadRentals(rentalsPage);
    } else {
      toast(res?.data?.message || 'Gagal mengonfirmasi refund.', 'error');
    }
  }, false);
};

window.loadRentals = loadRentals;

// ===== REALTIME SILENT POLLING =====
if (window.rentalsPollTimer) clearInterval(window.rentalsPollTimer);
window.rentalsPollTimer = setInterval(() => {
  const page = document.getElementById('rentals-page');
  // Hanya polling jika halaman reservasi sedang aktif/terbuka
  if (page && page.style.display !== 'none') {
    loadRentals(rentalsPage, true);
  }
}, 10000); // 10 detik sekali

window.globalRentals = allRentals;
