import UserLayoutApp from '@/layouts/user-layout';
import { Head } from '@inertiajs/react';
import { BookOpen, ExternalLink, ArrowRight, X } from 'lucide-react';
import { useState } from 'react';

const articles = [
    {
        id: 1,
        tag: 'Industri & Sejarah',
        title: 'Dari Cibaduyut Sampai Nangkring di Top 6 Dunia: Plot Twist Sejarah Sepatu Lokal yang Jarang Kalian Tau',
        excerpt:
            'Industri sepatu kulit Indonesia udah berevolusi gila-gilaan. Dari sentra Cibaduyut & Magetan yang berdiri sejak 1800-an, sampai jadi eksportir alas kaki terbesar ke-6 dunia dengan nilai ekspor US$ 1,89 miliar di Q1 2025.',
        readTime: '5 min read',
        sections: [
            {
                type: 'paragraph',
                content:
                    'Kalo lu masih mikir sepatu kulit lokal itu cuma sekedar "barang murah" yang solnya gampang menganga, main kalian kurang jauh gengs. Industri sepatu kulit di Indonesia udah berevolusi gila-gilaan dari tahun 1990. Dulu, pasar kita emang dijajah habis-habisan sama brand luar, sementara perajin lokal di sentra kayak Cibaduyut atau Magetan cuma jalan di tempat. Tapi sekarang? Sentimen local pride udah bukan sekadar hashtag doang nih. Faktanya, Indonesia itu konsisten nangkring di jajaran top eksportir alas kaki dunia.',
            },
            {
                type: 'paragraph',
                content:
                    'Sebelum lu makin yakin, gw kasih konteks dulu. Soalnya fondasi industri ini tuh udah ratusan tahun umurnya, bukan baru kemarin sore tiba-tiba viral.',
            },
            {
                type: 'paragraph',
                content:
                    'Di Magetan, Jawa Timur, orang udah nyamak kulit dari tahun 1830-an. Awalnya buat perlengkapan kuda dan senjata pasca Perang Diponegoro, baru setelah merdeka pengrajinnya geser ke sepatu dan sandal. Cibaduyut sendiri, sentra yang lebih familiar di telinga anak muda sekarang, mulai tumbuh sejak 1920-an dan sempat disebut sebagai pasar penjualan kerajinan sepatu terpanjang di dunia karena tokonya berderet sampai berkilo-kilo.',
            },
            {
                type: 'callout',
                content:
                    'Nah ini yang gw bilang plot twist: fondasi inilah yang akhirnya bikin brand gede dunia notice Indonesia. Tahun 1988, Nike mulai produksi di sini, terus disusul Adidas, Reebok, Puma yang ramai-ramai mindahin produksinya ke Asia Tenggara. Orang sering mikir mereka datang cuma karena ngejar upah murah. Padahal itu separuh cerita doang — keahlian craftsmanship lokal yang udah dibangun ratusan tahun itu yang sebenernya jadi alasan kuat kenapa brand global percaya bikin sepatu di sini.',
            },
            {
                type: 'paragraph',
                content:
                    'Sekarang juga gak kalah gila. Indonesia sanggup produksi 1,4 miliar pasang sepatu per tahun dengan kualitas konsisten, dan pas pandemi bikin supply chain global kacau, industri ini malah cepet bangkit sambil ningkatin otomatisasi. Makanya gak aneh kalau Indonesia sekarang nyerap hampir 30% tenaga kerja pabrik global Nike dan Adidas. Itu angka yang gak mungkin lahir dari kebetulan.',
            },
            {
                type: 'heading',
                content: 'Sekarang masuk ke angka-angkanya, Gas!',
            },
            {
                type: 'paragraph',
                content:
                    'Per kuartal I 2025, Kemenperin nyatet Indonesia ada di peringkat ke-6 eksportir alas kaki dunia dengan pangsa pasar 3,99 persen. Dan ini bukan capaian yang jalan di tempat, soalnya tren-nya emang naik terus.',
            },
            {
                type: 'paragraph',
                content:
                    'Coba lu simak ini: nilai ekspor alas kaki Indonesia periode Januari–Maret 2025 nyentuh US$ 1,89 miliar, naik 13,8% dari periode yang sama tahun sebelumnya. Industrinya pun tumbuh 6,95% di kuartal I 2025, dengan sektor kulit dan alas kaki nyerap sekitar 961 ribu pekerja sampai Agustus 2024, naik 3% dari tahun sebelumnya. Kalau diliat skala tahunan, sepanjang 2024 nilai ekspor industri kulit dan alas kaki mencapai 7,1 miliar dolar AS, naik 10% dari 2023 yang cuma 6,4 miliar dolar AS. Investasinya pun deras, cuma dalam lima bulan di 2025, masuk Rp8 triliun dari 12 perusahaan besar di sektor alas kaki.',
            },
            {
                type: 'paragraph',
                content:
                    'Bukan berarti semuanya mulus sih. Posisi Indonesia masih kalah dari Vietnam yang kapasitas produksinya dua kali lipat lebih gede. Tapi tren naiknya tetep keliatan, dan itu nunjukin industri ini bukan industri yang "lagi sekarat" kayak stereotype lama, justru lagi naik kelas.',
            },
            {
                type: 'paragraph',
                content:
                    'Jadi kalau lu masih ngeremehin sepatu kulit lokal cuma karena dulunya identik sama "barang pasar", mungkin yang ketinggalan info justru lu sendiri.',
            },
        ],
        sources: [
            { label: 'nguliksepatulokal.id', url: 'https://nguliksepatulokal.id/2025/11/03/sejarah-sepatu-indonesia/' },
            { label: 'antaranews.com', url: 'https://www.antaranews.com/berita/4895041/kemenperin-ekspor-alas-kaki-capai-rp306-triliun-di-triwulan-i-2025' },
            { label: 'detik.com', url: 'https://finance.detik.com/berita-ekonomi-bisnis/d-7961132/kemenperin-ungkap-ekspor-produk-alas-kaki-tembus-rp-30-t-naik-13-8' },
            { label: 'logistiknews.id', url: 'https://www.logistiknews.id/2025/06/15/ekspor-industri-alas-kaki-nasional-tumbuh-138/' },
            { label: 'daulat.co', url: 'https://www.daulat.co/nasional/1231906753/industri-alas-kaki-naik-487-persen-indonesia-masih-tertinggal-dari-vietnam' },
        ],
    },
    {
        id: 2,
        tag: 'Panduan Belanja',
        title: 'Stop Ketipu "Genuine Leather": Cheat Sheet Biar Lu Gak Boncos Beli Sepatu Kulit',
        excerpt:
            'Label "genuine leather" bukan jaminan kualitas — itu justru kasta terendah dari kulit asli. Pelajari perbedaan full grain, top grain, split grain, dan kenapa konstruksi Goodyear welted itu bukan sekadar buzzword.',
        readTime: '6 min read',
        sections: [
            {
                type: 'paragraph',
                content:
                    'Konsumen Gen-Z sekarang udah pada melek literasi produk. Brand udah gak bisa lagi gampang ngebodohin orang pakai embel-embel "kulit asli" tapi yang dikasih cuma genuine leather abal-abal atau sintetis murahan. Brand lokal yang mau sustain dan gak mati kelindes zaman akhirnya dipaksa naik kelas, main di full-grain leather dan konstruksi level dewa kayak Goodyear welted atau hand-welted. Biar lu gak gampang kena marketing kosong, ini breakdown-nya.',
            },
            {
                type: 'heading',
                content: '"Genuine Leather" itu sering jadi red flag yang disembunyiin',
            },
            {
                type: 'paragraph',
                content:
                    'Banyak brand pede banget nempelin label "genuine leather" di produknya, seolah itu udah jaminan kualitas tertinggi. Padahal kalau diliat lebih teknis, klaim ini menyesatkan kalau gak dijelasin lebih jauh.',
            },
            {
                type: 'paragraph',
                content:
                    'Faktanya, genuine leather itu justru kategori kulit asli dengan kualitas paling rendah, karena bahannya dari sisa potongan kulit yang gak kepake waktu bikin full grain atau top grain leather. Bukan berarti bohong soal "asli"-nya, tapi jelas bukan kasta tertinggi kayak yang sering diimplikasikan lewat marketing.',
            },
            {
                type: 'paragraph',
                content:
                    'Masalahnya makin runyam karena di Indonesia, penjual sering gak ngasih penjelasan rinci soal jenis kulit yang dipakai — mereka cuma bilang "kulit asli" tanpa nyebut itu full grain, top grain, atau cuma sisa kulit kualitas rendah. Makanya literasi produk jadi penting banget sekarang, biar lu gak ketipu embel-embel doang.',
            },
            {
                type: 'table',
                caption: 'Biar lu makin paham bedanya, ini perbandingan kasta kulitnya:',
                rows: [
                    { type: 'Full Grain Leather', karakteristik: 'Lapisan teratas, serat alami utuh, makin cantik seiring waktu (patina)', daya_tahan: '15 – 30+ tahun' },
                    { type: 'Top Grain Leather', karakteristik: 'Lapisan atas tapi sudah dihaluskan, lebih rapi tapi karakter alaminya berkurang.', daya_tahan: 'Tinggi, di bawah full grain' },
                    { type: 'Split Grain Leather', karakteristik: 'Kulit yang diambil dari sisa potongan atas (top cut)', daya_tahan: 'Bergantung pada finishing' },
                    { type: 'Bonded Leather', karakteristik: 'Terbuat dari sisa serat kulit yang direkatkan jadi satu, strukturnya beda jauh dari genuine leather.', daya_tahan: 'Hanya beberapa tahun' },
                ],
            },
            {
                type: 'paragraph',
                content:
                    'Jadi kalau ada brand yang berani terang-terangan nyebut "full-grain leather" di deskripsi produknya, itu sebenernya sinyal kepercayaan, bukan cuma gimmick marketing doang.',
            },
            {
                type: 'heading',
                content: 'Goodyear welted & hand-welted, bukan cuma buzzword keren',
            },
            {
                type: 'paragraph',
                content:
                    'Selain material, "konstruksi" jadi parameter kedua yang sering disebut brand-brand lokal premium. Dan ini bukan istilah yang asal nempel biar kedengeran fancy doang, ada alasan teknis di baliknya.',
            },
            {
                type: 'paragraph',
                content:
                    'Gampangnya, Goodyear welted itu konstruksi yang nyambungin bagian atas sepatu (upper) sama sol pakai lapisan kulit tambahan namanya welt, jadi sepatunya lebih kokoh dibanding yang cuma diandelin lem. Tekniknya pertama kali dipatenkan Charles Goodyear Jr. di akhir abad ke-19, dan sejak itu jadi standar sepatu kulit premium. Keuntungan utamanya, solnya bisa diganti tanpa ngerusak bagian atas sepatu, jadi sepatu bisa "diawetin" lebih lama dibanding sepatu biasa.',
            },
            {
                type: 'paragraph',
                content:
                    'Yang lebih niche lagi, sebagian brand lokal malah berani main di hand-welted, teknik yang justru lebih kuno dan lebih ribet dibanding Goodyear welted versi mesin. Hand welting itu metode lama yang udah ada sejak abad ke-16, jauh sebelum konstruksi Goodyear welt yang dipatenkan tahun 1870-an sebagai versi mesin yang lebih praktis. Bootmaker-bootmaker Bandung diketahui masih konsisten pakai metode manual ini, di mana hampir semua proses yang biasanya dikerjain mesin sama brand modern, mereka kerjain dengan tangan.',
            },
            {
                type: 'callout',
                content:
                    'Sebelum checkout, cek dua hal ini dulu: Brand-nya nyebut jenis kulit secara spesifik (full grain/top grain) atau cuma tulis "genuine leather" doang tanpa penjelasan? Ada keterangan konstruksinya (Goodyear welted/hand-welted) atau gak dibahas sama sekali? Kalau brand-nya transparan soal dua hal ini, kemungkinan besar lu beneran lagi invest ke produk yang sepadan harganya.',
            },
        ],
        sources: [
            { label: 'tritera.co.id', url: 'https://www.tritera.co.id/blog/mengenal-berbagai-jenis-kulit,-dari-full-grain-hingga-artificial-leather' },
            { label: 'zalora.co.id', url: 'https://www.zalora.co.id/blog/fashion/review/mengenal-genuine-leather-material-kulit-asli-untuk-fashion/' },
            { label: 'buttonscarves.com', url: 'https://www.buttonscarves.com/blogs/lifestyle/jenis-jenis-bahan-genuine-leather' },
            { label: 'gindingleather.com', url: 'https://gindingleather.com/4874/jenis-bahan-kulit-berdasarkan-tingkat-kualitas/' },
            { label: 'bahankain.com', url: 'https://www.bahankain.com/2026/03/12/goodyear-welted-rajanya-konstruksi-sepatu-kulit-premium-yang-awet-dan-bandel' },
            { label: 'stridewise.com', url: 'https://stridewise.com/best-indonesian-boots/' },
        ],
    },
];

