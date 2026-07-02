import UserLayoutApp from '@/layouts/user-layout';
import { Head } from '@inertiajs/react';

const timelineEvents = [
    {
        year: '1924',
        title: 'The First Stitch',
        description:
            'Emmanuel Varnell opens a small atelier in the heart of Bandung, Indonesia. Armed with a single awl, a bolt of calfskin, and an unrelenting belief in the beauty of the handmade.',
    },
    {
        year: '1941',
        title: 'The War Years',
        description:
            "During the occupation, the atelier becomes a quiet refuge. Emmanuel continues his craft in secret — a silent act of resilience. Shoes made in this era are now considered collector's relics.",
    },
    {
        year: '1958',
        title: 'A Second Generation',
        description:
            "Emmanuel's son, Pieter Varnell, inherits the workshop. He travels to Córdoba and Florence, absorbing centuries of European technique and weaving it into the Varnell identity.",
    },
    {
        year: '1976',
        title: 'The Iconic Oxford',
        description:
            'Pieter introduces the Varnell Oxford — a double-welt, hand-stitched silhouette that would define a decade and become the template for every shoe that followed.',
    },
    {
        year: '1994',
        title: 'A Third Voice',
        description:
            "Sophia Varnell joins the atelier at age 22. She modernizes the workshop's design language without sacrificing its soul, introducing asymmetric silhouettes and contemporary color palettes.",
    },
    {
        year: '2012',
        title: 'Varnell Goes Digital',
        description:
            "The first digital archive of Varnell's handwritten pattern books is completed. Over 3,000 pages of artisan records, spanning 88 years, are preserved for future generations.",
    },
    {
        year: '2024',
        title: 'A Century of Quiet Excellence',
        description:
            'Varnell marks its centennial. Still family-owned. Still handmade. A hundred years, and the same commitment to creating footwear that outlives its owner.',
    },
];

