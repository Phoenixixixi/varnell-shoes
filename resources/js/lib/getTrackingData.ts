export const getTrackingData = async (
    tracking_number: string,
    courier: string,
    phone?: string
) => {
    if (!tracking_number) throw new Error('No Tracking Number');
    if (!courier) throw new Error('No Courier');

    const params = new URLSearchParams({
        awb: tracking_number,
        courier,
    });

    if (phone) {
        const last5 = phone.replace(/\D/g, '').slice(-5);
        if (last5.length === 5) {
            params.set('number', last5);
        }
    }

    let data: any;

    try {
        const response = await fetch(`/cek-resi?${params.toString()}`);

        if (!response.ok) {
            throw new Error('Server error.');
        }

        data = await response.json();
    } catch {
        throw new Error('Unable to reach tracking service. Please try again later.');
    }

    if (!data || data.status !== 200) {
        throw new Error(
            data?.message ||
            data?.reason ||
            'Tracking data not available yet.'
        );
    }

    return data;
};