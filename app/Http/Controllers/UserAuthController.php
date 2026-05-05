<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;

class UserAuthController extends Controller
{
    public function showLogin()
    {
        return Inertia::render('user/auth/login');
    }

    public function showRegister()
    {
        return Inertia::render('user/auth/register');
    }
}
