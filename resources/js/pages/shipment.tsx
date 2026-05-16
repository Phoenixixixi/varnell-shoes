import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Truck, Box, CheckCircle, Edit2, MapPin, ExternalLink, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Shipments',
        href: '/admin/shipment',
    },
];

interface TrackingDetails {
    status: string;
    position: string;
    last_updated: string;
    history: {
        time: string;
        location: string;
        description: string;
    }[];
}

interface Shipment {
    id: number;
    order_id: number;
    courier: string | null;
    tracking_number: string | null;
    status: 'pending' | 'progress' | 'packaging' | 'completed' | 'sent_to_courier';
    created_at: string;
    tracking_details?: TrackingDetails;
    order: {
        id: number;
        shippind_address?: {
            street?: string;
            postal_code?: string;
            phone?: string;
        } | string | null;
        user: {
            name: string;
        };
        payment?: {
            status: string;
            method: string;
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
    const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data, setData, patch, processing, reset } = useForm({
        status: '',
        courier: '',
        tracking_number: '',
    });

    const handlePrint = (shipment: Shipment) => {
        const address = shipment.order?.shippind_address;
        const customerName = shipment.order?.user?.name || 'Customer';
        const orderId = shipment.order_id;
        
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const street = typeof address === 'object' ? address?.street : address;
        const phone = typeof address === 'object' ? address?.phone : '';
        const postal = typeof address === 'object' ? address?.postal_code : '';

        printWindow.document.write(`
            <html>
                <head>
                    <title>Shipping Label - #${orderId}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
                        body { font-family: 'Inter', sans-serif; padding: 20px; color: #000; background: #fff; }
                        .label-card { 
                            border: 3px solid #000; 
                            padding: 40px; 
                            width: 100%;
                            max-width: 550px; 
                            margin: 0 auto;
                            box-sizing: border-box;
                        }
                        .header { border-bottom: 3px solid #000; padding-bottom: 20px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
                        .header h1 { margin: 0; font-size: 32px; font-weight: 800; text-transform: uppercase; letter-spacing: 4px; }
                        .order-id { font-weight: bold; font-size: 20px; background: #000; color: #fff; padding: 5px 15px; }
                        .section { margin-bottom: 25px; }
                        .label { font-size: 11px; text-transform: uppercase; color: #000; margin-bottom: 8px; font-weight: 800; border-bottom: 1px solid #eee; display: inline-block; }
                        .content { font-size: 20px; line-height: 1.4; font-weight: 500; }
                        .phone { margin-top: 10px; font-size: 24px; font-weight: 800; border: 2px solid #000; display: inline-block; padding: 5px 15px; }
                        .footer { margin-top: 40px; font-size: 11px; text-align: center; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; }
                        @media print {
                            body { padding: 0; }
                            .label-card { border: 3px solid #000; box-shadow: none; width: 100%; max-width: none; height: auto; }
                            @page { margin: 1cm; }
                        }
                    </style>
                </head>
                <body>
                    <div class="label-card">
                        <div class="header">
                            <h1>VARNELL</h1>
                            <div class="order-id">#${orderId}</div>
                        </div>
                        
                        <div class="section">
                            <div class="label">Recipient / Penerima:</div>
                            <div class="content"><strong>${customerName}</strong></div>
                        </div>

                        <div class="section">
                            <div class="label">Shipping Address / Alamat:</div>
                            <div class="content">
                                ${street}<br>
                                <strong>POSTAL: ${postal || '-'}</strong>
                            </div>
                        </div>

                        <div class="section">
                            <div class="label">Phone / No. Telepon:</div>
                            <br>
                            <div class="phone">${phone || '-'}</div>
                        </div>

                        <div class="footer">
                            Varnell Collection - Premium Craftsmanship
                        </div>
                    </div>
                    <script>
                        window.onload = function() {
                            window.print();
                            setTimeout(() => { window.close(); }, 500);
                        }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const statCards = [
        { title: 'Pending', count: stats.pending, icon: Clock, color: 'text-yellow-500', bg: 'bg-gray-900/30' },
        { title: 'In Progress', count: stats.progress, icon: Truck, color: 'text-blue-500', bg: 'bg-gray-900/30' },
        { title: 'Packaging', count: stats.packaging, icon: Box, color: 'text-purple-500', bg: 'bg-gray-900/30' },
        { title: 'Completed', count: stats.completed, icon: CheckCircle, color: 'text-green-500', bg: 'bg-gray-900/30' },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="border-yellow-200 bg-yellow-50 text-yellow-700 font-medium">Pending</Badge>;
            case 'progress':
            case 'sent_to_courier':
                return <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 font-medium">In Progress</Badge>;
            case 'packaging':
                return <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700 font-medium">Packaging</Badge>;
            case 'completed':
                return <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 font-medium">Completed</Badge>;
            default:
                return <Badge variant="outline" className="font-medium">{status}</Badge>;
        }
    };

    const handleEdit = (shipment: Shipment) => {
        setEditingShipment(shipment);
        setData({
            status: shipment.status,
            courier: shipment.courier || '',
            tracking_number: shipment.tracking_number || '',
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingShipment) return;

        patch(route('admin.shipment.update', editingShipment.id), {
            onSuccess: () => {
                setIsDialogOpen(false);
                reset();
                setEditingShipment(null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Shipments" />
            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
                {/* Stats Summary */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((card) => (
                        <Card key={card.title} className="border-sidebar-border/70 shadow-sm overflow-hidden hover:border-sidebar-border transition-colors">
                            <CardContent className="flex items-center gap-4 p-6">
                                <div className={`rounded-xl ${card.bg} p-3`}>
                                    <card.icon className={`h-6 w-6 ${card.color}`} />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{card.title}</p>
                                    <h3 className="text-2xl font-bold mt-1">{card.count}</h3>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Shipment Table */}
                <Card className="border-sidebar-border/70 bg-transparent shadow-sm overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b border-sidebar-border/70">
                        <CardTitle className="text-lg font-headline">Order Shipments</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/20">
                                        <TableHead className="font-bold">Order ID</TableHead>
                                        <TableHead className="font-bold">Customer</TableHead>
                                        <TableHead className="font-bold">Payment</TableHead>
                                        <TableHead className="font-bold">Courier & Tracking</TableHead>
                                        <TableHead className="font-bold">Live Status</TableHead>
                                        <TableHead className="font-bold">Status</TableHead>
                                        <TableHead className="font-bold">Date</TableHead>
                                        <TableHead className="text-right font-bold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {shipments.length > 0 ? (
                                        shipments.map((shipment) => (
                                            <TableRow key={shipment.id} className="hover:bg-muted/10 transition-colors">
                                                <TableCell className="font-medium">#{shipment.order_id}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-semibold text-primary">{shipment.order?.user?.name || 'Unknown'}</span>
                                                        {shipment.order?.shippind_address && (
                                                            <div className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                                                                <p className="truncate" title={shipment.order.shippind_address.street}>{shipment.order.shippind_address.street}</p>
                                                                <p>Postal: {shipment.order.shippind_address.postal_code}</p>
                                                                <p>Phone: {shipment.order.shippind_address.phone}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        {shipment.order?.payment?.status === 'success' ? (
                                                            <Badge className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20">Success</Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-yellow-600 border-yellow-500/20">Pending</Badge>
                                                        )}
                                                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{shipment.order?.payment?.method || 'N/A'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-sm font-medium">{shipment.courier || '-'}</span>
                                                        <span className="font-mono text-xs text-muted-foreground">{shipment.tracking_number || 'No tracking'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {shipment.tracking_details ? (
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-2 text-xs font-semibold text-secondary">
                                                                <Truck className="h-3 w-3" />
                                                                {shipment.tracking_details.status}
                                                            </div>
                                                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                                <MapPin className="h-2.5 w-2.5" />
                                                                {shipment.tracking_details.position}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground italic">N/A</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {format(new Date(shipment.created_at), 'MMM d, yyyy')}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon" onClick={() => handlePrint(shipment)} className="h-8 w-8 hover:bg-primary hover:text-white transition-colors" title="Print Shipping Label">
                                                            <Printer className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(shipment)} className="h-8 w-8 hover:bg-secondary hover:text-white transition-colors">
                                                            <Edit2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
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

            {/* Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px] border-sidebar-border shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="font-headline text-xl">Update Shipment</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="status" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</Label>
                            <Select
                                value={data.status}
                                onValueChange={(value) => setData('status', value)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="packaging">Packaging</SelectItem>
                                    <SelectItem value="sent_to_courier">Sent to Courier</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="courier" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Courier Name</Label>
                            <Input
                                id="courier"
                                value={data.courier}
                                onChange={(e) => setData('courier', e.target.value)}
                                placeholder="e.g. JNE, FedEx, DHL"
                                className="bg-muted/10 border-sidebar-border"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tracking_number" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tracking Number</Label>
                            <div className="relative">
                                <Input
                                    id="tracking_number"
                                    value={data.tracking_number}
                                    onChange={(e) => setData('tracking_number', e.target.value)}
                                    placeholder="Enter tracking number"
                                    className="bg-muted/10 border-sidebar-border font-mono pr-10"
                                />
                                {data.tracking_number && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <Truck className="h-4 w-4 text-secondary opacity-50" />
                                    </div>
                                )}
                            </div>
                            <p className="text-[10px] text-muted-foreground italic mt-1">
                                Integrating with external API for real-time tracking.
                            </p>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={processing}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-secondary text-white hover:bg-secondary/90" disabled={processing}>
                                {processing ? 'Updating...' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
