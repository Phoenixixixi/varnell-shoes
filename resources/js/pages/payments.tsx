import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, Printer, TrendingUp, Clock, CheckCircle, RefreshCw, Smartphone, Building2, QrCode, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

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
        // Doku-sourced fields resolved on page load
        doku_status?: string;
        doku_method?: string;
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

    console.log(orders)

    const handlePrint = (order: Order) => {
        setPrintingOrder(order);
        setTimeout(() => {
            window.print();
            setPrintingOrder(null);
        }, 100);
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

    /**
     * Map Doku raw paymentChannel codes to human-readable labels + icons.
     * Doku Non-SNAP returns values like: QRIS, VIRTUAL_ACCOUNT_BCA, CREDIT_CARD, etc.
     */
    const DOKU_METHOD_MAP: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
        // QRIS
        QRIS: { label: 'QRIS', icon: <QrCode className="w-3.5 h-3.5" />, color: 'text-purple-500' },
        // BCA
        VIRTUAL_ACCOUNT_BCA: { label: 'BCA Virtual Account', icon: <Building2 className="w-3.5 h-3.5" />, color: 'text-blue-500' },
        // Mandiri
        VIRTUAL_ACCOUNT_MANDIRI: { label: 'Mandiri Virtual Account', icon: <Building2 className="w-3.5 h-3.5" />, color: 'text-yellow-600' },
        // BNI
        VIRTUAL_ACCOUNT_BNI: { label: 'BNI Virtual Account', icon: <Building2 className="w-3.5 h-3.5" />, color: 'text-orange-500' },
        // BRI
        VIRTUAL_ACCOUNT_BRI: { label: 'BRI Virtual Account', icon: <Building2 className="w-3.5 h-3.5" />, color: 'text-sky-500' },
        // Permata
        VIRTUAL_ACCOUNT_PERMATA: { label: 'Permata Virtual Account', icon: <Building2 className="w-3.5 h-3.5" />, color: 'text-teal-500' },
        // CIMB
        VIRTUAL_ACCOUNT_CIMB: { label: 'CIMB Virtual Account', icon: <Building2 className="w-3.5 h-3.5" />, color: 'text-red-500' },
        // Danamon
        VIRTUAL_ACCOUNT_DANAMON: { label: 'Danamon Virtual Account', icon: <Building2 className="w-3.5 h-3.5" />, color: 'text-rose-500' },
        // Credit Card
        CREDIT_CARD: { label: 'Credit Card', icon: <CreditCard className="w-3.5 h-3.5" />, color: 'text-indigo-500' },
        // GoPay / Wallet
        GOPAY: { label: 'GoPay', icon: <Wallet className="w-3.5 h-3.5" />, color: 'text-green-500' },
        OVO: { label: 'OVO', icon: <Wallet className="w-3.5 h-3.5" />, color: 'text-purple-600' },
        DANA: { label: 'DANA', icon: <Wallet className="w-3.5 h-3.5" />, color: 'text-blue-600' },
        LINKAJA: { label: 'LinkAja', icon: <Wallet className="w-3.5 h-3.5" />, color: 'text-red-600' },
        SHOPEEPAY: { label: 'ShopeePay', icon: <Wallet className="w-3.5 h-3.5" />, color: 'text-orange-600' },
        // Convenience Store
        CONVENIENCE_STORE_ALFAMART: { label: 'Alfamart', icon: <Smartphone className="w-3.5 h-3.5" />, color: 'text-red-500' },
        CONVENIENCE_STORE_INDOMARET: { label: 'Indomaret', icon: <Smartphone className="w-3.5 h-3.5" />, color: 'text-red-400' },
    };

    const formatDokuMethod = (raw?: string): { label: string; icon: React.ReactNode; color: string } => {
        if (!raw) return { label: '—', icon: <CreditCard className="w-3.5 h-3.5" />, color: 'text-muted-foreground' };
        const key = raw.toUpperCase().replace(/-/g, '_');
        if (DOKU_METHOD_MAP[key]) return DOKU_METHOD_MAP[key];
        // Fallback: prettify the raw string
        const pretty = raw.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        return { label: pretty, icon: <CreditCard className="w-3.5 h-3.5" />, color: 'text-muted-foreground' };
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payments Management" />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8 print:hidden">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-headline text-primary">Financial Overview</h2>
                        <p className="text-xs text-muted-foreground mt-1">
                            Payment statuses are synced from Doku automatically on page load.
                        </p>
                    </div>
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
                        <CardTitle className="text-lg font-headline">Transaction Records</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/20">
                                        <TableHead className="font-bold">Order Details</TableHead>
                                        <TableHead className="font-bold">Customer</TableHead>
                                        <TableHead className="font-bold">Amount</TableHead>
                                        <TableHead className="font-bold">Method (Doku)</TableHead>
                                        <TableHead className="font-bold">Status (Doku)</TableHead>
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
                                                        {order.payment?.midtrans_order_id || 'Doku ID Pending'}
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
                                                        {(order.payment?.doku_method || order.payment?.method || order.payment?.payment_type)?.replace(/_/g, ' ') || '—'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1.5">
                                                    <Badge
                                                        variant={getStatusVariant(order.payment?.doku_status || order.payment?.status || order.status)}
                                                        className="w-fit text-[10px] py-0 px-2 font-bold uppercase"
                                                    >
                                                        {order.payment?.doku_status || order.payment?.status || order.status}
                                                    </Badge>
                                                    {order.payment?.transaction_status && (
                                                        <div className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground uppercase">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${order.payment.transaction_status === 'settlement' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                                            {order.payment.transaction_status}
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
                                                            title="Sync from Doku"
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

            {/* Printable Invoice */}
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
                                <p>{(printingOrder.payment?.doku_method || printingOrder.payment?.payment_type)?.toUpperCase() || 'N/A'}</p>
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
