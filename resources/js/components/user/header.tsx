import { Search, ShoppingBag, User, Menu, X } from "lucide-react"
import { usePage } from "@inertiajs/react"
import { useState, useEffect } from "react"
import { assetUrl } from "@/lib/asset-url"

export default function Header() {
    const { url, props } = usePage()
    const { auth, cartCount } = props as any;
    const [mobileOpen, setMobileOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDesktopSearch, setShowDesktopSearch] = useState(false);

    useEffect(() => {
        if (searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            setIsSearching(true);
            fetch(`/api/products/search?q=${searchQuery}`)
                .then(res => res.json())
                .then(data => {
                    setSearchResults(data);
                    setIsSearching(false);
                })
                .catch(err => {
                    console.error(err);
                    setIsSearching(false);
                });
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = ""
        }
        return () => { document.body.style.overflow = "" }
    }, [mobileOpen])

    type NavLink = {
        name: string;
        link: string;
        active: boolean;
    }

    let navLink: NavLink[] = [
        { name: 'Home', link: "/", active: url === "/" },
        { name: "Collections", link: "/collections", active: url === "/collections" },
        { name: "Consument Care", link: "/consument-care", active: url === "/consument-care" },
        { name: "Articles", link: "/heritage", active: url === "/heritage" },
    ]

    if (auth?.user) {
        navLink.push({
            name: "Order",
            link: route('shipment.index'),
            active: url.startsWith("/shipment")
        });
    }

    const userLink = auth?.user ? route('account') : route('user.login');
    const userLabel = auth?.user ? 'My Account' : 'Sign In';

    return (
        <>
            {/* ── Top Bar ── */}
            <nav className="fixed top-0 w-full h-20 z-50 flex justify-between items-center px-6 md:px-12 max-w-none backdrop-blur-md"
                style={{ backgroundColor: "rgba(250, 250, 245, 0.85)" }}>

                {/* Logo */}
                <div className="flex items-center gap-12">
                    <a href="/" className="text-2xl font-bold tracking-tighter text-primary font-headline">Varnell</a>

                    {/* Desktop nav links */}
                    <div className="hidden md:flex gap-8 items-center">
                        {navLink.map((value, index) => (
                            <a key={index}
                                className={value.active
                                    ? "border-secondary text-primary font-semibold border-b-2 font-headline tracking-wide py-1"
                                    : "text-primary/70 hover:text-primary transition-colors duration-300 font-headline tracking-wide"}
                                href={value.link}>
                                {value.name}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Right-side actions */}
                <div className="flex items-center gap-5">
                    <div className="hidden md:block">
                        {showDesktopSearch ? (
                            <div className="relative flex items-center gap-3">
                                <input
                                    autoFocus
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search products..."
                                    className="w-64 bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2 text-[.8rem] text-primary placeholder:text-primary/40 outline-none focus:ring-1 focus:ring-secondary/50 focus:border-secondary transition-all"
                                />
                                <button
                                    onClick={() => {
                                        setShowDesktopSearch(false);
                                        setSearchQuery("");
                                        setSearchResults([]);
                                    }}
                                    className="text-primary hover:opacity-80 transition-opacity duration-300 p-1"
                                >
                                    <X className="w-[22px] h-[22px]" strokeWidth={1.5} />
                                </button>

                                {/* Dropdown with solid white background */}
                                {searchQuery.length >= 2 && (
                                    <div className="absolute top-full right-0 mt-3 w-80 bg-white sm:bg-white border border-outline-variant p-3 rounded-2xl shadow-xl z-50 max-h-72 overflow-y-auto flex flex-col gap-2">
                                        {isSearching ? (
                                            <div className="flex items-center justify-center gap-2 py-6 text-primary/50">
                                                <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-ping"></span>
                                                <span className="text-xs font-body italic">Searching...</span>
                                            </div>
                                        ) : searchResults.length > 0 ? (
                                            searchResults.map(product => {
                                                const imageUrl = product.images?.[0]
                                                    ? assetUrl(product.images[0].image_list)
                                                    : '';
                                                return (
                                                    <a
                                                        key={product.id}
                                                        href={`/collections/${product.id}`}
                                                        onClick={() => setShowDesktopSearch(false)}
                                                        className="group flex gap-3 p-2 rounded-xl hover:bg-surface-container-low border border-transparent hover:border-outline-variant transition-all duration-300 text-left"
                                                    >
                                                        <div className="w-12 h-16 bg-surface rounded-lg overflow-hidden border border-outline-variant flex-shrink-0">
                                                            {imageUrl && (
                                                                <img src={imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col justify-between py-0.5">
                                                            <div>
                                                                <h4 className="font-headline text-sm text-primary group-hover:text-secondary transition-colors line-clamp-1">{product.name}</h4>
                                                                <span className="text-[9px] font-label text-secondary tracking-wider uppercase">The Heritage Collection</span>
                                                            </div>
                                                            <span className="text-xs font-label font-semibold text-primary">
                                                                Rp {product.price.toLocaleString('id-ID')}
                                                            </span>
                                                        </div>
                                                    </a>
                                                );
                                            })
                                        ) : (
                                            <p className="text-xs text-primary/50 text-center py-6 italic">No products found</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={() => {
                                    setShowDesktopSearch(true);
                                    setSearchQuery("");
                                    setSearchResults([]);
                                }}
                                className="hover:opacity-80 transition-opacity duration-300 active:scale-95 text-primary inline-flex mt-1"
                            >
                                <Search className="w-[22px] h-[22px]" strokeWidth={1.5} />
                            </button>
                        )}
                    </div>
                    <a href={route('cart.index')} className="relative hover:opacity-80 transition-opacity duration-300 active:scale-95 text-primary">
                        <ShoppingBag className="w-[22px] h-[22px]" strokeWidth={1.5} />
                        {cartCount > 0 && (
                            <span className="absolute -top-1.5 -right-2 bg-secondary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                {cartCount}
                            </span>
                        )}
                    </a>
                    <a href={userLink} className="hover:opacity-80 transition-opacity duration-300 active:scale-95 text-primary hidden md:inline-flex">
                        <User className="w-[22px] h-[22px]" strokeWidth={1.5} />
                    </a>

                    {/* Hamburger – mobile only */}
                    <button
                        className="md:hidden relative w-8 h-8 flex items-center justify-center text-primary"
                        onClick={() => setMobileOpen((prev) => !prev)}
                        aria-label={mobileOpen ? "Close menu" : "Open menu"}
                    >
                        <span className={`absolute transition-all duration-300 ${mobileOpen ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"}`}>
                            <Menu className="w-6 h-6" strokeWidth={1.6} />
                        </span>
                        <span className={`absolute transition-all duration-300 ${mobileOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75"}`}>
                            <X className="w-6 h-6" strokeWidth={1.6} />
                        </span>
                    </button>
                </div>
            </nav>

            {/* ── Mobile Overlay ── */}
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 md:hidden ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                onClick={() => setMobileOpen(false)}
            />

            {/* Drawer panel */}
            <div
                className={`fixed top-0 right-0 z-45 w-full sm:w-[360px] h-full md:hidden
                    transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
                    ${mobileOpen ? "translate-x-0" : "translate-x-full"}`}
                style={{ backgroundColor: "var(--color-surface, #fafaf5)", zIndex: 45 }}
            >
                {/* Inner content – push below navbar height */}
                <div className="flex flex-col h-full pt-24 px-8 pb-10">
                    {/* Search bar */}
                    <div className="mb-8 relative">
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                            style={{ backgroundColor: "var(--color-surface-low, #f2f2eb)" }}>
                            <Search className="w-5 h-5 text-primary/50" strokeWidth={1.5} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search products…"
                                className="bg-transparent w-full text-sm text-primary placeholder:text-primary/40 outline-none font-[var(--font-functional)]"
                            />
                        </div>
                        {searchQuery.length >= 2 && (
                            <div className="absolute top-full left-0 w-full bg-surface rounded-2xl shadow-xl border border-outline-variant p-3 mt-2 z-50 max-h-80 overflow-y-auto flex flex-col gap-2">
                                {isSearching ? (
                                    <div className="flex items-center justify-center gap-2 py-6 text-primary/50">
                                        <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-ping"></span>
                                        <span className="text-xs font-body italic">Searching...</span>
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map(product => {
                                        const imageUrl = product.images?.[0]
                                            ? assetUrl(product.images[0].image_list)
                                            : '';
                                        return (
                                            <a
                                                key={product.id}
                                                href={`/collections/${product.id}`}
                                                onClick={() => setMobileOpen(false)}
                                                className="group flex gap-3 p-2 rounded-xl hover:bg-surface-container-low border border-transparent hover:border-outline-variant transition-all duration-300"
                                            >
                                                <div className="w-12 h-16 bg-surface rounded-lg overflow-hidden border border-outline-variant flex-shrink-0">
                                                    {imageUrl && (
                                                        <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col justify-between py-0.5">
                                                    <div>
                                                        <h4 className="font-headline text-sm text-primary group-hover:text-secondary transition-colors line-clamp-1">{product.name}</h4>
                                                        <span className="text-[9px] font-label text-secondary tracking-wider uppercase">The Heritage Collection</span>
                                                    </div>
                                                    <span className="text-xs font-label font-semibold text-primary">
                                                        Rp {product.price.toLocaleString('id-ID')}
                                                    </span>
                                                </div>
                                            </a>
                                        );
                                    })
                                ) : (
                                    <p className="text-xs text-primary/50 text-center py-6 italic">No products found</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Nav links */}
                    <div className="flex flex-col gap-1">
                        {navLink.map((value, index) => (
                            <a
                                key={index}
                                href={value.link}
                                className={`group flex items-center justify-between py-4 border-b transition-all duration-300
                                    ${value.active
                                        ? "text-primary font-semibold"
                                        : "text-primary/60 hover:text-primary"}`}
                                style={{
                                    borderColor: "var(--outline-variant, rgba(128,117,108,0.15))",
                                    transitionDelay: mobileOpen ? `${index * 60}ms` : "0ms",
                                    opacity: mobileOpen ? 1 : 0,
                                    transform: mobileOpen ? "translateX(0)" : "translateX(24px)",
                                }}
                                onClick={() => setMobileOpen(false)}
                            >
                                <span className="text-lg tracking-wide font-headline">{value.name}</span>
                                {value.active && (
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--color-secondary, #1b6d24)" }} />
                                )}
                            </a>
                        ))}
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Bottom actions */}
                    <div className="flex flex-col gap-3 pt-6"
                        style={{
                            borderTop: "1px solid var(--outline-variant, rgba(128,117,108,0.15))",
                            opacity: mobileOpen ? 1 : 0,
                            transition: "opacity 0.4s ease 0.25s",
                        }}>
                        <a href={userLink} className="flex items-center gap-3 py-3 text-primary/70 hover:text-primary transition-colors duration-200">
                            <User className="w-5 h-5" strokeWidth={1.5} />
                            <span className="text-sm font-medium tracking-wide">{userLabel}</span>
                        </a>
                        <a href={route('cart.index')} className="flex items-center gap-3 py-3 text-primary/70 hover:text-primary transition-colors duration-200">
                            <div className="relative">
                                <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1.5 -right-2 bg-secondary text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </div>
                            <span className="text-sm font-medium tracking-wide">Shopping Bag</span>
                        </a>
                    </div>
                </div>
            </div>
        </>
    )
}