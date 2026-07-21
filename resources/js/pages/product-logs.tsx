import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, useForm, router } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';

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
    description: string;
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
    const { auth } = usePage<any>().props;
    const isSuperadmin = auth?.user?.role === 'superadmin';

    // Superadmin actions state
    const [editLog, setEditLog] = useState<Log | null>(null);
    const [deleteLog, setDeleteLog] = useState<Log | null>(null);

    const { data: editData, setData: setEditData, put, processing: editProcessing } = useForm({
        log_date: ''
    });

    const openEdit = (log: Log) => {
        setEditLog(log);
        setEditData('log_date', format(new Date(log.created_at), 'yyyy-MM-dd'));
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editLog) return;
        put(route('admin.product.logs.update', editLog.id), {
            onSuccess: () => setEditLog(null),
        });
    };

    const handleDelete = () => {
        if (!deleteLog) return;
        router.delete(route('admin.product.logs.destroy', deleteLog.id), {
            onSuccess: () => setDeleteLog(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Product Stock Logs" />
            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
                <Card className="border-sidebar-border/70 bg-transparent shadow-none dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>Export Product Stock Logs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const form = e.currentTarget;
                                const startDate = (form.elements.namedItem('startDate') as HTMLInputElement).value;
                                const endDate = (form.elements.namedItem('endDate') as HTMLInputElement).value;
                                if (!startDate || !endDate) return;
                                window.open(route('admin.product.logs.export', { start_date: startDate, end_date: endDate }), '_blank');
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
                                        <TableHead>Notes</TableHead>
                                        <TableHead>Date & Time</TableHead>
                                        {isSuperadmin && <TableHead className="text-right">Actions</TableHead>}
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
                                                <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground" title={log.description || ''}>
                                                    {log.description || '-'}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-xs">
                                                    {format(new Date(log.created_at), 'PPP p')}
                                                </TableCell>
                                                {isSuperadmin && (
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEdit(log)}>
                                                                <Edit className="h-4 w-4 text-emerald-500" />
                                                            </Button>
                                                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setDeleteLog(log)}>
                                                                <Trash2 className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={isSuperadmin ? 7 : 6} className="text-center text-muted-foreground">
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

            {/* Edit Date Dialog */}
            <Dialog open={!!editLog} onOpenChange={(open) => !open && setEditLog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Log Date</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium">New Date</label>
                            <Input
                                type="date"
                                required
                                value={editData.log_date}
                                onChange={(e) => setEditData('log_date', e.target.value)}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditLog(null)}>Cancel</Button>
                            <Button type="submit" disabled={editProcessing} className="bg-emerald-600 hover:bg-emerald-700 text-white">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteLog} onOpenChange={(open) => !open && setDeleteLog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Log</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this product log entry? This action cannot be undone and will not revert the product stock.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteLog(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete Log</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
