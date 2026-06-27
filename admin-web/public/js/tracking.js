/* ===== TRACKING MODULE =====
   Menampilkan lokasi HP tersembunyi di peta MapLibre GL JS 3D (admin panel)
   ============================================================= */

const TRACKER_API     = 'https://sewamobilyuk-api.exponic.site/api/tracker';
const POLL_INTERVAL   = 10000; // 10 detik (mengurangi beban web)
const OFFLINE_TIMEOUT = 30;    // detik – tracker dianggap offline

let trackingMap      = null;
let trackerMarkers   = {};    // { trackerId: { marker: maplibregl.Marker, element: HTMLElement, latlng: [lng, lat] } }
let trackingInterval = null;
let initialFitDone   = false;

// Playback variables
let pbData = null;
let pbIndex = 0;
let pbInterval = null;
let pbMarker = null;
let isPlaying = false;

/* ───────────────────────────────────────────────────────
   MAIN LOAD
─────────────────────────────────────────────────────── */
async function loadTracking() {
  initTrackingMap();
  await refreshTrackers();
  // Auto-refresh setiap 10 detik
  if (trackingInterval) clearInterval(trackingInterval);
  trackingInterval = setInterval(refreshTrackers, POLL_INTERVAL);
  // Tombol refresh manual
  const btn = document.getElementById('btn-refresh-map');
  if (btn) btn.onclick = refreshTrackers;
}

/* ───────────────────────────────────────────────────────
   INISIALISASI PETA MAPLIBRE GL JS
─────────────────────────────────────────────────────── */
function initTrackingMap() {
  if (trackingMap) return;
  initialFitDone = false;

  // Gunakan MapLibre dengan Tile Raster Google Maps Hybrid (Satelit + Label Jalan)
  trackingMap = new maplibregl.Map({
    container: 'map',
    style: {
      'version': 8,
      'sources': {
        'google-hybrid': {
          'type': 'raster',
          'tiles': [
            'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&scale=2'
          ],
          'tileSize': 256,
          'attribution': '© Google Maps'
        }
      },
      'layers': [
        {
          'id': 'google-hybrid-layer',
          'type': 'raster',
          'source': 'google-hybrid',
          'minzoom': 0,
          'maxzoom': 22
        }
      ]
    },
    center: [106.816, -6.2],
    zoom: 12,
    pitch: 45, // 3D Tilt
    bearing: 0,
    antialias: true
  });

  trackingMap.addControl(new maplibregl.NavigationControl(), 'top-right');
  
  trackingMap.on('load', () => {
    // Setup GeoJSON untuk rute Trip Playback (Jalur Latar Belakang)
    trackingMap.addSource('route-history', {
        'type': 'geojson',
        'data': { 'type': 'Feature', 'properties': {}, 'geometry': { 'type': 'LineString', 'coordinates': [] } }
    });
    
    // Setup GeoJSON untuk rute Progress (Jalur Menyala)
    trackingMap.addSource('route-progress', {
        'type': 'geojson',
        'data': { 'type': 'Feature', 'properties': {}, 'geometry': { 'type': 'LineString', 'coordinates': [] } }
    });
    
    trackingMap.addLayer({
        'id': 'route-history-line',
        'type': 'line',
        'source': 'route-history',
        'layout': { 'line-join': 'round', 'line-cap': 'round' },
        'paint': {
            'line-color': '#cbd5e1', // Abu-abu terang
            'line-width': 5,
            'line-opacity': 0.6,
            'line-dasharray': [2, 2] // Garis putus-putus
        }
    });

    trackingMap.addLayer({
        'id': 'route-progress-line',
        'type': 'line',
        'source': 'route-progress',
        'layout': { 'line-join': 'round', 'line-cap': 'round' },
        'paint': {
            'line-color': '#0ea5e9', // Biru cerah neon
            'line-width': 7,
            'line-opacity': 0.9,
            'line-blur': 1 // Efek glowing
        }
    });
    
    // FIX: Pastikan marker digambar ulang seketika setelah peta benar-benar siap (style loaded)
    // Sebelumnya, jika peta telat loading, marker tidak tergambar dan user harus menunggu 10 detik!
    refreshTrackers();
  });
}

