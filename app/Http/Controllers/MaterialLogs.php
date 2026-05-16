<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MaterialLog;
use Inertia\Inertia;

class MaterialLogs extends Controller
{
    public function index(){
        $logs = MaterialLog::with(['material', 'user'])->latest()->get();
        return Inertia::render('material-log', [
            'logs' => $logs
        ]);
    }
}
