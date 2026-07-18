import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import { Package, Activity, Users, TrendingUp, TrendingDown, AlertTriangle, BarChart2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Material Dashboard', href: '/admin/material-dashboard' },
];

interface MaterialDashboardProps {
    totalSKUs: number;
    totalStock: number;
    systemUsers: number;
    stockIn7d: number;
    stockOut7d: number;
    lowStockItems: number;
    monthlyTransactions: Array<{
        month: string;
        stockIn: number;
        stockOut: number;
    }>;
    sevenDayFlow: {
        stockIn: number;
        stockOut: number;
    };
}

// ─── Reusable KPI Card ────────────────────────────────────────────────────────

interface KpiCardProps {
    icon: React.ReactNode;
    iconBg: string;
    title: string;
    value: string | number;
    subtitle: string;
}

function KpiCard({ icon, iconBg, title, value, subtitle }: KpiCardProps) {
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

// ─── Custom Tooltip for Bar Chart ────────────────────────────────────────────

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
}

function CustomBarTooltip({ active, payload, label }: CustomTooltipProps) {
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MaterialDashboard({
    totalSKUs,
    totalStock,
    systemUsers,
    stockIn7d,
    stockOut7d,
    lowStockItems,
    monthlyTransactions,
    sevenDayFlow,
}: MaterialDashboardProps) {
    const totalFlow = sevenDayFlow.stockIn + sevenDayFlow.stockOut;
    const inRatio = totalFlow > 0 ? Math.round((sevenDayFlow.stockIn / totalFlow) * 100) : 0;

    // Donut data
    const donutData = [
        { name: 'Stock In', value: sevenDayFlow.stockIn || 0.001 },
        { name: 'Stock Out', value: sevenDayFlow.stockOut || 0.001 },
    ];
    const donutColors = ['#4ade80', '#f87171'];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Material Dashboard" />

            {/* Dark page wrapper */}
            <div className="min-h-screen bg-[#131726] px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl space-y-6">

                    {/* Header */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
                            <BarChart2 className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Material Overview</h1>
                            <p className="text-xs text-slate-500">Stock KPIs & flow — last 7 days and 6 months</p>
                        </div>
                    </div>

                    {/* ── Row 1 KPIs ─────────────────────────────────────────── */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <KpiCard
                            iconBg="bg-indigo-500"
                            icon={<Package className="h-6 w-6 text-white" />}
                            title="Total SKUs"
                            value={totalSKUs.toLocaleString()}
                            subtitle="Unique products in system"
                        />
                        <KpiCard
                            iconBg="bg-purple-500"
                            icon={<Activity className="h-6 w-6 text-white" />}
                            title="Total Stock"
                            value={totalStock.toLocaleString()}
                            subtitle="Units across all items"
                        />
                        <KpiCard
                            iconBg="bg-sky-500"
                            icon={<Users className="h-6 w-6 text-white" />}
                            title="System Users"
                            value={systemUsers.toLocaleString()}
                            subtitle="Active accounts"
                        />
                    </div>

                    {/* ── Row 2 KPIs ─────────────────────────────────────────── */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <KpiCard
                            iconBg="bg-emerald-500"
                            icon={<TrendingUp className="h-6 w-6 text-white" />}
                            title="Stock In (7d)"
                            value={stockIn7d.toLocaleString()}
                            subtitle="Units received this week"
                        />
                        <KpiCard
                            iconBg="bg-rose-500"
                            icon={<TrendingDown className="h-6 w-6 text-white" />}
                            title="Stock Out (7d)"
                            value={stockOut7d.toLocaleString()}
                            subtitle="Units dispatched this week"
                        />
                        <KpiCard
                            iconBg="bg-amber-500"
                            icon={<AlertTriangle className="h-6 w-6 text-white" />}
                            title="Low Stock Items"
                            value={lowStockItems.toLocaleString()}
                            subtitle="Items with fewer than 5 units"
                        />
                    </div>

                    {/* ── Bottom Row: Bar Chart + Donut ───────────────────────── */}
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

                        {/* Monthly Transactions Bar Chart */}
                        <div className="col-span-1 rounded-2xl bg-[#1e2235] p-6 shadow-lg lg:col-span-2">
                            <div className="mb-1 flex items-start justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-white">Monthly Transactions</h2>
                                    <p className="text-xs text-slate-500">Stock In vs. Stock Out — last 6 months</p>
                                </div>
                                <BarChart2 className="h-5 w-5 text-slate-600" />
                            </div>

                            <div className="mt-4 h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={monthlyTransactions}
                                        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                                        barCategoryGap="35%"
                                        barGap={4}
                                    >
                                        <CartesianGrid
                                            vertical={false}
                                            stroke="#2d3348"
                                            strokeDasharray="4 4"
                                        />
                                        <XAxis
                                            dataKey="month"
                                            tick={{ fill: '#64748b', fontSize: 12 }}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            tick={{ fill: '#64748b', fontSize: 11 }}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                                        <Bar
                                            dataKey="stockIn"
                                            name="Stock In"
                                            fill="#4ade80"
                                            radius={[4, 4, 0, 0]}
                                        />
                                        <Bar
                                            dataKey="stockOut"
                                            name="Stock Out"
                                            fill="#f87171"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Legend */}
                            <div className="mt-3 flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#4ade80]" />
                                    <span className="text-xs text-slate-400">Stock In</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#f87171]" />
                                    <span className="text-xs text-slate-400">Stock Out</span>
                                </div>
                            </div>
                        </div>

                        {/* 7-Day Flow Donut */}
                        <div className="rounded-2xl bg-[#1e2235] p-6 shadow-lg">
                            <div className="mb-1">
                                <h2 className="text-lg font-bold text-white">7-Day Flow</h2>
                                <p className="text-xs text-slate-500">In vs. Out ratio</p>
                            </div>

                            {/* Donut Chart */}
                            <div className="relative mt-4 flex items-center justify-center" style={{ height: 200 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={donutData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={65}
                                            outerRadius={88}
                                            startAngle={90}
                                            endAngle={-270}
                                            dataKey="value"
                                            strokeWidth={0}
                                        >
                                            {donutData.map((_, idx) => (
                                                <Cell key={idx} fill={donutColors[idx]} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Centre label */}
                                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                                    <p className="text-3xl font-bold text-white">{inRatio}%</p>
                                    <p className="text-xs text-slate-500">In ratio</p>
                                </div>
                            </div>

                            {/* Legend rows */}
                            <div className="mt-6 space-y-3 border-t border-white/5 pt-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#4ade80]" />
                                        <span className="text-sm text-slate-400">Stock In</span>
                                    </div>
                                    <span className="text-sm font-semibold text-white">
                                        {sevenDayFlow.stockIn.toLocaleString()} units
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#f87171]" />
                                        <span className="text-sm text-slate-400">Stock Out</span>
                                    </div>
                                    <span className="text-sm font-semibold text-white">
                                        {sevenDayFlow.stockOut.toLocaleString()} units
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
