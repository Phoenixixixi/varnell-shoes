import React, { useState, useEffect } from 'react';
import UserLayoutApp from '@/layouts/user-layout';
import { Head, router } from '@inertiajs/react';
import { formatRupiah } from '@/lib/to-rupiah';
import { assetUrl } from '@/lib/asset-url';
import { ShieldCheck, Truck, CreditCard, ChevronRight } from 'lucide-react';

interface CheckoutItem {
    product_id: number;
    name: string;
    price: number;
    quantity: number;
    size: string;
    image: string;
}

interface Props {
    items: CheckoutItem[];
    total: number;
    user: {
        name: string;
        email: string;
        address?: string;
    };
}

declare global {
    interface Window {
        snap: any;
    }
}

export default function Checkout({ items, total, user }: Props) {
    const [address, setAddress] = useState(user.address || '');
    const [phone, setPhone] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleProcessPayment = async () => {
        if (!address || !phone || !postalCode) {
            alert('Please complete all shipping details.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(route('checkout.process'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({
                    items,
                    total,
                    address: {
                        street: address,
                        phone: phone,
                        postal_code: postalCode
                    }
                }),
            });

            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error('Non-JSON response received:', text);
                alert('Server returned an invalid response. Check console for details.');
                return;
            }

            if (data.payment_url) {
                window.location.href = data.payment_url;
            } else {
                alert('Error: ' + (data.error || 'Could not initiate payment.'));
            }
        } catch (error) {
            console.error(error);
            alert('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <UserLayoutApp>
            <Head title="Checkout - Varnell" />

            <main className="min-h-screen pt-32 pb-24 px-6 md:px-12 bg-surface">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-2 mb-12 text-xs font-label font-bold tracking-[0.2em] uppercase text-primary/40">
                        <Link href="/cart" className="hover:text-primary transition-colors">Bag</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-primary">Checkout</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                        {/* Left Side: Forms */}
                        <div className="space-y-12">
                            <section className="space-y-6">
                                <h2 className="text-3xl font-headline text-primary italic">Shipping Details</h2>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-label font-bold tracking-widest uppercase text-primary/60">Full Name</label>
                                        <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant font-body text-primary">
                                            {user.name}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-label font-bold tracking-widest uppercase text-primary/60">Email Address</label>
                                        <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant font-body text-primary">
                                            {user.email}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-label font-bold tracking-widest uppercase text-primary/60">Phone Number</label>
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="+62..."
                                                className="w-full p-4 bg-surface rounded-xl border border-outline-variant font-body text-primary focus:border-secondary focus:ring-1 focus:ring-secondary transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-label font-bold tracking-widest uppercase text-primary/60">Postal Code</label>
                                            <input
                                                type="text"
                                                value={postalCode}
                                                onChange={(e) => setPostalCode(e.target.value)}
                                                placeholder="12345"
                                                className="w-full p-4 bg-surface rounded-xl border border-outline-variant font-body text-primary focus:border-secondary focus:ring-1 focus:ring-secondary transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-label font-bold tracking-widest uppercase text-primary/60">Shipping Address</label>
                                        <textarea
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            rows={4}
                                            placeholder="Enter your complete delivery address..."
                                            className="w-full p-4 bg-surface rounded-xl border border-outline-variant font-body text-primary focus:border-secondary focus:ring-1 focus:ring-secondary transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-6">
                                <h2 className="text-3xl font-headline text-primary italic">Payment Method</h2>
                                <div className="p-6 bg-surface-container-low rounded-2xl border border-outline-variant flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                                        <CreditCard className="w-6 h-6" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <p className="font-headline text-primary">Doku Secure Payment</p>
                                        <p className="text-xs font-body text-on-surface-variant">Credit Card, GoPay, Bank Transfer, and more.</p>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Right Side: Order Summary */}
                        <div className="space-y-8">
                            <div className="bg-surface-container-low rounded-3xl p-10 border border-outline-variant editorial-shadow">
                                <h2 className="text-2xl font-headline text-primary mb-8 italic">Order Summary</h2>

                                <div className="space-y-6 mb-10">
                                    {items.map((item, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="w-16 h-20 rounded-lg overflow-hidden bg-surface flex-shrink-0">
                                                <img src={assetUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-headline text-primary text-sm">{item.name}</h4>
                                                <p className="text-[10px] font-label text-primary/40 tracking-widest uppercase">Size: {item.size} • Qty: {item.quantity}</p>
                                                <p className="text-sm font-label font-bold text-primary mt-1">{formatRupiah(item.price * item.quantity)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-4 pt-6 border-t border-outline-variant mb-10">
                                    <div className="flex justify-between text-sm font-body">
                                        <span className="text-on-surface-variant">Subtotal</span>
                                        <span className="text-primary">{formatRupiah(total)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-body">
                                        <span className="text-on-surface-variant">Shipping</span>
                                        <span className="text-secondary font-label font-bold uppercase tracking-widest text-[10px]">Complimentary</span>
                                    </div>
                                    <div className="flex justify-between items-end pt-4 border-t border-outline-variant">
                                        <span className="text-lg font-headline text-primary">Total</span>
                                        <span className="text-2xl font-bold font-label text-primary">{formatRupiah(total)}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleProcessPayment}
                                    disabled={loading}
                                    className="w-full py-5 bg-primary text-white rounded-xl text-sm font-label font-bold tracking-[0.2em] uppercase flex items-center justify-center gap-3 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : 'Complete Payment'}
                                    <ShieldCheck className="w-4 h-4" />
                                </button>

                                <div className="mt-8 grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2 text-[10px] font-label text-primary/40 tracking-widest uppercase">
                                        <Truck className="w-3 h-3" />
                                        Fast Delivery
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-label text-primary/40 tracking-widest uppercase">
                                        <ShieldCheck className="w-3 h-3" />
                                        Secure Checkout
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </UserLayoutApp>
    );
}

import { Link } from '@inertiajs/react';
