import { PortfolioItem } from "@/services/api";
import { Button } from "../ui/button";
import { Edit2, Trash2 } from "lucide-react";

interface PortfolioRowProps {
    item: PortfolioItem;
    currentPrice: number;
    onEdit: () => void;
    onDelete: () => void;
}

export function PortfolioRow({ item, currentPrice, onEdit, onDelete }: PortfolioRowProps) {
    const value = item.quantity * currentPrice;
    const cost = item.quantity * item.avg_cost;
    const pl = value - cost;
    const plPercent = cost > 0 ? (pl / cost) * 100 : 0;

    return (
        <tr className="hover:bg-muted/50 transition-colors">
            <td className="px-4 py-3 font-medium">{item.code}</td>
            <td className="px-4 py-3 text-right">{item.quantity}</td>
            <td className="px-4 py-3 text-right">
                {item.avg_cost.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
            </td>
            <td className="px-4 py-3 text-right">
                {currentPrice > 0 ? `${currentPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺` : '-'}
            </td>
            <td className="px-4 py-3 text-right font-medium">
                {value.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
            </td>
            <td className={`px-4 py-3 text-right font-medium ${pl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {pl.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                <div className="text-xs opacity-80">%{plPercent.toFixed(2)}</div>
            </td>
            <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-2">
                    <Button variant="ghost" size="icon" onClick={onEdit}>
                        <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={onDelete}>
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </td>
        </tr>
    );
}
