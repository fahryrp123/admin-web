<!DOCTYPE html>
<html lang="id">
<head>
  <style>
    html { display: none; }
  </style>
  <script>
    let token = localStorage.getItem('smy_token');
    let userStr = localStorage.getItem('smy_user');
    let isAdmin = false;
    try {
      if (token) {
        let payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role === 'admin' || payload.role === 'Admin') {
          isAdmin = true;
        }
      }
    } catch(e) {}

    if (!token || !isAdmin) {
      localStorage.removeItem('smy_token');
      localStorage.removeItem('smy_user');
      document.cookie = 'smy_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      window.location.href = '/login';
    } else {
      document.documentElement.style.display = 'block';
    }
  </script>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Admin Dashboard – SewaMobilYuk</title>
  <meta name="description" content="Panel admin SewaMobilYuk – kelola armada, reservasi, dan pelanggan rental mobil."/>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>
  <link href="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css" rel="stylesheet"/>
  <link rel="stylesheet" href="{{ asset('css/admin.css') }}"/>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <script src="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js"></script>
  <style>
    /* ── TRACKER CARDS ── */
    .tracker-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 12px 14px;
      transition: all .2s ease;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    .tracker-card:hover { 
      background: #f8fafc; 
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
      transform: translateY(-1px);
    }
    .tracker-card.tracker-online  { border-left: 4px solid #22c55e; }
    .tracker-card.tracker-offline { border-left: 4px solid #ef4444; }
    .tracker-card.tracker-selected { border-color: #3b82f6; background: #eff6ff; box-shadow: 0 4px 12px rgba(59,130,246,0.15); }
    .tracker-card-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 6px;
    }
    .tracker-name {
      display: flex; align-items: center; gap: 7px;
      font-size: 13px; font-weight: 600; color: #1e293b;
    }
    .tracker-dot {
      width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
    }
    .dot-green  { background: #22c55e; animation: pulse-g 1.5s infinite; }
    .dot-red    { background: #ef4444; }
    .dot-yellow { background: #eab308; }
    @keyframes pulse-g {
      0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,.5); }
      50%      { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
    }
    .tracker-status-badge {
      font-size: 10px; padding: 2px 8px; border-radius: 99px; font-weight: 600;
    }
    .tracker-card-body { font-size: 11px; color: #475569; }
    .tracker-meta { display: flex; justify-content: space-between; }

    /* ── MAP MARKER ICONS (REDESIGN) ── */
    .map-tracker-icon {
      width: 44px; height: 44px;
      display: flex; align-items: center; justify-content: center;
      position: relative;
    }
    .tracker-core {
      width: 26px; height: 26px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      position: relative;
      z-index: 2;
      border: 2px solid white;
    }
    .map-icon-online .tracker-core { background: #10b981; } /* Emerald */
    .map-icon-offline .tracker-core { background: #ef4444; } /* Red */
    .map-icon-playback .tracker-core { background: #eab308; } /* Gold */
    .tracker-core svg { width: 14px; height: 14px; fill: white; }
    
    .tracker-arrow {
      position: absolute;
      top: -4px; left: 50%;
      transform: translateX(-50%);
      width: 0; height: 0;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      z-index: 1;
    }
    .map-icon-online .tracker-arrow { border-bottom: 12px solid #10b981; }
    .map-icon-offline .tracker-arrow { border-bottom: 12px solid #ef4444; }
    .map-icon-playback .tracker-arrow { border-bottom: 12px solid #eab308; }

    .map-ping-ring {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 26px; height: 26px;
      border-radius: 50%;
      border: 2px solid #10b981;
      animation: ping-anim 2s cubic-bezier(0, 0, 0.2, 1) infinite;
      z-index: 0;
    }
    @keyframes ping-anim {
      0%   { transform: translate(-50%,-50%) scale(1); opacity: 0.8; }
      100% { transform: translate(-50%,-50%) scale(2.5); opacity: 0; }
    }

    /* ── POPUP FIXES ── */
    .maplibregl-popup-content {
      padding: 16px;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      border: none;
    }
    .maplibregl-popup-close-button {
      font-size: 24px;
      color: #94a3b8;
      right: 8px;
      top: 8px;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .maplibregl-popup-close-button:hover {
      background: #ef4444;
      color: white;
    }
    .maplibregl-popup-close-button:focus { outline: none; }

    /* ── GENERATE TOKEN MODAL ── */
    .gen-url-box {
      background: #0d0d16;
      border: 1px solid #2a3150;
      border-radius: 10px;
      padding: 12px;
      font-family: monospace;
      font-size: 11px;
      color: #94a3b8;
      word-break: break-all;
      margin-top: 12px;
    }
    .gen-url-box a { color: #3b82f6; }
  </style>
</head>
<body>

<!-- ====== SIDEBAR OVERLAY ====== -->
<div class="sidebar-overlay" id="sidebar-overlay"></div>

<!-- ====== LAYOUT ====== -->
<div class="admin-layout">

  <!-- SIDEBAR -->
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-brand">
      <img src="{{ asset('logo-baru.png') }}" alt="Logo" class="sidebar-logo-img" />
      <div>
        <div class="sidebar-brand-name">SewaMobilYuk</div>
        <div class="sidebar-brand-sub">Admin Panel</div>
      </div>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-section-label">Utama</div>
      <button class="nav-item active" data-page="dashboard" id="nav-dashboard">
        <span class="nav-icon"><i class="fas fa-th-large"></i></span>
        Dashboard
      </button>

      <div class="nav-section-label">Armada</div>
      <button class="nav-item" data-page="cars" id="nav-cars">
        <span class="nav-icon"><i class="fas fa-car-side"></i></span>
        Kelola Mobil
      </button>
      <button class="nav-item" data-page="tracking" id="nav-tracking">
        <span class="nav-icon"><i class="fas fa-map-marked-alt"></i></span>
        Tracking Kendaraan
      </button>

      <div class="nav-section-label">Transaksi</div>
      <button class="nav-item" data-page="rentals" id="nav-rentals">
        <span class="nav-icon"><i class="fas fa-calendar-check"></i></span>
        Reservasi
        <span class="badge" id="pending-badge" style="display:none">0</span>
      </button>
      <button class="nav-item" data-page="reports" id="nav-reports">
        <span class="nav-icon"><i class="fas fa-file-invoice-dollar"></i></span>
        Laporan Keuangan
      </button>

      <div class="nav-section-label">Pengguna</div>
      <button class="nav-item" data-page="customers" id="nav-customers">
        <span class="nav-icon"><i class="fas fa-users"></i></span>
        Pelanggan
      </button>

      <div class="nav-section-label">Akun</div>
      <button class="nav-item" data-page="profile" id="nav-profile">
        <span class="nav-icon"><i class="fas fa-user-cog"></i></span>
        Profil Admin
      </button>
    </nav>

    <div class="sidebar-footer">
      <div class="sidebar-user">
        <div class="sidebar-avatar" id="sidebar-avatar">A</div>
        <div>
          <div class="sidebar-user-name" id="sidebar-uname">Admin</div>
          <div class="sidebar-user-role">Administrator</div>
        </div>
        <button class="btn-logout" id="btn-logout" title="Keluar">
          <i class="fas fa-sign-out-alt"></i>
        </button>
      </div>
    </div>
  </aside>

  <!-- MAIN -->
  <main class="main-content">
    <!-- TOPBAR -->
    <header class="topbar">
      <button class="topbar-toggle" id="topbar-toggle"><i class="fas fa-bars"></i></button>
      <div class="topbar-title" id="topbar-title">Dashboard</div>
      <div class="topbar-actions">
        <div class="topbar-date" id="topbar-date"></div>
      </div>
    </header>

    <!-- PAGES -->
    <div class="page-content">

      <!-- ===== DASHBOARD PAGE ===== -->
      <div class="page active" id="page-dashboard">
        <div class="page-header">
          <div class="page-header-left">
            <h1>Dashboard</h1>
            <p>Ringkasan aktivitas bisnis rental mobil Anda</p>
          </div>
        </div>

        <!-- Stats -->
        <div class="stats-grid" id="stats-grid">
          <div class="stat-card">
            <div class="stat-icon orange"><i class="fas fa-car"></i></div>
            <div>
              <div class="stat-value" id="stat-cars">–</div>
              <div class="stat-label">Total Armada</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon green"><i class="fas fa-key"></i></div>
            <div>
              <div class="stat-value" id="stat-active">–</div>
              <div class="stat-label">Sedang Disewa</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon yellow"><i class="fas fa-clock"></i></div>
            <div>
              <div class="stat-value" id="stat-pending">–</div>
              <div class="stat-label">Menunggu Konfirmasi</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon blue"><i class="fas fa-users"></i></div>
            <div>
              <div class="stat-value" id="stat-users">–</div>
              <div class="stat-label">Total Pelanggan</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon cyan"><i class="fas fa-calendar-check"></i></div>
            <div>
              <div class="stat-value" id="stat-rentals">–</div>
              <div class="stat-label">Total Transaksi</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon red"><i class="fas fa-check-double"></i></div>
            <div>
              <div class="stat-value" id="stat-completed">–</div>
              <div class="stat-label">Selesai</div>
            </div>
          </div>
        </div>

        <!-- Charts + Recent -->
        <div class="dashboard-grid">
          <div class="card">
            <div class="card-header">
              <div>
                <div class="card-title">Tren Reservasi</div>
                <div class="card-subtitle">7 hari terakhir</div>
              </div>
            </div>
            <div class="card-body">
              <div class="chart-container">
                <canvas id="chart-trend"></canvas>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <div>
                <div class="card-title">Status Armada</div>
                <div class="card-subtitle">Distribusi kendaraan</div>
              </div>
            </div>
            <div class="card-body">
              <div class="chart-container" style="height:220px;">
                <canvas id="chart-fleet"></canvas>
              </div>
            </div>
          </div>

          <div class="card col-full">
            <div class="card-header">
              <div class="card-title">Reservasi Terbaru</div>
              <button class="btn btn-secondary btn-sm" onclick="navigate('rentals')">Lihat Semua</button>
            </div>
            <div class="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Pelanggan</th>
                    <th>Mobil</th>
                    <th>Tanggal Sewa</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody id="recent-rentals-body">
                  <tr><td colspan="5" style="text-align:center;padding:24px;color:#94a3b8">Memuat data...</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div><!-- /dashboard -->

      <!-- ===== CARS PAGE ===== -->
      <div class="page" id="page-cars">
        <div class="page-header">
          <div class="page-header-left">
            <h1>Kelola Mobil</h1>
            <p>Manajemen armada kendaraan rental</p>
          </div>
          <div class="page-header-actions">
            <button class="btn btn-primary" id="btn-add-car">
              <i class="fas fa-plus"></i> Tambah Mobil
            </button>
          </div>
        </div>

        <!-- Mini Dashboard untuk Kelola Mobil -->
        <div class="stats-grid" style="margin-bottom: 24px;">
          <div class="stat-card">
            <div class="stat-icon blue"><i class="fas fa-car-side"></i></div>
            <div>
              <div class="stat-value" id="cars-stat-total">–</div>
              <div class="stat-label">Total Armada</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon green"><i class="fas fa-check-circle"></i></div>
            <div>
              <div class="stat-value" id="cars-stat-avail">–</div>
              <div class="stat-label">Tersedia</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon orange"><i class="fas fa-key"></i></div>
            <div>
              <div class="stat-value" id="cars-stat-rented">–</div>
              <div class="stat-label">Disewa</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon red"><i class="fas fa-tools"></i></div>
            <div>
              <div class="stat-value" id="cars-stat-maint">–</div>
              <div class="stat-label">Servis</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="toolbar">
            <div class="search-box">
              <i class="fas fa-search"></i>
              <input type="text" id="car-search" placeholder="Cari nama/merk mobil..."/>
            </div>
            <select class="filter-select" id="car-status-filter">
              <option value="">Semua Status</option>
              <option value="available">Tersedia</option>
              <option value="rented">Disewa</option>
              <option value="maintenance">Servis</option>
            </select>
            <select class="filter-select" id="car-category-filter">
              <option value="">Semua Kategori</option>
            </select>
            <div class="view-toggle" style="display: flex; gap: 4px; margin-left: auto;">
              <button class="btn btn-secondary btn-icon active" id="btn-view-table" onclick="toggleCarView('table')" title="Tampilan Tabel"><i class="fas fa-list"></i></button>
              <button class="btn btn-secondary btn-icon" id="btn-view-grid" onclick="toggleCarView('grid')" title="Tampilan Kartu"><i class="fas fa-th-large"></i></button>
            </div>
          </div>
          <div class="table-wrapper" style="position:relative">
            <div id="cars-loading" class="loading-overlay" style="display:none"><div class="spinner"></div></div>
            <table>
              <thead>
                <tr>
                  <th>Kendaraan</th>
                  <th>Plat Nomor</th>
                  <th>Kategori</th>
                  <th>Harga/Hari</th>
                  <th>Tahun</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody id="cars-body">
                <tr><td colspan="7" style="text-align:center;padding:40px;color:#94a3b8">Memuat data...</td></tr>
              </tbody>
            </table>
          </div>
          
          <!-- Grid Container for Card View -->
          <div id="cars-grid-wrapper" class="cars-grid" style="display:none; padding: 20px;">
             <!-- Cards akan dirender di sini via JS -->
          </div>
          
          <div class="pagination" id="cars-pagination"></div>
        </div>
      </div><!-- /cars -->

      <!-- ===== RENTALS PAGE ===== -->
      <div class="page" id="page-rentals">
        <div class="page-header">
          <div class="page-header-left">
            <h1>Manajemen Reservasi</h1>
            <p>Kelola semua pemesanan dan status sewa</p>
          </div>
        </div>

        <!-- Mini Dashboard untuk Reservasi -->
        <div class="stats-grid" style="margin-bottom: 24px;">
          <div class="stat-card">
            <div class="stat-icon blue"><i class="fas fa-calendar-day"></i></div>
            <div>
              <div class="stat-value" id="rentals-stat-today">–</div>
              <div class="stat-label">Reservasi Hari Ini</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon orange"><i class="fas fa-clock"></i></div>
            <div>
              <div class="stat-value" id="rentals-stat-pending">–</div>
              <div class="stat-label">Perlu Konfirmasi</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon green"><i class="fas fa-car"></i></div>
            <div>
              <div class="stat-value" id="rentals-stat-active">–</div>
              <div class="stat-label">Mobil Sedang Jalan</div>
            </div>
          </div>

        </div>

        <!-- Filter tabs -->
        <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;">
          <button class="btn btn-primary btn-sm rental-tab active" data-status="">Semua</button>
          <button class="btn btn-secondary btn-sm rental-tab" data-status="pending">Menunggu</button>
          <button class="btn btn-secondary btn-sm rental-tab" data-status="approved">Disetujui</button>
          <button class="btn btn-secondary btn-sm rental-tab" data-status="active">Aktif</button>
          <button class="btn btn-secondary btn-sm rental-tab" data-status="completed">Selesai</button>
          <button class="btn btn-secondary btn-sm rental-tab" data-status="cancelled">Dibatalkan</button>
          <button class="btn btn-secondary btn-sm rental-tab" data-status="rejected">Ditolak</button>
        </div>

        <div class="card">
          <div class="toolbar">
            <div class="search-box">
              <i class="fas fa-search"></i>
              <input type="text" id="rental-search" placeholder="Cari nama pelanggan / kode..."/>
            </div>
            <div style="display:flex; align-items:center; gap:8px; margin-left:12px; flex-wrap:wrap;">
              <span style="font-size:12px; font-weight:600; color:var(--text-muted)">Dari:</span>
              <input type="date" id="rental-filter-start" class="form-control" style="width:auto; padding:6px 12px; height:auto;"/>
              <span style="font-size:12px; font-weight:600; color:var(--text-muted)">Sampai:</span>
              <input type="date" id="rental-filter-end" class="form-control" style="width:auto; padding:6px 12px; height:auto;"/>
              <button class="btn btn-secondary btn-sm" id="btn-clear-rental-dates" title="Reset Tanggal" style="padding: 6px 10px;"><i class="fas fa-undo"></i> Reset</button>
            </div>
          </div>
          <div class="table-wrapper" style="position:relative">
            <div id="rentals-loading" class="loading-overlay" style="display:none"><div class="spinner"></div></div>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Pelanggan</th>
                  <th>Kendaraan</th>
                  <th>Mulai</th>
                  <th>Selesai</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody id="rentals-body">
                <tr><td colspan="8" style="text-align:center;padding:40px;color:#94a3b8">Memuat data...</td></tr>
              </tbody>
            </table>
          </div>
          <div class="pagination" id="rentals-pagination"></div>
        </div>
      </div><!-- /rentals -->

      <!-- ===== TRACKING PAGE ===== -->
      <div class="page" id="page-tracking">
        <div class="page-header">
          <div class="page-header-left">
            <h1>Tracking Kendaraan</h1>
            <p>Pemantauan posisi HP tersembunyi di dalam mobil secara real-time</p>
          </div>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-secondary" id="btn-gen-tracker" onclick="openGenerateTokenModal()">
              <i class="fas fa-qrcode"></i> Setup HP Tracker
            </button>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:320px 1fr;gap:16px;height:calc(100vh - 220px);min-height:400px;">
          <!-- Sidebar kiri -->
          <div style="display:flex;flex-direction:column;gap:16px;height:100%;min-height:0;">
            <div class="card" style="flex:1;display:flex;flex-direction:column;overflow:hidden;min-height:0;">
              <div class="card-header" style="flex-shrink:0;">
                <div class="card-title"><i class="fas fa-satellite-dish" style="color:#64748b;margin-right:8px;"></i> HP Tracker Aktif</div>
              </div>
              <div id="tracking-list" style="padding:8px;display:flex;flex-direction:column;gap:8px;overflow-y:auto;flex:1;min-height:0;">
                <div style="text-align:center;padding:20px;color:#94a3b8">Memuat...</div>
              </div>
            </div>

            <!-- Stats kecil -->
            <div class="card" style="flex-shrink:0;">
              <div class="card-title" style="padding:14px 16px 0;"><i class="fas fa-chart-pie" style="color:#64748b;margin-right:8px;"></i> Ringkasan</div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:1px;background:#e2e8f0;margin:12px 0 0;">
                <div style="background:#ffffff;padding:12px 14px;">
                  <div style="font-size:11px;color:#64748b;">Online</div>
                  <div style="font-size:22px;font-weight:800;color:#22c55e;" id="stat-tracker-online">–</div>
                </div>
                <div style="background:#ffffff;padding:12px 14px;">
                  <div style="font-size:11px;color:#64748b;">Offline</div>
                  <div style="font-size:22px;font-weight:800;color:#ef4444;" id="stat-tracker-offline">–</div>
                </div>
              </div>
              <div style="padding:10px 14px;font-size:11px;color:#64748b;text-align:center;background:#ffffff;border-top:1px solid #e2e8f0;" id="tracker-last-update">
                Auto-refresh setiap 10 detik
              </div>
            </div>
          </div>

          <!-- Peta -->
          <div class="card" style="display:flex;flex-direction:column;height:100%;isolation:isolate;">
            <div class="card-header" style="flex-shrink:0;">
              <div class="card-title"><i class="fas fa-map-marked-alt" style="color:#64748b;margin-right:8px;"></i> Peta Real-Time</div>
              <div style="font-size:12px;color:#94a3b8;display:flex;align-items:center;gap:8px;">
                <span style="display:inline-flex;align-items:center;gap:4px;"><span class="tracker-dot dot-green"></span>Online</span>
                <span style="display:inline-flex;align-items:center;gap:4px;"><span class="tracker-dot dot-red"></span>Offline</span>
              </div>
            </div>
            <div class="card-body" style="padding:16px;flex:1;display:flex;flex-direction:column;position:relative;">
              <div id="map" style="flex:1;width:100%;min-height:0;border-radius:8px;"></div>
              
              <!-- TRIP PLAYBACK UI -->
              <div id="playback-panel" style="display:none; position:absolute; top:20px; left:20px; background:rgba(19,19,26,0.85); border:1px solid #3b82f6; border-radius:12px; padding:12px 20px; box-shadow:0 8px 32px rgba(0,0,0,0.5); backdrop-filter:blur(8px); z-index:999; color:white; min-width:340px;">
                <div style="font-size:12px; font-weight:600; color:#94a3b8; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
                  <span id="pb-car-name"><i class="fas fa-route" style="color:#3b82f6;"></i> Trip Playback</span>
                  <button onclick="closePlayback()" style="background:none; border:none; color:#ef4444; cursor:pointer;" title="Tutup Playback"><i class="fas fa-times"></i></button>
                </div>
                <div style="display:flex; align-items:center; gap:16px;">
                  <button id="pb-play-btn" onclick="togglePlayback()" style="width:40px; height:40px; border-radius:50%; background:linear-gradient(135deg, #3b82f6, #2563eb); border:none; color:white; cursor:pointer; flex-shrink:0; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(59,130,246,0.4);"><i class="fas fa-play"></i></button>
                  <div style="flex:1;">
                    <input type="range" id="pb-slider" min="0" max="100" value="0" style="width:100%; cursor:pointer;" disabled>
                    <div style="font-size:11px; color:#e2e8f0; margin-top:6px; text-align:center; font-family:monospace;" id="pb-time-label">Memuat Rute...</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div><!-- /tracking -->

      <!-- ===== CUSTOMERS PAGE ===== -->
      <div class="page" id="page-customers">
        <div class="page-header">
          <div class="page-header-left">
            <h1>Data Pelanggan</h1>
            <p>Kelola pengguna dan riwayat sewa mereka</p>
          </div>
        </div>

        <div class="card">
          <div class="toolbar">
            <div class="search-box">
              <i class="fas fa-search"></i>
              <input type="text" id="customer-search" placeholder="Cari nama / email pelanggan..."/>
            </div>
          </div>
          <div class="table-wrapper" style="position:relative">
            <div id="customers-loading" class="loading-overlay" style="display:none"><div class="spinner"></div></div>
            <table>
              <thead>
                <tr>
                  <th>Pelanggan</th>
                  <th>Email</th>
                  <th>Bergabung</th>
                  <th>Total Sewa</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody id="customers-body">
                <tr><td colspan="6" style="text-align:center;padding:40px;color:#94a3b8">Memuat data...</td></tr>
              </tbody>
            </table>
          </div>
          <div class="pagination" id="customers-pagination"></div>
        </div>
      </div><!-- /customers -->

      <!-- ===== REPORTS PAGE ===== -->
      <div class="page" id="page-reports">
        <div class="page-header">
          <div class="page-header-left">
            <h1>Laporan Keuangan</h1>
            <p>Analisis pendapatan, transaksi, dan performa armada</p>
          </div>
          <div class="page-header-actions">
            <button class="btn btn-primary" onclick="window.printReport()">
              <i class="fas fa-print"></i> Cetak Laporan
            </button>
          </div>
        </div>

        <!-- Filter Card -->
        <div class="card" style="margin-bottom: 24px;">
          <div class="toolbar" style="padding: 14px 20px;">
            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
              <span style="font-size:12px; font-weight:600; color:var(--text-muted)"><i class="fas fa-filter"></i> Filter Tanggal Sewa:</span>
              <span style="font-size:12px; font-weight:600; color:var(--text-muted); margin-left:8px;">Dari</span>
              <input type="date" id="report-filter-start" class="form-control" style="width:auto; padding:6px 12px; height:auto;"/>
              <span style="font-size:12px; font-weight:600; color:var(--text-muted)">Sampai</span>
              <input type="date" id="report-filter-end" class="form-control" style="width:auto; padding:6px 12px; height:auto;"/>
              <button class="btn btn-secondary btn-sm" id="btn-clear-report-dates" title="Reset Tanggal" style="padding: 6px 10px;"><i class="fas fa-undo"></i> Reset</button>
            </div>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="stats-grid" style="margin-bottom: 24px;">
          <div class="stat-card">
            <div class="stat-icon green"><i class="fas fa-wallet"></i></div>
            <div>
              <div class="stat-value" id="rep-stat-total-income">Rp 0</div>
              <div class="stat-label">Total Pendapatan</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon blue"><i class="fas fa-calendar-check"></i></div>
            <div>
              <div class="stat-value" id="rep-stat-total-transactions">0</div>
              <div class="stat-label">Total Transaksi</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon orange"><i class="fas fa-key"></i></div>
            <div>
              <div class="stat-value" id="rep-stat-active-rentals">0</div>
              <div class="stat-label">Penyewaan Aktif</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon red"><i class="fas fa-times-circle"></i></div>
            <div>
              <div class="stat-value" id="rep-stat-cancelled-rentals">0</div>
              <div class="stat-label">Transaksi Batal</div>
            </div>
          </div>
        </div>

        <div class="dashboard-grid">
          <!-- Monthly Chart -->
          <div class="card col-full">
            <div class="card-header">
              <div class="card-title">Grafik Pendapatan Reservasi</div>
              <div class="card-subtitle">Visualisasi tren pendapatan bulanan dari transaksi reservasi</div>
            </div>
            <div class="card-body">
              <div class="chart-container" style="height: 300px; position: relative;">
                <canvas id="chart-reports-income"></canvas>
              </div>
            </div>
          </div>

          <!-- Per-Car Income Report -->
          <div class="card col-full">
            <div class="card-header">
              <div class="card-title">Performa & Pendapatan per Armada</div>
              <div class="card-subtitle">Detail total pendapatan yang dihasilkan oleh setiap unit mobil</div>
            </div>
            <div class="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Mobil</th>
                    <th>Plat Nomor</th>
                    <th>Kategori</th>
                    <th>Harga/Hari</th>
                    <th>Jumlah Transaksi</th>
                    <th>Total Hari Sewa</th>
                    <th>Total Pendapatan</th>
                  </tr>
                </thead>
                <tbody id="rep-cars-tbody">
                  <tr><td colspan="7" style="text-align:center;padding:24px;color:#94a3b8">Memuat data...</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div><!-- /reports -->

      <!-- ===== PROFILE PAGE ===== -->
      <div class="page" id="page-profile">
        <div class="page-header">
          <div class="page-header-left">
            <h1>Profil Admin</h1>
            <p>Informasi akun administrator</p>
          </div>
        </div>
        <div style="max-width:600px;">
          <div class="card" style="margin-bottom:16px;">
            <div class="card-body" style="display:flex;align-items:center;gap:20px;">
              <div style="width:80px;height:80px;border-radius:20px;background:linear-gradient(135deg,#f97316,#ea580c);display:flex;align-items:center;justify-content:center;color:white;font-size:32px;font-weight:800;" id="profile-avatar-big">A</div>
              <div>
                <div style="font-size:20px;font-weight:700;color:#1e293b;" id="profile-name">–</div>
                <div style="font-size:13px;color:#64748b;" id="profile-email">–</div>
                <div style="margin-top:6px;"><span class="badge badge-orange"><i class="fas fa-shield-alt"></i>Administrator</span></div>
              </div>
            </div>
          </div>
          <div class="card">
            <div class="card-header"><div class="card-title">Informasi Akun</div></div>
            <div class="card-body">
              <table style="width:100%;">
                <tr style="border-bottom:1px solid #e2e8f0;">
                  <td style="padding:12px 0;font-size:13px;color:#64748b;width:40%;">Nama Lengkap</td>
                  <td style="padding:12px 0;font-size:13px;font-weight:600;" id="pi-name">–</td>
                </tr>
                <tr style="border-bottom:1px solid #e2e8f0;">
                  <td style="padding:12px 0;font-size:13px;color:#64748b;">Email</td>
                  <td style="padding:12px 0;font-size:13px;font-weight:600;" id="pi-email">–</td>
                </tr>
                <tr style="border-bottom:1px solid #e2e8f0;">
                  <td style="padding:12px 0;font-size:13px;color:#64748b;">No. HP</td>
                  <td style="padding:12px 0;font-size:13px;font-weight:600;" id="pi-phone">–</td>
                </tr>
                <tr>
                  <td style="padding:12px 0;font-size:13px;color:#64748b;">Status</td>
                  <td style="padding:12px 0;"><span class="badge badge-success"><i class="fas fa-check-circle"></i>Aktif</span></td>
                </tr>
              </table>
              <div style="margin-top:20px;padding-top:16px;border-top:1px solid #e2e8f0;">
                <button class="btn btn-danger" id="btn-logout-profile">
                  <i class="fas fa-sign-out-alt"></i> Logout
                </button>
              </div>
            </div>
          </div>


        </div>
      </div><!-- /profile -->

    </div><!-- /page-content -->
  </main>
</div><!-- /layout -->

<!-- ====== TOAST CONTAINER ====== -->
<div id="toast-container"></div>

<!-- ====== CONFIRM MODAL ====== -->
<div class="modal-overlay" id="confirm-overlay">
  <div class="modal" style="max-width:400px;">
    <div class="modal-body" style="text-align:center;padding:32px 24px;">
      <div class="confirm-icon" id="confirm-icon"><i class="fas fa-exclamation-triangle"></i></div>
      <div style="font-size:17px;font-weight:700;margin-bottom:8px;" id="confirm-title">Konfirmasi</div>
      <div class="confirm-msg" id="confirm-msg"></div>
    </div>
    <div class="modal-footer" style="justify-content:center;">
      <button class="btn btn-secondary" onclick="document.getElementById('confirm-overlay').classList.remove('open')">Batal</button>
      <button class="btn btn-danger" id="confirm-ok">Ya, Lanjutkan</button>
    </div>
  </div>
</div>

<!-- ====== CAR MODAL ====== -->
<div class="modal-overlay" id="car-modal-overlay">
  <div class="modal modal-lg">
    <div class="modal-header">
      <div class="modal-title" id="car-modal-title">Tambah Mobil Baru</div>
      <button class="modal-close" onclick="closeModal('car-modal-overlay')"><i class="fas fa-times"></i></button>
    </div>
    <div class="modal-body">
      <form id="car-form" enctype="multipart/form-data">
        <input type="hidden" id="car-id"/>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Nama Mobil *</label>
            <input type="text" class="form-control" id="car-name" placeholder="Toyota Avanza" required/>
          </div>
          <div class="form-group">
            <label class="form-label">Plat Nomor *</label>
            <input type="text" class="form-control" id="car-plate" placeholder="B 1234 ABC" required/>
          </div>
        </div>
        <div class="form-row col-3">
          <div class="form-group">
            <label class="form-label">Tahun *</label>
            <input type="number" class="form-control" id="car-year" placeholder="2022" min="1990" max="2030"/>
          </div>
          <div class="form-group">
            <label class="form-label">Harga Sewa / Hari (Rp) *</label>
            <input type="number" class="form-control" id="car-price" placeholder="350000" required/>
          </div>
          <div class="form-group">
            <label class="form-label">Kapasitas Penumpang</label>
            <input type="number" class="form-control" id="car-seat" placeholder="5" min="1" max="50"/>
          </div>
        </div>
        <div class="form-row col-3">
          <div class="form-group">
            <label class="form-label">Kategori</label>
            <select class="form-control" id="car-kategori">
              <option value="">Pilih Kategori</option>
              <option value="SUV">SUV</option>
              <option value="MPV">MPV</option>
              <option value="sedan">Sedan</option>
              <option value="hatchback">Hatchback</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Model *</label>
            <input type="text" class="form-control" id="car-model" placeholder="Avanza G" required/>
          </div>
          <div class="form-group">
            <label class="form-label">Transmisi</label>
            <select class="form-control" id="car-transmission">
              <option value="">Pilih</option>
              <option value="manual">Manual</option>
              <option value="automatic">Automatic</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-control" id="car-status">
            <option value="available">Tersedia</option>
            <option value="maintenance">Servis/Maintenance</option>
            <option value="rented">Disewa</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Deskripsi</label>
          <textarea class="form-control" id="car-desc" rows="3" placeholder="Deskripsi singkat kendaraan..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Foto Kendaraan</label>
          <div class="img-upload-area" id="img-upload-area">
            <input type="file" id="car-image" accept="image/*"/>
            <i class="fas fa-cloud-upload-alt" style="font-size:28px;color:#94a3b8;"></i>
            <div style="margin-top:8px;font-size:13px;color:#64748b;">Klik atau seret gambar ke sini</div>
            <div style="font-size:11px;color:#94a3b8;margin-top:4px;">PNG, JPG, WEBP – maks 5MB</div>
            <img id="img-preview" class="img-preview" style="display:none;"/>
          </div>
        </div>
      </form>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal('car-modal-overlay')">Batal</button>
      <button class="btn btn-primary" id="car-save-btn">
        <i class="fas fa-save"></i> Simpan
      </button>
    </div>
  </div>
</div>

<!-- ===== MODAL DETAIL RESERVASI ===== -->
<div class="modal-overlay" id="rental-modal-overlay">
  <div class="modal" style="max-width: 600px;">
    <div class="modal-header">
      <h3 class="modal-title">Detail Reservasi</h3>
      <button class="modal-close" onclick="closeModal('rental-modal-overlay')"><i class="fas fa-times"></i></button>
    </div>
    <div class="modal-body" id="rental-detail-body">
      <!-- Injected -->
    </div>
    <div class="modal-footer" id="rental-detail-actions">
      <!-- Injected -->
    </div>
  </div>
</div>

<!-- ===== MODAL TOLAK RESERVASI ===== -->
<div class="modal-overlay" id="reject-modal-overlay">
  <div class="modal" style="max-width: 400px;">
    <div class="modal-header">
      <h3 class="modal-title" style="color: #ef4444;"><i class="fas fa-ban"></i> Tolak Reservasi</h3>
      <button class="modal-close" onclick="closeModal('reject-modal-overlay')"><i class="fas fa-times"></i></button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label class="form-label">Alasan Penolakan <span style="color:red">*</span></label>
        <textarea id="reject-reason-input" class="form-control" rows="3" placeholder="Contoh: Maaf, mobil sedang dalam perbaikan..." required></textarea>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal('reject-modal-overlay')">Batal</button>
      <button class="btn btn-danger" id="btn-submit-reject">Tolak Reservasi</button>
    </div>
  </div>
</div>

<!-- ===== MODAL KONFIRMASI CASH ===== -->
<div class="modal-overlay" id="cash-modal-overlay">
  <div class="modal" style="max-width: 400px;">
    <div class="modal-header">
      <h3 class="modal-title" style="color: var(--primary);"><i class="fas fa-money-bill-wave"></i> Konfirmasi Pembayaran Tunai</h3>
      <button class="modal-close" onclick="closeModal('cash-modal-overlay')"><i class="fas fa-times"></i></button>
    </div>
    <div class="modal-body">
      <div style="background: var(--bg-soft); padding: 16px; border-radius: 8px; margin-bottom: 16px; border-left: 4px solid var(--primary);">
        <div style="font-size: 12px; color: var(--text-sub); margin-bottom: 4px;">Total Tagihan Reservasi</div>
        <div id="cash-modal-tagihan" style="font-size: 20px; font-weight: 800; color: var(--text-main);">Rp 0</div>
      </div>
      <div class="form-group">
        <label class="form-label">Nominal Uang Diterima <span style="color:red">*</span></label>
        <div style="position: relative;">
          <span style="position: absolute; left: 12px; top: 10px; font-weight: 600; color: var(--text-sub);">Rp</span>
          <input type="text" id="cash-amount-input" class="form-control" style="padding-left: 38px; font-size: 16px; font-weight: 600;" placeholder="0" required autocomplete="off">
        </div>
        <div style="font-size: 11px; color: var(--text-sub); margin-top: 6px;">
          Masukkan angka saja tanpa titik/koma.
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal('cash-modal-overlay')">Batal</button>
      <button class="btn btn-primary" id="btn-submit-cash">Konfirmasi Uang</button>
    </div>
  </div>
</div>
<!-- SIDE DRAWER: RENTAL DETAIL -->
<div class="drawer-overlay" id="rental-detail-overlay" onclick="closeRentalDetail()"></div>
<div class="side-drawer" id="rental-detail-drawer" style="max-width:450px;">
  <div class="drawer-header">
    <h3>Detail Reservasi</h3>
    <button class="btn-close" onclick="closeRentalDetail()"><i class="fas fa-times"></i></button>
  </div>
  <div class="drawer-body" style="background:#f8fafc;">
    <div id="rental-drawer-content">
      <!-- Dirender via JS -->
    </div>
  </div>
  <div class="drawer-actions" id="rental-drawer-actions" style="margin:0; padding:16px 24px; background:white; border-top:1px solid var(--border); display:flex; gap:12px;">
    <!-- Dirender via JS -->
  </div>
</div>

<!-- ====== CUSTOMER DETAIL MODAL ====== -->
<div class="modal-overlay" id="customer-modal-overlay">
  <div class="modal">
    <div class="modal-header">
      <div class="modal-title">Detail Pelanggan</div>
      <button class="modal-close" onclick="closeModal('customer-modal-overlay')"><i class="fas fa-times"></i></button>
    </div>
    <div class="modal-body" id="customer-detail-body">
      <div style="text-align:center;padding:40px;"><div class="spinner"></div></div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal('customer-modal-overlay')">Tutup</button>
    </div>
  </div>
</div>

<!-- ====== GENERATE HP TRACKER MODAL ====== -->
<div class="modal-overlay" id="tracker-gen-modal">
  <div class="modal" style="max-width:480px;">
    <div class="modal-header">
      <div class="modal-title"><i class="fas fa-mobile-alt" style="color:#64748b;margin-right:8px;"></i> Setup HP Tracker Tersembunyi</div>
      <button class="modal-close" onclick="closeModal('tracker-gen-modal')"><i class="fas fa-times"></i></button>
    </div>
    <div class="modal-body">
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;margin-bottom:16px;font-size:12px;color:#475569;line-height:1.6;">
        <strong style="color:#3b82f6;">Cara pakai:</strong><br>
        1. Pilih mobil dan beri label (opsional) → klik Generate<br>
        2. Copy link atau scan QR Code dengan HP tersembunyi<br>
        3. Buka link di browser HP tersembunyi<br>
        4. Tekan "Mulai Tracking" → HP otomatis kirim GPS setiap 15 detik
      </div>
      <div class="form-group" style="margin-bottom:16px;">
        <label class="form-label">Pilih Mobil *</label>
        <select class="form-control" id="gen-car-select">
          <option value="">Memuat data mobil...</option>
        </select>
      </div>
      <div class="form-group" style="margin-bottom:20px;">
        <label class="form-label">Label Custom (Opsional)</label>
        <input type="text" class="form-control" id="gen-custom-label" placeholder="Contoh: HP Supir Budi, Samsung J2"/>
        <div style="font-size:10px;color:#94a3b8;margin-top:4px;">Kosongkan jika ingin memakai nama mobil sebagai label.</div>
      </div>
      <button class="btn btn-primary" id="gen-token-btn" onclick="doGenerateToken()" style="width:100%;">
        <i class="fas fa-qrcode"></i> Generate Link Tracker
      </button>
      <!-- Hasil generate -->
      <div id="gen-result" style="display:none;margin-top:20px;">
        <div style="font-size:12px;font-weight:600;color:#64748b;margin-bottom:8px;"><i class="fas fa-clipboard-list" style="margin-right:6px;"></i> Link Tracker</div>
        <div class="gen-url-box" style="display:flex;align-items:flex-start;gap:10px;justify-content:space-between;">
          <a id="gen-tracker-url" href="#" target="_blank" style="flex:1;word-break:break-all;"></a>
          <button class="btn btn-secondary btn-sm" onclick="copyTrackerUrl()" style="flex-shrink:0;" title="Copy link">
            <i class="fas fa-copy"></i>
          </button>
        </div>
        
        <div style="font-size:12px;font-weight:600;color:#64748b;margin-bottom:8px;margin-top:16px;"><i class="fas fa-key" style="margin-right:6px;"></i> Token Aplikasi Android</div>
        <div class="gen-url-box" style="display:flex;align-items:center;gap:10px;justify-content:space-between;background:#f8fafc;border:1px solid #e2e8f0;padding:10px;border-radius:6px;">
          <span id="gen-tracker-token" style="flex:1;word-break:break-all;font-family:monospace;font-weight:bold;font-size:14px;color:#0f172a;"></span>
          <button class="btn btn-primary btn-sm" onclick="copyTrackerToken()" style="flex-shrink:0;" title="Copy token">
            <i class="fas fa-copy"></i> Copy
          </button>
        </div>
        <div style="text-align:center;margin-top:16px;">
          <div style="font-size:12px;color:#64748b;margin-bottom:8px;">QR Code – Scan dengan HP tersembunyi</div>
          <img id="gen-qr-img" src="" alt="QR Code" style="width:180px;height:180px;border-radius:10px;border:2px solid #e2e8f0;"/>
        </div>
        <div style="font-size:11px;color:#64748b;text-align:center;margin-top:10px;line-height:1.5;">
          Simpan link ini! Jika HP di-restart, buka link yang sama.<br/>Token otomatis tersimpan di browser HP tersebut.
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal('tracker-gen-modal')">Tutup</button>
    </div>
  </div>
</div>

<!-- ====== IMAGE VIEWER MODAL ====== -->
<div class="modal-overlay" id="image-viewer-modal" onclick="if(event.target===this) closeModal('image-viewer-modal')">
  <div style="position: relative; max-width: 90vw; max-height: 90vh; display: flex; align-items: center; justify-content: center;">
    <button onclick="closeModal('image-viewer-modal')" style="position: absolute; top: -40px; right: 0; background: none; border: none; color: white; font-size: 28px; cursor: pointer;"><i class="fas fa-times"></i></button>
    <img id="image-viewer-img" src="" style="max-width: 100%; max-height: 90vh; border-radius: 8px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); object-fit: contain; background: white;">
  </div>
</div>

<script src="{{ asset('js/api.js') }}?v={{ time() }}"></script>
<script src="{{ asset('js/main.js') }}?v={{ time() }}"></script>
<script src="{{ asset('js/cars.js') }}?v={{ time() }}"></script>
<script src="{{ asset('js/rentals.js') }}?v={{ time() }}"></script>
<script src="{{ asset('js/customers.js') }}?v={{ time() }}"></script>
<script src="{{ asset('js/tracking.js') }}?v={{ time() }}"></script>
<script src="{{ asset('js/reports.js') }}?v={{ time() }}"></script>
</body>
</html>
