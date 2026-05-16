import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { CreditCard, Printer, TrendingUp, Clock, CheckCircle, RefreshCw, List, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import axios from 'axios';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Payments',
        href: '/admin/payments',
    },
];

interface Order {
    id: number;
    total_price: number;
    status: string;
    shippind_address: any;
    created_at: string;
    user: {
        name: string;
        email: string;
    };
    payment?: {
        id: number;
        payment_type: string;
        transaction_status: string;
        status?: string;
        method?: string;
        midtrans_transaction_id?: string;
    };
    items: Array<{
        id: number;
        price: number;
        quantity: number;
        product: {
            name: string;
        };
    }>;
}

interface MidtransTransaction {
    transaction_id: string;
    order_id: string;
    gross_amount: string;
    payment_type: string;
    transaction_status: string;
    transaction_time: string;
    settlement_time?: string;
}

interface Props {
    orders: Order[];
    stats: {
        total_revenue: number;
        pending_payments: number;
        total_orders: number;
    };
}

export default function PaymentsPage({ orders, stats }: Props) {
    const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
    const [midtransHistory, setMidtransHistory] = useState<MidtransTransaction[]>([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    const handlePrint = (order: Order) => {
        setPrintingOrder(order);
        setTimeout(() => {
            window.print();
            setPrintingOrder(null);
        }, 100);
    };

    const fetchMidtransHistory = async () => {
        setIsLoadingHistory(true);
        setIsHistoryOpen(true);
        try {
            const response = await axios.get(route('admin.payments.history'));
            if (response.data && response.data.transactions) {
                setMidtransHistory(response.data.transactions);
            }
        } catch (error) {
            console.error('Failed to fetch Midtrans history', error);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const handleReconcile = (tx: MidtransTransaction) => {
        router.post(route('admin.payments.reconcile'), {
            transaction_id: tx.transaction_id,
            order_id: tx.order_id
        });
    };

    const getStatusVariant = (status: string) => {
        if (!status) return 'secondary';
        switch (status.toLowerCase()) {
            case 'completed':
            case 'settlement':
            case 'success':
            case 'capture':
                return 'default';
            case 'pending':
                return 'outline';
            case 'canceled':
            case 'deny':
            case 'expire':
            case 'failure':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    const isMatched = (midtransTxId: string) => {
        return orders.some(order => order.payment?.midtrans_transaction_id === midtransTxId);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payments Management" />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8 print:hidden">
                {/* Header Actions */}
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-headline text-primary">Financial Overview</h2>
                    <Button 
                        onClick={fetchMidtransHistory} 
                        className="bg-secondary text-white hover:bg-secondary/90 gap-2"
                    >
                        <ShieldCheck className="w-4 h-4" />
                        Midtrans Reconcile
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Card className="border-sidebar-border/70 shadow-sm overflow-hidden hover:border-sidebar-border transition-colors">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-xl bg-green-500/10 p-3">
                                <TrendingUp className="h-6 w-6 text-green-500" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Revenue</p>
                                <h3 className="text-2xl font-bold mt-1">IDR {Number(stats.total_revenue).toLocaleString('id-ID')}</h3>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-sidebar-border/70 shadow-sm overflow-hidden hover:border-sidebar-border transition-colors">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-xl bg-yellow-500/10 p-3">
                                <Clock className="h-6 w-6 text-yellow-500" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pending Payments</p>
                                <h3 className="text-2xl font-bold mt-1">{stats.pending_payments}</h3>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-sidebar-border/70 shadow-sm overflow-hidden hover:border-sidebar-border transition-colors">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-xl bg-blue-500/10 p-3">
                                <CheckCircle className="h-6 w-6 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Orders</p>
                                <h3 className="text-2xl font-bold mt-1">{stats.total_orders}</h3>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Orders Table */}
                <Card className="border-sidebar-border/70 bg-transparent shadow-sm overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b border-sidebar-border/70">
                        <CardTitle className="text-lg font-headline">Internal Transaction Records</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/20">
                                        <TableHead className="font-bold">Order Details</TableHead>
                                        <TableHead className="font-bold">Customer</TableHead>
                                        <TableHead className="font-bold">Amount</TableHead>
                                        <TableHead className="font-bold">Method</TableHead>
                                        <TableHead className="font-bold">System Status</TableHead>
                                        <TableHead className="text-right font-bold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.map((order) => (
                                        <TableRow key={order.id} className="hover:bg-muted/10 transition-colors">
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-bold">#{order.id}</span>
                                                    <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[120px]" title={order.payment?.midtrans_transaction_id}>
                                                        {order.payment?.midtrans_transaction_id || 'ID Pending'}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {format(new Date(order.created_at), 'MMM d, yyyy HH:mm')}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-primary">{order.user?.name}</span>
                                                    <span className="text-xs text-muted-foreground italic">{order.user?.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-bold">
                                                {Number(order.total_price).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 rounded-md bg-muted/50">
                                                        <CreditCard className="w-3.5 h-3.5 text-secondary" />
                                                    </div>
                                                    <span className="text-xs font-bold uppercase tracking-tight">
                                                        {(order.payment?.method || order.payment?.payment_type)?.replace(/_/g, ' ') || 'TBD'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1.5">
                                                    <Badge variant={getStatusVariant(order.payment?.status || order.status)} className="w-fit text-[10px] py-0 px-2 font-bold uppercase">
                                                        {(order.payment?.status || order.status)}
                                                    </Badge>
                                                    {order.payment?.transaction_status && (
                                                        <div className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground uppercase">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${order.payment.transaction_status === 'settlement' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                                            API: {order.payment.transaction_status}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {order.payment && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => router.post(route('admin.payments.sync', order.payment!.id))}
                                                            className="h-8 w-8 text-muted-foreground hover:bg-secondary hover:text-white transition-colors"
                                                            title="Cloud Sync"
                                                        >
                                                            <RefreshCw className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handlePrint(order)}
                                                        className="h-8 gap-1.5 border-sidebar-border/70 hover:bg-primary hover:text-white"
                                                    >
                                                        <Printer className="h-3.5 w-3.5" />
                                                        Invoice
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Midtrans History Modal */}
            <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-hidden flex flex-col p-0 border-sidebar-border shadow-2xl">
                    <DialogHeader className="p-6 bg-muted/30 border-b border-sidebar-border">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-secondary/10">
                                <List className="w-5 h-5 text-secondary" />
                            </div>
                            <div>
                                <DialogTitle className="font-headline text-xl">Midtrans Cloud Transactions</DialogTitle>
                                <DialogDescription className="text-xs text-muted-foreground mt-1 italic">
                                    Real-time payment history from Midtrans production/sandbox servers.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-0">
                        {isLoadingHistory ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <RefreshCw className="w-10 h-10 text-secondary animate-spin opacity-20" />
                                <p className="text-sm font-label font-bold uppercase tracking-widest text-muted-foreground">Fetching live data...</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader className="bg-muted/10 sticky top-0 z-10">
                                    <TableRow>
                                        <TableHead className="font-bold text-[10px] uppercase">Midtrans Order ID</TableHead>
                                        <TableHead className="font-bold text-[10px] uppercase">Amount</TableHead>
                                        <TableHead className="font-bold text-[10px] uppercase">Type</TableHead>
                                        <TableHead className="font-bold text-[10px] uppercase">Status</TableHead>
                                        <TableHead className="font-bold text-[10px] uppercase">Time</TableHead>
                                        <TableHead className="text-right font-bold text-[10px] uppercase">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {midtransHistory.map((tx) => {
                                        const matched = isMatched(tx.transaction_id);
                                        return (
                                            <TableRow key={tx.transaction_id} className={matched ? 'bg-green-500/5 opacity-60' : 'hover:bg-muted/10'}>
                                                <TableCell className="font-mono text-xs">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold">{tx.order_id}</span>
                                                        <span className="text-[9px] text-muted-foreground truncate max-w-[150px]">{tx.transaction_id}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-bold text-xs">
                                                    IDR {Number(tx.gross_amount).toLocaleString('id-ID')}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-[9px] py-0 font-bold uppercase border-sidebar-border">
                                                        {tx.payment_type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusVariant(tx.transaction_status)} className="text-[9px] py-0 font-bold uppercase">
                                                        {tx.transaction_status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-[10px] text-muted-foreground">
                                                    {format(new Date(tx.transaction_time), 'MMM d, HH:mm')}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {matched ? (
                                                        <div className="flex items-center justify-end gap-1 text-[10px] font-bold text-green-600 uppercase">
                                                            <CheckCircle className="w-3 h-3" />
                                                            Synced
                                                        </div>
                                                    ) : (
                                                        <Button 
                                                            size="sm" 
                                                            variant="secondary"
                                                            className="h-7 text-[10px] font-bold uppercase px-3"
                                                            onClick={() => handleReconcile(tx)}
                                                        >
                                                            Reconcile
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                    
                    <DialogFooter className="p-4 bg-muted/30 border-t border-sidebar-border">
                        <Button variant="outline" onClick={() => setIsHistoryOpen(false)}>Close Registry</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Printable Invoice Logic */}
            {printingOrder && (
                <div className="fixed inset-0 z-[9999] hidden bg-white p-12 print:block">
                    <div className="mx-auto max-w-2xl border-2 border-black p-8">
                        <div className="flex justify-between border-b-2 border-black pb-4">
                            <div>
                                <h1 className="text-2xl font-bold uppercase tracking-widest">Sending Letter</h1>
                                <p className="text-sm font-semibold">VARNELL STORE</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold">Order ID: #{printingOrder.id}</p>
                                <p className="text-sm">{format(new Date(printingOrder.created_at), 'PPP')}</p>
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-2 gap-8">
                            <div>
                                <h2 className="text-xs font-bold uppercase text-gray-500">Shipping To:</h2>
                                <p className="mt-1 font-bold">{printingOrder.user?.name}</p>
                                <div className="mt-1 text-sm leading-relaxed">
                                    {typeof printingOrder.shippind_address === 'object' && printingOrder.shippind_address !== null ? (
                                        <>
                                            <p>{printingOrder.shippind_address.street}</p>
                                            <p>{printingOrder.shippind_address.postal_code}</p>
                                            <p>Phone: {printingOrder.shippind_address.phone}</p>
                                        </>
                                    ) : (
                                        <p>{printingOrder.shippind_address}</p>
                                    )}
                                </div>
                            </div>
                            <div className="text-right text-sm">
                                <p className="font-bold">Payment Method:</p>
                                <p>{printingOrder.payment?.payment_type?.toUpperCase() || 'N/A'}</p>
                                <p className="mt-2 font-bold">Total Price:</p>
                                <p className="text-lg font-bold">IDR {Number(printingOrder.total_price).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="mt-10">
                            <table className="w-full border-collapse border border-black">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border border-black p-2 text-left text-xs uppercase">Item Description</th>
                                        <th className="border border-black p-2 text-center text-xs uppercase">Qty</th>
                                        <th className="border border-black p-2 text-right text-xs uppercase">Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {printingOrder.items?.map((item) => (
                                        <tr key={item.id}>
                                            <td className="border border-black p-2 text-sm">{item.product?.name}</td>
                                            <td className="border border-black p-2 text-center text-sm">{item.quantity}</td>
                                            <td className="border border-black p-2 text-right text-sm">IDR {Number(item.price).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-12 text-center">
                            <p className="text-xs italic text-gray-600">Thank you for shopping with Varnell!</p>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
