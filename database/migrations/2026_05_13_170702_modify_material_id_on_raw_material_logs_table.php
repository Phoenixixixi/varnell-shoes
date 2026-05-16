<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('raw_material_logs', function (Blueprint $table) {

            $table->dropForeign(['material_id']);

            $table->unsignedBigInteger('material_id')
                ->nullable()
                ->change();

            $table->foreign('material_id')
                ->references('id')
                ->on('raw_materials')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('raw_material_logs', function (Blueprint $table) {

            $table->dropForeign(['material_id']);

            $table->unsignedBigInteger('material_id')
                ->nullable(false)
                ->change();

            $table->foreign('material_id')
                ->references('id')
                ->on('raw_materials')
                ->cascadeOnDelete();
        });
    }
};