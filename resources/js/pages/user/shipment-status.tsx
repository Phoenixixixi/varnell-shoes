import React, { useEffect, useState } from 'react';
import UserLayoutApp from '@/layouts/user-layout';
import { Head, Link, router } from '@inertiajs/react';
import { assetUrl } from '@/lib/asset-url';
import { Package, Truck, CheckCircle, Clock, MapPin, Activity, HandCoins, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

interface TrackingDetails {
    status: string;
    position: string;
    last_updated: string;
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
    midtrans_client_key: string;
    is_production: boolean;
}

declare global {
    interface Window {
        snap: any;
    }
}

export default function ShipmentStatus({ shipment, midtrans_client_key, is_production }: Props) {
    const [loadingPayment, setLoadingPayment] = useState(false);

    useEffect(() => {
        const midtransScriptUrl = is_production
            ? "https://app.midtrans.com/snap/snap.js"
            : "https://app.sandbox.midtrans.com/snap/snap.js";

        const script = document.createElement('script');
        script.src = midtransScriptUrl;
        script.setAttribute('data-client-key', midtrans_client_key);
        script.async = true;

        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        }
    }, [is_production, midtrans_client_key]);

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

            if (data.snap_token) {
                window.snap.pay(data.snap_token, {
                    onSuccess: async function (result: any) {
                        // Immediately notify backend of successful payment
                        try {
                            await fetch(route('checkout.finalize'), {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/json',
                                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                                },
                                body: JSON.stringify({
                                    order_id: shipment.order.id,
                                    transaction_id: result.transaction_id,
                                    payment_type: result.payment_type,
                                    transaction_status: result.transaction_status,
                                }),
                            });
                        } catch (e) {
                            console.error('Finalize call failed:', e);
                        }
                        router.reload();
                    },
                    onPending: function () { router.reload(); },
                    onError: function () { alert("Payment failed!"); },
                    onClose: function () { setLoadingPayment(false); }
                });
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
        { key: 'sent_to_courier', label: 'Sent to Courier', icon: <Truck className="w-5 h-5" />, desc: 'Your package is on its way to you.' },
        { key: 'completed', label: 'Delivered', icon: <CheckCircle className="w-5 h-5" />, desc: 'Enjoy your Varnell craftsmanship.' },
    ];

    // A payment is considered successful if status is 'success' or raw Midtrans status is 'settlement'/'capture'
    const isPaymentSuccess = shipment.status_payment === 'success' || shipment.status_payment === 'settlement' || shipment.status_payment === 'capture';
    const currentStatusIndex = statuses.findIndex(s => s.key === shipment.status);
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
                                                        {isCompleted ? status.desc : 'Expected soon.'}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {shipment.tracking_details && (
                                <div className="bg-surface-container-low rounded-3xl p-8 md:p-10 border border-outline-variant editorial-shadow">
                                    <h2 className="text-2xl font-headline text-primary mb-10 flex items-center gap-3">
                                        <MapPin className="w-6 h-6 text-secondary" />
                                        Live Tracking Details
                                    </h2>
                                    <div className="space-y-8">
                                        {shipment.tracking_details.history.map((item, index) => (
                                            <div key={index} className="flex gap-6 relative">
                                                {index !== shipment.tracking_details!.history.length - 1 && (
                                                    <div className="absolute left-2.5 top-8 bottom-[-24px] w-px bg-outline-variant border-dashed border-l" />
                                                )}
                                                <div className={`w-5 h-5 rounded-full mt-1.5 flex-shrink-0 ${index === 0 ? 'bg-secondary' : 'bg-outline-variant'}`} />
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-label font-bold text-xs uppercase tracking-wider text-secondary">
                                                            {format(new Date(item.time), 'MMM d, h:mm a')}
                                                        </span>
                                                        <span className="text-[10px] font-medium text-primary/40 px-2 py-0.5 rounded-full bg-outline-variant/30">
                                                            {item.location}
                                                        </span>
                                                    </div>
                                                    <p className={`font-body ${index === 0 ? 'text-primary font-medium' : 'text-on-surface-variant'}`}>
                                                        {item.description}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
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

