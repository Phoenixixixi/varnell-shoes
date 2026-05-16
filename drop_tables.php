<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

DB::statement('SET FOREIGN_KEY_CHECKS=0');
Schema::dropIfExists('material_logs');
Schema::dropIfExists('recipe_items');
Schema::dropIfExists('recipes');
Schema::dropIfExists('materials');
DB::statement('SET FOREIGN_KEY_CHECKS=1');
echo "Dropped tables successfully!\n";