export default function Heritage() {
    return (
        <UserLayoutApp>
            <Head title="Heritage | Varnell" />

            <main className="pt-24 pb-32">

                {/* ── Hero ── */}
                <section className="relative h-[90vh] flex items-end overflow-hidden">
                    <img
                        src="/images/heritage/workshop_hero.png"
                        className="absolute inset-0 w-full h-full object-cover"
                        alt="The Varnell Heritage Workshop"
                    />
                    {/* Gradient overlay — bottom-heavy for text legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <div className="relative z-10 px-6 md:px-16 pb-20 max-w-5xl space-y-5">
                        <span className="inline-block text-white/60 font-label font-bold tracking-[0.45em] uppercase text-xs animate-fade-in">
                            Est. 1924 · Bandung, Indonesia
                        </span>
                        <h1 className="text-6xl md:text-9xl font-headline text-white leading-none tracking-tight">
                            One Hundred<br />
                            <span className="italic text-secondary-container/90">Years of</span><br />
                            Memory.
                        </h1>
                        <p className="text-lg md:text-xl text-white/70 font-body leading-relaxed max-w-xl">
                            Heritage is not a marketing word at Varnell. It is the sum of every stitch, every decision, and every generation that chose craft over convenience.
                        </p>
                    </div>
                </section>

                {/* ── Opening Statement ── */}
                <section className="py-28 px-6 md:px-16 bg-surface">
                    <div className="max-w-4xl mx-auto text-center space-y-8">
                        <span className="text-secondary font-label font-bold tracking-[0.25em] uppercase text-sm">A Family's Promise</span>
                        <h2 className="text-4xl md:text-6xl font-headline text-primary leading-tight">
                            Three generations. One<br />
                            <span className="italic">unbroken thread.</span>
                        </h2>
                        <p className="text-lg text-on-surface-variant font-body leading-relaxed max-w-2xl mx-auto">
                            From Emmanuel's first workshop in post-colonial Bandung to Sophia's modern atelier, every Varnell shoe carries the weight of a century of decisions made in favour of quality. We have never outsourced a sole. We have never compromised a seam.
                        </p>
                        <div className="w-16 h-px bg-secondary/40 mx-auto" />
                    </div>
                </section>

                {/* ── Archive Section ── */}
                <section className="py-28 px-6 md:px-12 bg-surface-container-low overflow-hidden">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-20 items-center">
                        {/* Image */}
                        <div className="md:w-1/2 relative flex-shrink-0">
                            <div className="absolute -inset-6 rounded-[3rem] bg-primary/5 -rotate-2 -z-10" />
                            <img
                                src="/images/heritage/journals.png"
                                className="w-full h-[540px] object-cover rounded-[2rem] editorial-shadow"
                                alt="Varnell Archive Journals"
                            />
                            {/* Floating badge */}
                            <div className="absolute -bottom-6 -left-6 bg-primary text-on-primary rounded-2xl px-6 py-4 editorial-shadow">
                                <p className="text-3xl font-headline italic">3,000+</p>
                                <p className="text-xs font-label uppercase tracking-widest opacity-70 mt-1">Pages Archived</p>
                            </div>
                        </div>

                        {/* Text */}
                        <div className="md:w-1/2 space-y-8">
                            <span className="text-secondary font-label font-bold tracking-[0.2em] uppercase text-sm">The Living Archive</span>
                            <h2 className="text-4xl md:text-5xl font-headline text-primary leading-tight">
                                Every pattern. Every<br />
                                <span className="italic">cut. Preserved.</span>
                            </h2>
                            <p className="text-on-surface-variant leading-relaxed font-body text-lg">
                                In 1924, Emmanuel Varnell began recording his work in hand-stitched leather journals. Every hide sourced, every pattern drafted, every customer fitted — documented with the care of a man who understood that knowledge is the only truly inheritable wealth.
                            </p>
                            <p className="text-on-surface-variant leading-relaxed font-body text-lg">
                                Today, those journals number in the hundreds. They are the DNA of every shoe we make — a living archive that shapes our designs as much as any contemporary trend.
                            </p>
                            <div className="p-6 border-l-4 border-secondary/50 bg-surface/60 rounded-r-xl italic text-primary/80 font-body text-lg">
                                "Write it down. The hands forget, but the paper remembers."<br />
                                <span className="text-sm not-italic text-on-surface-variant mt-2 block">— Emmanuel Varnell, 1931</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Timeline ── */}
                <section className="py-32 px-6 md:px-12 bg-surface">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-24 space-y-4">
                            <span className="text-secondary font-label font-bold tracking-[0.25em] uppercase text-sm">A Century in Steps</span>
                            <h2 className="text-4xl md:text-7xl font-headline text-primary">The Varnell Chronicle</h2>
                        </div>

                        {/* Timeline items */}
                        <div className="relative">
                            {/* Vertical line */}
                            <div className="absolute left-[7rem] md:left-1/2 top-0 bottom-0 w-px bg-outline-variant hidden md:block" />

                            <div className="space-y-0">
                                {timelineEvents.map((event, index) => (
                                    <div
                                        key={event.year}
                                        className={`relative flex flex-col md:flex-row gap-8 md:gap-16 pb-16 group ${
                                            index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                                        }`}
                                    >
                                        {/* Year pill */}
                                        <div className={`md:w-1/2 flex ${index % 2 === 0 ? 'md:justify-end' : 'md:justify-start'}`}>
                                            <div className="flex items-start gap-6">
                                                {index % 2 !== 0 && (
                                                    <div className="mt-2 w-4 h-4 rounded-full bg-secondary border-4 border-surface flex-shrink-0 hidden md:block group-hover:scale-125 transition-transform" />
                                                )}
                                                <div className={`space-y-2 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                                                    <p className="text-5xl font-headline text-primary/10 italic group-hover:text-secondary/30 transition-colors duration-500">
                                                        {event.year}
                                                    </p>
                                                    <h3 className="text-xl font-headline text-primary">{event.title}</h3>
                                                    <p className="text-on-surface-variant font-body text-sm leading-relaxed max-w-xs">
                                                        {event.description}
                                                    </p>
                                                </div>
                                                {index % 2 === 0 && (
                                                    <div className="mt-2 w-4 h-4 rounded-full bg-secondary border-4 border-surface flex-shrink-0 hidden md:block group-hover:scale-125 transition-transform" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Spacer for other side */}
                                        <div className="md:w-1/2 hidden md:block" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Master Artisan Portrait ── */}
                <section className="py-28 px-6 md:px-12 bg-primary text-on-primary overflow-hidden">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row-reverse gap-20 items-center">
                        {/* Image */}
                        <div className="md:w-1/2 relative">
                            <img
                                src="/images/heritage/master_artisan.png"
                                className="w-full h-[560px] object-cover rounded-[2rem] opacity-90"
                                style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.3)' }}
                                alt="Master Artisan at Work"
                            />
                            {/* Decorative ring */}
                            <div className="absolute -top-8 -right-8 w-48 h-48 border border-secondary/20 rounded-full hidden md:block" />
                            <div className="absolute -top-4 -right-4 w-32 h-32 border border-secondary/10 rounded-full hidden md:block" />
                        </div>

                        {/* Text */}
                        <div className="md:w-1/2 space-y-8">
                            <span className="text-secondary font-label font-bold tracking-[0.2em] uppercase text-sm">The Master's Chair</span>
                            <h2 className="text-4xl md:text-5xl font-headline leading-tight">
                                We still use the same<br />
                                <span className="italic text-secondary/80">chair he sat in.</span>
                            </h2>
                            <p className="text-white/70 leading-relaxed font-body text-lg">
                                The original workbench from Emmanuel's 1924 atelier still stands in our Bandung workshop. It is not a museum piece — it is a working station. Our current master cobbler, a third-generation apprentice of the Varnell lineage, uses it every morning.
                            </p>
                            <p className="text-white/70 leading-relaxed font-body text-lg">
                                We keep it not out of sentiment, but as a daily reminder: the standard was set long ago. Every shoe we make must be worthy of that bench.
                            </p>
                            <div className="grid grid-cols-3 gap-8 pt-4 border-t border-white/10">
                                {[
                                    { stat: '100', label: 'Years of Heritage' },
                                    { stat: '3', label: 'Generations' },
                                    { stat: '1', label: 'Family. One Standard.' },
                                ].map((item) => (
                                    <div key={item.label}>
                                        <p className="text-3xl font-headline italic text-secondary/80">{item.stat}</p>
                                        <p className="text-xs text-white/50 font-label uppercase tracking-widest mt-1">{item.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── CTA ── */}
                <section className="py-32 px-6 md:px-12 bg-surface">
                    <div className="max-w-4xl mx-auto text-center space-y-10">
                        <span className="text-secondary font-label font-bold tracking-[0.25em] uppercase text-sm">Carry the Story</span>
                        <h2 className="text-5xl md:text-7xl font-headline text-primary leading-tight">
                            Own a piece of<br />
                            <span className="italic">a century.</span>
                        </h2>
                        <p className="text-lg text-on-surface-variant font-body max-w-xl mx-auto leading-relaxed">
                            Every pair of Varnell shoes is a chapter in this story. Explore the collection and find yours.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <a
                                href="/collections"
                                className="inline-block bg-primary text-on-primary px-12 py-5 rounded-full font-label text-sm font-bold tracking-[0.2em] uppercase hover:bg-primary/90 transition-all editorial-shadow active:scale-95"
                            >
                                Explore the Collection
                            </a>
                            <a
                                href="/craftsmanship"
                                className="inline-block border border-primary/20 text-primary px-12 py-5 rounded-full font-label text-sm font-bold tracking-[0.2em] uppercase hover:bg-surface-container-low transition-all active:scale-95"
                            >
                                See Our Craftsmanship
                            </a>
                        </div>
                    </div>
                </section>
            </main>
        </UserLayoutApp>
    );
}
