import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit2, Trash2 } from 'lucide-react';
import { router } from '@inertiajs/react';

interface ProductTableProps {
    products: any[];
    onEdit: (product: any) => void;
}

export default function ProductTable({ products, onEdit }: ProductTableProps) {
    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this product?')) {
            router.delete(route('admin.product.destroy', id));
        }
    };

    return (
        <Card className="mt-8 border-sidebar-border/70 bg-transparent shadow-none dark:border-sidebar-border">
            <CardHeader>
                <CardTitle>Product Catalog</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative overflow-x-auto rounded-xl border border-sidebar-border/70 bg-transparent dark:border-sidebar-border">
                    <table className="w-full text-left text-sm text-neutral-500 rtl:text-right dark:text-neutral-400">
                        <thead className="bg-neutral-50/50 text-xs uppercase text-neutral-700 dark:bg-neutral-900/50 dark:text-neutral-300">
                            <tr>
                                <th scope="col" className="px-6 py-3">ID</th>
                                <th scope="col" className="px-6 py-3">Name</th>
                                <th scope="col" className="px-6 py-3">Price</th>
                                <th scope="col" className="px-6 py-3">Stock</th>
                                <th scope="col" className="px-6 py-3">Created At</th>
                                <th scope="col" className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-sidebar-border/50 dark:divide-sidebar-border/50">
                            {products.length === 0 ? (
                                <tr className="bg-transparent text-center">
                                    <td colSpan={6} className="px-6 py-4 italic opacity-80">No products found.</td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id} className="bg-transparent hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50">
                                        <td className="px-6 py-4 font-medium text-neutral-900 dark:text-neutral-100">{product.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-neutral-900 dark:text-neutral-100">{product.name}</div>
                                            {product.descriptions && product.descriptions.length > 0 && (
                                                <ul className="mt-1 list-inside list-disc text-xs text-neutral-400">
                                                    {product.descriptions.map((d: any, i: number) => (
                                                        <li key={i}>{d.list}</li>
                                                    ))}
                                                </ul>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">${product.price}</td>
                                        <td className="px-6 py-4">{product.stock}</td>
                                        <td className="px-6 py-4 text-xs opacity-80">
                                            {new Date(product.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8 border-sidebar-border/70 bg-transparent dark:border-sidebar-border"
                                                    onClick={() => onEdit(product)}
                                                >
                                                    <Edit2 size={14} className="text-blue-500" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8 border-red-200/50 bg-transparent hover:bg-red-50 hover:text-red-500 dark:border-red-900/50 dark:hover:bg-red-950/50"
                                                    onClick={() => handleDelete(product.id)}
                                                >
                                                    <Trash2 size={14} className="text-red-500" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
