import UserLayoutApp from '@/layouts/user-layout';
import { formatRupiah } from '@/lib/to-rupiah';
import { assetUrl } from '@/lib/asset-url';


export default function Welcome({ product }: any) {
    console.log(product)


    return (
        <>
            <UserLayoutApp>

                <main className="pt-24">

                    <section className="relative min-h-[921px] flex flex-col md:flex-row items-center px-6 md:px-12 py-12 gap-12 overflow-hidden">
                        <div className="flex-1 z-10 space-y-8 max-w-2xl">
                            <span className="text-secondary font-label font-bold tracking-[0.2em] uppercase text-sm">The 2024 Collection</span>
                            <h1 className="text-5xl md:text-8xl font-headline text-primary leading-tight tracking-tight">Elegance in Every <span className="italic">Stitch</span>.</h1>
                            <p className="text-lg md:text-xl text-on-surface-variant font-body leading-relaxed max-w-lg">
                                Hand-burnished Italian calfskin meets the wild serenity of nature. Our artisan-made footwear is built for those who walk with purpose.
                            </p>
                            <div className="pt-6">
                                <button className="btn-primary px-10 py-5 rounded-xl font-label text-sm font-bold tracking-widest uppercase hover:opacity-90 transition-all editorial-shadow active:scale-95">
                                    Explore Collection
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 relative w-full aspect-square md:aspect-auto md:h-[819px] group">
                            <div className="absolute inset-0 bg-secondary-container/20 rounded-[4rem] rotate-3 scale-95 transition-transform duration-700 group-hover:rotate-0"></div>
                            <img className="w-full h-full object-cover rounded-[3rem] editorial-shadow relative z-10 transition-transform duration-700 group-hover:-translate-y-4" data-alt="ultra-high-quality close-up of a single luxury brown leather oxford shoe resting on lush vibrant green grass with soft morning dew and natural lighting" src="images/home/8.webp" />
                            <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-surface-container-low rounded-full flex items-center justify-center p-8 z-20 text-center editorial-shadow">
                                <span className="text-xs font-bold font-label text-primary tracking-widest uppercase italic">100% Hand-Crafted</span>
                            </div>
                        </div>
                    </section>

                    <section className="py-32 px-6 md:px-12 bg-surface-container-low">
                        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-16 items-center">
                            <div className="md:col-span-5 space-y-8">
                                <h2 className="text-4xl md:text-5xl font-headline text-primary leading-tight">A Legacy Carved in Hide</h2>
                                <p className="text-on-surface-variant leading-relaxed font-body text-lg">
                                    Founded in the heart of the Tuscan hills, Atelier Leather began with a single workbench and a devotion to time-honored techniques. We don't just make shoes; we preserve a heritage of patience.
                                </p>
                                <div className="flex gap-4 items-center group cursor-pointer">
                                    <span className="text-sm font-bold font-label tracking-widest uppercase border-b border-secondary">Read Our Story</span>
                                </div>
                            </div>
                            <div className="md:col-span-7 grid grid-cols-2 gap-6">
                                <img className="w-full h-[400px] object-cover rounded-xl mt-12 editorial-shadow" data-alt="black and white artistic close-up of artisan hands stitching thick leather with heavy waxed thread in a traditional sunlit workshop" src="images/home/22-06 (1) - ENHANCED.webp" />
                                <img className="w-full h-[400px] object-cover rounded-xl editorial-shadow" data-alt="vintage leather workshop background with rolls of tanned hides and cobbler tools on a worn wooden table" src="images/home/15.webp" />
                            </div>
                        </div>
                    </section>

                    <section className="py-32 px-6 md:px-12 bg-surface">
                        <div className="max-w-7xl mx-auto space-y-16">
                            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                                <div className="max-w-xl space-y-4">
                                    <span className="text-secondary font-label font-bold tracking-[0.2em] uppercase text-sm">Featured Arrivals</span>
                                    <h2 className="text-4xl md:text-5xl font-headline text-primary">The Seasonal Edit</h2>
                                </div>

                            </div>

                            {/* show 3 product from product table */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {product.map((item: any, index: any) => (
                                    <a href={`/collections/${item.id}`} className="group cursor-pointer space-y-6" key={index}>
                                        <div className="aspect-[4/5] overflow-hidden rounded-xl bg-surface-container-low relative">
                                            <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                data-alt="studio shot of deep mahogany leather wingtip shoes on a minimalist warm beige background"
                                                src={assetUrl(item?.images?.[0]?.image_list)} />
                                            <div className="absolute top-4 left-4 bg-surface px-4 py-1 rounded-full">
                                                <span className="text-[10px] font-bold tracking-widest uppercase">New Product</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-xl font-headline text-primary">{item.name}</h3>

                                            </div>
                                            <div className='flex flex-col'>

                                                <span className="text-lg font-bold font-label text-primary min-w-32 text-end">{formatRupiah(item.price)}</span>
                                                <span className='text-end text-sm font-body text-on-surface-variant'>size {item.sizes.map((size: any) => size.size).join(' | ')}</span>
                                            </div>
                                        </div>
                                    </a>
                                ))}


                                {/* <div className="group cursor-pointer space-y-6">
                                        <div className="aspect-[4/5] overflow-hidden rounded-xl bg-surface-container-low relative">
                                            <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" data-alt="luxury camel tan leather desert boots in a soft focus outdoor lifestyle setting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmXCcGMZiGMJsera8E6vSHbF6CY74_oN-m2EyoMMCqeTKKxijBUwiVbzy9levKFlNKnAiIoEmfp5C6_wT4FUU7QfNwm37qC-WRTNMnsxqTjF5qPEagBhisnVuwF3MOo13gfCfnR2olAH2Ot2rcgVkwFoQyQj0tILXl6MAeeu3W8fRRmWE0f_46iAx0ct-il33SIhAM7PpIYE4DmlUXodDmLUYyAY1IzGC0gvJ0_Jve2FQl6EQHRl6q743yUxfo4iGv6FvRnLvzQ_Pq" />
                                        </div>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-xl font-headline text-primary">The Nomad Boot</h3>
                                                <p className="text-sm text-on-surface-variant font-body">Camel Suede</p>
                                            </div>
                                            <span className="text-lg font-bold font-label text-primary">$550</span>
                                        </div>
                                    </div>

                                    <div className="group cursor-pointer space-y-6">
                                        <div className="aspect-[4/5] overflow-hidden rounded-xl bg-surface-container-low relative">
                                            <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" data-alt="close-up of elegant midnight black leather loafers with gold hardware buckle" src="https://lh3.googleusercontent.com/aida-public/AB6AXuALi83UUoV9EYoLoSYzDouEV_o6cqkBvD5sv5V9t3zeGd99itQX7XWh6WyAnkfnbwi_ihbmSRNdD26w8RYyz-1sTi3pY7iWdIxcS-LfxLgyK1RDn8fJXkKL1p-NMVj4o-1t91x4IvrxwNQHtDPEVrvnQLoyr9KQk76xKyd04izVjp-8EW1eCen0piv15ENCk0AbZszIuvA7B0_xOTIydNnDymD2EyH9doNbTn97f8c1H2GUpEakbXhh16F7OLZK_2XuJ9AoIi9nWkK_" />
                                        </div>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-xl font-headline text-primary">The Artisan Loafer</h3>
                                                <p className="text-sm text-on-surface-variant font-body">Midnight Black</p>
                                            </div>
                                            <span className="text-lg font-bold font-label text-primary">$425</span>
                                        </div>
                                    </div> */}
                            </div>
                        </div>
                    </section>

                    <section className="py-32 px-6 md:px-12 bg-surface-container-low overflow-hidden">
                        <div className="max-w-7xl mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
                                <div className="relative">
                                    <img className="w-full aspect-square object-cover rounded-[1rem] editorial-shadow relative z-10" data-alt="macro photograph of rich pebbled leather texture showing natural grain and a deep forest green hue" src="images/home/28-05.webp" />
                                    <div className="absolute -top-12 -left-12 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"></div>
                                    <div className="absolute -bottom-16 -right-16 md:block hidden">
                                        <img className="w-64 h-64 object-cover rounded-xl border-[12px] border-surface-container-low editorial-shadow z-20" data-alt="detail of a master craftsman using a silver tool to edge a piece of raw leather" src="images/home/29-06 (2).webp" />
                                    </div>
                                </div>
                                <div className="space-y-10">
                                    <span className="text-secondary font-label font-bold tracking-[0.2em] uppercase text-sm">The Process</span>
                                    <h2 className="text-4xl md:text-5xl font-headline text-primary">Slow Fashion, Faster Results.</h2>
                                    <div className="space-y-8">
                                        <div className="flex gap-6">
                                            <span className="text-3xl font-headline text-primary/30 italic">01.</span>
                                            <div>
                                                <h4 className="text-xl font-headline text-primary mb-2">Sustainable Sourcing</h4>
                                                <p className="text-on-surface-variant font-body leading-relaxed">We only use hides that are a byproduct of the food industry, tanned using vegetable-based bark extracts.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-6">
                                            <span className="text-3xl font-headline text-primary/30 italic">02.</span>
                                            <div>
                                                <h4 className="text-xl font-headline text-primary mb-2">The Golden Hand</h4>
                                                <p className="text-on-surface-variant font-body leading-relaxed">Each shoe passes through 12 different master craftsmen, from pattern cutting to final hand-polishing.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-6">
                                            <span className="text-3xl font-headline text-primary/30 italic">03.</span>
                                            <div>
                                                <h4 className="text-xl font-headline text-primary mb-2">Final Inspection</h4>
                                                <p className="text-on-surface-variant font-body leading-relaxed">Every pair is stamped with the artisan's mark, a personal guarantee of lifelong quality.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="py-32 px-6 md:px-12 bg-surface">
                        <div className="max-w-7xl mx-auto rounded-[2rem] overflow-hidden relative min-h-[500px] flex items-center p-8 md:p-24 group">
                            <div className="absolute inset-0 z-0">
                                <img className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" data-alt="moody editorial shot of a forest path at twilight with soft fog and moss-covered trees" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAba_GUFOcz7MamNkgAWlgBMowHzB3kTBQjWOysSjPG5Y8-HI7thO9B6PdVPDrajU7VN75Ro0nPlzo3X_Ou1d5QmH_1-YhpYA2D3eRY_dryoShbdfsKxmLBV7qAJmjBJ3ZqGIYGLhe-UEOpvZZdWV8KkgC6vdYmLLHg-d1_ud1VxUPs4SVTY3SjYHPkmJwvEraCWW2kSJaFTSMd2Z3EeSAgb4_BfscP27uLsVuiVaIXEGREtO7Tn38e2uSjFjWwMGTm-b7ZzkWMAxrz" />
                                <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm"></div>
                            </div>
                            <div className="relative z-10 w-full max-w-xl space-y-8 text-on-primary">
                                <h2 className="text-4xl md:text-6xl font-headline leading-tight italic text-white">Join the Varnell Circle.</h2>
                                <p className="text-lg opacity-90 font-body text-white/80">Receive exclusive access to seasonal drops and stories from the workshop. No clutter, just craft.</p>
                                <form className="flex flex-col md:flex-row gap-4">
                                    <button className="bg-secondary text-on-primary px-8 py-4 rounded-xl font-label text-sm font-bold tracking-widest uppercase hover:opacity-90 transition-all active:scale-95">
                                        Register
                                    </button>
                                </form>
                            </div>
                        </div>
                    </section>
                </main>



            </UserLayoutApp>
        </>
    );
}
