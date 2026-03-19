"use client"

import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox"

interface CustomComboBoxProps {
    items: { value: string; label: string }[];
    placeholder: string;
}
export function CustomComboBox({ items, placeholder }: CustomComboBoxProps) {
    return (
        <Combobox items={items} itemToStringValue={(item: { value: string; label: string }) => item.label}>
            <ComboboxInput placeholder={placeholder} />
            <ComboboxContent>
                <ComboboxEmpty>No items found.</ComboboxEmpty>
                <ComboboxList>
                    {(item) => (
                        <ComboboxItem key={item.value} value={item}>
                            {item.label}
                        </ComboboxItem>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    )
}
