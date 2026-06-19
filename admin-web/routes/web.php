<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

Route::get('/', function () {
    return redirect('/login');
});

Route::get('/login', function () {
    return view('login');
})->name('login');

Route::get('/admin', function (Request $request) {
    if (!isset($_COOKIE['smy_token']) || empty($_COOKIE['smy_token'])) {
        return redirect('/login');
    }
    return view('admin');
})->name('admin');
