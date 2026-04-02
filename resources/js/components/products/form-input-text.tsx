
import {
    Field,
    FieldDescription,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"




export default function Form({ name, label, description, placeholder, type }: { name: string, label: string, description: string, placeholder: string, type: string }) {
    return (
        <Field>
            <FieldLabel htmlFor={name}>{label}</FieldLabel>
            <FieldDescription>{description}</FieldDescription>
            <Input id={name} placeholder={placeholder} type={type} />
        </Field>
    )
}