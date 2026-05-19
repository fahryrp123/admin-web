<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Admin Dashboard – SewaMobilYuk</title>
  <meta name="description" content="Panel admin SewaMobilYuk – kelola armada, reservasi, dan pelanggan rental mobil."/>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <link rel="stylesheet" href="{{ asset('css/admin.css') }}"/>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
</head>
<body>

<!-- ====== SIDEBAR OVERLAY ====== -->
<div class="sidebar-overlay" id="sidebar-overlay"></div>

<!-- ====== LAYOUT ====== -->
<div class="admin-layout">

  <!-- SIDEBAR -->
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-brand">
      <div class="sidebar-logo"><i class="fas fa-car"></i></div>
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
        <button class="topbar-btn" id="refresh-btn" title="Refresh"><i class="fas fa-sync-alt"></i></button>
      </div>
    </header>

    <!-- PAGES -->
    <div class="page-content">

      <!-- ===== DASHBOARD PAGE ===== -->
      <div class="page active" id="page-dashboard">
        <div class="page-header">
          <div class="page-header-left">
            <div class="breadcrumb"><i class="fas fa-home"></i> / <span>Dashboard</span></div>
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
            <div class="breadcrumb"><i class="fas fa-car-side"></i> / <span>Kelola Mobil</span></div>
            <h1>Kelola Mobil</h1>
            <p>Manajemen armada kendaraan rental</p>
          </div>
          <button class="btn btn-primary" id="btn-add-car">
            <i class="fas fa-plus"></i> Tambah Mobil
          </button>
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
          <div class="pagination" id="cars-pagination"></div>
        </div>
      </div><!-- /cars -->

      <!-- ===== RENTALS PAGE ===== -->
      <div class="page" id="page-rentals">
        <div class="page-header">
          <div class="page-header-left">
            <div class="breadcrumb"><i class="fas fa-calendar-check"></i> / <span>Reservasi</span></div>
            <h1>Manajemen Reservasi</h1>
            <p>Kelola semua pemesanan dan status sewa</p>
          </div>
        </div>

        <!-- Filter tabs -->
        <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;">
          <button class="btn btn-primary btn-sm rental-tab active" data-status="">Semua</button>
          <button class="btn btn-secondary btn-sm rental-tab" data-status="pending">⏳ Menunggu</button>
          <button class="btn btn-secondary btn-sm rental-tab" data-status="approved">✅ Disetujui</button>
          <button class="btn btn-secondary btn-sm rental-tab" data-status="active">🚗 Aktif</button>
          <button class="btn btn-secondary btn-sm rental-tab" data-status="completed">🏁 Selesai</button>
          <button class="btn btn-secondary btn-sm rental-tab" data-status="cancelled">❌ Dibatalkan</button>
        </div>

        <div class="card">
          <div class="toolbar">
            <div class="search-box">
              <i class="fas fa-search"></i>
              <input type="text" id="rental-search" placeholder="Cari nama pelanggan / kode..."/>
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
            <div class="breadcrumb"><i class="fas fa-map-marked-alt"></i> / <span>Tracking</span></div>
            <h1>Tracking Kendaraan</h1>
            <p>Pemantauan posisi armada secara real-time</p>
          </div>
          <button class="btn btn-primary" id="btn-refresh-map">
            <i class="fas fa-sync-alt"></i> Refresh Posisi
          </button>
        </div>

        <div style="display:grid;grid-template-columns:300px 1fr;gap:16px;align-items:start;">
          <div>
            <div class="card" style="margin-bottom:16px;">
              <div class="card-header"><div class="card-title">Kendaraan Aktif</div></div>
              <div id="tracking-list" style="padding:12px;display:flex;flex-direction:column;gap:8px;max-height:440px;overflow-y:auto;">
                <div style="text-align:center;padding:20px;color:#94a3b8">Memuat...</div>
              </div>
            </div>
          </div>
          <div class="card">
            <div class="card-header">
              <div class="card-title">Peta Armada</div>
              <div style="font-size:12px;color:#94a3b8;display:flex;align-items:center;gap:6px;">
                <span class="status-dot dot-green"></span>Aktif
                <span class="status-dot dot-yellow" style="margin-left:8px;"></span>Tersedia
              </div>
            </div>
            <div class="card-body" style="padding:16px;">
              <div id="map"></div>
            </div>
          </div>
        </div>
      </div><!-- /tracking -->

      <!-- ===== CUSTOMERS PAGE ===== -->
      <div class="page" id="page-customers">
        <div class="page-header">
          <div class="page-header-left">
            <div class="breadcrumb"><i class="fas fa-users"></i> / <span>Pelanggan</span></div>
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
                  <th>No. HP</th>
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

      <!-- ===== PROFILE PAGE ===== -->
      <div class="page" id="page-profile">
        <div class="page-header">
          <div class="page-header-left">
            <div class="breadcrumb"><i class="fas fa-user-cog"></i> / <span>Profil Admin</span></div>
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
      <div class="confirm-icon" id="confirm-icon">⚠️</div>
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
            <input type="text" class="form-control" id="car-kategori" placeholder="MPV"/>
          </div>
          <div class="form-group">
            <label class="form-label">Model</label>
            <input type="text" class="form-control" id="car-model" placeholder="Avanza G"/>
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

<!-- ====== RENTAL DETAIL MODAL ====== -->
<div class="modal-overlay" id="rental-modal-overlay">
  <div class="modal modal-lg">
    <div class="modal-header">
      <div class="modal-title">Detail Reservasi</div>
      <button class="modal-close" onclick="closeModal('rental-modal-overlay')"><i class="fas fa-times"></i></button>
    </div>
    <div class="modal-body" id="rental-detail-body">
      <div style="text-align:center;padding:40px;"><div class="spinner"></div></div>
    </div>
    <div class="modal-footer" id="rental-detail-actions"></div>
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

<script src="{{ asset('js/api.js') }}"></script>
<script src="{{ asset('js/main.js') }}"></script>
<script src="{{ asset('js/cars.js') }}"></script>
<script src="{{ asset('js/rentals.js') }}"></script>
<script src="{{ asset('js/customers.js') }}"></script>
</body>
</html>
