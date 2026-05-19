<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Login Admin – SewaMobilYuk</title>
  <meta name="description" content="Halaman login admin SewaMobilYuk – platform rental mobil terpercaya."/>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>
  <link rel="stylesheet" href="{{ asset('css/admin.css') }}"/>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      min-height: 100vh;
      display: flex;
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 40%, #bfdbfe 100%);
      position: relative;
      overflow: hidden;
    }
    /* Decorative shapes */
    body::before {
      content: '';
      position: absolute;
      top: -120px; right: -120px;
      width: 400px; height: 400px;
      border-radius: 50%;
      background: linear-gradient(135deg, #60a5fa55, #3b82f6aa);
      filter: blur(60px);
    }
    body::after {
      content: '';
      position: absolute;
      bottom: -100px; left: -100px;
      width: 350px; height: 350px;
      border-radius: 50%;
      background: linear-gradient(135deg, #93c5fd55, #2563ebaa);
      filter: blur(60px);
    }

    .login-wrapper {
      display: flex;
      width: 100%;
      min-height: 100vh;
      position: relative;
      z-index: 1;
    }

    /* Left Panel */
    .left-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 60px;
      background: linear-gradient(145deg, #3b82f6, #1d4ed8);
      color: white;
      position: relative;
      overflow: hidden;
    }
    .left-panel::before {
      content: '';
      position: absolute;
      top: -60px; left: -60px;
      width: 300px; height: 300px;
      border-radius: 50%;
      background: rgba(255,255,255,0.08);
    }
    .left-panel::after {
      content: '';
      position: absolute;
      bottom: -80px; right: -40px;
      width: 350px; height: 350px;
      border-radius: 50%;
      background: rgba(255,255,255,0.06);
    }
    .brand-logo {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 48px;
      position: relative; z-index: 1;
    }
    .brand-logo .icon {
      width: 64px; height: 64px;
      background: rgba(255,255,255,0.2);
      border-radius: 16px;
      display: flex; align-items: center; justify-content: center;
      font-size: 28px;
      backdrop-filter: blur(10px);
    }
    .brand-name { font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
    .brand-tagline { font-size: 13px; opacity: 0.8; margin-top: 2px; }
    .left-content { text-align: center; position: relative; z-index: 1; }
    .left-content h2 { font-size: 36px; font-weight: 800; line-height: 1.2; margin-bottom: 16px; }
    .left-content p { font-size: 16px; opacity: 0.85; line-height: 1.7; max-width: 380px; }
    .feature-list { list-style: none; margin-top: 40px; display: flex; flex-direction: column; gap: 16px; }
    .feature-list li {
      display: flex; align-items: center; gap: 12px;
      font-size: 15px; opacity: 0.9;
    }
    .feature-list li .fi {
      width: 36px; height: 36px;
      background: rgba(255,255,255,0.15);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; flex-shrink: 0;
    }
    .car-illustration {
      margin-top: 48px;
      font-size: 120px;
      opacity: 0.15;
      position: absolute;
      bottom: 20px; right: 20px;
    }

    /* Right Panel (Form) */
    .right-panel {
      width: 480px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      background: white;
    }
    .form-card {
      width: 100%;
      max-width: 400px;
    }
    .form-header { margin-bottom: 40px; }
    .form-header h1 { font-size: 28px; font-weight: 800; color: #1e293b; }
    .form-header p { font-size: 14px; color: #64748b; margin-top: 6px; }

    .form-group { margin-bottom: 20px; }
    .form-group label {
      display: block;
      font-size: 13px; font-weight: 600;
      color: #374151;
      margin-bottom: 8px;
    }
    .input-wrapper {
      position: relative;
    }
    .input-wrapper i {
      position: absolute; left: 14px; top: 50%;
      transform: translateY(-50%);
      color: #9ca3af; font-size: 16px;
    }
    .input-wrapper input {
      width: 100%;
      padding: 13px 14px 13px 44px;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      font-size: 14px; font-family: 'Inter', sans-serif;
      color: #1e293b;
      background: #f9fafb;
      transition: all 0.2s;
      outline: none;
    }
    .input-wrapper input:focus {
      border-color: #3b82f6;
      background: white;
      box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
    }
    .toggle-pw {
      position: absolute; right: 14px; top: 50%;
      transform: translateY(-50%);
      cursor: pointer; color: #9ca3af;
      background: none; border: none; padding: 0; font-size: 16px;
      transition: color 0.2s;
    }
    .toggle-pw:hover { color: #3b82f6; }

    .btn-login {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 15px; font-weight: 700;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
      transition: all 0.3s;
      display: flex; align-items: center; justify-content: center; gap: 10px;
      margin-top: 8px;
      box-shadow: 0 4px 20px rgba(59,130,246,0.35);
    }
    .btn-login:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 28px rgba(59,130,246,0.45);
    }
    .btn-login:active { transform: translateY(0); }
    .btn-login:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
    .btn-login .spinner {
      width: 18px; height: 18px;
      border: 3px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .alert {
      padding: 12px 16px;
      border-radius: 10px;
      font-size: 13px; font-weight: 500;
      display: flex; align-items: center; gap: 10px;
      margin-bottom: 20px;
      animation: slideIn 0.3s ease;
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .alert-error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
    .alert-success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }

    .login-footer {
      margin-top: 32px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
    }

    @media (max-width: 900px) {
      .left-panel { display: none; }
      .right-panel { width: 100%; }
    }
  </style>
</head>
<body>
<div class="login-wrapper">
  <!-- Left Panel -->
  <div class="left-panel">
    <div class="brand-logo">
      <div class="icon"><i class="fas fa-car"></i></div>
      <div>
        <div class="brand-name">SewaMobilYuk</div>
        <div class="brand-tagline">Admin Dashboard</div>
      </div>
    </div>
    <div class="left-content">
      <h2>Kelola Bisnis Rental Mobil Lebih Mudah</h2>
      <p>Platform manajemen armada lengkap untuk admin – dari pemesanan hingga tracking kendaraan real-time.</p>
      <ul class="feature-list">
        <li><div class="fi"><i class="fas fa-car-side"></i></div> Manajemen armada kendaraan</li>
        <li><div class="fi"><i class="fas fa-calendar-check"></i></div> Monitoring reservasi real-time</li>
        <li><div class="fi"><i class="fas fa-map-marked-alt"></i></div> Tracking GPS kendaraan aktif</li>
        <li><div class="fi"><i class="fas fa-chart-bar"></i></div> Laporan & statistik bisnis</li>
      </ul>
    </div>
    <div class="car-illustration"><i class="fas fa-car"></i></div>
  </div>

  <!-- Right Panel -->
  <div class="right-panel">
    <div class="form-card">
      <div class="form-header">
        <h1>Selamat Datang 👋</h1>
        <p>Masuk ke panel admin untuk mengelola sistem</p>
      </div>

      <div id="alert-area"></div>

      <form id="login-form">
        <div class="form-group">
          <label for="email">Email Admin</label>
          <div class="input-wrapper">
            <i class="fas fa-envelope"></i>
            <input type="email" id="email" placeholder="admin@example.com" required autocomplete="email"/>
          </div>
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <div class="input-wrapper">
            <i class="fas fa-lock"></i>
            <input type="password" id="password" placeholder="Masukkan password" required autocomplete="current-password"/>
            <button type="button" class="toggle-pw" id="toggle-pw">
              <i class="fas fa-eye" id="pw-icon"></i>
            </button>
          </div>
        </div>
        <button type="submit" class="btn-login" id="btn-login">
          <i class="fas fa-sign-in-alt"></i>
          <span id="btn-text">Masuk ke Dashboard</span>
        </button>
      </form>
      <div class="login-footer">
        &copy; 2025 SewaMobilYuk &mdash; Semua hak dilindungi
      </div>
    </div>
  </div>
</div>

<script>
  const API = 'https://sewamobilyuk-api.exponic.site/api';

  // Toggle password visibility
  document.getElementById('toggle-pw').addEventListener('click', function() {
    const pw = document.getElementById('password');
    const icon = document.getElementById('pw-icon');
    if (pw.type === 'password') {
      pw.type = 'text';
      icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
      pw.type = 'password';
      icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
  });

  function showAlert(msg, type = 'error') {
    const area = document.getElementById('alert-area');
    area.innerHTML = `<div class="alert alert-${type}"><i class="fas fa-${type==='error'?'exclamation-circle':'check-circle'}"></i>${msg}</div>`;
  }

  function setLoading(loading) {
    const btn = document.getElementById('btn-login');
    const txt = document.getElementById('btn-text');
    if (loading) {
      btn.disabled = true;
      btn.innerHTML = '<div class="spinner"></div><span>Memverifikasi...</span>';
    } else {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-sign-in-alt"></i><span id="btn-text">Masuk ke Dashboard</span>';
    }
  }

  document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    document.getElementById('alert-area').innerHTML = '';
    setLoading(true);
    try {
      // API expects 'login' field (can be email or username)
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ login: email, email, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('smy_token', data.token);
        localStorage.setItem('smy_user', JSON.stringify(data.user || data.data || {}));
        showAlert('Login berhasil! Mengalihkan...', 'success');
        setTimeout(() => { window.location.href = '/admin'; }, 800);
      } else {
        showAlert(data.message || 'Email atau password salah.');
        setLoading(false);
      }
    } catch(err) {
      showAlert('Gagal terhubung ke server. Periksa koneksi internet Anda.');
      setLoading(false);
    }
  });

  // Redirect if already logged in
  if (localStorage.getItem('smy_token')) {
    window.location.href = '/admin';
  }
</script>
</body>
</html>