/* ───────────────────────────────────────────────────────
   AMBIL DATA TRACKER DARI BACKEND
─────────────────────────────────────────────────────── */
async function refreshTrackers() {
  try {
    const res  = await apiFetch('/tracker/locations');
    const json = res.data || {};
    const trackers = json.data || [];

    renderTrackerList(trackers);
    renderTrackerMarkers(trackers);
  } catch (e) {
    console.error('Tracking refresh error:', e);
    document.getElementById('tracking-list').innerHTML =
      `<div class="empty-state">
        <i class="fas fa-exclamation-circle" style="font-size: 24px; color: #f59e0b; margin-bottom: 8px;"></i><br>Gagal memuat data tracker.<br>Pastikan server berjalan.
      </div>`;
  }
}

/* ───────────────────────────────────────────────────────
   RENDER DAFTAR TRACKER (sidebar kiri)
─────────────────────────────────────────────────────── */
function renderTrackerList(trackers) {
  const el = document.getElementById('tracking-list');

  const onlineCount  = trackers.filter(isOnline).length;
  const offlineCount = trackers.length - onlineCount;
  const onlineEl  = document.getElementById('stat-tracker-online');
  const offlineEl = document.getElementById('stat-tracker-offline');
  const updateEl  = document.getElementById('tracker-last-update');
  if (onlineEl)  onlineEl.textContent  = onlineCount;
  if (offlineEl) offlineEl.textContent = offlineCount;
  if (updateEl)  updateEl.textContent  = 'Update: ' + new Date().toLocaleTimeString('id-ID');

  if (!trackers.length) {
    el.innerHTML = `
      <div style="text-align:center;padding:24px;color:#64748b;font-size:13px;line-height:1.7;">
        <div style="font-size:32px;margin-bottom:8px;color:#94a3b8;"><i class="fas fa-satellite-dish"></i></div>
        <h3>Belum Ada Tracker</h3>
        <p>Gunakan HP Android sebagai tracker tersembunyi dengan menghubungkannya terlebih dahulu.</p>
      </div>`;
    return;
  }

  el.innerHTML = trackers.map(t => {
    const online     = isOnline(t);
    const lastSeen   = t.last_seen_at ? timeSince(t.last_seen_at) : 'Belum pernah';
    const battColor  = t.battery > 50 ? '#22c55e' : t.battery > 20 ? '#eab308' : '#ef4444';
    const battIcon   = t.battery > 50 ? '<i class="fas fa-circle" style="color:#22c55e;"></i>' : t.battery > 20 ? '<i class="fas fa-circle" style="color:#eab308;"></i>' : '<i class="fas fa-circle" style="color:#ef4444;"></i>';

    return `
      <div class="tracker-card ${online ? 'tracker-online' : 'tracker-offline'}"
           onclick="focusTracker(${t.id})"
           data-tracker-id="${t.id}"
           style="cursor:pointer;">
        <div class="tracker-card-header">
          <div class="tracker-name">
            <span class="tracker-dot ${online ? 'dot-green' : 'dot-red'}"></span>
            ${escHtml(t.car_label || 'Mobil #' + t.car_id)}
          </div>
          <span class="tracker-status-badge ${online ? 'badge-success' : 'badge-danger'}">
            ${online ? '● Online' : '○ Offline'}
          </span>
        </div>
        <div class="tracker-card-body">
          <div style="display:flex; justify-content:space-between; font-size:12px; color:#64748b; margin-top:8px;">
            <span><i class="fas fa-map-marker-alt" style="color:#ef4444;margin-right:4px;"></i> ${t.lat ? t.lat.toFixed(5) + ', ' + t.lng.toFixed(5) : '–'}</span>
            <span><i class="fas fa-history" style="margin-right:4px;"></i> ${lastSeen}</span>
            ${t.battery != null ? `<span style="color:${battColor};font-size:11px;">${battIcon} ${t.battery}%</span>` : ''}
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;margin-top:10px;">
          <div style="display:flex;gap:6px;">
            <button class="btn btn-soft-secondary btn-sm" style="flex:1;"
                    onclick="event.stopPropagation();viewTrackerSetup('${t.car_id}', '${escHtml(t.car_label || '').replace(/'/g,'\\\'')}', '${t.device_token}')"
                    title="Lihat Setup QR & Token">
              <i class="fas fa-qrcode"></i> Setup QR
            </button>
            <button class="btn btn-danger btn-sm"
                    onclick="event.stopPropagation();deactivateTracker(${t.id})"
                    title="Nonaktifkan tracker">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
          <button class="btn btn-primary btn-sm" style="width:100%;font-size:11px;"
                  onclick="event.stopPropagation();viewTrackerHistory('${t.car_id}', '${t.device_token}')">
            <i class="fas fa-play-circle"></i> Trip Playback
          </button>
        </div>
      </div>`;
  }).join('');
}

