import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Clock, Truck, Box, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Shipments',
        href: '/admin/shipment',
    },
];

interface Shipment {
    id: number;
    order_id: number;
    courier: string | null;
    tracking_number: string | null;
    status: 'pending' | 'progress' | 'packaging' | 'completed';
    created_at: string;
    order: {
        id: number;
        user: {
            name: string;
        };
    };
}

interface Stats {
    pending: number;
    progress: number;
    packaging: number;
    completed: number;
}

interface Props {
    shipments: Shipment[];
    stats: Stats;
}

export default function ShipmentPage({ shipments, stats }: Props) {
    const statCards = [
        { title: 'Pending', count: stats.pending, icon: Clock, color: 'text-yellow-500', bg: 'bg-gray-900/30' },
        { title: 'In Progress', count: stats.progress, icon: Truck, color: 'text-blue-500', bg: 'bg-gray-900/30' },
        { title: 'Packaging', count: stats.packaging, icon: Box, color: 'text-purple-500', bg: 'bg-gray-900/30' },
        { title: 'Completed', count: stats.completed, icon: CheckCircle, color: 'text-green-500', bg: 'bg-gray-900/30' },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="border-yellow-200 bg-yellow-50 text-yellow-700">Pending</Badge>;
            case 'progress':
                return <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">In Progress</Badge>;
            case 'packaging':
                return <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700">Packaging</Badge>;
            case 'completed':
                return <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">Completed</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Shipments" />
            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
                {/* Stats Summary */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((card) => (
                        <Card key={card.title} className="border-sidebar-border/70 shadow-none">
                            <CardContent className="flex items-center gap-4 p-6">
                                <div className={`rounded-lg ${card.bg} p-3`}>
                                    <card.icon className={`h-6 w-6 ${card.color}`} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                                    <h3 className="text-2xl font-bold">{card.count}</h3>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Shipment Table */}
                <Card className="border-sidebar-border/70 bg-transparent shadow-none">
                    <CardHeader>
                        <CardTitle>Recent Shipments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Courier</TableHead>
                                        <TableHead>Tracking Number</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {shipments.length > 0 ? (
                                        shipments.map((shipment) => (
                                            <TableRow key={shipment.id}>
                                                <TableCell className="font-medium">#{shipment.order_id}</TableCell>
                                                <TableCell>{shipment.order?.user?.name || 'Unknown'}</TableCell>
                                                <TableCell>{shipment.courier || '-'}</TableCell>
                                                <TableCell className="font-mono text-sm">{shipment.tracking_number || 'N/A'}</TableCell>
                                                <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {format(new Date(shipment.created_at), 'MMM d, yyyy')}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                                No shipments found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
