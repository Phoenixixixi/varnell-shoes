<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [\App\Http\Controllers\UserController::class, 'index'])->name('varnell');
Route::get('/collections', [\App\Http\Controllers\CollectionController::class, 'index'])->name('collections');
Route::get('/collections/{collection}', [\App\Http\Controllers\CollectionController::class, 'show'])->name('collections.show');

Route::middleware('guest')->group(function () {
    Route::get('/sign-in', [\App\Http\Controllers\UserAuthController::class, 'showLogin'])->name('user.login');
    Route::get('/sign-up', [\App\Http\Controllers\UserAuthController::class, 'showRegister'])->name('user.register');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/account', [\App\Http\Controllers\AccountController::class, 'index'])->name('account');

    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('/', function () {
        return redirect()->route('admin.dashboard');
        });
        Route::get('dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

        Route::resource('products', \App\Http\Controllers\ProductController::class)->names('product');
        Route::get('products-logs', [\App\Http\Controllers\ProductLogController::class, 'index'])->name('product.logs');
        Route::get('shipment', [\App\Http\Controllers\ShipmentController::class, 'index'])->name('shipment');
        Route::get('payments', [\App\Http\Controllers\PaymentController::class, 'index'])->name('payments');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