/* ───────────────────────────────────────────────────────
   MATH UTILS UNTUK ANIMASI & ROTASI (BEARING)
─────────────────────────────────────────────────────── */
function calculateBearing(startLat, startLng, destLat, destLng) {
  startLat = toRadians(startLat);
  startLng = toRadians(startLng);
  destLat = toRadians(destLat);
  destLng = toRadians(destLng);

  const y = Math.sin(destLng - startLng) * Math.cos(destLat);
  const x = Math.cos(startLat) * Math.sin(destLat) -
            Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
  let brng = Math.atan2(y, x);
  brng = toDegrees(brng);
  return (brng + 360) % 360;
}
function toRadians(degrees) { return degrees * Math.PI / 180; }
function toDegrees(radians) { return radians * 180 / Math.PI; }

function animateMarker(marker, start, end, duration) {
    const startTime = performance.now();
    function step(timestamp) {
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const currentLng = start[0] + (end[0] - start[0]) * progress;
        const currentLat = start[1] + (end[1] - start[1]) * progress;
        marker.setLngLat([currentLng, currentLat]);
        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }
    requestAnimationFrame(step);
}

/* ───────────────────────────────────────────────────────
   RENDER MARKER DI PETA (SMOOTH INTERPOLATION)
─────────────────────────────────────────────────────── */
function renderTrackerMarkers(trackers) {
  if (!trackingMap || !trackingMap.isStyleLoaded()) return;

  const validIds = new Set(trackers.map(t => t.id));

  // Hapus marker yang sudah tidak valid
  Object.keys(trackerMarkers).forEach(id => {
    if (!validIds.has(Number(id))) {
      trackerMarkers[id].marker.remove();
      delete trackerMarkers[id];
    }
  });

  const bounds = new maplibregl.LngLatBounds();
  let hasValid = false;

  trackers.forEach(t => {
    if (!t.lat || !t.lng) return;
    const online = isOnline(t);
    const lngLat = [parseFloat(t.lng), parseFloat(t.lat)];
    hasValid = true;
    bounds.extend(lngLat);

    const popupHtml = buildPopupHtml(t, online);

    if (trackerMarkers[t.id]) {
      // UPDATE MARKER YANG ADA
      const tm = trackerMarkers[t.id];
      const oldLngLat = tm.latlng;
      
      // Hitung arah berbelok (bearing)
      const brg = calculateBearing(oldLngLat[1], oldLngLat[0], lngLat[1], lngLat[0]);
      
      // Update gaya marker
      tm.element.className = `map-tracker-icon ${online ? 'map-icon-online' : 'map-icon-offline'}`;
      let innerHTML = `
        <div class="tracker-arrow"></div>
        <div class="tracker-core">
          <svg viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/></svg>
        </div>
      `;
      if (online) innerHTML += `<div class="map-ping-ring"></div>`;
      tm.element.innerHTML = innerHTML;
      
      // Lakukan animasi halus jika mobil bergerak
      if (oldLngLat[0] !== lngLat[0] || oldLngLat[1] !== lngLat[1]) {
        animateMarker(tm.marker, oldLngLat, lngLat, 2000); // Bergerak perlahan selama 2 detik
      }
      tm.latlng = lngLat;
      
      // Putar moncong mobil (Rotasi)
      if (!isNaN(brg) && (oldLngLat[0] !== lngLat[0] || oldLngLat[1] !== lngLat[1])) {
        tm.marker.setRotation(brg);
      }
      
      const popup = tm.marker.getPopup();
      if(popup) popup.setHTML(popupHtml);
      
    } else {
      // BUAT MARKER BARU
      const el = document.createElement('div');
      el.className = `map-tracker-icon ${online ? 'map-icon-online' : 'map-icon-offline'}`;
      let innerHTML = `
        <div class="tracker-arrow"></div>
        <div class="tracker-core">
          <svg viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/></svg>
        </div>
      `;
      if (online) innerHTML += `<div class="map-ping-ring"></div>`;
      el.innerHTML = innerHTML;

      const popup = new maplibregl.Popup({ offset: 25, className: 'dark-popup' }).setHTML(popupHtml);
      const marker = new maplibregl.Marker(el)
        .setLngLat(lngLat)
        .setPopup(popup)
        .addTo(trackingMap);
        
      trackerMarkers[t.id] = { marker, element: el, latlng: lngLat };
    }
  });

  if (!initialFitDone && hasValid) {
    trackingMap.fitBounds(bounds, { padding: 50, maxZoom: 15 });
    initialFitDone = true;
  }
}

