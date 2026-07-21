import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { Activity, AlertTriangle, BarChart2, ChevronDown, Package, TrendingDown, TrendingUp, Users, X } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Material Dashboard', href: '/admin/material-dashboard' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface DailyRow {
    date: string; // 'YYYY-MM-DD'
    stockIn: number;
    stockOut: number;
}

interface PerMaterialLog {
    materialId: number;
    date: string; // 'YYYY-MM-DD'
    stockIn: number;
    stockOut: number;
}

interface MaterialItem {
    id: number;
    name: string;
}

interface MaterialDashboardProps {
    totalSKUs: number;
    totalStock: number;
    systemUsers: number;
    stockIn7d: number;
    stockOut7d: number;
    lowStockItems: number;
    dailyTransactions: DailyRow[];
    sevenDayFlow: { stockIn: number; stockOut: number };
    materials: MaterialItem[];
    perMaterialLogs: PerMaterialLog[];
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ icon, iconBg, title, value, subtitle }: {
    icon: React.ReactNode; iconBg: string; title: string; value: string | number; subtitle: string;
}) {
    return (
        <div className="flex items-start gap-4 rounded-2xl bg-[#1e2235] p-5 shadow-lg">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-sm font-medium text-slate-400">{title}</p>
                <p className="mt-0.5 text-3xl font-bold tracking-tight text-white">{value}</p>
                <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
            </div>
        </div>
    );
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

function CustomBarTooltip({ active, payload, label }: {
    active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string;
}) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-xl border border-white/10 bg-[#1a1f35] px-4 py-3 shadow-xl text-sm">
            <p className="mb-2 font-semibold text-white">{label}</p>
            {payload.map((p) => (
                <div key={p.name} className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-slate-400">{p.name}:</span>
                    <span className="font-medium text-white">{p.value.toLocaleString()}</span>
                </div>
            ))}
        </div>
    );
}

// ─── Simple dark select ───────────────────────────────────────────────────────

function DarkSelect({ value, onChange, children }: {
    value: string; onChange: (v: string) => void; children: React.ReactNode;
}) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-8 appearance-none rounded-lg border border-white/10 bg-[#252a42] pr-8 pl-3 text-xs text-slate-300 outline-none focus:border-indigo-500 cursor-pointer"
            >
                {children}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
        </div>
    );
}

