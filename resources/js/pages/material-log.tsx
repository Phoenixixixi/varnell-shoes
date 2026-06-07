import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Material Logs',
        href: '/admin/material-logs',
    },
];

interface MaterialLog {
    id: number;
    material_id: number;
    material_name: string;
    user_id: number;
    type: 'in' | 'out' | 'adjustment';
    quantity: number;
    description: string;
    created_at: string;
    material: {
        name: string;
    };
    user: {
        name: string;
    };
}

interface Props {
    logs: MaterialLog[];
}

export default function MaterialLogs({ logs }: Props) {
    const colorBadge = (type: string) => {
        if (type === 'in') {
            return 'bg-green-500 hover:bg-green-600'
        }
        if (type === 'out') {
            return 'bg-red-500 hover:bg-red-600'
        }
        return 'bg-yellow-500 hover:bg-yellow-600'
    }
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Material Logs" />
            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
                <Card className="border-sidebar-border/70 bg-transparent shadow-none dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>Export Material Logs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const form = e.currentTarget;
                                const startDate = (form.elements.namedItem('startDate') as HTMLInputElement).value;
                                const endDate = (form.elements.namedItem('endDate') as HTMLInputElement).value;
                                if (!startDate || !endDate) return;
                                window.open(route('admin.material.logs.export', { start_date: startDate, end_date: endDate }), '_blank');
                            }}
                            className="flex flex-col gap-4 sm:flex-row sm:items-end"
                        >
                            <div className="flex-1">
                                <label htmlFor="startDate" className="block text-sm font-medium text-foreground mb-1">Start Date</label>
                                <Input id="startDate" name="startDate" type="date" required />
                            </div>
                            <div className="flex-1">
                                <label htmlFor="endDate" className="block text-sm font-medium text-foreground mb-1">End Date</label>
                                <Input id="endDate" name="endDate" type="date" required />
                            </div>
                            <Button type="submit" variant="outline" className="w-full sm:w-auto h-9">
                                Export Logs
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="border-sidebar-border/70 bg-transparent shadow-none dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>Material Usage History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Material</TableHead>
                                        <TableHead>Action By</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Notes</TableHead>
                                        <TableHead>Date &amp; Time</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.length > 0 ? (
                                        logs.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell className="font-medium">{log.material_name || 'Unknown Material'}</TableCell>
                                                <TableCell>{log.user?.name || 'System'}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={log.type === 'in' ? 'default' : 'destructive'}
                                                        className={`${colorBadge(log.type)} w-full text-white`}
                                                    >
                                                        {log.type.toUpperCase()}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-semibold">
                                                    {log.type === 'in' ? '+' : '-'}{log.quantity}
                                                </TableCell>
                                                <TableCell
                                                    className="max-w-[200px] truncate text-xs text-muted-foreground"
                                                    title={log.description || ''}
                                                >
                                                    {log.description || '-'}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-xs">
                                                    {format(new Date(log.created_at), 'PPP p')}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-muted-foreground">
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