/* ───────────────────────────────────────────────────────
   POPUP HTML
─────────────────────────────────────────────────────── */
function buildPopupHtml(t, online) {
  const lastSeen  = t.last_seen_at ? timeSince(t.last_seen_at) : '–';
  const battStr   = t.battery != null ? t.battery + '%' : '–';
  const speedStr  = t.speed   != null ? t.speed.toFixed(1) + ' km/h' : '–';
  
  return `
    <div style="font-family:Inter,sans-serif;min-width:200px; color:#1e293b; padding: 12px 16px;">
      <h4 style="margin:0 0 8px;font-size:15px;color:#0f172a;display:flex;align-items:center;gap:6px;">
      <i class="fas fa-car" style="color:#3b82f6;"></i> ${escHtml(t.car_label || 'Mobil #' + t.car_id)}
      </h4>
      <div style="font-size:12px;color:#475569;display:flex;flex-direction:column;gap:4px;">
        <div style="display:flex;align-items:center;gap:6px;"><i class="fas fa-clock" style="color:#64748b;width:14px;text-align:center;"></i> Update: <b>${lastSeen}</b></div>
        <div style="display:flex;align-items:center;gap:6px;"><i class="fas fa-tachometer-alt" style="color:#f59e0b;width:14px;text-align:center;"></i> Kecepatan: <b>${speedStr}</b></div>
        <div style="display:flex;align-items:center;gap:6px;"><i class="fas fa-battery-half" style="color:#22c55e;width:14px;text-align:center;"></i> Baterai: <b>${battStr}</b></div>
      </div>
      <div style="margin-top:16px;">
        <a href="https://maps.google.com/?q=${t.lat},${t.lng}" target="_blank"
           style="display:block;text-align:center;background:#3b82f6;color:white;padding:10px 0;border-radius:8px;text-decoration:none;font-size:12px;font-weight:700;box-shadow:0 4px 12px rgba(59,130,246,0.3);transition:background 0.2s; margin-bottom:4px;">
          <i class="fas fa-map-marked-alt"></i> Buka di Google Maps
        </a>
      </div>
    </div>`;
}

/* ───────────────────────────────────────────────────────
   FOKUS KE MARKER
─────────────────────────────────────────────────────── */
function focusTracker(id) {
  const tm = trackerMarkers[id];
  if (!tm) return;
  
  // Gunakan jumpTo agar pindah secara instan (tanpa animasi delay sama sekali)
  trackingMap.jumpTo({ center: tm.latlng, zoom: 18, pitch: 60 }); 
  
  const popup = tm.marker.getPopup();
  if (popup && !popup.isOpen()) {
    tm.marker.togglePopup();
  }
  
  document.querySelectorAll('.tracker-card').forEach(c => c.classList.remove('tracker-selected'));
  const card = document.querySelector(`[data-tracker-id="${id}"]`);
  if (card) card.classList.add('tracker-selected');
}

