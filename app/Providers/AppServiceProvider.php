<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //  URL::forceScheme('https');
    }

    /**
     * Bootstrap any application services.
     */
    public function boot()
    {
        \Fouladgar\OTP\Notifications\OTPNotification::toMailUsing(fn ($notifiable, $token) => (new \Illuminate\Notifications\Messages\MailMessage)
            ->subject('Your Verification Code')
            ->greeting('Hello!')
            ->line('Your verification code is:')
            ->line($token)
            ->line('This code will expire in 10 minutes.')
            ->line('Thank you for using our application!')
        );
    }
}
