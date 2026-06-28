export const getTrackingData = async (tracking_number: string, courier: string) => {
    const apiKey = import.meta.env.VITE_BINDER_BYTE_API_KEY;
    if (!tracking_number) {
        throw new Error('No Tracking Number');
    }

    if (!courier) {
        throw new Error('No Courier');
    }

    const response = await fetch(`https://api.binderbyte.com/v1/track?api_key=${apiKey}&courier=${courier}&awb=${tracking_number}`);

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'failed to fetch');
    }
    return data;
};
