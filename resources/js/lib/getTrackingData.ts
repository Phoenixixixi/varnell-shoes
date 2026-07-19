export const getTrackingData = async (tracking_number: string, courier: string, phone?: string) => {
    const apiKey = import.meta.env.VITE_BINDER_BYTE_API_KEY;

    if (!tracking_number) throw new Error('No Tracking Number');
    if (!courier) throw new Error('No Courier');

    const params = new URLSearchParams({
        api_key: apiKey,
        courier,
        awb: tracking_number,
    });

    // Binderbyte accepts the last 5 digits of the recipient phone for some couriers.
    if (phone) {
        const last5 = phone.replace(/\D/g, '').slice(-5);
        if (last5.length === 5) {
            params.set('number', last5);
        }
    }

    let data: any;

    try {
        const response = await fetch(`https://api.binderbyte.com/v1/track?${params.toString()}`);
        data = await response.json();
    } catch {
        // Network failure / JSON parse error — treat as no tracking data
        throw new Error('Unable to reach tracking service. Please try again later.');
    }

    // Binderbyte always returns HTTP 200; the real status lives in data.status.
    // Anything other than 200 means the AWB wasn't found or the API rejected the request.
    if (!data || data.status !== 200) {
        const msg = data?.message || data?.reason || 'Tracking data not available yet.';
        throw new Error(msg);
    }

    return data;
};
