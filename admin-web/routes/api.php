<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TrackerController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

/* ===== TRACKER ROUTES ===== */

// HP tersembunyi kirim lokasi (tanpa auth, pakai device_token)
Route::post('/tracker/ping', [TrackerController::class, 'ping']);
Route::post('/tracker/stop', [TrackerController::class, 'stop']);

// Admin lihat semua lokasi tracker
Route::get('/tracker/locations', [TrackerController::class, 'locations']);

// Admin lihat lokasi tracker per mobil
Route::get('/tracker/locations/{carId}', [TrackerController::class, 'locationByCar']);

// Admin generate link tracker untuk HP tersembunyi
Route::post('/tracker/generate-token', [TrackerController::class, 'generateToken']);

// Admin nonaktifkan tracker
Route::delete('/tracker/{id}', [TrackerController::class, 'destroy']);

// Ambil histori rute mobil
Route::get('/tracker/history/{carId}', [TrackerController::class, 'history']);
