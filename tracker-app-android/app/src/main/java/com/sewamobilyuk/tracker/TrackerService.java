package com.sewamobilyuk.tracker;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.BatteryManager;
import android.os.Build;
import android.os.IBinder;
import android.os.Looper;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;

import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.Priority;

import org.json.JSONObject;

import java.io.IOException;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class TrackerService extends Service {

    private static final String TAG = "TrackerService";
    private static final String CHANNEL_ID = "TrackerServiceChannel";
    private static final int NOTIFICATION_ID = 1;
    
    // GANTI URL INI JIKA SUDAH DI-UPLOAD KE SERVER ASLI
    // Link sudah permanen ke server live
    private static final String API_URL = "https://sewamobilyuk-api.exponic.site/api/tracker/ping";

    private FusedLocationProviderClient fusedLocationClient;
    private LocationCallback locationCallback;
    private OkHttpClient httpClient;
    private String deviceToken;

    @Override
    public void onCreate() {
        super.onCreate();
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);
        httpClient = new OkHttpClient();
        
        SharedPreferences prefs = getSharedPreferences("TrackerPrefs", MODE_PRIVATE);
        deviceToken = prefs.getString("device_token", "");

        locationCallback = new LocationCallback() {
            @Override
            public void onLocationResult(LocationResult locationResult) {
                if (locationResult == null || locationResult.getLastLocation() == null) return;
                
                double lat = locationResult.getLastLocation().getLatitude();
                double lng = locationResult.getLastLocation().getLongitude();
                float speed = locationResult.getLastLocation().getSpeed() * 3.6f; // m/s to km/h
                float accuracy = locationResult.getLastLocation().getAccuracy();
                
                sendLocationToApi(lat, lng, speed, accuracy);
            }
        };
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        createNotificationChannel();
        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("SewaMobilYuk Tracker")
                .setContentText("Sistem pelacakan latar belakang sedang aktif.")
                .setSmallIcon(R.drawable.ic_launcher)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .build();

        startForeground(NOTIFICATION_ID, notification);
        startLocationUpdates();

        return START_STICKY;
    }

    private void startLocationUpdates() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            stopSelf();
            return;
        }

        // Ubah dari 15 detik menjadi 5 detik agar pergerakan map lebih "Live"
        LocationRequest locationRequest = new LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 5000)
                .setMinUpdateIntervalMillis(5000)
                .build();

        fusedLocationClient.requestLocationUpdates(locationRequest, locationCallback, Looper.getMainLooper());
    }

    private void sendLocationToApi(double lat, double lng, float speed, float accuracy) {
        if (deviceToken == null || deviceToken.isEmpty()) return;

        try {
            JSONObject json = new JSONObject();
            json.put("token", deviceToken);
            json.put("lat", lat);
            json.put("lng", lng);
            json.put("speed", speed);
            json.put("accuracy", accuracy);
            json.put("battery", getBatteryLevel());

            RequestBody body = RequestBody.create(MediaType.parse("application/json; charset=utf-8"), json.toString());
            Request request = new Request.Builder()
                    .url(API_URL)
                    .post(body)
                    .addHeader("Accept", "application/json")
                    .build();

            httpClient.newCall(request).enqueue(new Callback() {
                @Override
                public void onFailure(Call call, IOException e) {
                    Log.e(TAG, "Gagal mengirim lokasi: " + e.getMessage());
                }

                @Override
                public void onResponse(Call call, Response response) throws IOException {
                    if (response.isSuccessful()) {
                        Log.d(TAG, "Lokasi berhasil terkirim");
                    } else {
                        Log.e(TAG, "API Error: " + response.code());
                    }
                    response.close();
                }
            });

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private int getBatteryLevel() {
        BatteryManager bm = (BatteryManager) getSystemService(BATTERY_SERVICE);
        if (bm != null) {
            return bm.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY);
        }
        return 100;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (fusedLocationClient != null) {
            fusedLocationClient.removeLocationUpdates(locationCallback);
        }
        
        // Beritahu server bahwa HP ini berhenti tracking secara instan
        if (deviceToken != null && !deviceToken.isEmpty()) {
            try {
                JSONObject json = new JSONObject();
                json.put("token", deviceToken);
                RequestBody body = RequestBody.create(MediaType.parse("application/json; charset=utf-8"), json.toString());
                Request request = new Request.Builder()
                        .url(API_URL.replace("/ping", "/stop"))
                        .post(body)
                        .addHeader("Accept", "application/json")
                        .build();

                httpClient.newCall(request).enqueue(new Callback() {
                    @Override
                    public void onFailure(Call call, IOException e) { }
                    @Override
                    public void onResponse(Call call, Response response) throws IOException {
                        response.close();
                    }
                });
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                    CHANNEL_ID,
                    "Tracker Service Channel",
                    NotificationManager.IMPORTANCE_LOW
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(serviceChannel);
            }
        }
    }
}