/* ───────────────────────────────────────────────────────
   TRIP PLAYBACK ENGINE
─────────────────────────────────────────────────────── */
async function viewTrackerHistory(carId, deviceToken) {
  try {
    toast('Memuat rute historis...', 'info');
    const res = await apiFetch('/tracker/history/' + carId);
    if (!res || !res.ok) throw new Error('Gagal memuat histori');
    
    const allHistory = res.data?.data || [];
    const historyData = deviceToken ? allHistory.filter(h => h.device_token === deviceToken) : allHistory;

    if (historyData.length < 2) {
      toast('Belum cukup data rute untuk diputar ulang.', 'warning');
      return;
    }

    const rawLatlngs = historyData.map(h => [parseFloat(h.lng), parseFloat(h.lat)]);
    const timestamps = historyData.map(h => h.created_at);
    
    // Filter out jitter (remove points that are too close to each other)
    const coords = [];
    const times = [];
    if (rawLatlngs.length > 0) {
      coords.push(rawLatlngs[0]);
      times.push(timestamps[0]);
      for (let i = 1; i < rawLatlngs.length; i++) {
         coords.push(rawLatlngs[i]);
         times.push(timestamps[i]);
      }
    }

    // Gambar Garis Rute (Latar Belakang)
    trackingMap.getSource('route-history').setData({
        'type': 'Feature',
        'properties': {},
        'geometry': {
            'type': 'LineString',
            'coordinates': coords
        }
    });

    // Reset Jalur Menyala (Progress)
    trackingMap.getSource('route-progress').setData({
        'type': 'Feature',
        'properties': {},
        'geometry': {
            'type': 'LineString',
            'coordinates': [coords[0]]
        }
    });
    
    // Zoom ke Rute
    const bounds = new maplibregl.LngLatBounds();
    coords.forEach(c => bounds.extend(c));
    trackingMap.fitBounds(bounds, { padding: 80, pitch: 45 }); // Cinematic view
    
    // Setup Data Playback
    pbData = { coords, times, carId };
    pbIndex = 0;
    
    // Tampilkan Floating UI Playback
    document.getElementById('playback-panel').style.display = 'block';
    const slider = document.getElementById('pb-slider');
    slider.max = coords.length - 1;
    slider.value = 0;
    slider.disabled = false;
    slider.oninput = function(e) {
        if (!pbData) return;
        pbIndex = parseInt(e.target.value);
        const start = pbData.coords[pbIndex];
        pbMarker.setLngLat(start);
        const progressCoords = pbData.coords.slice(0, pbIndex + 1);
        trackingMap.getSource('route-progress').setData({
            'type': 'Feature',
            'properties': {},
            'geometry': { 'type': 'LineString', 'coordinates': progressCoords }
        });
        trackingMap.easeTo({ center: start, duration: 300 });
        updatePlaybackUI();
    };
    
    // Setup Marker Hantu (Playback Marker)
    if (pbMarker) pbMarker.remove();
    const el = document.createElement('div');
    el.className = 'map-tracker-icon map-icon-playback';
    el.innerHTML = `
      <div class="tracker-arrow"></div>
      <div class="tracker-core">
        <svg viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/></svg>
      </div>
    `;
    
    pbMarker = new maplibregl.Marker(el).setLngLat(coords[0]).addTo(trackingMap);
        
    updatePlaybackUI();
    toast('Rute siap diputar!', 'success');
  } catch (e) {
    toast('Error: ' + e.message, 'error');
  }
}

function closePlayback() {
    document.getElementById('playback-panel').style.display = 'none';
    if(pbInterval) clearInterval(pbInterval);
    isPlaying = false;
    document.getElementById('pb-play-btn').innerHTML = '<i class="fas fa-play"></i>';
    if(pbMarker) pbMarker.remove();
    trackingMap.getSource('route-history').setData({
        'type': 'Feature',
        'properties': {},
        'geometry': { 'type': 'LineString', 'coordinates': [] }
    });
    trackingMap.getSource('route-progress').setData({
        'type': 'Feature',
        'properties': {},
        'geometry': { 'type': 'LineString', 'coordinates': [] }
    });
}

function togglePlayback() {
    if(!pbData) return;
    isPlaying = !isPlaying;
    const btn = document.getElementById('pb-play-btn');
    if (isPlaying) {
        btn.innerHTML = '<i class="fas fa-pause"></i>';
        if (pbIndex >= pbData.coords.length - 1) pbIndex = 0; // ulang dari awal jika sudah selesai
        pbInterval = setInterval(playStep, 600); // Tiap titik berdurasi 0.6 detik
    } else {
        btn.innerHTML = '<i class="fas fa-play"></i>';
        clearInterval(pbInterval);
    }
}

