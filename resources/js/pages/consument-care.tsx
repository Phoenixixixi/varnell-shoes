import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { MessageCircle, Mail, User, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Consument Care', href: '/admin/consument-care' },
];

interface ConsumentCareItem {
    id: number;
    user_id: number | null;
    name: string;
    email: string;
    messages: string;
    created_at: string;
    updated_at: string;
    user: { name: string; email: string } | null;
}

interface PaginatedConsument {
    data: ConsumentCareItem[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
    from: number;
    to: number;
}

interface Props {
    consument: PaginatedConsument;
}

function toLocal(utcString: string) {
    const s = utcString.endsWith('Z') ? utcString : utcString + 'Z';
    return format(new Date(s), 'dd MMM yyyy, HH:mm');
}

export default function ConsumentCarePage({ consument }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Consument Care" />

            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                            <MessageCircle className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Consument Care</h1>
                            <p className="text-xs text-muted-foreground">Customer messages & inquiries</p>
                        </div>
                    </div>
                    <Badge variant="outline" className="text-sm">
                        {consument.total} total
                    </Badge>
                </div>

                {/* Table card */}
                <Card className="border-sidebar-border/70 bg-transparent shadow-none dark:border-sidebar-border">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-base">Messages</CardTitle>
                        <span className="text-xs text-muted-foreground">
                            {consument.from}–{consument.to} of {consument.total}
                        </span>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-10 pl-6">#</TableHead>
                                        <TableHead>
                                            <div className="flex items-center gap-1">
                                                <User className="h-3.5 w-3.5" /> Name
                                            </div>
                                        </TableHead>
                                        <TableHead>
                                            <div className="flex items-center gap-1">
                                                <Mail className="h-3.5 w-3.5" /> Email
                                            </div>
                                        </TableHead>
                                        <TableHead>Message</TableHead>
                                        <TableHead>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" /> Submitted
                                            </div>
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {consument.data.length > 0 ? (
                                        consument.data.map((item, idx) => (
                                            <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                                                <TableCell className="pl-6 text-xs text-muted-foreground">
                                                    {consument.from + idx}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{item.name}</span>
                                                        {item.user && item.user.name !== item.name && (
                                                            <span className="text-[11px] text-muted-foreground">
                                                                (account: {item.user.name})
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    <a
                                                        href={`mailto:${item.email}`}
                                                        className="hover:text-primary hover:underline transition-colors"
                                                    >
                                                        {item.email}
                                                    </a>
                                                </TableCell>
                                                <TableCell className="max-w-[340px]">
                                                    <p
                                                        className="line-clamp-2 text-sm text-foreground"
                                                        title={item.messages}
                                                    >
                                                        {item.messages}
                                                    </p>
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                                                    {toLocal(item.created_at)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                                                <MessageCircle className="mx-auto mb-2 h-8 w-8 opacity-20" />
                                                No messages yet.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {consument.last_page > 1 && (
                            <div className="flex items-center justify-between border-t px-6 py-4">
                                <p className="text-xs text-muted-foreground">
                                    Page {consument.current_page} of {consument.last_page}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {consument.links.map((link, idx) => {
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
        </AppLayout>
    );
}
