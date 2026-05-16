import React from 'react';
import UserLayoutApp from '@/layouts/user-layout';
import { Head, Link, router } from '@inertiajs/react';
import { formatRupiah } from '@/lib/to-rupiah';
import { assetUrl } from '@/lib/asset-url';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react';

interface CartItem {
    id: number;
    product_id: number;
    quantity: number;
    size: string;
    product: {
        id: number;
        name: string;
        price: number;
        images: { image_list: string }[];
    };
}

interface Props {
    items: CartItem[];
}

export default function Cart({ items }: Props) {
    const subtotal = items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const shipping = 0; // Complimentary shipping
    const total = subtotal + shipping;

    const handleUpdateQuantity = (id: number, newQuantity: number) => {
        if (newQuantity < 1) return;
        router.patch(route('cart.update', id), { quantity: newQuantity });
    };

    const handleRemove = (id: number) => {
        if (confirm('Are you sure you want to remove this item?')) {
            router.delete(route('cart.remove', id));
        }
    };

    const handleCheckout = () => {
        if (confirm('Proceed to checkout?')) {
            window.location.href = route('checkout.index');
        }
    };

    return (
        <UserLayoutApp>
            <Head title="Your Cart - Varnell" />

            <main className="min-h-screen pt-32 pb-24 px-6 md:px-12">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                        <div className="space-y-2">
                            <span className="text-secondary font-label font-bold tracking-[0.2em] uppercase text-sm">
                                Your Selection
                            </span>
                            <h1 className="text-4xl md:text-5xl font-headline text-primary">Shopping Cart</h1>
                        </div>
                        <p className="font-body text-on-surface-variant">
                            {items.length} {items.length === 1 ? 'item' : 'items'} in your bag
                        </p>
                    </div>

                    {items.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            {/* Items List */}
                            <div className="lg:col-span-2 space-y-8">
                                {items.map((item) => (
                                    <div key={item.id} className="flex flex-col sm:flex-row gap-6 pb-8 border-b border-outline-variant group">
                                        {/* Product Image */}
                                        <div className="w-full sm:w-40 aspect-[4/5] overflow-hidden rounded-xl bg-surface-container-low flex-shrink-0">
                                            <img
                                                src={item.product.images[0] ? assetUrl(item.product.images[0].image_list) : ''}
                                                alt={item.product.name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-1 flex flex-col justify-between py-2">
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="text-xl font-headline text-primary">
                                                        {item.product.name}
                                                    </h3>
                                                    <p className="text-lg font-bold font-label text-primary">
                                                        {formatRupiah(item.product.price)}
                                                    </p>
                                                </div>
                                                <p className="text-sm font-label text-primary/50 tracking-widest uppercase">
                                                    Size: {item.size}
                                                </p>
                                            </div>

                                            <div className="flex justify-between items-center mt-6">
                                                <div className="flex items-center border border-outline-variant rounded-lg overflow-hidden bg-surface">
                                                    <button 
                                                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                        className="p-2 hover:bg-surface-container-low transition-colors text-primary/60"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="px-4 font-label font-bold text-sm text-primary min-w-[40px] text-center">
                                                        {item.quantity}
                                                    </span>
                                                    <button 
                                                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                        className="p-2 hover:bg-surface-container-low transition-colors text-primary/60"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <button 
                                                    onClick={() => handleRemove(item.id)}
                                                    className="flex items-center gap-2 text-xs font-label font-bold tracking-widest uppercase text-red-500 hover:text-red-700 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Summary Card */}
                            <div className="lg:col-span-1">
                                <div className="bg-surface-container-low rounded-2xl p-8 border border-outline-variant sticky top-32">
                                    <h2 className="text-2xl font-headline text-primary mb-8 italic">Summary</h2>
                                    
                                    <div className="space-y-4 pb-8 border-b border-outline-variant">
                                        <div className="flex justify-between text-sm font-body">
                                            <span className="text-on-surface-variant">Subtotal</span>
                                            <span className="text-primary">{formatRupiah(subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm font-body">
                                            <span className="text-on-surface-variant">Shipping</span>
                                            <span className="text-secondary font-label font-bold uppercase tracking-widest text-[10px]">Complimentary</span>
                                        </div>
                                    </div>

                                    <div className="py-8 space-y-6">
                                        <div className="flex justify-between items-end">
                                            <span className="text-lg font-headline text-primary">Total</span>
                                            <span className="text-2xl font-bold font-label text-primary">{formatRupiah(total)}</span>
                                        </div>
                                        <button 
                                            onClick={handleCheckout}
                                            className="w-full py-5 bg-primary text-white rounded-xl text-sm font-label font-bold tracking-[0.2em] uppercase flex items-center justify-center gap-3 hover:opacity-90 transition-all active:scale-[0.98]"
                                        >
                                            Secure Checkout
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                        <p className="text-[10px] text-center text-on-surface-variant font-label tracking-widest uppercase px-4">
                                            Taxes calculated at checkout. Lifetime guarantee included.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-surface-container-low border border-outline-variant border-dashed rounded-3xl flex flex-col items-center justify-center p-20 text-center">
                            <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mb-8">
                                <ShoppingBag className="w-8 h-8 text-primary/20" strokeWidth={1} />
                            </div>
                            <h2 className="text-3xl font-headline text-primary mb-4">Your bag is empty</h2>
                            <p className="font-body text-on-surface-variant mb-10 max-w-sm">
                                It seems you haven't added any craftsmanship to your collection yet.
                            </p>
                            <Link href="/collections" className="btn-primary">
                                Explore Collections
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </UserLayoutApp>
    );
}
