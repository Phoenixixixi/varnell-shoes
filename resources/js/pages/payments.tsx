import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, Printer, TrendingUp, Clock, CheckCircle } from 'lucide-react';
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
    shippind_address: {
        address: string;
        city: string;
        postal_code: string;
        phone: string;
    } | any;
    created_at: string;
    user: {
        name: string;
        email: string;
    };
    payment?: {
        payment_type: string;
        transaction_status: string;
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

    const handlePrint = (order: Order) => {
        setPrintingOrder(order);
        // Wait for state to update and then print
        setTimeout(() => {
            window.print();
            setPrintingOrder(null);
        }, 100);
    };

    const getStatusVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
            case 'settlement':
                return 'default';
            case 'pending':
                return 'outline';
            case 'canceled':
            case 'deny':
            case 'expire':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payments Management" />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8 print:hidden">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Card className="border-sidebar-border/70 shadow-none">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-lg bg-gray-900/30 p-3">
                                <TrendingUp className="h-6 w-6 text-green-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                                <h3 className="text-2xl font-bold">${Number(stats.total_revenue).toLocaleString()}</h3>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-sidebar-border/70 shadow-none">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-lg bg-yay-900/30 p-3">
                                <Clock className="h-6 w-6 text-yellow-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Pending Payments</p>
                                <h3 className="text-2xl font-bold">{stats.pending_payments}</h3>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-sidebar-border/70 shadow-none">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-lg bgay-900/30 p-3">
                                <CheckCircle className="h-6 w-6 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                                <h3 className="text-2xl font-bold">{stats.total_orders}</h3>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Orders Table */}
                <Card className="border-sidebar-border/70 bg-transparent shadow-none">
                    <CardHeader>
                        <CardTitle>Transactions & Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Address</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">#{order.id}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">{order.user?.name}</span>
                                                    <span className="text-xs text-muted-foreground">{order.user?.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>${Number(order.total_price).toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusVariant(order.status)}>
                                                    {order.status.toUpperCase()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-[200px] truncate text-xs text-muted-foreground" title={typeof order.shippind_address === 'string' ? order.shippind_address : JSON.stringify(order.shippind_address)}>
                                                    {typeof order.shippind_address === 'object'
                                                        ? `${order.shippind_address.address}, ${order.shippind_address.city}`
                                                        : order.shippind_address || '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handlePrint(order)}
                                                    className="h-8 gap-1"
                                                >
                                                    <Printer className="h-3.5 w-3.5" />
                                                    Print Letter
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Printable Sending Letter Component */}
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
                                    {typeof printingOrder.shippind_address === 'object' ? (
                                        <>
                                            <p>{printingOrder.shippind_address.address}</p>
                                            <p>{printingOrder.shippind_address.city}, {printingOrder.shippind_address.postal_code}</p>
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
                                <p className="text-lg font-bold">${Number(printingOrder.total_price).toLocaleString()}</p>
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
                                            <td className="border border-black p-2 text-right text-sm">${Number(item.price).toLocaleString()}</td>
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
