import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { getTrackingData } from '@/lib/getTrackingData';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { Box, CheckCircle, Clock, Edit2, Eye, MapPin, Printer, Truck } from 'lucide-react';
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
        shippind_address?:
            | {
                  street?: string;
                  postal_code?: string;
                  phone?: string;
              }
            | string
            | null;
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
    const [isShow, setIsShow] = useState(false);
    const [errorTracking, setErrorTracking] = useState('');
    const [trackingData, setTrackingData] = useState(null);

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
                return (
                    <Badge variant="outline" className="border-yellow-200 bg-yellow-50 font-medium text-yellow-700">
                        Pending
                    </Badge>
                );
            case 'progress':
            case 'sent_to_courier':
                return (
                    <Badge variant="outline" className="border-blue-200 bg-blue-50 font-medium text-blue-700">
                        In Progress
                    </Badge>
                );
            case 'packaging':
                return (
                    <Badge variant="outline" className="border-purple-200 bg-purple-50 font-medium text-purple-700">
                        Packaging
                    </Badge>
                );
            case 'completed':
                return (
                    <Badge variant="outline" className="border-green-200 bg-green-50 font-medium text-green-700">
                        Completed
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="font-medium">
                        {status}
                    </Badge>
                );
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

    const showTrackingExternal = async (tracking_number: string, courier: string) => {
        setIsShow(true);
        const apiKey = import.meta.env.VITE_BINDER_BYTE_API_KEY;

        if (!tracking_number) {
            setErrorTracking('No Tracking Number');
            return;
        }

        if (!courier) {
            setErrorTracking('No Courier');
            return;
        }

        try {
            const response = await getTrackingData(tracking_number, courier);
            setTrackingData(response);
        } catch (error) {
            console.error('error fetching api', error);
            if (error instanceof Error) {
                setErrorTracking(error.message);
            } else {
                setErrorTracking('error while fetching api');
            }
            return;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Shipments" />
            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
                {/* Stats Summary */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((card) => (
                        <Card
                            key={card.title}
                            className="border-sidebar-border/70 hover:border-sidebar-border overflow-hidden shadow-sm transition-colors"
                        >
                            <CardContent className="flex items-center gap-4 p-6">
                                <div className={`rounded-xl ${card.bg} p-3`}>
                                    <card.icon className={`h-6 w-6 ${card.color}`} />
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">{card.title}</p>
                                    <h3 className="mt-1 text-2xl font-bold">{card.count}</h3>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Shipment Table */}
                <Card className="border-sidebar-border/70 overflow-hidden bg-transparent shadow-sm">
                    <CardHeader className="bg-muted/30 border-sidebar-border/70 border-b">
                        <CardTitle className="font-headline text-lg">Order Shipments</CardTitle>
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
                                                        <span className="text-primary font-semibold">{shipment.order?.user?.name || 'Unknown'}</span>
                                                        {shipment.order?.shippind_address && (
                                                            <div className="text-muted-foreground mt-1 max-w-[200px] text-xs">
                                                                <p className="truncate" title={shipment.order.shippind_address.street}>
                                                                    {shipment.order.shippind_address.street}
                                                                </p>
                                                                <p>Postal: {shipment.order.shippind_address.postal_code}</p>
                                                                <p>Phone: {shipment.order.shippind_address.phone}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        {shipment.order?.payment?.status === 'success' ? (
                                                            <Badge className="border-green-500/20 bg-green-500/10 text-green-600 hover:bg-green-500/20">
                                                                Success
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="border-yellow-500/20 text-yellow-600">
                                                                Pending
                                                            </Badge>
                                                        )}
                                                        <span className="text-muted-foreground text-[10px] tracking-widest uppercase">
                                                            {shipment.order?.payment?.method || 'N/A'}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-sm font-medium">{shipment.courier || '-'}</span>
                                                        <span className="text-muted-foreground font-mono text-xs">
                                                            {shipment.tracking_number || 'No tracking'}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {shipment.tracking_details ? (
                                                        <div className="flex flex-col gap-1">
                                                            <div className="text-secondary flex items-center gap-2 text-xs font-semibold">
                                                                <Truck className="h-3 w-3" />
                                                                {shipment.tracking_details.status}
                                                            </div>
                                                            <div className="text-muted-foreground flex items-center gap-1 text-[10px]">
                                                                <MapPin className="h-2.5 w-2.5" />
                                                                {shipment.tracking_details.position}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs italic">N/A</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                                                <TableCell className="text-muted-foreground text-xs">
                                                    {format(new Date(shipment.created_at), 'MMM d, yyyy')}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handlePrint(shipment)}
                                                            className="hover:bg-primary h-8 w-8 transition-colors hover:text-white"
                                                            title="Print Shipping Label"
                                                        >
                                                            <Printer className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleEdit(shipment)}
                                                            className="hover:bg-secondary h-8 w-8 transition-colors hover:text-white"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            // onClick={() => showTrackingExternal(shipment.tracking_number, shipment.courier)}
                                                            onClick={() =>
                                                                showTrackingExternal(shipment.tracking_number, shipment.courier?.toLocaleLowerCase())
                                                            }
                                                            className="hover:bg-secondary h-8 w-8 transition-colors hover:text-white"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-muted-foreground h-24 text-center">
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

            <Dialog
                open={isShow}
                onOpenChange={(open) => {
                    setIsShow(open);

                    if (!open) {
                        setTrackingData(null);
                        setErrorTracking('');
                    }
                }}
            >
                <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Tracking Details</DialogTitle>
                    </DialogHeader>

                    {errorTracking && <div className="rounded-md bg-red-100 p-3 text-red-600">{errorTracking}</div>}

                    {trackingData?.data && (
                        <div className="space-y-6">
                            {/* SUMMARY */}
                            <div className="space-y-2 rounded-lg border p-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold">Shipment Summary</h2>
                                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                                        {trackingData?.data?.summary?.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <p>
                                        <span className="font-medium">AWB:</span> {trackingData?.data?.summary?.awb}
                                    </p>
                                    <p>
                                        <span className="font-medium">Courier:</span> {trackingData?.data?.summary?.courier}
                                    </p>
                                    <p>
                                        <span className="font-medium">Service:</span> {trackingData?.data?.summary?.service}
                                    </p>
                                    <p>
                                        <span className="font-medium">Weight:</span> {trackingData?.data?.summary?.weight}
                                    </p>
                                    <p>
                                        <span className="font-medium">Amount:</span> Rp {trackingData?.data?.summary?.amount}
                                    </p>
                                    <p>
                                        <span className="font-medium">Date:</span> {trackingData?.data?.summary?.date}
                                    </p>
                                </div>
                            </div>

                            {/* DETAIL */}
                            <div className="space-y-3 rounded-lg border p-4">
                                <h2 className="text-lg font-semibold">Shipment Detail</h2>

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <p>
                                        <span className="font-medium">Origin:</span> {trackingData?.data?.detail?.origin}
                                    </p>
                                    <p>
                                        <span className="font-medium">Destination:</span> {trackingData?.data?.detail?.destination}
                                    </p>
                                    <p>
                                        <span className="font-medium">Shipper:</span> {trackingData?.data?.detail?.shipper}
                                    </p>
                                    <p>
                                        <span className="font-medium">Receiver:</span> {trackingData?.data?.detail?.receiver}
                                    </p>
                                </div>
                            </div>

                            {/* HISTORY */}
                            <div className="rounded-lg border p-4">
                                <h2 className="mb-4 text-lg font-semibold">Tracking History</h2>

                                <div className="space-y-4">
                                    {trackingData?.data?.history?.map((item: any, index: number) => (
                                        <div key={index} className="relative flex gap-3 border-l-2 pl-4">
                                            <div className="absolute top-1 -left-[7px] h-3 w-3 rounded-full bg-blue-500"></div>

                                            <div>
                                                <p className="text-sm text-gray-500">{item.date}</p>
                                                <p className="font-medium">{item.desc}</p>
                                                {item.location && <p className="text-sm text-gray-500">{item.location}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="border-sidebar-border shadow-2xl sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="font-headline text-xl">Update Shipment</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="status" className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                                Status
                            </Label>
                            <Select value={data.status} onValueChange={(value) => setData('status', value)}>
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
                            <Label htmlFor="courier" className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                                Courier Name
                            </Label>
                            <Input
                                id="courier"
                                value={data.courier}
                                onChange={(e) => setData('courier', e.target.value.toLocaleLowerCase())}
                                placeholder="e.g. JNE, FedEx, DHL"
                                className="bg-muted/10 border-sidebar-border"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tracking_number" className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                                Tracking Number
                            </Label>
                            <div className="relative">
                                <Input
                                    id="tracking_number"
                                    value={data.tracking_number}
                                    onChange={(e) => setData('tracking_number', e.target.value)}
                                    placeholder="Enter tracking number"
                                    className="bg-muted/10 border-sidebar-border pr-10 font-mono"
                                />
                                {data.tracking_number && (
                                    <div className="absolute top-1/2 right-3 -translate-y-1/2">
                                        <Truck className="text-secondary h-4 w-4 opacity-50" />
                                    </div>
                                )}
                            </div>
                            <p className="text-muted-foreground mt-1 text-[10px] italic">Integrating with external API for real-time tracking.</p>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={processing}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-secondary hover:bg-secondary/90 text-white" disabled={processing}>
                                {processing ? 'Updating...' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
