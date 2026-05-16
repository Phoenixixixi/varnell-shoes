import UserLayoutApp from '@/layouts/user-layout';
import { Head } from '@inertiajs/react';

export default function Craftsmanship() {
    return (
        <UserLayoutApp>
            <Head title="Craftsmanship & Heritage | Varnell" />
            
            <main className="pt-24 pb-32">
                {/* Hero Section */}
                <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
                    <img 
                        src="/images/craftsmanship/luxury_shoe_craftsmanship_final_1778241597845.png" 
                        className="absolute inset-0 w-full h-full object-cover"
                        alt="Heritage Craftsmanship"
                    />
                    <div className="absolute inset-0 bg-black/40"></div>
                    <div className="relative z-10 text-center px-6 max-w-4xl mx-auto space-y-6">
                        <span className="text-secondary-container font-label font-bold tracking-[0.4em] uppercase text-xs animate-fade-in">The Art of the Maker</span>
                        <h1 className="text-5xl md:text-8xl font-headline text-white leading-tight tracking-tight">Heritage <span className="italic underline decoration-secondary/40">Redefined</span>.</h1>
                        <p className="text-lg md:text-xl text-white/80 font-body leading-relaxed max-w-2xl mx-auto">
                            At Varnell, we believe that true luxury is found in the patience of the hand and the soul of the material.
                        </p>
                    </div>
                </section>

                {/* The Heritage Section */}
                <section className="py-32 px-6 md:px-12 bg-surface">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
                        <div className="space-y-10">
                            <span className="text-secondary font-label font-bold tracking-[0.2em] uppercase text-sm">Our Roots</span>
                            <h2 className="text-4xl md:text-6xl font-headline text-primary leading-tight">A Legacy of <br/>Silent Excellence.</h2>
                            <p className="text-on-surface-variant leading-relaxed font-body text-lg">
                                For generations, our workshop has been a sanctuary for traditional techniques that are slowly vanishing. We don't chase trends; we honor the timeless relationship between a craftsman and their tools.
                            </p>
                            <div className="grid grid-cols-2 gap-12 pt-6">
                                <div>
                                    <h4 className="text-3xl font-headline text-primary italic">1924</h4>
                                    <p className="text-sm text-on-surface-variant font-label uppercase tracking-widest mt-2">Foundation Year</p>
                                </div>
                                <div>
                                    <h4 className="text-3xl font-headline text-primary italic">200+</h4>
                                    <p className="text-sm text-on-surface-variant font-label uppercase tracking-widest mt-2">Hours Per Pair</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute -inset-4 bg-secondary-container/10 rounded-[3rem] rotate-3 -z-10"></div>
                            <img 
                                src="/images/craftsmanship/vintage_leather_tools_heritage_1778241370190.png" 
                                className="w-full h-[600px] object-cover rounded-[2rem] editorial-shadow"
                                alt="Vintage Tools"
                            />
                        </div>
                    </div>
                </section>

                {/* The Material Section */}
                <section className="py-32 bg-surface-container-low px-6 md:px-12 overflow-hidden">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row-reverse gap-24 items-center">
                        <div className="md:w-1/2 space-y-10">
                            <span className="text-secondary font-label font-bold tracking-[0.2em] uppercase text-sm">The Material</span>
                            <h2 className="text-4xl md:text-6xl font-headline text-primary">Born from the Earth.</h2>
                            <p className="text-on-surface-variant leading-relaxed font-body text-lg">
                                We source only the finest full-grain leathers, tanned using ancient vegetable-based recipes. This process preserves the natural character of the hide, ensuring that every mark and grain tells a unique story.
                            </p>
                            <div className="p-8 border-l-4 border-secondary bg-surface/50 rounded-r-xl italic text-primary/80 font-body">
                                "Leather is a living material. It remembers the weather, the movement, and the passage of time."
                            </div>
                        </div>
                        <div className="md:w-1/2 relative">
                             <img 
                                src="/images/craftsmanship/premium_leather_texture_macro_green_and_brown_1778241493821.png" 
                                className="w-full aspect-square object-cover rounded-[2rem] editorial-shadow"
                                alt="Leather Texture"
                            />
                            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-secondary/5 rounded-full blur-3xl -z-10"></div>
                        </div>
                    </div>
                </section>

                {/* The Process - Horizontal Scroll/Grid */}
                <section className="py-32 px-6 md:px-12 bg-surface">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-24 space-y-4">
                            <span className="text-secondary font-label font-bold tracking-[0.2em] uppercase text-sm">The 12 Steps</span>
                            <h2 className="text-4xl md:text-7xl font-headline text-primary">The Alchemy of Creation</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            <div className="space-y-6 group">
                                <div className="aspect-[4/3] overflow-hidden rounded-2xl relative">
                                    <img 
                                        src="/images/craftsmanship/artisan_hands_crafting_leather_1778241339119.png" 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                        alt="Stitching"
                                    />
                                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-headline text-primary italic">01. The Selection</h3>
                                    <p className="text-on-surface-variant font-body">Only the top 5% of hides are chosen for their impeccable grain and durability.</p>
                                </div>
                            </div>

                            <div className="space-y-6 group md:mt-12">
                                <div className="aspect-[4/3] overflow-hidden rounded-2xl relative bg-secondary-container/20 flex items-center justify-center p-8">
                                    <span className="text-secondary text-7xl font-headline opacity-20 italic">Precision</span>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-headline text-primary italic">02. Hand-Cutting</h3>
                                    <p className="text-on-surface-variant font-body">Using brass-bound patterns, each piece is cut by hand to ensure perfect alignment.</p>
                                </div>
                            </div>

                            <div className="space-y-6 group">
                                <div className="aspect-[4/3] overflow-hidden rounded-2xl relative">
                                    <div className="absolute inset-0 bg-surface-container-low flex items-center justify-center">
                                        <div className="w-16 h-16 border-2 border-secondary/30 rounded-full animate-ping"></div>
                                    </div>
                                    <img 
                                        src="/images/craftsmanship/artisan_hands_crafting_leather_1778241339119.png" 
                                        className="w-full h-full object-cover grayscale opacity-50" 
                                        alt="The Last"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-headline text-primary italic">03. The Lasting</h3>
                                    <p className="text-on-surface-variant font-body">The leather is pulled over the wooden last, a process that takes days to set properly.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Call to Action */}
                <section className="py-32 px-6 md:px-12">
                    <div className="max-w-5xl mx-auto bg-primary rounded-[3rem] p-12 md:p-24 text-center text-on-primary relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-secondary/20 via-transparent to-transparent opacity-50"></div>
                        <div className="relative z-10 space-y-8">
                            <h2 className="text-4xl md:text-6xl font-headline italic">Walk with Heritage.</h2>
                            <p className="text-lg md:text-xl opacity-80 font-body max-w-2xl mx-auto text-white/80">
                                Experience the difference of a century-old tradition. Discover the collection that carries the soul of the maker.
                            </p>
                            <div className="pt-6">
                                <a href="/collections" className="inline-block bg-secondary text-on-primary px-12 py-5 rounded-full font-label text-sm font-bold tracking-[0.2em] uppercase hover:bg-secondary/90 transition-all editorial-shadow active:scale-95">
                                    Explore the Collection
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </UserLayoutApp>
    );
}
