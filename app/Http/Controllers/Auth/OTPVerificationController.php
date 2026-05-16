<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Fouladgar\OTP\Exceptions\OTPException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class OTPVerificationController extends Controller
{
    public function show(Request $request): Response
    {
        return Inertia::render('user/auth/verify-otp', [
            'email' => $request->email,
            'type' => $request->type ?? 'registration', // 'registration' or 'password_reset'
        ]);
    }

    public function verify(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
            'type' => 'required|string|in:registration,password_reset',
        ]);

        try {
            // Use onlyConfirmToken to avoid fetching the user from the DB during validation,
            // which prevents "null given to revoke()" error if the user doesn't exist yet (registration).
            $notifiable = OTP()->onlyConfirmToken()->validate($request->email, $request->otp);
        } catch (OTPException $e) {
            return back()->withErrors(['otp' => $e->getMessage()]);
        } catch (\Exception $e) {
            return back()->withErrors(['otp' => 'An unexpected error occurred. Please try again.']);
        }

        if ($request->type === 'registration') {
            $data = $request->session()->get('registration_data');
            
            if (!$data || $data['email'] !== $request->email) {
                return redirect()->route('user.register')->withErrors(['email' => 'Registration session expired. Please register again.']);
            }

            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'],
                'role' => $data['role'],
                'email_verified_at' => now(),
            ]);

            $request->session()->forget('registration_data');
            Auth::login($user);
            return redirect()->route('landing-page');
        }

        if ($request->type === 'password_reset') {
            return redirect()->route('password.reset', ['token' => $request->otp, 'email' => $request->email]);
        }

        return redirect()->route('login');
    }

    public function resend(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        
        try {
            $user = User::where('email', $request->email)->first();
            if ($user) {
                OTP()->revoke($user);
            }
            
            OTP()->channel(['mail'])->send($request->email);
        } catch (\Exception $e) {
            return back()->withErrors(['email' => 'Could not resend code. ' . $e->getMessage()]);
        }

        return back()->with('status', 'A new verification code has been sent to your email.');
    }
}
