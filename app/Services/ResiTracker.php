<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class ResiTracker
{
    public function track($awb, $courier = 'jne', $number = null)
    {
        $params = [
            'api_key' => config('services.binderbyte.api_key'),
            'awb' => $awb,
            'courier' => $courier,
        ];

        // Tambahkan nomor HP jika diisi
        if (! empty($number)) {
            $params['number'] = $number;
        }

        return Http::get('https://api.binderbyte.com/v1/track', $params)
            ->json();
    }
}
