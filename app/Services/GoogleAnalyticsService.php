<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class GoogleAnalyticsService
{
    /**
     * Get visitor statistics.
     *
     * @return array
     */
    public function getVisitorData(): array
    {
        $propertyId = env('GOOGLE_ANALYTICS_PROPERTY_ID');
        $credentialsJson = env('GOOGLE_SERVICE_ACCOUNT_JSON');
        $credentialsPath = env('GOOGLE_APPLICATION_CREDENTIALS');

        if (!$propertyId || (!$credentialsJson && !$credentialsPath)) {
            return $this->getMockData();
        }

        return Cache::remember('google_analytics_visitor_data', 1800, function () use ($propertyId, $credentialsJson, $credentialsPath) {
            try {
                $accessToken = $this->getAccessToken($credentialsJson ?: $credentialsPath);
                if (!$accessToken) {
                    throw new \Exception('Failed to retrieve OAuth2 access token for Google Analytics API.');
                }

                // Fetch all-time stats overview
                $statsResponse = Http::withToken($accessToken)
                    ->post("https://analyticsdata.googleapis.com/v1beta/properties/{$propertyId}:runReport", [
                        'dateRanges' => [['startDate' => '2020-01-01', 'endDate' => 'today']],
                        'metrics' => [
                            ['name' => 'totalUsers'],
                            ['name' => 'sessions'],
                            ['name' => 'screenPageViews'],
                        ],
                    ]);

                // Fetch 7-day trend
                $trendResponse = Http::withToken($accessToken)
                    ->post("https://analyticsdata.googleapis.com/v1beta/properties/{$propertyId}:runReport", [
                        'dateRanges' => [['startDate' => '7daysAgo', 'endDate' => 'today']],
                        'dimensions' => [['name' => 'date']],
                        'metrics' => [
                            ['name' => 'totalUsers'],
                            ['name' => 'sessions'],
                        ],
                        'orderBys' => [
                            [
                                'dimension' => ['dimensionName' => 'date'],
                                'desc' => false,
                            ]
                        ]
                    ]);

                // Fetch real-time active users
                $realtimeResponse = Http::withToken($accessToken)
                    ->post("https://analyticsdata.googleapis.com/v1beta/properties/{$propertyId}:runRealtimeReport", [
                        'metrics' => [
                            ['name' => 'activeUsers'], // Realtime API only supports activeUsers, not totalUsers
                        ],
                    ]);

                if ($statsResponse->failed() || $trendResponse->failed()) {
                    Log::warning('Google Analytics Data API responded with an error.', [
                        'stats_status' => $statsResponse->status(),
                        'stats_body' => $statsResponse->body(),
                        'trend_status' => $trendResponse->status(),
                        'trend_body' => $trendResponse->body(),
                    ]);
                    return $this->getMockData();
                }

                $realtimeActive = 0;
                if ($realtimeResponse->successful()) {
                    $realtimeData = $realtimeResponse->json();
                    $realtimeActive = (int) ($realtimeData['rows'][0]['metricValues'][0]['value'] ?? 0);
                }

                return $this->formatApiResponse($statsResponse->json(), $trendResponse->json(), $realtimeActive);
            } catch (\Exception $e) {
                Log::error('Error fetching Google Analytics data: ' . $e->getMessage());
                return $this->getMockData();
            }
        });
    }

    /**
     * Generate access token using OAuth2 service account JWT assertion.
     */
    private function getAccessToken(?string $credentials): ?string
    {
        if (!$credentials) {
            return null;
        }

        // Parse key file
        $keyData = [];
        if (json_decode($credentials)) {
            $keyData = json_decode($credentials, true);
        } else {
            $resolvedPath = $credentials;

            // 1. Check relative path if starting with /var/www/html/ or similar
            if (!file_exists($resolvedPath)) {
                $cleanPath = str_replace('/var/www/html/', '', $credentials);
                if (file_exists(base_path($cleanPath))) {
                    $resolvedPath = base_path($cleanPath);
                } elseif (file_exists(storage_path($cleanPath))) {
                    $resolvedPath = storage_path($cleanPath);
                }
            }

            // 2. Fallback: Search storage/app directory for any service account json file
            if (!file_exists($resolvedPath)) {
                $files = glob(storage_path('app/*.json'));
                if (!empty($files)) {
                    foreach ($files as $file) {
                        $content = @file_get_contents($file);
                        if ($content && strpos($content, 'service_account') !== false) {
                            $resolvedPath = $file;
                            break;
                        }
                    }
                }
            }

            if (file_exists($resolvedPath)) {
                $keyData = json_decode(file_get_contents($resolvedPath), true);
            }
        }

        if (empty($keyData) || !isset($keyData['private_key']) || !isset($keyData['client_email'])) {
            throw new \Exception('Invalid Service Account configuration format. Resolved path: ' . ($resolvedPath ?? 'none'));
        }

        $now = time();
        $header = base64UrlEncode(json_encode(['alg' => 'RS256', 'typ' => 'JWT']));
        $payload = base64UrlEncode(json_encode([
            'iss' => $keyData['client_email'],
            'scope' => 'https://www.googleapis.com/auth/analytics.readonly',
            'aud' => 'https://oauth2.googleapis.com/token',
            'exp' => $now + 3600,
            'iat' => $now,
        ]));

        $signature = '';
        if (!openssl_sign("$header.$payload", $signature, $keyData['private_key'], OPENSSL_ALGO_SHA256)) {
            throw new \Exception('Failed to sign the OAuth2 JWT assertion.');
        }

        $assertion = "$header.$payload." . base64UrlEncode($signature);

        $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion' => $assertion,
        ]);

        if ($response->failed()) {
            Log::error('OAuth token request failed: ' . $response->body());
            return null;
        }

        return $response->json('access_token');
    }

    /**
     * Format real Google Analytics response data.
     */
    private function formatApiResponse(array $statsJson, array $trendJson, int $realtimeActive): array
    {
        $metricValues = $statsJson['rows'][0]['metricValues'] ?? [];
        
        $activeUsers = (int) ($metricValues[0]['value'] ?? 0);
        $sessions = (int) ($metricValues[1]['value'] ?? 0);
        $pageViews = (int) ($metricValues[2]['value'] ?? 0);

        $trends = [];
        if (isset($trendJson['rows'])) {
            foreach ($trendJson['rows'] as $row) {
                $rawDate = $row['dimensionValues'][0]['value'] ?? ''; // e.g. "20260617"
                $formattedDate = $rawDate ? Carbon::createFromFormat('Ymd', $rawDate)->format('Y-m-d') : '';
                
                $trends[] = [
                    'date' => $formattedDate,
                    'active_users' => (int) ($row['metricValues'][0]['value'] ?? 0),
                    'sessions' => (int) ($row['metricValues'][1]['value'] ?? 0),
                ];
            }
        }

        return [
            'is_mocked' => false,
            'stats' => [
                'active_users' => $activeUsers,
                'sessions' => $sessions,
                'page_views' => $pageViews,
                'active_realtime' => $realtimeActive,
            ],
            'trends' => $trends,
        ];
    }

    /**
     * Generate realistic-looking simulated data for local development.
     */
    private function getMockData(): array
    {
        $trends = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->format('Y-m-d');
            // Generate some deterministic but realistic random stats based on day of week
            $dayOfWeek = Carbon::now()->subDays($i)->dayOfWeek;
            $multiplier = ($dayOfWeek === 0 || $dayOfWeek === 6) ? 0.7 : 1.1; // lower traffic on weekends
            
            $baseUsers = 120 + rand(-20, 20);
            $trends[] = [
                'date' => $date,
                'active_users' => (int) ($baseUsers * $multiplier),
                'sessions' => (int) ($baseUsers * 1.3 * $multiplier),
            ];
        }

        return [
            'is_mocked' => true,
            'stats' => [
                'active_users' => 15245,
                'sessions' => 21680,
                'page_views' => 48890,
                'active_realtime' => rand(8, 24),
            ],
            'trends' => $trends,
        ];
    }
}

/**
 * Base64 URL helper function.
 */
if (!function_exists('App\Services\base64UrlEncode')) {
    function base64UrlEncode(string $data): string
    {
        return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
    }
}
