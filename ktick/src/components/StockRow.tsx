import { StockDetail } from "@/services/api"
import { Activity, ArrowDown, ArrowUp, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/tr";
import { IconWrapper } from "./IconWrapper";

interface StockRowProps {
    data: StockDetail
    onRemove: (code: string) => void
}

export function StockRow({ data, onRemove }: StockRowProps) {
    dayjs.extend(relativeTime);
    dayjs.locale("tr");
    const isPositive = data.daily_change_percent >= 0;

    return (
        <div className="group grid grid-cols-[200px_1fr_180px_80px_120px_120px_80px_40px] items-center border-b py-2 px-4 hover:bg-muted/5 transition-colors text-sm">
            {/* Icon ve code/name */}
            <div className="flex ">
                <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center mb-1">
                <IconWrapper data={{ icon: data.icon }} />
                </div>
                <div className="ms-3 flex flex-col">
                    <div className="font-bold">{data.code}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[100px]">{data.name}</div>
                </div>
            </div>
            {/* Son fiyat ve günlük değişim alt alta */}
            <div className="flex flex-col items-end">
                <span className="font-bold">{(data?.last ?? 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${isPositive
                    ? "bg-green-500/20 text-green-400 dark:bg-green-500/20 dark:text-green-300"
                    : "bg-red-500/20 text-red-400 dark:bg-red-500/20 dark:text-red-300"
                    }`}>
                    {isPositive ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                    %{Math.abs(data.daily_change_percent).toFixed(2)}
                </span>
            </div>


            {/* Kaldır butonu */}
            <div className="text-center">
                <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => onRemove(data.code)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
