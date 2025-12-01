import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface DeleteHoldingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    stockCode: string;
    onConfirm: () => Promise<void>;
}

export function DeleteHoldingDialog({ open, onOpenChange, stockCode, onConfirm }: DeleteHoldingDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = async () => {
        setIsDeleting(true);
        try {
            await onConfirm();
            onOpenChange(false);
        } catch (error) {
            console.error("Delete failed", error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <Trash2 className="w-5 h-5" />
                        Hisseyi Sil
                    </DialogTitle>
                    <DialogDescription>
                        <strong>{stockCode}</strong> hissesini portföyünüzden silmek istediğinize emin misiniz?
                        <br />
                        Bu işlem geri alınamaz.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isDeleting}
                    >
                        İptal
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Siliniyor..." : "Sil"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
