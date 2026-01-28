"use client";

import React, { useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { useRouter } from "next/navigation";

const cities = [
    { name: "New York", code: "NY" },
    { name: "Rome", code: "RM" },
    { name: "London", code: "LDN" },
    { name: "Paris", code: "PRS" },
    { name: " ", code: "0" }, // Blank option at the end
];

export default function SelectionPage() {
    const router = useRouter();
    const [selections, setSelections] = useState<(any | null)[]>([null, null, null, null]);
    const [savedSelections, setSavedSelections] = useState<(any | null)[]>([null, null, null, null]);
    const toast = React.useRef<any>(null);

    // Check if current selections differ from saved selections
    const hasChanges = React.useMemo(() => {
        if (selections.length !== savedSelections.length) return true;
        for (let i = 0; i < selections.length; i++) {
            const selCode = selections[i]?.code || null;
            const savedCode = savedSelections[i]?.code || null;
            if (selCode !== savedCode) return true;
        }
        return false;
    }, [selections, savedSelections]);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    // Pad with blank options up to 4
                    const blankOption = cities.find(c => c.code === "0");
                    const filledData = [...data];
                    while (filledData.length < 4) {
                        filledData.push(blankOption);
                    }
                    setSelections(filledData.slice(0, 4));
                    setSavedSelections(filledData.slice(0, 4));
                }
            }
        } catch (error) {
            console.error("Failed to fetch settings", error);
        }
    };

    React.useEffect(() => {
        fetchSettings();
    }, []);

    const saveSettings = async () => {
        try {
            // Filter out nulls and blanks (item.code === "0")
            const validSelections = selections.filter(item => item && item.code !== "0");

            // Create new UI state: compacted valid selections + blanks at the end
            const blankOption = cities.find(c => c.code === "0");
            const newUiSelections = [...validSelections];
            while (newUiSelections.length < 4) {
                newUiSelections.push(blankOption);
            }

            // Update UI immediately
            setSelections(newUiSelections);

            // Send only valid (non-blank) selections to backend
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(validSelections),
            });
            if (res.ok) {
                setSavedSelections(newUiSelections);
                alert('Settings saved successfully!');
            } else {
                alert('Failed to save settings.');
            }
        } catch (error) {
            console.error("Error saving settings", error);
            alert('Error saving settings.');
        }
    };

    const resetSelections = () => {
        setSelections(savedSelections);
    };

    const handleChange = (index: number, value: any) => {
        const newSelections = [...selections];
        newSelections[index] = value;
        setSelections(newSelections);
    };

    const getOptions = (currentIndex: number) => {
        const otherSelectedCodes = selections
            .filter((item, index) => index !== currentIndex && item && item.code !== "0")
            .map((item) => item.code);

        return cities.filter(
            (city) => city.code === "0" || !otherSelectedCodes.includes(city.code)
        );
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-8">
            <h1 className="text-3xl font-bold mb-4">Make Your Selection</h1>

            <div className="flex flex-col gap-4 w-full max-w-xs">
                {selections.map((selection, index) => (
                    <Dropdown
                        key={index}
                        value={selection}
                        onChange={(e) => handleChange(index, e.value)}
                        options={getOptions(index)}
                        optionLabel="name"
                        placeholder={`Select Application ${index + 1}`}
                        className="w-full"
                    />
                ))}
            </div>

            <div className="flex gap-4 mt-8">
                <Button
                    label="设置"
                    icon="pi pi-cog"
                    //   className="p-button-secondary"
                    onClick={saveSettings}
                    disabled={!hasChanges}
                />
                <Button
                    label="重置"
                    icon="pi pi-refresh"
                    severity="warning"
                    onClick={resetSelections}
                />
                <Button
                    label="返回"
                    icon="pi pi-arrow-left"
                    className="p-button-outlined"
                    onClick={() => router.push("/")}
                />
            </div>
        </div>
    );
}
