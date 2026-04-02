export default function Footer() {
    return (
        <footer className="w-full pt-24 pb-12 bg-surface">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-6 md:px-16 max-w-7xl mx-auto">
                <div className="space-y-6">
                    <span className="text-lg font-bold text-primary font-headline tracking-tighter uppercase">ATELIER LEATHER</span>
                    <p className="text-on-surface-variant text-sm font-body leading-relaxed">© 2024 Atelier Leather. Defined by Nature. Crafted by Hand.</p>
                    <div className="flex gap-4">
                        <span className="material-symbols-outlined text-primary cursor-pointer hover:text-secondary">public</span>
                        <span className="material-symbols-outlined text-primary cursor-pointer hover:text-secondary">camera</span>
                        <span className="material-symbols-outlined text-primary cursor-pointer hover:text-secondary">mail</span>
                    </div>
                </div>
                <div className="space-y-4">
                    <h4 className="text-sm font-bold font-label tracking-widest uppercase text-primary">Support</h4>
                    <ul className="space-y-2 text-primary/60 font-body text-sm">
                        <li><a className="hover:text-secondary transition-colors duration-200" href="#">Sizing Guide</a></li>
                        <li><a className="hover:text-secondary transition-colors duration-200" href="#">Shipping &amp; Returns</a></li>
                        <li><a className="hover:text-secondary transition-colors duration-200" href="#">Contact Us</a></li>
                    </ul>
                </div>
                <div className="space-y-4">
                    <h4 className="text-sm font-bold font-label tracking-widest uppercase text-primary">Discover</h4>
                    <ul className="space-y-2 text-primary/60 font-body text-sm">
                        <li><a className="hover:text-secondary transition-colors duration-200" href="#">Sustainability</a></li>
                        <li><a className="hover:text-secondary transition-colors duration-200" href="#">Store Locator</a></li>
                        <li><a className="hover:text-secondary transition-colors duration-200" href="#">Heritage</a></li>
                    </ul>
                </div>
                <div className="space-y-4">
                    <h4 className="text-sm font-bold font-label tracking-widest uppercase text-primary">Legal</h4>
                    <ul className="space-y-2 text-primary/60 font-body text-sm">
                        <li><a className="hover:text-secondary transition-colors duration-200" href="#">Privacy Policy</a></li>
                        <li><a className="hover:text-secondary transition-colors duration-200" href="#">Terms of Service</a></li>
                    </ul>
                </div>
            </div>
        </footer>
    )
}