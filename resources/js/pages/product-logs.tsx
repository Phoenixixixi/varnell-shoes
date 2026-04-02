import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Product Logs',
        href: '/admin/products-logs',
    },
];

interface Log {
    id: number;
    product_id: number;
    user_id: number;
    type: 'in' | 'out';
    quantity: number;
    created_at: string;
    product: {
        name: string;
    };
    user: {
        name: string;
    };
}

interface Props {
    logs: Log[];
}

export default function ProductLogs({ logs }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Product Stock Logs" />
            <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
                <Card className="border-sidebar-border/70 bg-transparent shadow-none dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>Product Stock History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Action By</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Date & Time</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.length > 0 ? (
                                        logs.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell className="font-medium">{log.product?.name || 'Unknown Product'}</TableCell>
                                                <TableCell>{log.user?.name || 'System'}</TableCell>
                                                <TableCell>
                                                    <Badge variant={log.type === 'in' ? 'default' : 'destructive'} className={log.type === 'in' ? 'bg-green-500 hover:bg-green-600' : ''}>
                                                        {log.type === 'in' ? 'STOCKED IN' : 'STOCKED OUT'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-semibold">
                                                    {log.type === 'in' ? '+' : '-'}{log.quantity}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {format(new Date(log.created_at), 'PPP p')}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                                No logs found.
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