// ─── Chip / active-filter badge ───────────────────────────────────────────────

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs font-medium text-indigo-300">
            {label}
            <button onClick={onRemove} className="ml-0.5 hover:text-white">
                <X className="h-3 w-3" />
            </button>
        </span>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MaterialDashboard({
    totalSKUs,
    totalStock,
    systemUsers,
    stockIn7d,
    stockOut7d,
    lowStockItems,
    dailyTransactions,
    materials,
    perMaterialLogs,
}: MaterialDashboardProps) {

    // ── Filter state ──────────────────────────────────────────────────────────
    const [selectedMaterial, setSelectedMaterial] = useState<string>('all');
    const [selectedPeriod, setSelectedPeriod] = useState<string>('6_months');
    const [selectedSpecificMonth, setSelectedSpecificMonth] = useState<string>('');
    const [selectedSpecificWeek, setSelectedSpecificWeek] = useState<string>('');

    const allDates = useMemo(() => dailyTransactions.map((r) => r.date).sort(), [dailyTransactions]);

    const availableMonths = useMemo(() => {
        const months = new Set<string>();
        allDates.forEach(d => months.add(d.substring(0, 7)));
        return Array.from(months).sort().reverse();
    }, [allDates]);

    const availableWeeks = useMemo(() => {
        const weeks = new Set<string>();
        allDates.forEach(d => {
            const ym = d.substring(0, 7);
            const day = parseInt(d.substring(8, 10), 10);
            const w = Math.ceil(day / 7);
            weeks.add(`${ym}-${w}`);
        });
        return Array.from(weeks).sort().reverse();
    }, [allDates]);

    const currentSpecificMonth = selectedSpecificMonth || availableMonths[0] || '';
    const currentSpecificWeek = selectedSpecificWeek || availableWeeks[0] || '';

    // ── Derived chart data ────────────────────────────────────────────────────
    const chartData = useMemo(() => {
        let sourceData: DailyRow[] = [];

        if (selectedMaterial === 'all') {
            sourceData = dailyTransactions;
        } else {
            const matId = parseInt(selectedMaterial, 10);
            const map = new Map<string, {stockIn: number, stockOut: number}>();
            allDates.forEach(d => map.set(d, {stockIn: 0, stockOut: 0}));
            perMaterialLogs.forEach(l => {
                if (l.materialId === matId && map.has(l.date)) {
                    const m = map.get(l.date)!;
                    m.stockIn += l.stockIn;
                    m.stockOut += l.stockOut;
                }
            });
            sourceData = allDates.map(d => ({ date: d, ...map.get(d)! }));
        }

        if (selectedPeriod === '1_week') {
            if (!currentSpecificWeek) return [];
            const [sy, sm, sw] = currentSpecificWeek.split('-');
            const filtered = sourceData.filter(d => {
                const ym = d.date.substring(0, 7);
                const w = Math.ceil(parseInt(d.date.substring(8, 10), 10) / 7);
                return ym === `${sy}-${sm}` && w === parseInt(sw, 10);
            });
            
            return filtered.map(d => {
                const label = new Date(d.date).toLocaleString('default', { weekday: 'short', day: 'numeric' });
                return { label, ...d };
            });
        }

        if (selectedPeriod === '1_month') {
            if (!currentSpecificMonth) return [];
            const filtered = sourceData.filter(d => d.date.substring(0, 7) === currentSpecificMonth);
            
            const weekBuckets = new Map<number, {stockIn: number, stockOut: number}>();
            [1,2,3,4,5].forEach(w => weekBuckets.set(w, {stockIn:0, stockOut:0}));
            
            filtered.forEach(d => {
                const w = Math.ceil(parseInt(d.date.substring(8, 10), 10) / 7);
                const bucket = weekBuckets.get(w)!;
                bucket.stockIn += d.stockIn;
                bucket.stockOut += d.stockOut;
            });

            const res = [];
            for (let i = 1; i <= 5; i++) {
                const b = weekBuckets.get(i)!;
                if (i === 5 && b.stockIn === 0 && b.stockOut === 0) continue; 
                res.push({ label: `Week ${i}`, ...b });
            }
            return res;
        }

        const monthCount = parseInt(selectedPeriod.split('_')[0], 10);
        const slicedMonths = availableMonths.slice(0, monthCount).reverse();

        const filtered = sourceData.filter(d => slicedMonths.includes(d.date.substring(0, 7)));

        const monthBuckets = new Map<string, {stockIn: number, stockOut: number}>();
        slicedMonths.forEach(ym => monthBuckets.set(ym, {stockIn:0, stockOut:0}));
        
        filtered.forEach(d => {
            const ym = d.date.substring(0, 7);
            if (monthBuckets.has(ym)) {
                const b = monthBuckets.get(ym)!;
                b.stockIn += d.stockIn;
                b.stockOut += d.stockOut;
            }
        });

        return slicedMonths.map(ym => {
            const label = new Date(ym + '-01').toLocaleString('default', { month: 'short', year: 'numeric' });
            return { label, ...monthBuckets.get(ym)! };
        });

    }, [selectedMaterial, selectedPeriod, currentSpecificWeek, currentSpecificMonth, dailyTransactions, perMaterialLogs, allDates, availableMonths]);

    // ── Derived ratio (from filtered chart data) ──────────────────────────────
    const filteredIn  = useMemo(() => chartData.reduce((s, r) => s + r.stockIn, 0),  [chartData]);
    const filteredOut = useMemo(() => chartData.reduce((s, r) => s + r.stockOut, 0), [chartData]);
    const filteredTotal = filteredIn + filteredOut;
    const inRatio  = filteredTotal > 0 ? Math.round((filteredIn  / filteredTotal) * 100) : 0;
    const outRatio = filteredTotal > 0 ? Math.round((filteredOut / filteredTotal) * 100) : 0;

    const donutData   = [
        { name: 'Stock In',  value: filteredIn  || 0.001 },
        { name: 'Stock Out', value: filteredOut || 0.001 },
    ];
    const donutColors = ['#4ade80', '#f87171'];

    // Active filter labels
    const materialLabel = selectedMaterial !== 'all'
        ? materials.find((m) => m.id === parseInt(selectedMaterial, 10))?.name
        : null;
        
    const timeLabel = useMemo(() => {
        if (selectedPeriod === '1_week') {
            if (!currentSpecificWeek) return '1 Week';
            const [y, m, w] = currentSpecificWeek.split('-');
            return `Week ${w} in ${new Date(`${y}-${m}-01`).toLocaleString('default', { month: 'short', year: 'numeric' })}`;
        }
        if (selectedPeriod === '1_month') {
            if (!currentSpecificMonth) return '1 Month';
            return new Date(currentSpecificMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' });
        }
        const count = selectedPeriod.split('_')[0];
        return `Last ${count} months`;
    }, [selectedPeriod, currentSpecificWeek, currentSpecificMonth]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Material Dashboard" />

            <div className="min-h-screen bg-[#131726] px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl space-y-6">

                    {/* ── Header ──────────────────────────────────────────── */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
                            <BarChart2 className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Material Overview</h1>
                            <p className="text-xs text-slate-500">Stock KPIs & flow analytics</p>
                        </div>
                    </div>

                    {/* ── KPI Row 1 ───────────────────────────────────────── */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <KpiCard iconBg="bg-indigo-500" icon={<Package className="h-6 w-6 text-white" />}
                            title="Total SKUs" value={totalSKUs.toLocaleString()} subtitle="Unique products in system" />
                        <KpiCard iconBg="bg-purple-500" icon={<Activity className="h-6 w-6 text-white" />}
                            title="Total Stock" value={totalStock.toLocaleString()} subtitle="Units across all items" />
                        <KpiCard iconBg="bg-sky-500" icon={<Users className="h-6 w-6 text-white" />}
                            title="System Users" value={systemUsers.toLocaleString()} subtitle="Active accounts" />
                    </div>

                    {/* ── KPI Row 2 ───────────────────────────────────────── */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <KpiCard iconBg="bg-emerald-500" icon={<TrendingUp className="h-6 w-6 text-white" />}
                            title="Stock In (7d)" value={stockIn7d.toLocaleString()} subtitle="Units received this week" />
                        <KpiCard iconBg="bg-rose-500" icon={<TrendingDown className="h-6 w-6 text-white" />}
                            title="Stock Out (7d)" value={stockOut7d.toLocaleString()} subtitle="Units dispatched this week" />
                        <KpiCard iconBg="bg-amber-500" icon={<AlertTriangle className="h-6 w-6 text-white" />}
                            title="Low Stock Items" value={lowStockItems.toLocaleString()} subtitle="Items with fewer than 5 units" />
                    </div>

                    {/* ── Chart Section ────────────────────────────────────── */}
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

                        {/* Bar Chart card */}
                        <div className="col-span-1 rounded-2xl bg-[#1e2235] p-6 shadow-lg lg:col-span-2">

                            {/* Chart header + filters */}
                            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-white">Stock Flow</h2>
                                    <p className="text-xs text-slate-500">Stock In vs. Stock Out</p>
                                </div>

                                {/* Filter controls */}
                                <div className="flex flex-wrap items-center gap-2">
                                    {/* Material filter */}
                                    <DarkSelect value={selectedMaterial} onChange={setSelectedMaterial}>
                                        <option value="all">All Materials</option>
                                        {materials.map((m) => (
                                            <option key={m.id} value={String(m.id)}>{m.name}</option>
                                        ))}
                                    </DarkSelect>

                                    {/* Period filter */}
                                    <DarkSelect value={selectedPeriod} onChange={setSelectedPeriod}>
                                        <option value="1_week">1 Week</option>
                                        <option value="1_month">1 Month</option>
                                        <option value="3_months">3 Months</option>
                                        <option value="6_months">6 Months</option>
                                        <option value="12_months">12 Months</option>
                                    </DarkSelect>

                                    {/* Specific Month filter (only if 1_month) */}
                                    {selectedPeriod === '1_month' && (
                                        <DarkSelect value={currentSpecificMonth} onChange={setSelectedSpecificMonth}>
                                            {availableMonths.map(ym => {
                                                const label = new Date(ym + '-01').toLocaleString('default', { month: 'short', year: 'numeric' });
                                                return <option key={ym} value={ym}>{label}</option>
                                            })}
                                        </DarkSelect>
                                    )}

                                    {/* Specific Week filter (only if 1_week) */}
                                    {selectedPeriod === '1_week' && (
                                        <DarkSelect value={currentSpecificWeek} onChange={setSelectedSpecificWeek}>
                                            {availableWeeks.map(wStr => {
                                                const [y, m, w] = wStr.split('-');
                                                const label = `Week ${w} - ${new Date(`${y}-${m}-01`).toLocaleString('default', { month: 'short', year: 'numeric' })}`;
                                                return <option key={wStr} value={wStr}>{label}</option>
                                            })}
                                        </DarkSelect>
                                    )}
                                </div>
                            </div>

                            {/* Active filter chips */}
                            {(materialLabel || selectedPeriod !== '6_months') && (
                                <div className="mb-3 flex flex-wrap gap-2">
                                    {materialLabel && (
                                        <FilterChip label={materialLabel} onRemove={() => setSelectedMaterial('all')} />
                                    )}
                                    <FilterChip label={timeLabel} onRemove={() => setSelectedPeriod('6_months')} />
                                </div>
                            )}

                            {/* Bar chart */}
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barCategoryGap="35%" barGap={4}>
                                        <CartesianGrid vertical={false} stroke="#2d3348" strokeDasharray="4 4" />
                                        <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
                                        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
                                        <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                                        <Bar dataKey="stockIn"  name="Stock In"  fill="#4ade80" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="stockOut" name="Stock Out" fill="#f87171" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Summary row below chart */}
                            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-4">
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#4ade80]" />
                                        <span className="text-xs text-slate-400">Stock In</span>
                                        <span className="text-xs font-semibold text-white">{filteredIn.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#f87171]" />
                                        <span className="text-xs text-slate-400">Stock Out</span>
                                        <span className="text-xs font-semibold text-white">{filteredOut.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <span>In: <span className="font-semibold text-emerald-400">{inRatio}%</span></span>
                                    <span className="text-slate-700">|</span>
                                    <span>Out: <span className="font-semibold text-rose-400">{outRatio}%</span></span>
                                </div>
                            </div>
                        </div>

                        {/* Donut + ratio card — reflects current filter */}
                        <div className="rounded-2xl bg-[#1e2235] p-6 shadow-lg">
                            <div className="mb-1">
                                <h2 className="text-lg font-bold text-white">Flow Ratio</h2>
                                <p className="text-xs text-slate-500">
                                    {materialLabel ? materialLabel : 'All materials'} · {timeLabel}
                                </p>
                            </div>

                            {/* Donut */}
                            <div className="relative mt-4 flex items-center justify-center" style={{ height: 200 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={donutData}
                                            cx="50%" cy="50%"
                                            innerRadius={65} outerRadius={88}
                                            startAngle={90} endAngle={-270}
                                            dataKey="value" strokeWidth={0}
                                        >
                                            {donutData.map((_, idx) => (
                                                <Cell key={idx} fill={donutColors[idx]} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                                    <p className="text-3xl font-bold text-white">{inRatio}%</p>
                                    <p className="text-xs text-slate-500">In ratio</p>
                                </div>
                            </div>

                            {/* Ratio bars */}
                            <div className="mt-4 space-y-2">
                                {/* Stock In bar */}
                                <div>
                                    <div className="mb-1 flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-1.5">
                                            <span className="inline-block h-2 w-2 rounded-full bg-[#4ade80]" />
                                            <span className="text-slate-400">Stock In</span>
                                        </div>
                                        <span className="font-semibold text-emerald-400">{inRatio}%</span>
                                    </div>
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                                        <div className="h-full rounded-full bg-[#4ade80] transition-all duration-500" style={{ width: `${inRatio}%` }} />
                                    </div>
                                </div>
                                {/* Stock Out bar */}
                                <div>
                                    <div className="mb-1 flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-1.5">
                                            <span className="inline-block h-2 w-2 rounded-full bg-[#f87171]" />
                                            <span className="text-slate-400">Stock Out</span>
                                        </div>
                                        <span className="font-semibold text-rose-400">{outRatio}%</span>
                                    </div>
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                                        <div className="h-full rounded-full bg-[#f87171] transition-all duration-500" style={{ width: `${outRatio}%` }} />
                                    </div>
                                </div>
                            </div>

                            {/* Unit totals */}
                            <div className="mt-6 space-y-3 border-t border-white/5 pt-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#4ade80]" />
                                        <span className="text-sm text-slate-400">Stock In</span>
                                    </div>
                                    <span className="text-sm font-semibold text-white">{filteredIn.toLocaleString()} units</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#f87171]" />
                                        <span className="text-sm text-slate-400">Stock Out</span>
                                    </div>
                                    <span className="text-sm font-semibold text-white">{filteredOut.toLocaleString()} units</span>
                                </div>
                                <div className="flex items-center justify-between border-t border-white/5 pt-2">
                                    <span className="text-sm text-slate-500">Total</span>
                                    <span className="text-sm font-semibold text-white">{filteredTotal.toLocaleString()} units</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
