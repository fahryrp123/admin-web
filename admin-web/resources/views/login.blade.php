<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Login Admin – SewaMobilYuk</title>
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800;900&display=swap" rel="stylesheet"/>
  
  <!-- Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>
  
  <style>
    /* Reset & Base */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
      background: #F8FAFC; 
      display: flex;
    }

    /* ══════════════════════════════════════════════════
       SPLASH SCREEN: PREMIUM CAR ASSEMBLY
       Theme: Ultra Bright, Cheerful, Professional
    ══════════════════════════════════════════════════ */
    #splash {
      position: fixed; inset: 0;
      background: #FFFFFF; /* Pure bright white */
      z-index: 9999;
      display: flex; flex-direction: column; justify-content: center; align-items: center;
      clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
      transition: clip-path 0.8s cubic-bezier(0.77, 0, 0.175, 1);
    }
    #splash.hide {
      clip-path: polygon(100% 0, 100% 0, 100% 100%, 100% 100%);
      pointer-events: none;
    }

    .splash-center {
      display: flex; flex-direction: column; align-items: center;
    }

    /* ── SVG Animations for Car Assembly ── */
    .car-assembly {
      width: 320px; height: 140px; position: relative;
    }

    /* 1. Wheels roll in */
    #part-wheel-back {
      transform-origin: 85px 85px;
      animation: roll-in-left 1s cubic-bezier(0.25, 1, 0.5, 1) forwards;
    }
    #part-wheel-front {
      transform-origin: 235px 85px;
      animation: roll-in-right 1s cubic-bezier(0.25, 1, 0.5, 1) forwards;
    }
    @keyframes roll-in-left {
      0% { transform: translateX(-200px) rotate(-720deg); opacity: 0; }
      100% { transform: translateX(0) rotate(0deg); opacity: 1; }
    }
    @keyframes roll-in-right {
      0% { transform: translateX(200px) rotate(720deg); opacity: 0; }
      100% { transform: translateX(0) rotate(0deg); opacity: 1; }
    }

    /* 2. Chassis drops */
    #part-chassis {
      opacity: 0; transform: translateY(-20px);
      animation: drop-in 0.4s ease-out 0.8s forwards;
    }
    
    /* 3. Main Body drops & bounces */
    #part-body {
      opacity: 0; transform: translateY(-120px);
      animation: bounce-drop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 1.0s forwards;
    }
    
    /* 4. Windows pop */
    #part-windows {
      opacity: 0; transform: scale(0.8); transform-origin: 150px 40px;
      animation: pop-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 1.5s forwards;
    }

    /* Assembly Keyframes */
    @keyframes drop-in { to { opacity: 1; transform: translateY(0); } }
    @keyframes bounce-drop { to { opacity: 1; transform: translateY(0); } }
    @keyframes pop-in { to { opacity: 1; transform: scale(1); } }

    /* Whole car drives off */
    .car-svg-group.drive-off {
      animation: blast-off 0.7s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards;
    }
    @keyframes blast-off {
      0% { transform: translateX(0) scale(1); }
      15% { transform: translateX(-20px) scale(0.95); } /* revving back */
      100% { transform: translateX(150vw) scale(1.1) skewX(-5deg); }
    }

    /* ── Splash Texts ── */
    .splash-text-area { text-align: center; margin-top: 20px; }
    .splash-brand {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 38px; font-weight: 800; color: #1E293B;
      letter-spacing: -1px; margin-bottom: 4px;
      opacity: 0; transform: translateY(20px);
      animation: slide-up 0.6s cubic-bezier(0.25, 1, 0.5, 1) 1.8s forwards;
    }
    .splash-brand .c-blue { color: #2563EB; }
    .splash-brand .c-light { color: #38BDF8; }
    .splash-tag {
      font-size: 13px; font-weight: 700; color: #64748B;
      letter-spacing: 5px; opacity: 0; transform: translateY(15px);
      animation: slide-up 0.6s cubic-bezier(0.25, 1, 0.5, 1) 2.1s forwards;
    }
    @keyframes slide-up { to { opacity: 1; transform: translateY(0); } }


    /* ══════════════════════════════════════════════════
       MAIN PAGE: ULTRA BRIGHT, FRESH & MODERN
       No dark colors. White, Sky Blue, and Clean UI.
    ══════════════════════════════════════════════════ */
    .page-wrapper {
      display: flex;
      width: 100vw;
      height: 100vh;
    }

    /* ── LEFT PANEL (Brand Side) ── */
    .panel-left {
      flex: 1.1;
      /* Very bright, cheerful sky blue gradient */
      background: linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 50%, #7DD3FC 100%);
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      overflow: hidden;
    }

    /* Abstract bright floating circles for aesthetics */
    .bright-circle {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.4);
      filter: blur(40px);
      animation: float-cloud 10s ease-in-out infinite alternate;
    }
    .bc-1 { width: 500px; height: 500px; top: -150px; left: -100px; }
    .bc-2 { width: 400px; height: 400px; bottom: -100px; right: -50px; animation-delay: -5s; }

    @keyframes float-cloud {
      0% { transform: translateY(0) scale(1); }
      100% { transform: translateY(30px) scale(1.05); }
    }

    .main-brand-content {
      position: relative;
      z-index: 10;
      text-align: center;
      opacity: 0;
      transform: translateX(-40px);
      transition: all 0.9s cubic-bezier(0.22, 1, 0.36, 1);
    }
    body.ready .main-brand-content { opacity: 1; transform: translateX(0); transition-delay: 0.3s; }

    .main-logo {
      width: 280px;
      margin-bottom: 4px;
      filter: drop-shadow(0 15px 30px rgba(14, 165, 233, 0.3));
    }
    .main-title {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 42px;
      font-weight: 900;
      color: #0369A1; /* Deep Sky Blue text */
      letter-spacing: -1.5px;
      margin-bottom: 8px;
    }
    .main-title span { color: #0284C7; }
    .main-subtitle {
      font-size: 15px;
      font-weight: 700;
      color: #0284C7;
      letter-spacing: 4px;
      text-transform: uppercase;
      opacity: 0.8;
    }


    /* ── RIGHT PANEL (Form Side) ── */
    .panel-right {
      flex: 1;
      min-width: 500px;
      background: #FFFFFF; /* Pure bright white */
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
    }

    .form-wrapper {
      width: 100%;
      max-width: 440px;
      opacity: 0;
      transform: translateX(40px);
      transition: all 0.9s cubic-bezier(0.22, 1, 0.36, 1);
    }
    body.ready .form-wrapper { opacity: 1; transform: translateX(0); transition-delay: 0.4s; }

    .form-card {
      padding: 40px;
      background: #FFFFFF;
      border-radius: 24px;
      border: 1px solid #F1F5F9;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.03);
    }

    .form-header { margin-bottom: 36px; }
    .form-title {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 32px;
      font-weight: 800;
      color: #0F172A;
      margin-bottom: 8px;
      letter-spacing: -0.5px;
    }
    .form-desc { color: #64748B; font-size: 15px; line-height: 1.6; }

    .input-group { margin-bottom: 22px; }
    .input-label { display: block; font-size: 13.5px; font-weight: 700; color: #475569; margin-bottom: 8px; }
    .input-wrapper { position: relative; }
    .input-icon {
      position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
      color: #94A3B8; font-size: 16px; transition: color 0.3s;
    }
    .input-field {
      width: 100%; padding: 15px 18px 15px 48px;
      font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 500;
      color: #0F172A; background: #F8FAFC;
      border: 2px solid transparent; border-radius: 14px;
      outline: none; transition: all 0.3s;
      box-shadow: inset 0 0 0 1px #E2E8F0;
    }
    .input-field::placeholder { color: #94A3B8; font-weight: 400; }
    .input-field:focus {
      background: #FFFFFF;
      box-shadow: inset 0 0 0 2px #38BDF8, 0 8px 20px rgba(56, 189, 248, 0.15);
    }
    .input-wrapper:focus-within .input-icon { color: #0284C7; }

    .toggle-pw {
      position: absolute; right: 16px; top: 50%; transform: translateY(-50%);
      color: #94A3B8; cursor: pointer; padding: 5px; transition: color 0.3s;
    }
    .toggle-pw:hover { color: #0284C7; }

    .form-opts { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
    .remember { display: flex; align-items: center; gap: 8px; cursor: pointer; }
    .remember input { width: 16px; height: 16px; accent-color: #0284C7; cursor: pointer; }
    .remember-text { font-size: 14px; color: #475569; font-weight: 600; }
    .forgot { font-size: 14px; color: #0284C7; font-weight: 700; text-decoration: none; }
    .forgot:hover { text-decoration: underline; }

    .submit-btn {
      width: 100%; padding: 16px;
      background: linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%);
      color: white; border: none; border-radius: 14px;
      font-family: 'Inter', sans-serif; font-size: 16px; font-weight: 700;
      cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 10px;
      transition: all 0.3s;
      box-shadow: 0 10px 20px rgba(2, 132, 199, 0.25);
    }
    .submit-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 25px rgba(2, 132, 199, 0.35);
    }
    .submit-btn:active { transform: translateY(0); }

    /* Alert */
    .alert {
      padding: 14px; border-radius: 12px; font-size: 14.5px; font-weight: 600;
      margin-bottom: 24px; display: none; align-items: center; gap: 10px;
    }
    .alert.show { display: flex; }
    .alert-error { background: #FEF2F2; color: #B91C1C; border: 1px solid #FECACA; }
    .alert-success { background: #F0FDF4; color: #15803D; border: 1px solid #BBF7D0; }

    @media (max-width: 900px) {
      .page-wrapper { flex-direction: column; }
      .panel-left { flex: none; padding: 40px 20px; }
      .main-title { font-size: 32px; }
      .main-logo { width: 140px; }
      .panel-right { min-width: 100%; flex: 1; align-items: flex-start; }
      .form-card { box-shadow: none; border: none; padding: 32px 24px; }
      #splash { display: none; } /* Skip on mobile for speed */
      body { overflow: auto; }
    }
  </style>
</head>
<body>

  <!-- ══════════════════════════════════════════
       1. SPLASH SCREEN (CAR ASSEMBLY ANIMATION)
  ══════════════════════════════════════════ -->
  <div id="splash">
    <div class="splash-center">
      
      <!-- Premium Elegant Car SVG -->
      <div class="car-assembly">
        <svg viewBox="0 0 320 120" width="320" height="120" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <!-- Sleek Premium Dark Silver/Black Gradient -->
            <linearGradient id="bodyColor" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#475569" />
              <stop offset="50%" stop-color="#1E293B" />
              <stop offset="100%" stop-color="#0F172A" />
            </linearGradient>
            <!-- Elegant Glass Tint -->
            <linearGradient id="glass" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#334155" />
              <stop offset="100%" stop-color="#0F172A" />
            </linearGradient>
            <!-- Soft Shadow -->
            <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#000000" flood-opacity="0.15" />
            </filter>
          </defs>

          <g class="car-svg-group" id="car-svg-group">
            
            <!-- 1. Underbody/Chassis -->
            <rect id="part-chassis" x="40" y="80" width="240" height="8" rx="4" fill="#020617" />
            
            <!-- 2. Main Body Shell (Modern Indonesian MPV/Crossover) -->
            <g id="part-body" filter="url(#drop-shadow)">
              <!-- Roof Rails (SUV/Crossover vibe) -->
              <rect x="80" y="18" width="110" height="4" rx="2" fill="#64748B" />
              
              <!-- Sleek MPV Body -->
              <path d="M 35 80 L 35 55 C 38 35, 50 22, 70 22 L 195 22 C 215 22, 230 30, 250 48 C 265 52, 290 55, 295 65 C 298 75, 295 80, 285 80 Z" 
                    fill="url(#bodyColor)" />
              
              <!-- Dynamic Shield Character Line (Xpander/Avanza style) -->
              <path d="M 295 65 L 275 52 L 250 48 L 45 52" 
                    fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" opacity="0.2" />

              <!-- Lower Accent / Side Skirt -->
              <path d="M 285 76 L 40 76" 
                    fill="none" stroke="#FFFFFF" stroke-width="1" stroke-linecap="round" opacity="0.1" />

              <!-- Futuristic LED DRL (Top Slit) -->
              <path d="M 292 58 L 265 52 L 265 54 L 292 60 Z" fill="#F8FAFC" opacity="0.9" filter="drop-shadow(0 0 4px #F8FAFC)" />
              
              <!-- Main Headlight Block (Bumper mounted) -->
              <rect x="282" y="64" width="7" height="10" rx="2" fill="#E2E8F0" />

              <!-- Modern L-Shaped Taillight -->
              <path d="M 35 45 L 45 45 L 45 60 L 35 55 Z" fill="#EF4444" filter="drop-shadow(0 0 4px #EF4444)" />

              <!-- Flush Door Handles -->
              <rect x="180" y="52" width="12" height="3" rx="1.5" fill="#94A3B8" />
              <rect x="110" y="52" width="12" height="3" rx="1.5" fill="#94A3B8" />

              <!-- Clean Wheel Arches -->
              <circle cx="85" cy="85" r="24" fill="#FFFFFF" />
              <circle cx="235" cy="85" r="24" fill="#FFFFFF" />
            </g>

            <!-- 3. Privacy Windows & Mirrors -->
            <g id="part-windows">
              <!-- Flush Tinted Windows (Cab-forward MPV style) -->
              <path d="M 250 50 C 230 40, 210 26, 190 26 L 70 26 C 55 26, 45 35, 42 50 Z" fill="url(#glass)" />
              
              <!-- B-Pillar -->
              <line x1="155" y1="26" x2="160" y2="50" stroke="#020617" stroke-width="8" />
              
              <!-- C-Pillar -->
              <line x1="100" y1="26" x2="105" y2="50" stroke="#020617" stroke-width="10" />
              
              <!-- D-Pillar (Floating Roof Effect) -->
              <path d="M 45 35 L 60 50 L 42 50 Z" fill="#020617" />

              <!-- Aerodynamic Side Mirror -->
              <path d="M 230 46 C 235 44, 240 44, 240 49 L 230 51 Z" fill="#1E293B" />
            </g>

            <!-- 4. Wheels (Elegant Multi-Spoke Alloys) -->
            <g id="part-wheel-back">
              <circle cx="85" cy="85" r="20" fill="#0F172A" />
              <circle cx="85" cy="85" r="16" fill="none" stroke="#64748B" stroke-width="2" />
              <circle cx="85" cy="85" r="4" fill="#CBD5E1" />
              <!-- V-Spokes -->
              <path d="M 85 69 L 85 85 L 73 93 M 85 85 L 97 93" stroke="#CBD5E1" stroke-width="2.5" stroke-linecap="round" />
              <path d="M 85 101 L 85 85 L 97 77 M 85 85 L 73 77" stroke="#CBD5E1" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
            </g>

            <g id="part-wheel-front">
              <circle cx="235" cy="85" r="20" fill="#0F172A" />
              <circle cx="235" cy="85" r="16" fill="none" stroke="#64748B" stroke-width="2" />
              <circle cx="235" cy="85" r="4" fill="#CBD5E1" />
              <!-- V-Spokes -->
              <path d="M 235 69 L 235 85 L 223 93 M 235 85 L 247 93" stroke="#CBD5E1" stroke-width="2.5" stroke-linecap="round" />
              <path d="M 235 101 L 235 85 L 247 77 M 235 85 L 223 77" stroke="#CBD5E1" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
            </g>
          </g>
        </svg>
      </div>
      
      <!-- Splash Texts (Elegant Color Palette) -->
      <div class="splash-text-area">
        <h1 class="splash-brand"><span style="color:#0F172A;">Sewa</span>Mobil<span style="color:#475569;">Yuk</span></h1>
        <p class="splash-tag">MANAJEMEN RENTAL MOBIL</p>
      </div>

    </div>
  </div>

  <!-- ══════════════════════════════════════════
       2. MAIN PAGE LAYOUT (Bright & Clean)
  ══════════════════════════════════════════ -->
  <div class="page-wrapper">
    
    <!-- LEFT PANEL: Bright Sky Blue -->
    <div class="panel-left">
      <div class="bright-circle bc-1"></div>
      <div class="bright-circle bc-2"></div>

      <div class="main-brand-content">
        <img src="{{ asset('logo-baru.png') }}" alt="SewaMobilYuk Logo" class="main-logo" />
        <h2 class="main-title">Sewa<span>Mobil</span>Yuk</h2>
        <p class="main-subtitle">Platform Manajemen Rental</p>
      </div>
    </div>

    <!-- RIGHT PANEL: Pure White Form -->
    <div class="panel-right">
      <div class="form-wrapper">
        <div class="form-card">
          
          <div class="form-header">
            <h1 class="form-title">Selamat Datang</h1>
            <p class="form-desc">Silakan masuk ke akun admin Anda.</p>
          </div>

          <div class="alert alert-error" id="alert-box">
            <i class="fas fa-exclamation-circle"></i>
            <span id="alert-text">Email atau password salah.</span>
          </div>

          <form id="login-form" autocomplete="off">
            <div class="input-group">
              <label class="input-label" for="email">Alamat Email</label>
              <div class="input-wrapper">
                <i class="fas fa-envelope input-icon"></i>
                <input type="email" id="email" class="input-field" placeholder="Masukan email anda" autocomplete="off" required>
              </div>
            </div>

            <div class="input-group">
              <label class="input-label" for="password">Password</label>
              <div class="input-wrapper">
                <i class="fas fa-lock input-icon"></i>
                <input type="password" id="password" class="input-field" placeholder="Masukkan password Anda" autocomplete="new-password" required>
                <i class="fas fa-eye toggle-pw" id="toggle-pw"></i>
              </div>
            </div>



            <button type="submit" class="submit-btn" id="submit-btn">
              <span>Masuk ke Dashboard</span>
              <i class="fas fa-arrow-right"></i>
            </button>
          </form>

        </div>
      </div>
    </div>

  </div>

  <script>
    // ════════════════════════════════════════════════════
    // 1. CAR ASSEMBLY TIMING & TRANSITION LOGIC
    // ════════════════════════════════════════════════════
    const splashScreen = document.getElementById('splash');
    const carGroup = document.getElementById('car-svg-group');

    // Only run splash logic if on Desktop
    if (window.innerWidth > 900) {
      // Step 1: Car drives off screen after assembly & texts are done
      setTimeout(() => {
        document.getElementById('car-svg-group').classList.add('drive-off');
      }, 3400);

      // Step 2: Reveal the beautiful UI behind the splash screen
      setTimeout(() => {
        splashScreen.classList.add('hide');
        document.body.classList.add('ready'); // Triggers left/right panel slide-ins
      }, 3900);

    } else {
      // Mobile fallback: Skip splash animation for UX speed
      document.body.classList.add('ready');
    }

    // ════════════════════════════════════════════════════
    // 2. FORM & API LOGIC
    // ════════════════════════════════════════════════════
    const togglePw = document.getElementById('toggle-pw');
    const pwInput = document.getElementById('password');

    togglePw.addEventListener('click', () => {
      if (pwInput.type === 'password') {
        pwInput.type = 'text';
        togglePw.classList.replace('fa-eye', 'fa-eye-slash');
      } else {
        pwInput.type = 'password';
        togglePw.classList.replace('fa-eye-slash', 'fa-eye');
      }
    });

    const loginForm = document.getElementById('login-form');
    const alertBox = document.getElementById('alert-box');
    const alertText = document.getElementById('alert-text');
    const submitBtn = document.getElementById('submit-btn');
    const API = 'https://sewamobilyuk-api.exponic.site/api';

    if (localStorage.getItem('smy_token')) {
      document.cookie = "smy_token=" + localStorage.getItem('smy_token') + "; path=/";
      window.location.href = '/admin';
    }

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      
      alertBox.className = 'alert'; 
      submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i><span>Memproses...</span>';
      submitBtn.disabled = true;

      try {
        const res = await fetch(API + '/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ login: email, email: email, password: password })
        });
        
        const data = await res.json();
        
        if (res.ok && data.token) {
          let isAdmin = false;
          try {
            const tokenPayload = JSON.parse(atob(data.token.split('.')[1]));
            if (tokenPayload.role === 'admin' || tokenPayload.role === 'Admin') {
              isAdmin = true;
            }
          } catch (e) { console.error(e); }
          
          if (!isAdmin) {
            alertBox.className = 'alert alert-error show';
            alertText.textContent = 'Akses ditolak. Akun Anda bukan Admin.';
            resetBtn();
            return;
          }

          localStorage.setItem('smy_token', data.token);
          // Api does not return user, we just set empty obj, it will be fetched in main.js
          localStorage.setItem('smy_user', JSON.stringify({}));
          document.cookie = "smy_token=" + data.token + "; path=/";
          
          alertBox.className = 'alert alert-success show';
          alertBox.innerHTML = '<i class="fas fa-check-circle"></i><span>Login berhasil! Mengalihkan...</span>';
          
          setTimeout(() => { window.location.href = '/admin'; }, 1000);
        } else {
          alertBox.className = 'alert alert-error show';
          alertText.textContent = data.message || 'Kredensial tidak valid.';
          resetBtn();
        }
      } catch (err) {
        alertBox.className = 'alert alert-error show';
        alertText.textContent = 'Gagal terhubung ke server.';
        resetBtn();
      }
    });

    function resetBtn() {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>Masuk ke Dashboard</span><i class="fas fa-arrow-right"></i>';
    }
  </script>
</body>
</html>