type Section =
    | { type: 'paragraph'; content: string }
    | { type: 'heading'; content: string }
    | { type: 'callout'; content: string }
    | { type: 'table'; caption?: string; rows: { type: string; karakteristik: string; daya_tahan: string }[] };

function ArticleBody({ sections }: { sections: Section[] }) {
    return (
        <div className="space-y-6">
            {sections.map((section, i) => {
                if (section.type === 'paragraph') {
                    return (
                        <p key={i} className="text-on-surface font-body text-base leading-relaxed">
                            {section.content}
                        </p>
                    );
                }
                if (section.type === 'heading') {
                    return (
                        <h3 key={i} className="text-xl md:text-2xl font-headline text-primary pt-4">
                            {section.content}
                        </h3>
                    );
                }
                if (section.type === 'callout') {
                    return (
                        <div key={i} className="p-6 border-l-4 border-secondary/60 bg-surface rounded-r-2xl text-primary/80 font-body text-base leading-relaxed italic">
                            {section.content}
                        </div>
                    );
                }
                if (section.type === 'table' && section.rows) {
                    return (
                        <div key={i} className="space-y-3 pt-2">
                            {section.caption && (
                                <p className="text-on-surface-variant font-body text-sm">{section.caption}</p>
                            )}
                            <div className="overflow-x-auto rounded-2xl border border-outline-variant">
                                <table className="w-full text-sm font-body">
                                    <thead>
                                        <tr className="bg-surface-container border-b border-outline-variant">
                                            <th className="px-5 py-4 text-left text-xs font-label uppercase tracking-widest text-primary/70">Jenis Kulit</th>
                                            <th className="px-5 py-4 text-left text-xs font-label uppercase tracking-widest text-primary/70">Karakteristik</th>
                                            <th className="px-5 py-4 text-left text-xs font-label uppercase tracking-widest text-primary/70 whitespace-nowrap">Daya Tahan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {section.rows.map((row, ri) => (
                                            <tr key={ri} className={`border-b border-outline-variant/50 last:border-0 ${ri % 2 === 0 ? 'bg-surface' : 'bg-surface-container-low'}`}>
                                                <td className="px-5 py-4 font-headline text-sm text-primary whitespace-nowrap">{row.type}</td>
                                                <td className="px-5 py-4 text-on-surface-variant leading-relaxed">{row.karakteristik}</td>
                                                <td className="px-5 py-4 text-secondary font-label font-bold text-xs whitespace-nowrap">{row.daya_tahan}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                }
                return null;
            })}
        </div>
    );
}

export default function Heritage() {
    const [activeId, setActiveId] = useState<number | null>(null);
    const activeArticle = articles.find((a) => a.id === activeId) ?? null;

    const handleSelect = (id: number) => {
        setActiveId((prev) => (prev === id ? null : id));
    };

    return (
        <UserLayoutApp>
            <Head title="Articles | Varnell" />

            <main className="min-h-screen pt-32 pb-24 px-6 md:px-12 bg-surface">
                <div className="max-w-5xl mx-auto space-y-10">

                    {/* ── Page Header ── */}
                    <div className="text-center space-y-4 pb-4">
                        <span className="text-secondary font-label font-bold tracking-[0.2em] uppercase text-sm flex items-center justify-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            Varnell Reads
                        </span>
                        <h1 className="text-4xl md:text-6xl font-headline text-primary">Articles</h1>
                        <p className="text-on-surface-variant font-body text-base max-w-xl mx-auto">
                            Insight, education, dan cerita di balik industri sepatu kulit Indonesia — tanpa filter.
                        </p>
                    </div>

                    {/* ── Two Cards Side by Side ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {articles.map((article) => {
                            const isActive = activeId === article.id;
                            return (
                                <button
                                    key={article.id}
                                    id={`article-card-${article.id}`}
                                    onClick={() => handleSelect(article.id)}
                                    className={`text-left group rounded-3xl border p-8 space-y-5 transition-all duration-300 cursor-pointer
                                        ${isActive
                                            ? 'bg-primary text-on-primary border-primary editorial-shadow scale-[1.01]'
                                            : 'bg-surface-container-low border-outline-variant hover:border-secondary/40 hover:editorial-shadow hover:scale-[1.01]'
                                        }`}
                                >
                                    {/* Tag + read time */}
                                    <div className="flex items-center justify-between gap-3 flex-wrap">
                                        <span className={`text-[10px] font-label font-bold uppercase tracking-widest px-3 py-1 rounded-full
                                            ${isActive ? 'bg-white/15 text-white' : 'bg-secondary/10 text-secondary'}`}>
                                            {article.tag}
                                        </span>
                                        <span className={`text-xs font-label ${isActive ? 'text-white/60' : 'text-on-surface-variant'}`}>
                                            {article.readTime}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h2 className={`text-lg md:text-xl font-headline leading-snug
                                        ${isActive ? 'text-white' : 'text-primary'}`}>
                                        {article.title}
                                    </h2>

                                    {/* Excerpt */}
                                    <p className={`font-body text-sm leading-relaxed line-clamp-3
                                        ${isActive ? 'text-white/70' : 'text-on-surface-variant'}`}>
                                        {article.excerpt}
                                    </p>

                                    {/* CTA row */}
                                    <div className={`flex items-center gap-2 text-xs font-label font-bold uppercase tracking-widest transition-colors pt-1
                                        ${isActive ? 'text-white/80' : 'text-secondary group-hover:gap-3'}`}>
                                        {isActive ? (
                                            <>
                                                <X className="w-3.5 h-3.5" />
                                                Close Article
                                            </>
                                        ) : (
                                            <>
                                                Read Article
                                                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                                            </>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* ── Article Detail (expands below cards) ── */}
                    <div
                        className={`overflow-hidden transition-all duration-500 ease-in-out ${
                            activeArticle ? 'max-h-[9999px] opacity-100' : 'max-h-0 opacity-0'
                        }`}
                    >
                        {activeArticle && (
                            <article className="bg-surface-container-low rounded-3xl border border-outline-variant overflow-hidden editorial-shadow">

                                {/* Article header */}
                                <div className="px-8 md:px-14 pt-12 pb-8 border-b border-outline-variant/50 space-y-4">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className="text-[10px] font-label font-bold uppercase tracking-widest text-secondary bg-secondary/10 px-3 py-1 rounded-full">
                                            {activeArticle.tag}
                                        </span>
                                        <span className="text-xs font-label text-on-surface-variant">{activeArticle.readTime}</span>
                                    </div>
                                    <h2 className="text-2xl md:text-4xl font-headline text-primary leading-tight">
                                        {activeArticle.title}
                                    </h2>
                                    <div className="flex items-center gap-2 pt-1">
                                        <div className="w-6 h-6 rounded-full bg-secondary/10 text-secondary flex items-center justify-center font-headline font-bold text-xs uppercase">
                                            V
                                        </div>
                                        <span className="text-xs font-body text-on-surface-variant">Varnell Editorial</span>
                                    </div>
                                </div>

                                {/* Article body */}
                                <div className="px-8 md:px-14 py-10">
                                    <ArticleBody sections={activeArticle.sections as Section[]} />
                                </div>

                                {/* Sources */}
                                <div className="px-8 md:px-14 py-6 bg-surface-container border-t border-outline-variant/50">
                                    <p className="text-xs font-label uppercase tracking-widest text-primary/40 mb-3">Sumber</p>
                                    <div className="flex flex-wrap gap-2">
                                        {activeArticle.sources.map((src, si) => (
                                            <a
                                                key={si}
                                                href={src.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-xs font-body text-secondary hover:text-secondary/70 bg-secondary/5 hover:bg-secondary/10 border border-secondary/20 px-3 py-1.5 rounded-full transition-colors"
                                            >
                                                {src.label}
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        ))}
                                    </div>
                                </div>

                                {/* Close button */}
                                <div className="flex justify-center py-6 border-t border-outline-variant/30">
                                    <button
                                        onClick={() => setActiveId(null)}
                                        className="inline-flex items-center gap-2 text-xs font-label font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                        Close Article
                                    </button>
                                </div>
                            </article>
                        )}
                    </div>

                </div>
            </main>
        </UserLayoutApp>
    );
}
