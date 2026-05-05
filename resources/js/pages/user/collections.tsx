import UserLayoutApp from '@/layouts/user-layout';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { formatRupiah } from '@/lib/to-rupiah';

export default function Catalog({ products, styleshoes, sizesshoes }: any) {
    const [styles, setStyles] = useState<string[]>([])
    const [sizes, setSizes] = useState<number[]>([])

    const handleClick = (type: string) => {
        let currPage = products.current_page


        if (type === 'increment') {
            currPage = currPage + 1
        } else {
            currPage = currPage - 1
        }

        if (currPage === 0) {
            currPage = 1
        }

        router.get('/collections', {
            page: currPage,
        }
        )

    }

    console.log(products)


    const sizesShoes: number[] = [
        38, 39, 40, 41, 42, 43, 44
    ];

    const sendParams = (newStyles: string[], newSizes: number[]) => {
        router.get('/collections', {
            styles: newStyles,
            sizes: newSizes
        }, {
            preserveState: true,
            replace: true
        })
    }

    const handleStyleChange = (value: string) => {
        let newStyles: string[]


        if (styles.includes(value)) {
            newStyles = styles.filter(s => s !== value)
        } else {
            newStyles = [...styles, value]
        }

        setStyles(newStyles)

        sendParams(newStyles, sizes)


    }
    const handleSizeChange = (value: number) => {
        let newSizes;
        if (sizes.includes(value)) {
            newSizes = sizes.filter(s => s !== value)
        } else {
            newSizes = [...sizes, value]
        }

        setSizes(newSizes)
        sendParams(styles, newSizes)


    }





    return (
        <UserLayoutApp>


            <main className="pt-32 pb-24 px-12 max-w-[1440px] mx-auto">

                <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="max-w-2xl">
                        <h1 className="text-6xl font-headline font-light tracking-tight text-primary leading-tight">Footwear <br />Collections</h1>
                        <p className="mt-6 text-on-surface-variant font-body text-lg leading-relaxed max-w-md">
                            Hand-stitched precision meets the raw beauty of organic textures. Discover our curated selection of leather silhouettes designed for the modern journey.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">

                    </div>
                </header>
                <div className="flex flex-col md:flex-row gap-16">

                    <aside className="w-full md:w-64 flex-shrink-0 space-y-12">
                        {/* <section>
                            <h3 className="font-headline text-xl mb-6 text-primary">Style</h3>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input className="w-5 h-5 rounded border-outline-variant text-secondary focus:ring-secondary/20" type="checkbox"
                                        value="Oxfords"
                                        checked={styles.includes("Oxfords")}
                                        onChange={() => handleStyleChange("Oxfords")}
                                    />
                                    <span className="font-label text-sm text-on-surface-variant group-hover:text-primary transition-colors">Oxfords</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input className="w-5 h-5 rounded border-outline-variant text-secondary focus:ring-secondary/20" type="checkbox"
                                        value="Loafers"
                                        checked={styles.includes("Loafers")}
                                        onChange={() => handleStyleChange("Loafers")}
                                    />
                                    <span className="font-label text-sm text-on-surface-variant group-hover:text-primary transition-colors">Loafers</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input className="w-5 h-5 rounded border-outline-variant text-secondary focus:ring-secondary/20" type="checkbox"
                                        value="Boots"
                                        checked={styles.includes("Boots")}
                                        onChange={() => handleStyleChange("Boots")}
                                    />
                                    <span className="font-label text-sm text-on-surface-variant group-hover:text-primary transition-colors">Boots</span>
                                </label>
                            </div>
                        </section> */}
                        {/* <section>
                            <h3 className="font-headline text-xl mb-6 text-primary">Material</h3>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input className="w-5 h-5 rounded border-outline-variant text-secondary focus:ring-secondary/20" type="checkbox" />
                                    <span className="font-label text-sm text-on-surface-variant group-hover:text-primary transition-colors">Full-Grain Leather</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input className="w-5 h-5 rounded border-outline-variant text-secondary focus:ring-secondary/20" type="checkbox" />
                                    <span className="font-label text-sm text-on-surface-variant group-hover:text-primary transition-colors">Suede</span>
                                </label>
                            </div>
                        </section> */}

                        <section>
                            <h3 className="font-headline text-xl mb-6 text-primary">Size</h3>
                            <div className="grid grid-cols-3 gap-2">
                                {sizesShoes.map((sizeShoes) => (
                                    <button
                                        className={`py-2 text-xs font-label border border-outline-variant rounded-lg hover:border-primary hover:bg-surface-container transition-all ${sizes.includes(sizeShoes) ? "bg-primary text-white" : ""}`}
                                        onClick={() => handleSizeChange(sizeShoes)}
                                    >{sizeShoes}</button>
                                ))}
                            </div>
                        </section>
                    </aside>

                    <div className="flex-1">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-16">

                            {products.data.map((product: any) => (
                                <a href={`/collections/${product.id}`} className="group cursor-pointer" key={product.id}>
                                    <div className="relative overflow-hidden editorial-image-mask aspect-[4/5] bg-surface-container-low mb-6">
                                        <img alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            data-alt={product.description}
                                            src={product.images[0].image_list} />
                                    </div>

                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-headline text-2xl text-primary mb-1">{product.name}</h3>
                                            <p className="text-on-surface-variant font-label text-sm uppercase tracking-wider mb-4">{product.description}</p>
                                            <div className="flex gap-2">
                                                {product.sizes.map((size: any) => (
                                                    <span className="font-label text-sm text-on-surface-variant">{size.size}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <span className="font-headline text-xl text-primary">{formatRupiah(product.price)}</span>
                                    </div>
                                </a>
                            ))}


                        </div>

                        <div className="mt-24 flex items-center justify-center gap-4">
                            <button className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center cursor-pointer text-primary hover:bg-primary hover:text-white transition-all"
                                onClick={() => handleClick('decrement')}
                            >
                                <ChevronLeft />
                            </button>
                            <span className="font-label text-sm tracking-widest text-primary font-bold">{products.current_page} / {products.last_page}</span>
                            <button className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center cursor-pointer text-primary hover:bg-primary hover:text-white transition-all"
                                onClick={() => handleClick('increment')}
                            >
                                <ChevronRight />
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </UserLayoutApp>
    )
}