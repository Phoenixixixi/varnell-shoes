import React from 'react';
import UserLayoutApp from '@/layouts/user-layout';
import { usePage, router, Head } from '@inertiajs/react';
import { LogOut, Package, User, MapPin } from 'lucide-react';
import { formatRupiah } from '@/lib/to-rupiah';
import { assetUrl } from '@/lib/asset-url';

interface OrderItem {
    id: number;
    product: {
        name: string;
        images: { image_list: string }[];
    };
    quantity: number;
    price: number;
}

interface Order {
    id: number;
    total_price: number;
    status: string;
    created_at: string;
    items: OrderItem[];
}

interface UserData {
    name: string;
    email: string;
    address?: {
        street: string;
        city: string;
        state: string;
        postal_code: string;
        country: string;
    };
    orders: Order[];
}

export default function Account({ user }: { user: UserData }) {
    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <UserLayoutApp>
            <Head title="My Account" />
            <main className="pt-32 pb-24 px-6 md:px-12 max-w-[1440px] mx-auto min-h-screen">

                <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-outline-variant pb-8">
                    <div className="max-w-2xl">
                        <span className="text-secondary font-label font-bold tracking-[0.2em] uppercase text-sm">Dashboard</span>
                        <h1 className="text-5xl md:text-6xl font-headline font-light tracking-tight text-primary leading-tight mt-4">
                            Welcome, {user.name}
                        </h1>
                        <p className="mt-4 text-on-surface-variant font-body text-lg leading-relaxed max-w-md">
                            Manage your personal atelier preferences, shipping information, and review your acquisition history.
                        </p>
                    </div>
                    <div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-6 py-3 border border-outline-variant rounded-xl text-primary font-label text-sm font-bold tracking-widest uppercase hover:bg-surface-container-low transition-all duration-300"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    {/* Left Column: Account Info & Address */}
                    <div className="lg:col-span-1 space-y-12">
                        {/* Profile Info */}
                        <section>
                            <div className="flex items-center gap-3 mb-6 border-b border-outline-variant pb-4">
                                <User className="w-5 h-5 text-secondary" strokeWidth={1.5} />
                                <h2 className="font-headline text-2xl text-primary">Personal Details</h2>
                            </div>
                            <div className="space-y-4 font-body">
                                <div>
                                    <span className="block text-xs font-label font-bold tracking-[0.15em] uppercase text-primary/50 mb-1">Full Name</span>
                                    <p className="text-primary text-lg">{user.name}</p>
                                </div>
                                <div>
                                    <span className="block text-xs font-label font-bold tracking-[0.15em] uppercase text-primary/50 mb-1">Email Address</span>
                                    <p className="text-primary text-lg">{user.email}</p>
                                </div>
                            </div>
                        </section>

                        {/* Address Info */}
                        <section>
                            <div className="flex items-center gap-3 mb-6 border-b border-outline-variant pb-4">
                                <MapPin className="w-5 h-5 text-secondary" strokeWidth={1.5} />
                                <h2 className="font-headline text-2xl text-primary">Default Address</h2>
                            </div>
                            <div className="font-body space-y-4">
                                {user.address ? (
                                    <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant">
                                        <p className="text-primary leading-relaxed">
                                            {user.address.street} <br />
                                            {user.address.city}, {user.address.state} {user.address.postal_code} <br />
                                            {user.address.country}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        <p className="text-on-surface-variant italic">No address provided yet.</p>
                                        <button className="text-sm font-label font-bold tracking-widest uppercase text-secondary underline underline-offset-4 hover:text-primary transition-colors text-left w-max">
                                            Add Address
                                        </button>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Order History */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center gap-3 mb-6 border-b border-outline-variant pb-4">
                            <Package className="w-5 h-5 text-secondary" strokeWidth={1.5} />
                            <h2 className="font-headline text-2xl text-primary">Order History</h2>
                        </div>

                        {user.orders && user.orders.length > 0 ? (
                            <div className="space-y-6">
                                {user.orders.map((order) => (
                                    <div key={order.id} className="bg-surface-container-low border border-outline-variant rounded-2xl p-6 md:p-8 transition-transform duration-300 hover:shadow-lg">
                                        {/* Order Header */}
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-outline-variant pb-6">
                                            <div className="space-y-1">
                                                <span className="text-xs font-label font-bold tracking-widest uppercase text-primary/50">Order #{order.id.toString().padStart(6, '0')}</span>
                                                <p className="font-body text-primary">{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-label font-bold tracking-widest uppercase mb-2 ${order.status === 'completed' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'}`}>
                                                    {order.status}
                                                </span>
                                                <p className="font-headline text-xl text-primary">{formatRupiah(order.total_price)}</p>
                                            </div>
                                        </div>

                                        {/* Order Items */}
                                        <div className="space-y-4">
                                            {order.items.map((item) => (
                                                <div key={item.id} className="flex gap-4 items-center">
                                                    <div className="w-16 h-20 rounded-lg overflow-hidden bg-surface flex-shrink-0">
                                                        {item.product.images[0] && (
                                                            <img
                                                                src={assetUrl(item.product.images[0].image_list)}
                                                                alt={item.product.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-headline text-lg text-primary">{item.product.name}</h4>
                                                        <p className="font-body text-sm text-primary/60">Qty: {item.quantity}</p>
                                                    </div>
                                                    <div className="font-label font-bold text-sm text-primary">
                                                        {formatRupiah(item.price)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-surface-container-low border border-outline-variant border-dashed rounded-2xl flex flex-col items-center justify-center p-16 text-center">
                                <Package className="w-12 h-12 text-primary/20 mb-4" strokeWidth={1} />
                                <h3 className="font-headline text-xl text-primary mb-2">No acquisitions yet</h3>
                                <p className="font-body text-on-surface-variant mb-6 max-w-sm">
                                    Your collection is empty. Discover our curated selection of fine leather footwear.
                                </p>
                                <a href="/collections" className="btn-primary">
                                    Explore Collections
                                </a>
                            </div>
                        )}
                    </div>
                </div>

            </main>
        </UserLayoutApp>
    );
}
