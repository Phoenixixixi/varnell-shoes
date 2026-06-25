<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [\App\Http\Controllers\UserController::class, 'index'])->name('landing-page');
Route::get('/collections', [\App\Http\Controllers\CollectionController::class, 'index'])->name('collections');
Route::get('/collections/{collection}', [\App\Http\Controllers\CollectionController::class, 'show'])->name('collections.show');

Route::get('/craftsmanship', [\App\Http\Controllers\UserController::class, 'craftsmanship'])->name('craftsmanship');
Route::get('/heritage', [\App\Http\Controllers\UserController::class, 'craftsmanship'])->name('heritage');

Route::middleware('guest')->group(function () {
    Route::get('/sign-in', [\App\Http\Controllers\Auth\AuthenticatedSessionController::class, 'create'])->name('user.login');
    Route::get('/sign-up', [\App\Http\Controllers\Auth\RegisteredUserController::class, 'create'])->name('user.register');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/account', [\App\Http\Controllers\AccountController::class, 'index'])->name('account');
    
    // Cart Routes
    Route::get('/cart', [\App\Http\Controllers\CartController::class, 'index'])->name('cart.index');
    Route::post('/cart/add', [\App\Http\Controllers\CartController::class, 'add'])->name('cart.add');
    Route::patch('/cart/update/{id}', [\App\Http\Controllers\CartController::class, 'update'])->name('cart.update');
    Route::delete('/cart/remove/{id}', [\App\Http\Controllers\CartController::class, 'remove'])->name('cart.remove');
    
    // Checkout Routes
    Route::get('/checkout', [\App\Http\Controllers\CheckoutController::class, 'index'])->name('checkout.index');
    Route::post('/checkout/process', [\App\Http\Controllers\CheckoutController::class, 'process'])->name('checkout.process');
    Route::post('/checkout/repay/{order}', [\App\Http\Controllers\CheckoutController::class, 'repay'])->name('checkout.repay');
    Route::post('/checkout/finalize', [\App\Http\Controllers\CheckoutController::class, 'finalize'])->name('checkout.finalize');
    // Shipment Status Route
    Route::get('/shipment', [\App\Http\Controllers\ShipmentController::class, 'userIndex'])->name('shipment.index');
    Route::get('/shipment/status', [\App\Http\Controllers\ShipmentController::class, 'status'])->name('shipment.status');
});

Route::post('/checkout/callback', [\App\Http\Controllers\CheckoutController::class, 'callback'])->name('checkout.callback');
Route::get('/checkout/callback', function() {
    return "The Varnell Callback endpoint is active. (Expecting Midtrans POST notification)";
});

Route::middleware(['admin'])->group(function () {
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('/', function () {
        return redirect()->route('admin.dashboard');
        });
        Route::get('dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

        Route::get('products/export', [\App\Http\Controllers\ProductController::class, 'export'])->name('product.export');
        Route::resource('products', \App\Http\Controllers\ProductController::class)->names('product');
        Route::get('products-logs/export', [\App\Http\Controllers\ProductLogController::class, 'export'])->name('product.logs.export');
        Route::get('products-logs', [\App\Http\Controllers\ProductLogController::class, 'index'])->name('product.logs');
        
        // Materials and Recipes
        Route::resource('materials', \App\Http\Controllers\MaterialController::class)->names('material');
        Route::put('/materials/{material}/add-quantity',[App\Http\Controllers\MaterialController::class, 'add_quantity']
        )->name('material.add-quantity');
        Route::resource('recipes', \App\Http\Controllers\RecipeController::class);
        Route::post('recipes/{recipe}/items', [\App\Http\Controllers\RecipeController::class, 'addItem'])->name('recipes.add-item');
        Route::delete('recipes/items/{item}', [\App\Http\Controllers\RecipeController::class, 'removeItem'])->name('recipes.remove-item');
        Route::get('material-logs/export', [\App\Http\Controllers\MaterialLogs::class, 'export'])->name('material.logs.export');
        Route::get('material-logs', [\App\Http\Controllers\MaterialLogs::class, 'index'])->name('material.logs');

        Route::get('shipment', [\App\Http\Controllers\ShipmentController::class, 'index'])->name('shipment');
        Route::patch('shipment/{id}', [\App\Http\Controllers\ShipmentController::class, 'update'])->name('shipment.update');
        Route::get('payments', [\App\Http\Controllers\PaymentController::class, 'index'])->name('payments');
        Route::post('payments/{id}/sync', [\App\Http\Controllers\PaymentController::class, 'sync'])->name('payments.sync');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
