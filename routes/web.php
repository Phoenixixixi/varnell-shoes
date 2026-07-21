<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\CollectionController;
use App\Http\Controllers\Consument;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MaterialController;
use App\Http\Controllers\MaterialDashboardController;
use App\Http\Controllers\MaterialLogs;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductLogController;
use App\Http\Controllers\RecipeController;
use App\Http\Controllers\ShipmentController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/', [UserController::class, 'index'])->name('landing-page');

Route::get('/collections', [CollectionController::class, 'index'])->name('collections');
Route::get('/collections/{collection}', [CollectionController::class, 'show'])->name('collections.show');

Route::get('/consument-care', [UserController::class, 'consumentCare'])->name('consument-care');
Route::post('/consument-care', [UserController::class, 'storeConsumentCare'])->name('consument-care.store');
Route::get('/heritage', [UserController::class, 'heritage'])->name('heritage');

Route::get('/api/products/search', [ProductController::class, 'search'])->name('products.search');

Route::middleware('guest')->group(function () {
    Route::get('/sign-in', [AuthenticatedSessionController::class, 'create'])->name('user.login');
    Route::get('/sign-up', [RegisteredUserController::class, 'create'])->name('user.register');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/account', [AccountController::class, 'index'])->name('account');

    // Cart Routes
    Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
    Route::post('/cart/add', [CartController::class, 'add'])->name('cart.add');
    Route::patch('/cart/update/{id}', [CartController::class, 'update'])->name('cart.update');
    Route::delete('/cart/remove/{id}', [CartController::class, 'remove'])->name('cart.remove');

    // Checkout Routes
    Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout.index');
    Route::post('/checkout/process', [CheckoutController::class, 'process'])->name('checkout.process');
    Route::post('/checkout/repay/{order}', [CheckoutController::class, 'repay'])->name('checkout.repay');
    Route::post('/checkout/finalize', [CheckoutController::class, 'finalize'])->name('checkout.finalize');
    // Shipment Status Route
    Route::get('/shipment', [ShipmentController::class, 'userIndex'])->name('shipment.index');
    Route::get('/shipment/status', [ShipmentController::class, 'status'])->name('shipment.status');
});

Route::post('/checkout/callback', [CheckoutController::class, 'callback'])->name('checkout.callback');
Route::get('/checkout/callback', function () {
    return 'The Varnell Callback endpoint is active. (Expecting Midtrans POST notification)';
});

Route::middleware(['admin'])->group(function () {
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('/', function () {
            return redirect()->route('admin.dashboard');
        });
        Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::get('material-dashboard', [MaterialDashboardController::class, 'index'])->name('material-dashboard');
        Route::get('consument-care', [Consument::class,  'index'])->name('consument');

        Route::get('products/export', [ProductController::class, 'export'])->name('product.export');
        Route::resource('products', ProductController::class)->names('product');
        Route::get('products-logs/export', [ProductLogController::class, 'export'])->name('product.logs.export');
        Route::get('products-logs', [ProductLogController::class, 'index'])->name('product.logs');
        Route::put('products-logs/{id}', [ProductLogController::class, 'update'])->name('product.logs.update');
        Route::delete('products-logs/{id}', [ProductLogController::class, 'destroy'])->name('product.logs.destroy');

        // Materials and Recipes
        Route::resource('materials', MaterialController::class)->names('material');
        Route::put('/materials/{material}/add-quantity', [MaterialController::class, 'add_quantity']
        )->name('material.add-quantity');
        Route::resource('recipes', RecipeController::class);
        Route::post('recipes/{recipe}/items', [RecipeController::class, 'addItem'])->name('recipes.add-item');
        Route::delete('recipes/items/{item}', [RecipeController::class, 'removeItem'])->name('recipes.remove-item');
        Route::get('material-logs/export', [MaterialLogs::class, 'export'])->name('material.logs.export');
        Route::get('material-logs', [MaterialLogs::class, 'index'])->name('material.logs');
        Route::put('material-logs/{id}', [MaterialLogs::class, 'update'])->name('material.logs.update');
        Route::delete('material-logs/{id}', [MaterialLogs::class, 'destroy'])->name('material.logs.destroy');

        Route::get('shipment', [ShipmentController::class, 'index'])->name('shipment');
        Route::patch('shipment/{id}', [ShipmentController::class, 'update'])->name('shipment.update');
        Route::get('payments', [PaymentController::class, 'index'])->name('payments');
        Route::post('payments/{id}/sync', [PaymentController::class, 'sync'])->name('payments.sync');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
