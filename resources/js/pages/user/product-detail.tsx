import UserLayoutApp from '@/layouts/user-layout';
import { formatRupiah } from '@/lib/to-rupiah';
import { assetUrl } from '@/lib/asset-url';
import { useState } from 'react';
import {
    Truck,
    RotateCcw,
    ShieldCheck,
    BadgeCheck,
    Star,
    ChevronRight,
} from 'lucide-react';

interface Size {
    id: number;
    size: string;
    stock: number;
}

interface Image {
    id: number;
    image_list: string;
}

interface Description {
    id: number;
    list: string;
}

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    images: Image[];
    sizes: Size[];
    descriptions: Description[];
}

interface RelatedProduct {
    id: number;
    name: string;
    price: number;
    images: Image[];
    sizes: Size[];
}

export default function ProductDetail({
    product,
    relatedProducts,
}: {
    product: Product;
    relatedProducts: RelatedProduct[];
}) {
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [activeImage, setActiveImage] = useState(0);

    const selectedSizeData = product.sizes.find((s) => s.size === selectedSize);
    const isOutOfStock = selectedSizeData ? selectedSizeData.stock === 0 : false;

    const badges = [
        { icon: <Truck className="w-4 h-4" strokeWidth={1.5} />, label: 'Complimentary Shipping' },
        { icon: <RotateCcw className="w-4 h-4" strokeWidth={1.5} />, label: 'Lifetime Refurbishment' },
        { icon: <ShieldCheck className="w-4 h-4" strokeWidth={1.5} />, label: 'LWG Certified Gold' },
        { icon: <BadgeCheck className="w-4 h-4" strokeWidth={1.5} />, label: 'Authenticity Guaranteed' },
    ];

    const reviews = [
        {
            stars: 4,
            title: 'Sublime Finish',
            text: 'The mahogany depth is incredible in natural light. Perfect for boardrooms and galleries alike.',
            author: 'Julian M.',
        },
        {
            stars: 5,
            title: 'Unrivaled Comfort',
            text: 'Surprisingly comfortable break-in period. The last is perfectly balanced.',
            author: 'Sarah K.',
        },
        {
            stars: 5,
            title: 'Classic Heritage',
            text: "A bit pricier than my usual pair, but the quality difference is immediate.",
            author: 'Marcus R.',
        },
    ];

    const featuredReview = {
        stars: 5,
        text: '"These are not just shoes; they are architectural achievements. The weight feels substantial, and the leather smells like a master\'s workshop."',
        author: 'Alexander V.',
        badge: 'Verified Collector',
    };

    return (
        <UserLayoutApp>
            <main className="pt-24">
                {/* ── Hero Section ── */}
                <section className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                        {/* Image Gallery */}
                        <div className="space-y-4">
                            {/* Main Image */}
                            <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-surface-container-low">
                                <img
                                    src={
                                        product.images[activeImage]
                                            ? assetUrl(product.images[activeImage].image_list)
                                            : ''
                                    }
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                />
                            </div>
                            {/* Thumbnail Row */}
                            {product.images.length > 1 && (
                                <div className="grid grid-cols-4 gap-3">
                                    {product.images.slice(0, 4).map((img, idx) => (
                                        <button
                                            key={img.id}
                                            onClick={() => setActiveImage(idx)}
                                            className={`aspect-square overflow-hidden rounded-xl transition-all duration-300 ${activeImage === idx
                                                ? 'ring-2 ring-primary ring-offset-2'
                                                : 'opacity-60 hover:opacity-100'
                                                }`}
                                        >
                                            <img
                                                src={assetUrl(img.image_list)}
                                                alt={`${product.name} ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="flex flex-col justify-center space-y-8">
                            {/* Breadcrumb */}
                            <div className="flex items-center gap-2 text-xs font-label tracking-[0.15em] uppercase">
                                <span className="text-secondary font-bold">The Heritage Collection</span>
                            </div>

                            <div className="space-y-4">
                                <h1 className="text-4xl md:text-5xl font-headline text-primary leading-tight tracking-tight">
                                    {product.name}
                                </h1>
                                <p className="text-2xl font-headline text-primary/80">{formatRupiah(product.price)}</p>
                            </div>

                            <p className="text-on-surface-variant font-body leading-relaxed text-base max-w-lg">
                                {product.description}
                            </p>

                            {/* Size Selector */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-label font-bold tracking-[0.15em] uppercase text-primary">
                                        Select Size (EU)
                                    </span>
                                    <button className="text-xs font-label text-primary/60 underline underline-offset-4 hover:text-primary transition-colors">
                                        Size Guide
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {product.sizes.map((size) => (
                                        <button
                                            key={size.id}
                                            onClick={() => setSelectedSize(size.size)}
                                            disabled={size.stock === 0}
                                            className={`min-w-[56px] py-3 px-4 rounded-lg text-sm font-label transition-all duration-200 border
                                                ${selectedSize === size.size
                                                    ? 'bg-primary text-on-primary border-primary'
                                                    : size.stock === 0
                                                        ? 'border-outline-variant text-primary/25 cursor-not-allowed line-through'
                                                        : 'border-outline-variant text-primary hover:border-primary hover:bg-surface-container-low'
                                                }`}
                                        >
                                            {size.size}
                                            {size.stock === 0 && (
                                                <span className="sr-only"> (Out of stock)</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* CTA Buttons */}
                            <div className="space-y-3 pt-2">
                                <button
                                    disabled={!selectedSize || isOutOfStock}
                                    className="w-full py-4 rounded-xl text-sm font-label font-bold tracking-[0.15em] uppercase transition-all duration-300 active:scale-[0.98]
                                        bg-primary text-on-primary hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Add to Cart
                                </button>
                                <button
                                    disabled={!selectedSize || isOutOfStock}
                                    className="w-full py-4 rounded-xl text-sm font-label font-bold tracking-[0.15em] uppercase transition-all duration-300 active:scale-[0.98]
                                        text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: 'var(--color-secondary, #1b6d24)' }}
                                >
                                    Buy It Now
                                </button>
                            </div>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-4">
                                {badges.map((badge, i) => (
                                    <div key={i} className="flex items-center gap-2 text-primary/70">
                                        <span className="text-secondary">{badge.icon}</span>
                                        <span className="text-xs font-label tracking-wide">{badge.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Full-Width Lifestyle Banner ── */}
                <section className="relative mx-6 md:mx-12 my-12 rounded-3xl overflow-hidden min-h-[400px] md:min-h-[520px] flex items-end group">
                    <img
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        src={
                            product.images[0]
                                ? assetUrl(product.images[0].image_list)
                                : ''
                        }
                        alt="Lifestyle"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="relative z-10 p-8 md:p-16">
                        <h2 className="text-3xl md:text-5xl font-headline text-white italic leading-tight">
                            Nature as our Workbench.
                        </h2>
                    </div>
                </section>

                {/* ── The Blueprint + Featured Review ── */}
                <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        {/* Blueprint Specs */}
                        <div className="lg:col-span-3 p-8 md:p-12 rounded-2xl"
                            style={{ backgroundColor: 'var(--color-surface-low, #f2f2eb)' }}>
                            <h3 className="text-3xl font-headline text-primary mb-10 italic">The Blueprint</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                                <div className="space-y-2">
                                    <h4 className="text-xs font-label font-bold tracking-[0.15em] uppercase text-secondary">
                                        Upper Material
                                    </h4>
                                    <p className="text-sm font-body text-primary/80 leading-relaxed">
                                        French Calfskin from the D'Annonay Tannery. Full-grain, vegetable-retanned.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xs font-label font-bold tracking-[0.15em] uppercase text-secondary">
                                        Construction
                                    </h4>
                                    <p className="text-sm font-body text-primary/80 leading-relaxed">
                                        Genuine Goodyear Welt with storm-welted edges for superior water resistance.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xs font-label font-bold tracking-[0.15em] uppercase text-secondary">
                                        Sole
                                    </h4>
                                    <p className="text-sm font-body text-primary/80 leading-relaxed">
                                        Stacked leather heel with Vibram® rubber forepart for all-weather traction.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xs font-label font-bold tracking-[0.15em] uppercase text-secondary">
                                        Insole
                                    </h4>
                                    <p className="text-sm font-body text-primary/80 leading-relaxed">
                                        Cork-filled midsole that molds to your unique foot shape over time.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Featured Review */}
                        <div
                            className="lg:col-span-2 p-8 md:p-10 rounded-2xl text-white flex flex-col justify-between"
                            style={{ backgroundColor: 'var(--color-secondary, #1b6d24)' }}
                        >
                            <div className="space-y-6">
                                <div className="flex gap-1">
                                    {[...Array(featuredReview.stars)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                <p className="text-lg md:text-xl font-headline italic leading-relaxed text-white/95">
                                    {featuredReview.text}
                                </p>
                            </div>
                            <div className="mt-8 pt-6 border-t border-white/20">
                                <p className="font-label font-bold text-sm tracking-wider uppercase">
                                    {featuredReview.author}
                                </p>
                                <p className="text-xs font-label text-white/60 tracking-wider uppercase mt-1">
                                    {featuredReview.badge}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Review Cards ── */}
                <section className="max-w-7xl mx-auto px-6 md:px-12 pb-16">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {reviews.map((review, i) => (
                            <div
                                key={i}
                                className="p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                                style={{ borderColor: 'var(--outline-variant, rgba(128,117,108,0.15))' }}
                            >
                                <div className="flex gap-0.5 mb-4">
                                    {[...Array(review.stars)].map((_, j) => (
                                        <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                <h4 className="font-headline text-lg text-primary mb-2">{review.title}</h4>
                                <p className="text-sm font-body text-primary/60 leading-relaxed mb-4">{review.text}</p>
                                <p className="text-xs font-label text-primary/40 tracking-wider uppercase">
                                    {review.author}
                                </p>
                            </div>
                        ))}

                        {/* Rating Summary Card */}
                        <div
                            className="p-6 rounded-2xl flex flex-col items-center justify-center text-center"
                            style={{ backgroundColor: 'var(--color-surface-low, #f2f2eb)' }}
                        >
                            <span className="text-xs font-label font-bold tracking-[0.15em] uppercase text-secondary mb-2">
                                4.9 / 5.0 Rating
                            </span>
                            <p className="text-sm font-body text-primary/60 mb-4 max-w-[180px]">
                                Join 2,400+ collectors of Varnell footwear.
                            </p>
                            <button className="text-xs font-label font-bold tracking-[0.15em] uppercase text-primary border-b-2 border-primary pb-0.5 hover:border-secondary hover:text-secondary transition-colors">
                                Read All Reviews
                            </button>
                        </div>
                    </div>
                </section>

                {/* ── Related Products ── */}
                {relatedProducts.length > 0 && (
                    <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">
                        <div className="flex justify-between items-end mb-12">
                            <div className="space-y-2">
                                <span className="text-secondary font-label font-bold tracking-[0.2em] uppercase text-sm">
                                    Complete the Look
                                </span>
                                <h2 className="text-3xl md:text-4xl font-headline text-primary">You May Also Like</h2>
                            </div>
                            <a
                                href="/collections"
                                className="group hidden md:flex items-center gap-2 text-sm font-label font-bold tracking-widest uppercase text-primary hover:text-secondary transition-colors"
                            >
                                View All
                                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </a>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {relatedProducts.map((item) => (
                                <a
                                    href={`/collections/${item.id}`}
                                    key={item.id}
                                    className="group cursor-pointer space-y-5"
                                >
                                    <div className="aspect-[4/5] overflow-hidden rounded-xl bg-surface-container-low relative">
                                        <img
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            src={
                                                item.images[0]
                                                    ? assetUrl(item.images[0].image_list)
                                                    : ''
                                            }
                                            alt={item.name}
                                        />
                                    </div>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-headline text-primary group-hover:text-secondary transition-colors">
                                                {item.name}
                                            </h3>
                                            <span className="text-xs text-on-surface-variant font-body">
                                                {item.sizes.map((s) => s.size).join(' · ')}
                                            </span>
                                        </div>
                                        <span className="text-base font-bold font-label text-primary">
                                            {formatRupiah(item.price)}
                                        </span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </UserLayoutApp>
    );
}
