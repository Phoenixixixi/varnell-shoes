<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // ─── Address ───
        Schema::create('address', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('postal_code');
            $table->string('city');
            $table->string('subdistrict');
            $table->string('ward');
            $table->string('addresses');
            $table->timestamps();
        });

        // Add address_id to users
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('address_id')->nullable()->after('password')->constrained('address')->nullOnDelete();
        });

        // ─── Products ───
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 12);
            $table->timestamps();
        });

        // ─── Product Desc Lists ───
        Schema::create('product_desc_lists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('list');
            $table->timestamps();
        });

        // ─── Products Logs ───
        Schema::create('products_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['in', 'out', 'update', 'destroy']);
            $table->unsignedInteger('quantity');
            $table->string('description')->nullable();
            $table->timestamps();
        });

        // ─── Product Images ───
        Schema::create('product_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('image_list');
            $table->timestamps();
        });

        // ─── Cart ───
        Schema::create('cart', function (Blueprint $table) {
            $table->id('cart_id');
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
        });

        // ─── Cart Items ───
        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('cart_id');
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('quantity')->default(1);
            $table->timestamps();

            $table->foreign('cart_id')->references('cart_id')->on('cart')->cascadeOnDelete();
        });

        // ─── Order ───
        Schema::create('order', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('total_price', 12, 2);
            $table->enum('status', ['pending', 'processing', 'completed', 'cancelled'])->default('pending');
            $table->json('shippind_address')->nullable();
            $table->timestamps();
        });

        // ─── Order Item ───
        Schema::create('order_item', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('order')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->decimal('price', 12, 2);
            $table->unsignedInteger('quantity');
            $table->timestamps();
        });

        // ─── Payments ───
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('order')->cascadeOnDelete();
            $table->string('midtrans_transaction_id')->nullable();
            $table->string('payment_type')->nullable();
            $table->string('transaction_status')->nullable();
            $table->decimal('gross_amout', 12, 2)->nullable();
            $table->timestamp('payment_time')->nullable();
            $table->json('raw_response')->nullable();
            $table->timestamps();
        });

        // ─── Shipment ───
        Schema::create('shipment', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('order')->cascadeOnDelete();
            $table->string('courier')->nullable();
            $table->string('tracking_number')->nullable();
            $table->string('status')->default('pending');
            $table->timestamps();
        });

        Schema::create('sizes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('size');
            $table->integer('stock');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipment');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('order_item');
        Schema::dropIfExists('order');
        Schema::dropIfExists('cart_items');
        Schema::dropIfExists('cart');
        Schema::dropIfExists('product_images');
        Schema::dropIfExists('products_logs');
        Schema::dropIfExists('product_desc_lists');
        Schema::dropIfExists('products');

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['address_id']);
            $table->dropColumn('address_id');
        });

        Schema::dropIfExists('address');
    }
};
