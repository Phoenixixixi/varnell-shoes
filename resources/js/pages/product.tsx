import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ImageUpload from '@/components/products/image-upload';
import ProductTable from '@/components/products/product-table';
import { Plus, Trash2, X } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Products',
        href: '/products',
    },
];

interface ProductProp {
    products: any[];
}

export default function Product({ products }: ProductProp) {
    const [isEditing, setIsEditing] = useState<number | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        descriptionList: [''],
        description: '',
        price: '',
        sizes: [{ size: '', stock: '' }] as { size: string; stock: string }[],
        images: [] as File[],
        deleted_images: [] as number[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            put(route('admin.product.update', isEditing), {
                onSuccess: () => {
                    reset();
                    setIsEditing(null);
                },
            });
        } else {
            post(route('admin.product.store'), {
                onSuccess: () => reset(),
            });
        }
    };

    const handleEdit = (product: any) => {
        setIsEditing(product.id);
        setData({
            name: product.name,
            descriptionList: product.descriptions.length > 0
                ? product.descriptions.map((d: any) => d.list)
                : [''],
            price: product.price.toString(),
            description: product.description,
            sizes: product.sizes && product.sizes.length > 0
                ? product.sizes.map((s: any) => ({ size: s.size, stock: s.stock.toString() }))
                : [{ size: '', stock: '' }],
            images: [],
            deleted_images: [],
        });
        clearErrors();
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const addDescription = () => {
        setData('descriptionList', [...data.descriptionList, '']);
    };

    const removeDescription = (index: number) => {
        if (data.descriptionList.length > 1) {
            const newDesc = [...data.descriptionList];
            newDesc.splice(index, 1);
            setData('descriptionList', newDesc);
        }
    };

    const updateDescription = (index: number, value: string) => {
        const newDesc = [...data.descriptionList];
        newDesc[index] = value;
        setData('descriptionList', newDesc);
    };

    const addSize = () => {
        setData('sizes', [...data.sizes, { size: '', stock: '' }]);
    };

    const removeSize = (index: number) => {
        if (data.sizes.length > 1) {
            const newSizes = [...data.sizes];
            newSizes.splice(index, 1);
            setData('sizes', newSizes);
        }
    };

    const updateSize = (index: number, field: 'size' | 'stock', value: string) => {
        const newSizes = [...data.sizes];
        newSizes[index] = { ...newSizes[index], [field]: value };
        setData('sizes', newSizes);
    };

    const cancelEdit = () => {
        setIsEditing(null);
        reset();
    };

    const handleRemoveExistingImage = (imageId: number) => {
        setData('deleted_images', [...data.deleted_images, imageId]);
    };

    const currentImages = isEditing ? products.find((p) => p.id === isEditing)?.images?.filter((img: any) => !data.deleted_images.includes(img.id)) || [] : [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />
            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
                <Card className="border-sidebar-border/70 bg-transparent shadow-none dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</CardTitle>
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
                                        placeholder="e.g. Classic T-Shirt"
                                        className={errors.name ? 'border-red-500' : ''}
                                    />
                                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="price">Price ($)</FieldLabel>
                                    <FieldDescription>Set the unit price.</FieldDescription>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        value={data.price}
                                        onChange={(e) => setData('price', e.target.value)}
                                        placeholder="0.00"
                                        className={errors.price ? 'border-red-500' : ''}
                                    />
                                    {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
                                </Field>



                                <Field>
                                    <FieldLabel htmlFor="description">Description</FieldLabel>
                                    <FieldDescription>Description of The Product</FieldDescription>
                                    <textarea
                                        id="description"
                                        type="text"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="e.g. This product is made of high-quality materials."
                                        className='border rounded-lg p-2'
                                    />
                                    {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
                                </Field>
                                <Field className="md:col-span-2">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <FieldLabel>Product Descriptions</FieldLabel>
                                            <FieldDescription>Add multiple points to describe your product.</FieldDescription>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addDescription}
                                            className="h-8"
                                        >
                                            <Plus size={14} className="mr-1" /> Add Point
                                        </Button>
                                    </div>

                                    <div className="mt-2 space-y-2">
                                        {data.descriptionList.map((desc, index) => (
                                            <div key={index} className="flex gap-x-2">
                                                <Input
                                                    value={desc}
                                                    onChange={(e) => updateDescription(index, e.target.value)}
                                                    placeholder={`Point ${index + 1}`}
                                                    className={(errors as any)[`descriptionList.${index}`] ? 'border-red-500' : ''}
                                                />
                                                {data.descriptionList.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => removeDescription(index)}
                                                        className="h-9 w-9 shrink-0 border-red-200 hover:bg-red-50"
                                                    >
                                                        <Trash2 size={14} className="text-red-500" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {errors.descriptionList && <p className="mt-1 text-xs text-red-500">{errors.descriptionList}</p>}
                                </Field>

                                {/* Sizes & Stock */}
                                <Field className="md:col-span-2">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <FieldLabel>Sizes & Stock</FieldLabel>
                                            <FieldDescription>Add size variants with their stock quantity.</FieldDescription>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addSize}
                                            className="h-8"
                                        >
                                            <Plus size={14} className="mr-1" /> Add Size
                                        </Button>
                                    </div>

                                    <div className="mt-2 space-y-2">
                                        {data.sizes.map((entry, index) => (
                                            <div key={index} className="flex gap-x-2 items-center">
                                                <Input
                                                    value={entry.size}
                                                    onChange={(e) => updateSize(index, 'size', e.target.value)}
                                                    placeholder={`Size (e.g. S, M, L, XL)`}
                                                    className={(errors as any)[`sizes.${index}.size`] ? 'border-red-500' : ''}
                                                />
                                                <Input
                                                    type="number"
                                                    value={entry.stock}
                                                    onChange={(e) => updateSize(index, 'stock', e.target.value)}
                                                    placeholder="Stock"
                                                    className={`w-28 ${(errors as any)[`sizes.${index}.stock`] ? 'border-red-500' : ''}`}
                                                />
                                                {data.sizes.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => removeSize(index)}
                                                        className="h-9 w-9 shrink-0 border-red-200 hover:bg-red-50"
                                                    >
                                                        <Trash2 size={14} className="text-red-500" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {(errors as any).sizes && <p className="mt-1 text-xs text-red-500">{(errors as any).sizes}</p>}
                                </Field>
                            </div>

                            {isEditing && currentImages.length > 0 && (
                                <Field className="w-full">
                                    <FieldLabel>Current Images</FieldLabel>
                                    <FieldDescription>Note: Uploading new images below will add to these.</FieldDescription>
                                    <div className="mt-2 flex flex-wrap gap-4">
                                        {currentImages.map((img: any) => (
                                            <div key={img.id} className="relative h-24 w-24 overflow-hidden rounded-lg border bg-white dark:bg-zinc-950">
                                                <img src={img.image_list} alt="Existing product" className="h-full w-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveExistingImage(img.id)}
                                                    className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </Field>
                            )}

                            <ImageUpload key={isEditing || 'new'} onChange={(files) => setData('images', files)} />
                            {Object.keys(errors)
                                .filter((key) => key.startsWith("images."))
                                .map((key, index) => (
                                    <p key={index} className="mt-1 text-xs text-red-500">
                                        {(errors as any)[key]}
                                    </p>
                                ))}

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
                    </CardContent>
                </Card>

                <ProductTable products={products} onEdit={handleEdit} />
            </div>
        </AppLayout>
    );
}
