import { Search, ShoppingBag, User, Menu, X } from "lucide-react"
import { usePage } from "@inertiajs/react"
import { useState, useEffect } from "react"

export default function Header() {
    const { url, props } = usePage()
    const { auth, cartCount } = props as any;
    const [mobileOpen, setMobileOpen] = useState(false)

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
        { name: "Heritage", link: "/heritage", active: url === "/heritage" },
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
            <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-12 py-5 max-w-none backdrop-blur-md"
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
                    <button className="hover:opacity-80 transition-opacity duration-300 active:scale-95 text-primary hidden md:inline-flex">
                        <Search className="w-[22px] h-[22px]" strokeWidth={1.5} />
                    </button>
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
                    <div className="mb-8">
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                            style={{ backgroundColor: "var(--color-surface-low, #f2f2eb)" }}>
                            <Search className="w-5 h-5 text-primary/50" strokeWidth={1.5} />
                            <input
                                type="text"
                                placeholder="Search products…"
                                className="bg-transparent w-full text-sm text-primary placeholder:text-primary/40 outline-none font-[var(--font-functional)]"
                            />
                        </div>
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