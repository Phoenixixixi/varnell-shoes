import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Clock, Package, CheckCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
];

interface DashboardProps {
    stats: {
        total_income: number;
        pending_orders: number;
        total_shipments: number;
        completed_shipments: number;
    };
    incomeTrends: Array<{
        date: string;
        total: number;
    }>;
    shipmentStats: {
        pending: number;
        progress: number;
        packaging: number;
        completed: number;
    };
}

const COLORS = ['#eab308', '#3b82f6', '#a855f7', '#22c55e']; // yellow, blue, purple, green corresponding to status colors

export default function Dashboard({ stats, incomeTrends, shipmentStats }: DashboardProps) {
    // Format data for Recharts Pie Chart
    const pieData = [
        { name: 'Pending', value: shipmentStats.pending },
        { name: 'In Progress', value: shipmentStats.progress },
        { name: 'Packaging', value: shipmentStats.packaging },
        { name: 'Completed', value: shipmentStats.completed },
    ];

    // Format data for Recharts Area Chart
    const areaData = incomeTrends.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        Total: Number(item.total)
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
                
                {/* Metric Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-sidebar-border/70 shadow-none hover:bg-muted/50 transition-colors">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-lg bg-green-500/10 p-3">
                                <TrendingUp className="h-6 w-6 text-green-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Income</p>
                                <h3 className="text-2xl font-bold">${Number(stats.total_income).toLocaleString()}</h3>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-sidebar-border/70 shadow-none hover:bg-muted/50 transition-colors">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-lg bg-yellow-500/10 p-3">
                                <Clock className="h-6 w-6 text-yellow-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                                <h3 className="text-2xl font-bold">{stats.pending_orders}</h3>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-sidebar-border/70 shadow-none hover:bg-muted/50 transition-colors">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-lg bg-blue-500/10 p-3">
                                <Package className="h-6 w-6 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Shipments</p>
                                <h3 className="text-2xl font-bold">{stats.total_shipments}</h3>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-sidebar-border/70 shadow-none hover:bg-muted/50 transition-colors">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-lg bg-emerald-500/10 p-3">
                                <CheckCircle className="h-6 w-6 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Completed Shipments</p>
                                <h3 className="text-2xl font-bold">{stats.completed_shipments}</h3>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Income Chart */}
                    <Card className="border-sidebar-border/70 shadow-none lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Income Overview (Last 30 Days)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[350px] w-full">
                                {areaData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={areaData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis 
                                                stroke="#888888" 
                                                fontSize={12} 
                                                tickLine={false} 
                                                axisLine={false} 
                                                tickFormatter={(value) => `$${value}`} 
                                            />
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                            <Tooltip 
                                                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Income']}
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Area type="monotone" dataKey="Total" stroke="#22c55e" fillOpacity={1} fill="url(#colorTotal)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-muted-foreground">
                                        No income data available for this period.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Shipment Distribution */}
                    <Card className="border-sidebar-border/70 shadow-none lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Shipment Status Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[350px] w-full">
                                {stats.total_shipments > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                formatter={(value: number) => [value, 'Shipments']}
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Legend verticalAlign="bottom" height={36}/>
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-muted-foreground">
                                        No shipment data available.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
