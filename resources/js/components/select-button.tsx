import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface ButtonProps {
    text: string;
    value: string;
}

interface SelectButtonProps {
    buttonItems: ButtonProps[];
    placeholder: string;
    value?: string;
    onValueChange?: (value: string) => void;
    className?: string;
}

export default function SelectButton({ buttonItems, placeholder, value, onValueChange, className }: SelectButtonProps) {
    return (
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger className={className || "w-[180px]"}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    {buttonItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                            {item.text}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}