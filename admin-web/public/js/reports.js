/* ===== REPORTS MODULE ===== */
let chartReportsIncome = null;
let reportsFiltersSetup = false;

function setupReportsFilters() {
  if (reportsFiltersSetup) return;
  reportsFiltersSetup = true;
  
  const startF = document.getElementById('report-filter-start');
  const endF = document.getElementById('report-filter-end');
  const clearBtn = document.getElementById('btn-clear-report-dates');
  
  if (startF) startF.onchange = () => loadReports();
  if (endF) endF.onchange = () => loadReports();
  if (clearBtn) {
    clearBtn.onclick = () => {
      if (startF) startF.value = '';
      if (endF) endF.value = '';
      loadReports();
    };
  }
}

async function loadReports() {
  setupReportsFilters();
  document.getElementById('rep-stat-total-income').textContent = 'Loading...';
  
  const carsRes = await Cars.listAll();
  let rentalsRes = await Rentals.listAll();
  if (!rentalsRes || !rentalsRes.ok) {
    rentalsRes = await Rentals.list();
  }
  
  const cars = extractList(carsRes);
  const rentals = extractList(rentalsRes);
  
  // Apply date filters
  const startFilter = document.getElementById('report-filter-start')?.value || '';
  const endFilter = document.getElementById('report-filter-end')?.value || '';
  
  let filteredRentals = rentals;
  if (startFilter) {
    filteredRentals = filteredRentals.filter(r => {
      const rStart = r.start_date ? r.start_date.split(' ')[0] : '';
      return rStart >= startFilter;
    });
  }
  if (endFilter) {
    filteredRentals = filteredRentals.filter(r => {
      const rStart = r.start_date ? r.start_date.split(' ')[0] : '';
      return rStart <= endFilter;
    });
  }
  
  // Calculate summary stats
  let totalIncome = 0;
  let activeRentals = 0;
  let cancelledRentals = 0;
  
  filteredRentals.forEach(r => {
    const st = (r.status || r.reservations_status || r.payment_status || '').toLowerCase();
    const isCancelled = st === 'cancelled' || st.includes('batal') || st === 'failed';
    const isCompleted = st === 'completed' || st.includes('selesai');
    const isOngoing = st === 'active' || st === 'ongoing' || st === 'on-going' || st === 'sedang disewa' || st.includes('jalan');
    const isApproved = st === 'approved' || st === 'confirmed' || st.includes('konfirmasi') || st.includes('disetujui') || st.includes('lunas') || st.includes('paid');
    
    if (isCancelled) {
      cancelledRentals++;
    } else if (isOngoing) {
      activeRentals++;
    }
    
    // Revenue is counted from paid, approved, active, or completed rentals
    if (isCompleted || isOngoing || isApproved) {
      totalIncome += Number(r.total_price || r.price || 0);
    }
  });
  
  // Animate/Render values
  document.getElementById('rep-stat-total-income').textContent = formatRp(totalIncome);
  document.getElementById('rep-stat-total-transactions').textContent = filteredRentals.length;
  document.getElementById('rep-stat-active-rentals').textContent = activeRentals;
  document.getElementById('rep-stat-cancelled-rentals').textContent = cancelledRentals;
  
  // Render monthly charts
  renderReportsChart(filteredRentals);
  
  // Render per-car performance
  renderCarsPerformance(cars, filteredRentals);
}

function renderReportsChart(rentals) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
  
  // Get last 6 months labels and calculate revenue
  const monthlyRevenue = [];
  const monthlyLabels = [];
  
  const today = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    monthlyLabels.push(months[d.getMonth()] + ' ' + d.getFullYear());
    
    // Sum revenue for this month
    let sum = 0;
    rentals.forEach(r => {
      const st = (r.status || r.reservations_status || r.payment_status || '').toLowerCase();
      const isCancelled = st === 'cancelled' || st.includes('batal') || st === 'failed';
      
      if (!isCancelled) {
        const rd = new Date(r.created_at || r.start_date || '');
        if (rd.getFullYear() === d.getFullYear() && rd.getMonth() === d.getMonth()) {
          sum += Number(r.total_price || r.price || 0);
        }
      }
    });
    monthlyRevenue.push(sum);
  }
  
  const ctx = document.getElementById('chart-reports-income').getContext('2d');
  if (chartReportsIncome) chartReportsIncome.destroy();
  
  // Create beautiful gradient background
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, 'rgba(34, 197, 94, 0.3)');
  gradient.addColorStop(1, 'rgba(34, 197, 94, 0.0)');
  
  chartReportsIncome = new Chart(ctx, {
    type: 'line',
    data: {
      labels: monthlyLabels,
      datasets: [{
        label: 'Pendapatan',
        data: monthlyRevenue,
        borderColor: '#22c55e',
        backgroundColor: gradient,
        borderWidth: 3,
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#22c55e',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              return ' Pendapatan: ' + formatRp(context.raw);
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return formatRpShort(value);
            }
          }
        }
      }
    }
  });
}

function renderCarsPerformance(cars, rentals) {
  const tbody = document.getElementById('rep-cars-tbody');
  
  if (!cars.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:#94a3b8">Tidak ada data armada</td></tr>';
    return;
  }
  
  // Aggregate data per car
  const list = cars.map(c => {
    let countTrans = 0;
    let totalDays = 0;
    let revenue = 0;
    
    rentals.forEach(r => {
      const cid = r.data_car_id || r.car_id || r.id_mobil || r.mobil_id || r.vehicle_id || r.id_kendaraan;
      if (String(cid) !== String(c.id)) return;
      
      const st = (r.status || r.reservations_status || r.payment_status || '').toLowerCase();
      const isCancelled = st === 'cancelled' || st.includes('batal') || st === 'failed';
      
      if (!isCancelled) {
        countTrans++;
        revenue += Number(r.total_price || r.price || 0);
        
        // Calculate days between start and end
        const start = new Date(r.start_date);
        const end = new Date(r.end_date);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
        totalDays += diffDays;
      }
    });
    
    return {
      car: c,
      countTrans,
      totalDays,
      revenue
    };
  });
  
  // Sort descending by revenue
  list.sort((a, b) => b.revenue - a.revenue);
  
  tbody.innerHTML = list.map(item => {
    const c = item.car;
    return `
      <tr>
        <td>
          <div style="font-weight: 600; color: var(--text-main);">${c.name_car || c.name || '-'}</div>
          <div style="font-size: 11px; color: var(--text-sub);">${c.model || '-'}</div>
        </td>
        <td><code style="background:#f1f5f9;padding:2px 8px;border-radius:6px;font-size:12px;">${c.plate_number || '-'}</code></td>
        <td>${c.kategori || '-'}</td>
        <td style="font-weight: 600; color: var(--text-sub);">${formatRp(c.price)}</td>
        <td style="text-align: center; font-weight: 600;">${item.countTrans}</td>
        <td style="text-align: center; font-weight: 600;">${item.totalDays} Hari</td>
        <td style="font-weight: 700; color: #22c55e;">${formatRp(item.revenue)}</td>
      </tr>
    `;
  }).join('');
}

function formatRpShort(value) {
  if (value === 0) return 'Rp 0';
  if (value >= 1e6) return 'Rp ' + (value / 1e6).toFixed(1) + 'M';
  if (value >= 1e3) return 'Rp ' + (value / 1e3).toFixed(0) + 'K';
  return 'Rp ' + value;
}

window.printReport = function() {
  window.print();
};

window.loadReports = loadReports;
