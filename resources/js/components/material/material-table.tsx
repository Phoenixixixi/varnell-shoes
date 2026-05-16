import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Pencil, Save } from 'lucide-react';
import { router } from '@inertiajs/react';


interface MaterialProps {
    materials: any;
    onEdit: (product: any) => void;
    handleDelete: (id: number) => void;

}

export default function MaterialTable({ materials, onEdit, handleDelete, }: MaterialProps) {
    const [editStockMaterial, setEditStockMaterial] = useState<number | null>(null);


    const [formData, setFormData] = useState({
        initial_stock: '',
    });

    const handleEditStock = (id: number) => {
        setEditStockMaterial(id);
        setFormData({
            initial_stock: materials.find((material: any) => material.id === id).current_stock,
        });
    }

    const saveStock = (id: number) => {
        setEditStockMaterial(null);
        router.put(route('admin.material.add-quantity', id), formData);
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Initial Stock</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {materials.map((material: any) => (
                    <TableRow key={material.id}>
                        <TableCell>{material.name}</TableCell>
                        <TableCell>
                            {material.current_stock}
                        </TableCell>
                        <TableCell>{material.unit}</TableCell>

                        <TableCell>
                            <Button variant="outline" size="sm" onClick={() => onEdit(material)}>
                                Edit
                            </Button>
                            <Button variant="destructive" size="sm" className='ml-2' onClick={() => handleDelete(material.id)}>
                                Delete
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}