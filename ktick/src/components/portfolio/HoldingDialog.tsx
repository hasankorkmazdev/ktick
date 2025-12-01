import { useState, useEffect } from "react";
import { PortfolioItem } from "@/services/api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { NumberInput } from "../NumberInput";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "../ui/dialog";
import { X, Check } from "lucide-react";
import { IconWrapper } from "../IconWrapper";

interface HoldingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingItem: Partial<PortfolioItem> | null;
    onSave: (item: PortfolioItem) => Promise<void>;
}

export function HoldingDialog({ open, onOpenChange, editingItem, onSave }: HoldingDialogProps) {
    const [formData, setFormData] = useState<Partial<PortfolioItem>>({
        code: "",
        quantity: 0,
        avg_cost: 0
    });

    useEffect(() => {
        if (editingItem) {
            setFormData(editingItem);
        }
    }, [editingItem]);

    const handleSave = async () => {
        if (!formData.code || formData.quantity === undefined || formData.avg_cost === undefined) {
            return;
        }

        const dataToSave = {
            icon:"",
            name:"",
            code: formData.code,
            quantity: Number(formData.quantity),
            avg_cost: Number(formData.avg_cost)
        };

        await onSave(dataToSave);

        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
            <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <IconWrapper stock={{code:editingItem?.code,icon:editingItem?.icon,name:editingItem?.name}}></IconWrapper>
                            <div className="flex-1">
                                <DialogTitle className="text-lg font-bold">
                                    {editingItem?.code}
                                </DialogTitle>
                                
                            </div>
                        </div>
                       
                    </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="quantity" className="text-right">
                            Adet
                        </Label>
                        <NumberInput
                            value={formData.quantity || 0}
                            decimalPlaces={2}
                            step={1}
                            onChange={(e) => setFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="avg_cost" className="text-right">
                            Ort. Maliyet
                        </Label>
                        <Input
                            id="avg_cost"
                            type="number"
                            step="0.01"
                            value={formData.avg_cost ?? ""}
                            onChange={(e) => {
                                const newValue = e.target.value === "" ? 0 : Number(e.target.value);
                                setFormData(prev => ({ ...prev, avg_cost: newValue }));
                            }}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button size="sm" onClick={() => onOpenChange(false)} className="flex items-center gap-1">
                        <X className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={handleSave} className="flex items-center gap-1">
                        <Check className="h-4 w-4" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
