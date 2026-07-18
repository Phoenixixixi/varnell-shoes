export const getTrackingData = async (tracking_number: string, courier: string, phone?: string) => {
    const apiKey = import.meta.env.VITE_BINDER_BYTE_API_KEY;
    if (!tracking_number) {
        throw new Error('No Tracking Number');
    }

    if (!courier) {
        throw new Error('No Courier');
    }

    const params = new URLSearchParams({
        api_key: apiKey,
        courier,
        awb: tracking_number,
    });

    // Binderbyte accepts the last 5 digits of the recipient phone for couriers that require it.
    if (phone) {
        const last5 = phone.replace(/\D/g, '').slice(-5);
        if (last5.length === 5) {
            params.set('waybill_number', last5);
        }
    }

    const response = await fetch(`https://api.binderbyte.com/v1/track?${params.toString()}`);

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'failed to fetch');
    }
    return data;
};