function playStep() {
    if (pbIndex >= pbData.coords.length - 1) {
        togglePlayback();
        return;
    }
    pbIndex++;
    
    const start = pbData.coords[pbIndex-1];
    const end = pbData.coords[pbIndex];
    
    // Animasi marker bergerak
    animateMarker(pbMarker, start, end, 600);
    
    // Rotasi moncong mobil
    const brg = calculateBearing(start[1], start[0], end[1], end[0]);
    if (!isNaN(brg)) pbMarker.setRotation(brg);
    
    // Update Garis Menyala (Trailing Progress Line)
    const progressCoords = pbData.coords.slice(0, pbIndex + 1);
    trackingMap.getSource('route-progress').setData({
        'type': 'Feature',
        'properties': {},
        'geometry': {
            'type': 'LineString',
            'coordinates': progressCoords
        }
    });
    
    // Kamera mengikuti tanpa berputar (agar tidak pusing)
    trackingMap.easeTo({
        center: end,
        duration: 600,
        easing: (t) => t
    });
    
    updatePlaybackUI();
}

function updatePlaybackUI() {
    document.getElementById('pb-slider').value = pbIndex;
    if(pbData && pbData.times[pbIndex]) {
        const d = new Date(pbData.times[pbIndex]);
        document.getElementById('pb-time-label').innerText = d.toLocaleDateString('id-ID') + ' ' + d.toLocaleTimeString('id-ID');
    }
}

/* ───────────────────────────────────────────────────────
   GENERATE LINK TRACKER
─────────────────────────────────────────────────────── */
async function openGenerateTokenModal() {
  openModal('tracker-gen-modal');
  document.getElementById('gen-result').style.display = 'none';
  document.getElementById('gen-car-select').parentElement.style.display = '';
  
  const customLabelInput = document.getElementById('gen-custom-label');
  if (customLabelInput) {
    customLabelInput.parentElement.style.display = '';
    customLabelInput.value = '';
  }
  document.getElementById('gen-token-btn').style.display = '';
  
  const sel = document.getElementById('gen-car-select');
  sel.innerHTML = '<option value="">Memuat data mobil...</option>';
  
  try {
    const res = await Cars.listAll();
    if (!res || !res.ok) throw new Error();
    const cars = window.extractList(res);
    
    const trRes = await apiFetch('/tracker/locations');
    const trJson = trRes.data || {};
    const activeCarIds = new Set((trJson.data || []).map(t => String(t.car_id)));

    if (!cars || !cars.length) {
      sel.innerHTML = '<option value="">Tidak ada data mobil</option>';
      return;
    }

    sel.innerHTML = '<option value="">-- Pilih Mobil --</option>' + cars.map(c => {
      const isTracked = activeCarIds.has(String(c.id));
      const statusText = isTracked ? ' (Sudah Ditracking)' : '';
      return `<option value="${c.id}" ${isTracked ? 'disabled' : ''}>${escHtml(c.name_car || c.model || 'Mobil')} - ${escHtml(c.plate_number)}${statusText}</option>`;
    }).join('');
  } catch (e) {
    sel.innerHTML = '<option value="">Gagal memuat data mobil</option>';
  }
}

