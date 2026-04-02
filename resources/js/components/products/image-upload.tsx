import { useState } from 'react';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Upload } from 'lucide-react';

interface ImageUploadProps {
    onChange: (files: File[]) => void;
    maxFiles?: number;
}

export default function ImageUpload({ onChange, maxFiles = 10 }: ImageUploadProps) {
    const [previews, setPreviews] = useState<string[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + selectedFiles.length > maxFiles) {
            alert(`You can only upload up to ${maxFiles} images.`);
            return;
        }

        const newFiles = [...selectedFiles, ...files];
        setSelectedFiles(newFiles);
        onChange(newFiles);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews([...previews, ...newPreviews]);
    };

    const removeImage = (index: number) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        const newPreviews = previews.filter((_, i) => i !== index);
        
        setSelectedFiles(newFiles);
        setPreviews(newPreviews);
        onChange(newFiles);
        
        // Revoke the URL to avoid memory leaks
        URL.revokeObjectURL(previews[index]);
    };

    return (
        <Field className="w-full">
            <FieldLabel>Product Images (Max {maxFiles})</FieldLabel>
            <FieldDescription>Select up to 10 images for your product.</FieldDescription>
            
            <div className="mt-2 flex flex-wrap gap-4">
                {previews.map((preview, index) => (
                    <div key={index} className="relative h-24 w-24 overflow-hidden rounded-lg border">
                        <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                        <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                        >
                            <X size={12} />
                        </button>
                    </div>
                ))}
                
                {selectedFiles.length < maxFiles && (
                    <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400">
                        <Upload size={24} className="text-gray-400" />
                        <span className="mt-1 text-xs text-gray-500">Upload</span>
                        <Input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </label>
                )}
            </div>
        </Field>
    );
}
