import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface Material {
    id: number;
    name: string;
    unit: string;
    current_stock: number;
}

interface RecipeItem {
    id: number;
    recipe_id: number;
    material_id: number;
    quantity_required: number;
    material: Material;
}

interface Recipe {
    id: number;
    name: string;
    description: string;
    items: RecipeItem[];
}

interface RecipesProps {
    recipes: Recipe[];
    materials: Material[];
}

export default function Recipes({ recipes, materials }: RecipesProps) {
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [addingItemTo, setAddingItemTo] = useState<number | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        description: '',
    });

    const itemForm = useForm({
        material_id: '',
        quantity_required: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            put(route('admin.recipes.update', isEditing), {
                onSuccess: () => {
                    reset();
                    setIsEditing(null);
                },
            });
        } else {
            post(route('admin.recipes.store'), {
                onSuccess: () => reset(),
            });
        }
    };

    const handleAddItem = (e: React.FormEvent, recipeId: number) => {
        e.preventDefault();
        itemForm.post(route('admin.recipes.add-item', recipeId), {
            onSuccess: () => {
                itemForm.reset();
                setAddingItemTo(null);
            },
        });
    };

    const handleRemoveItem = (itemId: number) => {
        if (confirm('Are you sure you want to remove this item?')) {
            router.delete(route('admin.recipes.remove-item', itemId));
        }
    };

    const handleEdit = (recipe: Recipe) => {
        setIsEditing(recipe.id);
        setData({
            name: recipe.name,
            description: recipe.description,
        });
        clearErrors();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteRecipe = (id: number) => {
        if (confirm('Are you sure you want to delete this recipe?')) {
            router.delete(route('admin.recipes.destroy', id));
        }
    };

    const handleEditItem = (item: RecipeItem) => {
        setAddingItemTo(item.recipe_id);
        itemForm.setData({
            material_id: item.material_id.toString(),
            quantity_required: item.quantity_required.toString(),
        });
    };

    return (
        <AppLayout>
            <Head title="Recipes" />
            <div className="mx-auto w-full max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
                <Card className="border-sidebar-border/70 bg-transparent shadow-none dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>{isEditing ? 'Edit Recipe' : 'Add New Recipe'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Field>
                                    <FieldLabel htmlFor="name">Recipe Name</FieldLabel>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g. Leather Shoes Model A"
                                        className={errors.name ? 'border-red-500' : ''}
                                    />
                                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="description">Description</FieldLabel>
                                    <Input
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Brief description..."
                                        className={errors.description ? 'border-red-500' : ''}
                                    />
                                    {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
                                </Field>
                            </div>

                            <div className="flex justify-end gap-x-4">
                                {isEditing && (
                                    <Button type="button" variant="outline" onClick={() => { setIsEditing(null); reset(); }}>
                                        Cancel
                                    </Button>
                                )}
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : isEditing ? 'Update Recipe' : 'Add Recipe'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold tracking-tight">Existing Recipes</h2>
                    </div>
                    {recipes.map((recipe) => (
                        <Card key={recipe.id} className="border-sidebar-border/70 bg-transparent shadow-none dark:border-sidebar-border">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div>
                                    <CardTitle className="text-xl font-bold">{recipe.name}</CardTitle>
                                    <p className="text-sm text-muted-foreground">{recipe.description}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handleEdit(recipe)}>Edit Recipe</Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteRecipe(recipe.id)}>Delete</Button>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold">Recipe Items (per unit)</h3>
                                        <Button variant="outline" size="sm" onClick={() => { setAddingItemTo(recipe.id); itemForm.reset(); }}>
                                            <Plus className="mr-2 h-4 w-4" /> Add Item
                                        </Button>
                                    </div>

                                    {addingItemTo === recipe.id && (
                                        <form onSubmit={(e) => handleAddItem(e, recipe.id)} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50">
                                            <Field>
                                                <FieldLabel>Material</FieldLabel>
                                                <Select 
                                                    onValueChange={(val) => itemForm.setData('material_id', val)}
                                                    value={itemForm.data.material_id}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select material" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {materials.map((m) => (
                                                            <SelectItem key={m.id} value={m.id.toString()}>
                                                                {m.name} ({m.unit})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </Field>
                                            <Field>
                                                <FieldLabel>Quantity Required</FieldLabel>
                                                <Input 
                                                    type="number" 
                                                    step="0.01"
                                                    value={itemForm.data.quantity_required}
                                                    onChange={(e) => itemForm.setData('quantity_required', e.target.value)}
                                                    placeholder="0.00"
                                                />
                                            </Field>
                                            <div className="flex items-end gap-2">
                                                <Button type="submit" disabled={itemForm.processing}>Save Item</Button>
                                                <Button type="button" variant="ghost" onClick={() => { setAddingItemTo(null); itemForm.reset(); }}>Cancel</Button>
                                            </div>
                                        </form>
                                    )}

                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Material</TableHead>
                                                <TableHead>Quantity Required</TableHead>
                                                <TableHead>Unit</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {recipe.items.length > 0 ? (
                                                recipe.items.map((item) => (
                                                    <TableRow key={item.id}>
                                                        <TableCell className="font-medium">{item.material?.name}</TableCell>
                                                        <TableCell>{item.quantity_required}</TableCell>
                                                        <TableCell className="text-muted-foreground">{item.material?.unit}</TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="icon"
                                                                    onClick={() => handleEditItem(item)}
                                                                    title="Edit Quantity"
                                                                >
                                                                    <Plus className="h-4 w-4 text-blue-500 rotate-45" />
                                                                </Button>
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="icon"
                                                                    onClick={() => handleRemoveItem(item.id)}
                                                                    title="Remove Item"
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                                                        No items added to this recipe.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}