import React, { useEffect, useState } from 'react';
import UserLayoutApp from '@/layouts/user-layout';
import { Head, Link, router } from '@inertiajs/react';
import { assetUrl } from '@/lib/asset-url';
import { formatRupiah } from '@/lib/to-rupiah';
import { Package, ChevronRight, Clock, Truck, CheckCircle, AlertCircle, Activity, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

interface TrackingDetails {
    status: string;
    position: string;
    last_updated: string;
}

interface Shipment {
    id: number;
    status: string;
    order_id: number;
    created_at: string;
    tracking_number?: string;
    tracking_details?: TrackingDetails;
    order: {
        id: number;
        total_price: number;
        status: string;
        items: {
            product_id: number;
            quantity: number;
            size: string;
            product: { 
                name: string; 
                images: { image_list: string }[] 
            };
        }[];
        payment?: {
            status: string;
            method: string;
            transaction_status: string;
        };
    };
}

interface Props {
    shipments: Shipment[];
    midtrans_client_key: string;
    is_production: boolean;
}

declare global {
    interface Window {
        snap: any;
    }
}

export default function MyShipments({ shipments, midtrans_client_key, is_production }: Props) {
    const [loadingPayment, setLoadingPayment] = useState<number | null>(null);

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

    const handleRepay = async (e: React.MouseEvent, orderId: number) => {
        e.preventDefault();
        e.stopPropagation();

        setLoadingPayment(orderId);

        try {
            const response = await fetch(route('checkout.repay', { order: orderId }), {
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
                                    order_id: orderId,
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
                    onPending: function (result: any) {
                        router.reload();
                    },
                    onError: function (result: any) {
                        alert("Payment failed!");
                    },
                    onClose: function () {
                        setLoadingPayment(null);
                    }
                });
            } else {
                alert('Error: ' + (data.error || 'Could not initiate payment.'));
            }
        } catch (error) {
            console.error(error);
            alert('An unexpected error occurred.');
        } finally {
            setLoadingPayment(null);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
            case 'packaging': return <Package className="w-4 h-4 text-purple-500" />;
            case 'sent_to_courier': return <Truck className="w-4 h-4 text-blue-500" />;
            case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
            default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'Pending';
            case 'packaging': return 'Packaging';
            case 'sent_to_courier': return 'In Transit';
            case 'completed': return 'Delivered';
            default: return status;
        }
    };

    return (
        <UserLayoutApp>
            <Head title="My Orders - Varnell" />

            <main className="min-h-screen pt-32 pb-24 px-6 md:px-12 bg-surface">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-12 space-y-2">
                        <h1 className="text-4xl font-headline text-primary">My Orders</h1>
                        <p className="font-body text-on-surface-variant italic">Track your collections and craftsmanship.</p>
                    </div>

                    {shipments.length > 0 ? (
                        <div className="space-y-6">
                            {shipments.map((shipment) => {
                                const isPendingPayment = shipment.order.status === 'pending' && 
                                    (!shipment.order.payment || shipment.order.payment.status === 'pending');

                                return (
                                    <Link 
                                        key={shipment.id}
                                        href={route('shipment.status', { order_id: shipment.order_id })}
                                        className="block group"
                                    >
                                        <div className="bg-surface-container-low rounded-3xl p-6 md:p-8 border border-outline-variant transition-all duration-500 hover:editorial-shadow hover:-translate-y-1">
                                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                                {/* Order Info */}
                                                <div className="space-y-6 flex-1">
                                                    <div className="flex flex-wrap items-center gap-6 md:gap-12">
                                                        <div>
                                                            <p className="text-[10px] font-label font-bold tracking-[0.2em] uppercase text-primary/40">Order ID</p>
                                                            <p className="font-headline text-primary">#{shipment.order_id}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-label font-bold tracking-[0.2em] uppercase text-primary/40">Date</p>
                                                            <p className="font-body text-primary text-sm">{format(new Date(shipment.created_at), 'MMM d, yyyy')}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-label font-bold tracking-[0.2em] uppercase text-primary/40">Status</p>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                {isPendingPayment ? (
                                                                    <>
                                                                        <CreditCard className="w-4 h-4 text-yellow-500" />
                                                                        <span className="font-label font-bold text-[11px] uppercase tracking-wider text-yellow-600">
                                                                            Awaiting Payment
                                                                        </span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        {getStatusIcon(shipment.status)}
                                                                        <span className="font-label font-bold text-[11px] uppercase tracking-wider text-primary">
                                                                            {getStatusLabel(shipment.status)}
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {shipment.tracking_details && (
                                                            <div className="bg-secondary/10 px-3 py-1.5 rounded-full border border-secondary/20 flex items-center gap-2">
                                                                <Activity className="w-3 h-3 text-secondary animate-pulse" />
                                                                <span className="text-[9px] font-label font-bold uppercase tracking-wider text-secondary">
                                                                    Live: {shipment.tracking_details.status}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Items Preview */}
                                                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                                        {shipment.order.items.map((item, idx) => (
                                                            <div key={idx} className="flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border border-outline-variant bg-surface relative group-hover:border-secondary transition-colors">
                                                                <img 
                                                                    src={assetUrl(item.product.images[0]?.image_list)} 
                                                                    alt={item.product.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                                {item.quantity > 1 && (
                                                                    <span className="absolute bottom-1 right-1 bg-primary text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                                                                        x{item.quantity}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Price & Action */}
                                                <div className="flex flex-row md:flex-col justify-between items-end md:text-right">
                                                    <div className="md:mb-auto">
                                                        <p className="text-[10px] font-label font-bold tracking-[0.2em] uppercase text-primary/40 mb-1">Total Amount</p>
                                                        <p className="font-label font-bold text-lg text-primary">{formatRupiah(shipment.order.total_price)}</p>
                                                    </div>
                                                    
                                                    {isPendingPayment ? (
                                                        <button
                                                            onClick={(e) => handleRepay(e, shipment.order_id)}
                                                            disabled={loadingPayment === shipment.order_id}
                                                            className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 rounded-full font-label font-bold text-[10px] uppercase tracking-widest hover:bg-yellow-500 hover:text-white transition-all disabled:opacity-50"
                                                        >
                                                            {loadingPayment === shipment.order_id ? (
                                                                <Clock className="w-3 h-3 animate-spin" />
                                                            ) : (
                                                                <CreditCard className="w-3 h-3" />
                                                            )}
                                                            Pay Now
                                                        </button>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-secondary font-label font-bold text-[10px] uppercase tracking-[0.2em] group-hover:gap-4 transition-all">
                                                            View Details
                                                            <ChevronRight className="w-4 h-4" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-surface-container-low rounded-3xl p-20 border border-dashed border-outline-variant text-center space-y-6">
                            <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto text-primary/10">
                                <Package className="w-10 h-10" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-headline text-primary">No orders found</h3>
                                <p className="font-body text-on-surface-variant">Your Varnell collection journey starts here.</p>
                            </div>
                            <Link 
                                href="/collections"
                                className="inline-block px-8 py-4 bg-primary text-white rounded-xl text-xs font-label font-bold tracking-[0.2em] uppercase hover:opacity-90 transition-all"
                            >
                                Browse Collections
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </UserLayoutApp>
    );
}

