import React, { useEffect, useState } from 'react';
import UserLayoutApp from '@/layouts/user-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Package, Truck, CheckCircle, Clock, MapPin, Activity, HandCoins, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { getTrackingData } from '@/lib/getTrackingData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface TrackingDetails {
    status: string;
    position: string;
    last_updated: string;
    receiver?: string;
    history: {
        time: string;
        location: string;
        description: string;
    }[];
}

interface Shipment {
    id: number;
    status: string;
    tracking_number?: string;
    courier?: string;
    status_payment: string;
    tracking_details?: TrackingDetails;
    order: {
        id: number;
        total_price: number;
        status: string;
        shippind_address?: {
            addresses: string;
            city: string;
            postal_code: string;
            subdistrict: string;
            ward: string;
        };
        user: { name: string; email: string };
        items: {
            product_id: number;
            quantity: number;
            size: string;
            product: { name: string; images: { image_list: string }[] };
        }[];
    };
}

interface Props {
    shipment: Shipment;
}

declare global {
    interface Window {
        snap: any;
    }
}

export default function ShipmentStatus({ shipment }: Props) {
    const [loadingPayment, setLoadingPayment] = useState(false);
    const [trackingDetails, setTrackingDetails] = useState<TrackingDetails | null>(shipment.tracking_details || null);
    const [trackingLoading, setTrackingLoading] = useState(false);
    const [trackingError, setTrackingError] = useState<string | null>(null);

    useEffect(() => {
        if (!trackingDetails && shipment.tracking_number && shipment.courier) {
            setTrackingLoading(true);
            setTrackingError(null);
            getTrackingData(shipment.tracking_number, shipment.courier)
                .then(data => {
                    if (data.status === 200 && data.data) {
                        const formattedData: TrackingDetails = {
                            status: data.data.summary.status,
                            position: data.data.summary.awb,
                            last_updated: data.data.summary.date,
                            receiver: data.data.summary.receiver || data.data.detail?.receiver || '',
                            history: data.data.history.map((h: any) => ({
                                time: h.date.replace(' ', 'T'),
                                location: h.location || '',
                                description: h.desc
                            }))
                        };
                        setTrackingDetails(formattedData);
                    } else {
                        setTrackingError('Failed to fetch tracking data.');
                    }
                })
                .catch(err => {
                    setTrackingError(err.message || 'Error tracking package');
                })
                .finally(() => {
                    setTrackingLoading(false);
                });
        }
    }, [shipment.tracking_number, shipment.courier, trackingDetails]);

    const handleRepay = async () => {
        setLoadingPayment(true);

        try {
            const response = await fetch(route('checkout.repay', { order: shipment.order.id }), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
            });

            const data = await response.json();

            if (data.payment_url) {
                window.location.href = data.payment_url;
            } else {
                alert('Error: ' + (data.error || 'Could not initiate payment.'));
            }
        } catch (error) {
            console.error(error);
            alert('An unexpected error occurred.');
        } finally {
            setLoadingPayment(false);
        }
    };

    const statuses = [
        {
            key: 'payment',
            label: shipment.status_payment === 'success' ? 'Payment Confirmed' : 'Payment Status',
            icon: <HandCoins className="w-5 h-5" />,
            desc: shipment.status_payment === 'success' ? 'Thank you for your purchase.' : 'Payment is awaiting completion.',
            isPayment: true
        },
        { key: 'pending', label: 'Order Confirmed', icon: <Clock className="w-5 h-5" />, desc: 'We have received your order.' },
        { key: 'packaging', label: 'Packaging', icon: <Package className="w-5 h-5" />, desc: 'Your collection is being carefully prepared.' },
        { key: 'sent_to_courier', label: 'In Transit', icon: <Truck className="w-5 h-5" />, desc: 'Your package is on its way to you.' },
        { key: 'completed', label: 'Delivered', icon: <CheckCircle className="w-5 h-5" />, desc: 'Enjoy your Varnell craftsmanship.' },
    ];

    // A payment is considered successful if status is 'success' or raw Midtrans status is 'settlement'/'capture'
    const isPaymentSuccess = shipment.status_payment === 'success' || shipment.status_payment === 'settlement' || shipment.status_payment === 'capture';
    let currentStatusIndex = 0; // payment
    if (isPaymentSuccess) {
        currentStatusIndex = 1; // Confirmed
        if (shipment.status === 'packaging') {
            currentStatusIndex = 2; // Packaging
        } else if (shipment.status === 'sent_to_courier') {
            currentStatusIndex = 3; // In Transit
        } else if (shipment.status === 'completed') {
            currentStatusIndex = 4; // Delivered
        }

        // Live API override for Delivered status
        if (trackingDetails && (trackingDetails.status.toUpperCase() === 'DELIVERED' || trackingDetails.history[0]?.description.toUpperCase().includes('DELIVERED'))) {
            currentStatusIndex = 4; // Delivered
        }
    }
    const isUnpaid = shipment.order.status === 'pending' && !isPaymentSuccess;

    return (
        <UserLayoutApp>
            <Head title="Shipment Status - Varnell" />

            <main className="min-h-screen pt-32 pb-24 px-6 md:px-12 bg-surface">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <span className="text-secondary font-label font-bold tracking-[0.2em] uppercase text-sm">Track Your Order</span>
                        <h1 className="text-4xl md:text-5xl font-headline text-primary text-center">Shipment Status</h1>
                        <p className="font-body text-on-surface-variant text-center">Order ID: #{shipment.order.id}</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-surface-container-low rounded-3xl p-8 md:p-10 border border-outline-variant editorial-shadow">
                                <h2 className="text-2xl font-headline text-primary mb-10 flex items-center gap-3">
                                    <Activity className="w-6 h-6 text-secondary" />
                                    Order Progress
                                </h2>
                                <div className="relative space-y-10">
                                    <div className="absolute left-[26px] top-4 bottom-4 w-0.5 bg-outline-variant" />

                                    {statuses.map((status, index) => {
                                        // A step is completed only if:
                                        // 1. It's the payment step and payment is success
                                        // 2. It's a shipment step, payment is success, AND the status has been reached
                                        const isCompleted = status.isPayment
                                            ? isPaymentSuccess
                                            : (isPaymentSuccess && index > 0 && index <= currentStatusIndex);

                                        return (
                                            <div key={index} className="relative flex items-start gap-8 group">
                                                <div className={`relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${isCompleted ? 'bg-secondary text-white shadow-lg' : 'bg-surface border border-outline-variant text-primary/20'
                                                    }`}>
                                                    {status.icon}
                                                </div>
                                                <div className="flex-1 pt-2">
                                                    <div className="flex justify-between items-center">
                                                        <h3 className={`font-headline text-xl ${isCompleted ? 'text-primary' : 'text-primary/40'}`}>
                                                            {status.label}
                                                        </h3>
                                                        {status.isPayment && isUnpaid && (
                                                            <button
                                                                onClick={handleRepay}
                                                                disabled={loadingPayment}
                                                                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full font-label font-bold text-[10px] uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50"
                                                            >
                                                                {loadingPayment ? <Clock className="w-3 h-3 animate-spin" /> : <CreditCard className="w-3 h-3" />}
                                                                Pay Now
                                                            </button>
                                                        )}
                                                    </div>
                                                    <p className="text-sm font-body text-on-surface-variant mt-1">
                                                        {isCompleted ? (
                                                            status.key === 'completed' ? (
                                                                <span className="block space-y-1 mt-1">
                                                                    {trackingDetails?.receiver && (
                                                                        <span className="block">Received by: <span className="font-semibold text-primary">{trackingDetails.receiver}</span></span>
                                                                    )}
                                                                    {shipment.order.shippind_address && (
                                                                        <span className="block text-xs text-on-surface-variant/80">
                                                                            Address: {shipment.order.shippind_address.addresses}, {shipment.order.shippind_address.ward}, {shipment.order.shippind_address.subdistrict}, {shipment.order.shippind_address.city} {shipment.order.shippind_address.postal_code}
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            ) : status.desc
                                                        ) : 'Expected soon.'}
                                                    </p>
                                                    {status.key === 'sent_to_courier' && trackingDetails && (
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <button className="mt-3 text-[10px] font-label font-bold uppercase tracking-widest text-secondary hover:underline underline-offset-4 flex items-center gap-1 transition-all">
                                                                    Click for Details
                                                                </button>
                                                            </DialogTrigger>
                                                            <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto bg-white border-outline-variant p-8 md:p-10 rounded-3xl editorial-shadow">
                                                                <DialogHeader className="mb-8">
                                                                    <DialogTitle className="font-headline text-2xl text-primary flex items-center gap-3">
                                                                        <MapPin className="w-6 h-6 text-secondary" />
                                                                        Live Tracking Details
                                                                    </DialogTitle>
                                                                </DialogHeader>
                                                                
                                                                <div className="space-y-8">
                                                                    {trackingDetails.history.map((item, idx) => (
                                                                        <div key={idx} className="flex gap-6 relative">
                                                                            {idx !== trackingDetails.history.length - 1 && (
                                                                                <div className="absolute left-2.5 top-8 bottom-0 w-px bg-outline-variant border-dashed border-l" />
                                                                            )}
                                                                            <div className={`w-5 h-5 rounded-full mt-1.5 flex-shrink-0 ${idx === 0 ? 'bg-secondary' : 'bg-outline-variant'}`} />
                                                                            <div className="space-y-1 flex-1">
                                                                                <div className="flex items-center justify-between gap-3 flex-wrap">
                                                                                    <span className="font-label font-bold text-xs uppercase tracking-wider text-secondary">
                                                                                        {format(new Date(item.time), 'MMM d, h:mm a')}
                                                                                    </span>
                                                                                    {item.location && (
                                                                                        <span className="text-[10px] font-medium text-primary/40 px-2 py-0.5 rounded-full bg-outline-variant/30">
                                                                                            {item.location}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                                <p className={`font-body text-sm ${idx === 0 ? 'text-primary font-medium' : 'text-on-surface-variant'}`}>
                                                                                    {item.description}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </DialogContent>
                                                        </Dialog>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {trackingLoading && (
                                <div className="bg-surface-container-low rounded-3xl p-8 md:p-10 border border-outline-variant editorial-shadow">
                                    <div className="flex justify-center py-4">
                                        <Clock className="w-8 h-8 animate-spin text-secondary" />
                                    </div>
                                </div>
                            )}
                            {trackingError && (
                                <div className="bg-surface-container-low rounded-3xl p-8 md:p-10 border border-outline-variant editorial-shadow">
                                    <div className="text-red-500 text-center">{trackingError}</div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-8">
                            <div className="bg-surface-container-low rounded-2xl p-8 border border-outline-variant sticky top-32">
                                <h3 className="text-lg font-headline text-primary mb-6 flex items-center gap-3">
                                    <Truck className="w-5 h-5 text-secondary" />
                                    Shipping Information
                                </h3>
                                <div className="space-y-6">
                                    <div className="p-4 rounded-xl bg-surface border border-outline-variant/50">
                                        <p className="text-[10px] font-label font-bold tracking-widest uppercase text-primary/40 mb-1">Courier</p>
                                        <p className="font-headline text-lg text-primary">{shipment.courier || 'Pending Assignment'}</p>
                                    </div>

                                    <div className="p-4 rounded-xl bg-surface border border-outline-variant/50">
                                        <p className="text-[10px] font-label font-bold tracking-widest uppercase text-primary/40 mb-1">Tracking Number</p>
                                        <p className="font-body text-primary font-mono select-all">{shipment.tracking_number || 'Not available yet'}</p>
                                    </div>

                                    <div className="pt-4 border-t border-outline-variant">
                                        <p className="text-[10px] font-label font-bold tracking-widest uppercase text-primary/40 mb-3">Shipping To</p>
                                        <div className="space-y-1">
                                            <p className="font-headline text-primary">{shipment.order.user.name}</p>
                                            <p className="font-body text-sm text-on-surface-variant">{shipment.order.user.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 text-center">
                        <Link href="/account" className="inline-flex items-center gap-2 text-sm font-label font-bold tracking-widest uppercase text-primary hover:text-secondary transition-all hover:gap-4 underline underline-offset-8">
                            Back to My Account
                        </Link>
                    </div>
                </div>
            </main>
        </UserLayoutApp>
    );
}