async function doGenerateToken() {
  const sel = document.getElementById('gen-car-select');
  const carId = sel.value;
  let carLabel = sel.options[sel.selectedIndex]?.text.replace(' (Sudah Ditracking)', '');
  
  const customLabelInput = document.getElementById('gen-custom-label');
  if (customLabelInput && customLabelInput.value.trim() !== '') {
    carLabel = customLabelInput.value.trim() + ' (' + carLabel + ')';
  }

  if (!carId) { toast('Silakan pilih mobil terlebih dahulu!', 'error'); return; }

  const btn = document.getElementById('gen-token-btn');
  btn.disabled = true;
  btn.textContent = 'Generating...';

  try {
    const res = await apiFetch('/tracker/generate-token', {
      method: 'POST',
      body: JSON.stringify({ car_id: carId, car_label: carLabel }),
    });
    const json = res.data || {};
    if (!res.ok) throw new Error(json.message || 'Gagal generate token');

    const token = json.device_token;
    const url = 'https://exponic.site/tracker.html?token=' + token + '&car_id=' + carId + '&label=' + encodeURIComponent(carLabel) + '&autostart=1';
    
    document.getElementById('gen-result').style.display = '';
    document.getElementById('gen-tracker-url').textContent = url;
    document.getElementById('gen-tracker-url').href = url;
    
    const tokenEl = document.getElementById('gen-tracker-token');
    if (tokenEl) tokenEl.textContent = token;
    
    document.getElementById('gen-qr-img').src =
      'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(url);

    toast('Link & Token tracker berhasil dibuat!', 'success');
    refreshTrackers();
  } catch (e) {
    toast('Error: ' + e.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Generate Link Tracker';
  }
}

window.viewTrackerSetup = function(carId, carLabel, token) {
  openModal('tracker-gen-modal');
  document.getElementById('gen-car-select').parentElement.style.display = 'none';
  const customLabelInput = document.getElementById('gen-custom-label');
  if (customLabelInput) customLabelInput.parentElement.style.display = 'none';
  document.getElementById('gen-token-btn').style.display = 'none';
  
  document.getElementById('gen-result').style.display = '';
  const url = 'https://exponic.site/tracker.html?token=' + token + '&car_id=' + carId + '&label=' + encodeURIComponent(carLabel) + '&autostart=1';
  document.getElementById('gen-tracker-url').textContent = url;
  document.getElementById('gen-tracker-url').href = url;
  
  const tokenEl = document.getElementById('gen-tracker-token');
  if (tokenEl) tokenEl.textContent = token;
  
  document.getElementById('gen-qr-img').src = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(url);
}

function copyTrackerUrl() {
  const url = document.getElementById('gen-tracker-url').textContent;
  navigator.clipboard.writeText(url).then(() => toast('Link disalin!', 'success'));
}

function copyTrackerToken() {
  const tokenEl = document.getElementById('gen-tracker-token');
  if (tokenEl) {
    navigator.clipboard.writeText(tokenEl.textContent).then(() => toast('Token disalin!', 'success'));
  }
}

/* ───────────────────────────────────────────────────────
   NONAKTIFKAN TRACKER
─────────────────────────────────────────────────────── */
async function deactivateTracker(id) {
  confirmAction('Nonaktifkan Tracker?', 'Tracker akan dinonaktifkan dan dihapus dari peta.', async () => {
    const res = await apiFetch('/tracker/' + id, { method: 'DELETE' });
    if (res && res.ok) {
      toast('Tracker dinonaktifkan.', 'success');
      if (trackerMarkers[id]) {
        trackerMarkers[id].marker.remove();
        delete trackerMarkers[id];
      }
      refreshTrackers();
    } else {
      toast('Gagal menonaktifkan tracker.', 'error');
    }
  });
}

/* ───────────────────────────────────────────────────────
   HELPERS
─────────────────────────────────────────────────────── */
function isOnline(t) {
  if (!t.last_seen_at) return false;
  const diff = (Date.now() - new Date(t.last_seen_at).getTime()) / 1000;
  return diff < OFFLINE_TIMEOUT;
}

function timeSince(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 5)   return 'Baru saja';
  if (diff < 60)  return diff + 'd yang lalu';
  if (diff < 3600) return Math.floor(diff/60) + 'm yang lalu';
  if (diff < 86400) return Math.floor(diff/3600) + 'j yang lalu';
  return Math.floor(diff/86400) + ' hari yang lalu';
}

function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Export ke window
window.loadTracking       = loadTracking;
window.refreshTrackers    = refreshTrackers;
window.focusTracker       = focusTracker;
window.viewTrackerHistory = viewTrackerHistory;
window.openGenerateTokenModal = openGenerateTokenModal;
window.doGenerateToken    = doGenerateToken;
window.viewTrackerSetup   = window.viewTrackerSetup;
window.closePlayback      = closePlayback;
window.togglePlayback     = togglePlayback;
