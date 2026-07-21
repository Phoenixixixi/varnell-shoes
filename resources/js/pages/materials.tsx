import AppLayout from "@/layouts/app-layout";
import { Head } from "@inertiajs/react";
import MaterialTable from "@/components/material/material-table";
import { useState } from "react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { useForm } from "@inertiajs/react";


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Material {
    id: number;
    name: string;
    unit: string;
    current_stock: number;
    created_at: number;
    updated_at: number;
}

export interface Props {
    materials: Material[];
}






export default function Materials({ materials }: Props) {
    const { data, setData, post, put, errors, processing, reset, delete: destroy, clearErrors } = useForm({
        name: '',
        unit: '',
        initial_stock: '',
        description: '',
        created_at: '',
        log_date: new Date().toISOString().split('T')[0],
    });
    const [isEditing, setIsEditing] = useState<number | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            put(route('admin.material.update', isEditing), {
                onSuccess: () => {
                    reset();
                    setIsEditing(null);
                }
            });
        } else {
            post(route('admin.material.store'), {
                onSuccess: () => {
                    reset();
                }
            });
        }
    }

    const handleEdit = (material: any) => {
        setIsEditing(material.id);
        setData({
            name: material.name,
            unit: material.unit,
            initial_stock: material.current_stock,
            description: '',
            created_at: material.created_at ? new Date(material.created_at).toISOString().split('T')[0] : '',
            log_date: new Date().toISOString().split('T')[0],
        });
        clearErrors();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this material?')) {
            destroy(route('admin.material.destroy', id));
        }
    }

    const cancelEdit = () => {
        reset();
        setIsEditing(null);
    }
    return (
        <AppLayout breadcrumbs={[]}>
            <Head title="Materials" />
            <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
                <Card className="border-sidebar-border/70 bg-transparent shadow-none dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>Materials</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <Field>
                                    <FieldLabel htmlFor="name">Product Name</FieldLabel>
                                    <FieldDescription>The display name of the product.</FieldDescription>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g. Glue"
                                        className={errors.name ? 'border-red-500' : ''}
                                    />
                                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="price">Price ($)</FieldLabel>
                                    <FieldDescription>Set the unit of measurement.</FieldDescription>
                                    <Input
                                        id="unit"
                                        value={data.unit}
                                        onChange={(e) => setData('unit', e.target.value)}
                                        placeholder="KG, Litre, etc."
                                        className={errors.unit ? 'border-red-500' : ''}
                                    />
                                    {errors.unit && <p className="mt-1 text-xs text-red-500">{errors.unit}</p>}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="stock">Stock</FieldLabel>
                                    <FieldDescription>Stock of The Product</FieldDescription>
                                    <Input
                                        id="stock"
                                        type="number"
                                        min={0}
                                        value={data.initial_stock}
                                        onChange={(e) => setData('initial_stock', e.target.value)}
                                        placeholder="15, 20"
                                        className={errors.initial_stock ? 'border-red-500' : ''}
                                    />
                                    {errors.initial_stock && <p className="mt-1 text-xs text-red-500">{errors.initial_stock}</p>}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="created_at">Date Created</FieldLabel>
                                    <FieldDescription>Custom creation / entry date (optional).</FieldDescription>
                                    <Input
                                        id="created_at"
                                        type="date"
                                        value={data.created_at}
                                        onChange={(e) => setData('created_at', e.target.value)}
                                        className={errors.created_at ? 'border-red-500' : ''}
                                    />
                                    {errors.created_at && <p className="mt-1 text-xs text-red-500">{errors.created_at}</p>}
                                </Field>

                                {isEditing && (
                                    <Field>
                                        <FieldLabel htmlFor="log_date">Stock Update Date</FieldLabel>
                                        <FieldDescription>Set the update date for material (default: Today).</FieldDescription>
                                        <Input
                                            id="log_date"
                                            type="date"
                                            value={data.log_date}
                                            onChange={(e) => setData('log_date', e.target.value)}
                                            className={(errors as any).log_date ? 'border-red-500' : ''}
                                        />
                                        {(errors as any).log_date && <p className="mt-1 text-xs text-red-500">{(errors as any).log_date}</p>}
                                    </Field>
                                )}

                                <Field className="md:col-span-2">
                                    <FieldLabel htmlFor="description">Note / Reason</FieldLabel>
                                    <FieldDescription>Explain the reason for this stock adjustment (optional).</FieldDescription>
                                    <textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="e.g. Received new shipment from supplier"
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                    {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
                                </Field>
                            </div>

                            <div className="flex justify-end gap-x-4">
                                {isEditing && (
                                    <Button type="button" variant="outline" onClick={cancelEdit}>
                                        Cancel
                                    </Button>
                                )}
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : isEditing ? 'Update Product' : 'Add Product'}
                                </Button>

                            </div>
                        </form>

                        <MaterialTable materials={materials} onEdit={handleEdit} handleDelete={handleDelete} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}