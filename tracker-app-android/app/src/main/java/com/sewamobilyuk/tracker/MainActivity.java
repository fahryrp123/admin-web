package com.sewamobilyuk.tracker;

import android.Manifest;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.google.zxing.integration.android.IntentIntegrator;
import com.google.zxing.integration.android.IntentResult;

public class MainActivity extends AppCompatActivity {

    private EditText etToken;
    private Button btnToggle;
    private Button btnScanQR;
    private TextView tvStatus;
    private SharedPreferences prefs;
    private boolean isTracking = false;

    private static final int PERMISSION_REQUEST_CODE = 123;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        etToken = findViewById(R.id.etToken);
        btnToggle = findViewById(R.id.btnToggle);
        btnScanQR = findViewById(R.id.btnScanQR);
        tvStatus = findViewById(R.id.tvStatus);
        
        prefs = getSharedPreferences("TrackerPrefs", MODE_PRIVATE);
        
        String savedToken = prefs.getString("device_token", "");
        if (!savedToken.isEmpty()) {
            etToken.setText(savedToken);
        }

        isTracking = prefs.getBoolean("is_tracking", false);
        updateUI();

        btnToggle.setOnClickListener(v -> {
            if (isTracking) {
                stopTracking();
            } else {
                startTracking();
            }
        });

        btnScanQR.setOnClickListener(v -> {
            IntentIntegrator integrator = new IntentIntegrator(this);
            integrator.setPrompt("Arahkan ke QR Code di layar admin");
            integrator.setBeepEnabled(true);
            integrator.setOrientationLocked(false);
            integrator.initiateScan();
        });

        checkPermissions();
    }

    private void checkPermissions() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED ||
            ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            
            ActivityCompat.requestPermissions(this,
                    new String[]{
                            Manifest.permission.ACCESS_FINE_LOCATION,
                            Manifest.permission.ACCESS_COARSE_LOCATION
                    }, PERMISSION_REQUEST_CODE);
        } else {
            checkBackgroundPermission();
        }
    }

    private void checkBackgroundPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_BACKGROUND_LOCATION) != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(this,
                        new String[]{Manifest.permission.ACCESS_BACKGROUND_LOCATION}, PERMISSION_REQUEST_CODE + 1);
            }
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQUEST_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                checkBackgroundPermission();
            } else {
                Toast.makeText(this, "Izin lokasi dibutuhkan!", Toast.LENGTH_LONG).show();
            }
        }
    }

    private void startTracking() {
        String token = etToken.getText().toString().trim();
        if (token.isEmpty()) {
            Toast.makeText(this, "Token tidak boleh kosong!", Toast.LENGTH_SHORT).show();
            return;
        }

        // Cek jika user mem-paste URL panjang, ambil bagian "token=" saja
        if (token.contains("token=")) {
            try {
                Uri uri = Uri.parse(token);
                String extractedToken = uri.getQueryParameter("token");
                if (extractedToken != null && !extractedToken.isEmpty()) {
                    token = extractedToken;
                    etToken.setText(token);
                }
            } catch (Exception e) {
                // Ignore parsing errors, use original
            }
        }

        prefs.edit()
            .putString("device_token", token)
            .putBoolean("is_tracking", true)
            .apply();

        isTracking = true;
        updateUI();

        Intent serviceIntent = new Intent(this, TrackerService.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent);
        } else {
            startService(serviceIntent);
        }
    }

    private void stopTracking() {
        prefs.edit().putBoolean("is_tracking", false).apply();
        isTracking = false;
        updateUI();

        Intent serviceIntent = new Intent(this, TrackerService.class);
        stopService(serviceIntent);
    }

    private void updateUI() {
        if (isTracking) {
            btnToggle.setText(R.string.stop_tracking);
            btnToggle.setBackgroundColor(Color.parseColor("#ef4444"));
            tvStatus.setText(R.string.status_active);
            tvStatus.setTextColor(Color.parseColor("#22c55e"));
            etToken.setEnabled(false);
        } else {
            btnToggle.setText(R.string.start_tracking);
            btnToggle.setBackgroundColor(Color.parseColor("#3b82f6"));
            tvStatus.setText(R.string.status_inactive);
            tvStatus.setTextColor(Color.parseColor("#ef4444"));
            etToken.setEnabled(true);
            btnScanQR.setEnabled(true);
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        IntentResult result = IntentIntegrator.parseActivityResult(requestCode, resultCode, data);
        if (result != null) {
            if (result.getContents() != null) {
                String scannedData = result.getContents();
                // Ekstrak token dari URL hasil scan
                if (scannedData.contains("token=")) {
                    try {
                        Uri uri = Uri.parse(scannedData);
                        String extractedToken = uri.getQueryParameter("token");
                        if (extractedToken != null && !extractedToken.isEmpty()) {
                            etToken.setText(extractedToken);
                            Toast.makeText(this, "Berhasil di-scan!", Toast.LENGTH_SHORT).show();
                            return;
                        }
                    } catch (Exception e) {}
                }
                // Jika bukan URL atau tidak ada parameter token
                etToken.setText(scannedData);
            }
        } else {
            super.onActivityResult(requestCode, resultCode, data);
        }
    }
}
