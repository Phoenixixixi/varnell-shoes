import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileSpreadsheet, Edit, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Material Logs', href: '/admin/material-logs' },
];

interface MaterialLog {
    id: number;
    material_id: number;
    material_name: string;
    user_id: number;
    type: 'in' | 'out' | 'adjustment' | 'delete';
    quantity: number;
    description: string;
    updated_at: string;
    material: { name: string } | null;
    user: { name: string } | null;
}

interface PaginatedLogs {
    data: MaterialLog[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
    from: number;
    to: number;
}

interface Props {
    logs: PaginatedLogs;
}

function colorBadge(type: string) {
    if (type === 'in')         return 'bg-green-500 hover:bg-green-600';
    if (type === 'out')        return 'bg-red-500 hover:bg-red-600';
    if (type === 'delete')     return 'bg-gray-500 hover:bg-gray-600';
    return 'bg-yellow-500 hover:bg-yellow-600';
}

function toLocal(utcString: string) {
    const s = utcString.endsWith('Z') ? utcString : utcString + 'Z';
    return format(new Date(s), 'dd MMM yyyy, HH:mm');
}

export default function MaterialLogs({ logs }: Props) {
    const { auth } = usePage<any>().props;
    const isSuperadmin = auth?.user?.role === 'superadmin';

    const startRef = useRef<HTMLInputElement>(null);
    const endRef   = useRef<HTMLInputElement>(null);
    const [exporting, setExporting] = useState(false);

    // Superadmin actions state
    const [editLog, setEditLog] = useState<MaterialLog | null>(null);
    const [deleteLog, setDeleteLog] = useState<MaterialLog | null>(null);

    const { data: editData, setData: setEditData, put, processing: editProcessing } = useForm({
        log_date: ''
    });

    const openEdit = (log: MaterialLog) => {
        setEditLog(log);
        setEditData('log_date', format(new Date(log.updated_at), 'yyyy-MM-dd'));
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editLog) return;
        put(route('admin.material.logs.update', editLog.id), {
            onSuccess: () => setEditLog(null),
        });
    };

    const handleDelete = () => {
        if (!deleteLog) return;
        router.delete(route('admin.material.logs.destroy', deleteLog.id), {
            onSuccess: () => setDeleteLog(null),
        });
    };

    const handleExport = (e: React.FormEvent) => {
        e.preventDefault();
        const startDate = startRef.current?.value;
        const endDate   = endRef.current?.value;
        if (!startDate || !endDate) return;

        setExporting(true);
        const url = route('admin.material.logs.export', { start_date: startDate, end_date: endDate });

        // Use a hidden anchor so we can detect when the download starts
        const a = document.createElement('a');
        a.href = url;
        a.download = '';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Re-enable button after a short delay (download has started)
        setTimeout(() => setExporting(false), 2000);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Material Logs" />
            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">

                {/* Export card */}
                <Card className="border-sidebar-border/70 bg-transparent shadow-none dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
                            Export to Excel
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleExport} className="flex flex-col gap-4 sm:flex-row sm:items-end">
                            <div className="flex-1">
                                <label htmlFor="startDate" className="mb-1 block text-sm font-medium text-foreground">
                                    Start Date
                                </label>
                                <Input ref={startRef} id="startDate" name="startDate" type="date" required />
                            </div>
                            <div className="flex-1">
                                <label htmlFor="endDate" className="mb-1 block text-sm font-medium text-foreground">
                                    End Date
                                </label>
                                <Input ref={endRef} id="endDate" name="endDate" type="date" required />
                            </div>
                            <Button
                                type="submit"
                                disabled={exporting}
                                className="h-9 w-full gap-2 bg-emerald-600 text-white hover:bg-emerald-700 sm:w-auto"
                            >
                                <FileSpreadsheet className="h-4 w-4" />
                                {exporting ? 'Downloading…' : 'Export Excel'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Logs table */}
                <Card className="border-sidebar-border/70 bg-transparent shadow-none dark:border-sidebar-border">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Material Usage History</CardTitle>
                        <span className="text-xs text-muted-foreground">
                            {logs.from}–{logs.to} of {logs.total} entries
                        </span>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-8">#</TableHead>
                                        <TableHead>Material</TableHead>
                                        <TableHead>Action By</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Notes</TableHead>
                                        <TableHead>Date &amp; Time</TableHead>
                                        {isSuperadmin && <TableHead className="text-right">Actions</TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.data.length > 0 ? (
                                        logs.data.map((log, idx) => (
                                            <TableRow key={log.id}>
                                                <TableCell className="text-muted-foreground text-xs">
                                                    {logs.from + idx}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {log.material_name || log.material?.name || 'Unknown Material'}
                                                </TableCell>
                                                <TableCell>{log.user?.name || 'System'}</TableCell>
                                                <TableCell>
                                                    <Badge className={`${colorBadge(log.type)} text-white`}>
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
                                                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {toLocal(log.updated_at)}
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
                                            <TableCell colSpan={7} className="text-center text-muted-foreground">
                                                No logs found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {logs.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between border-t pt-4">
                                <p className="text-xs text-muted-foreground">
                                    Page {logs.current_page} of {logs.last_page}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {logs.links.map((link, idx) => {
                                        if (!link.url) {
                                            return (
                                                <span
                                                    key={idx}
                                                    className="cursor-not-allowed rounded-md border border-sidebar-border/50 px-3 py-1.5 text-xs text-muted-foreground/40"
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            );
                                        }
                                        return (
                                            <Link
                                                key={idx}
                                                href={link.url}
                                                preserveScroll
                                                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                                                    link.active
                                                        ? 'border-primary bg-primary text-white'
                                                        : 'border-sidebar-border/70 text-primary hover:bg-muted/20'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}
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
                            Are you sure you want to delete this log entry? This action cannot be undone and will not revert the material stock.
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
