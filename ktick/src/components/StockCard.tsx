import { StockDetail } from "@/services/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDown, ArrowUp, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/tr";

interface StockCardProps {
    data: StockDetail
    onRemove: (code: string) => void
}

export function StockCard({ data, onRemove }: StockCardProps) {
    dayjs.extend(relativeTime);
    dayjs.locale("tr");
    const isPositive = data.daily_change_percent >= 0;
    console.log(data);
    return (
        <Card className="group relative overflow-hidden transition-all hover:shadow-lg hover:shadow-primary/5">
            <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                onClick={() => onRemove(data.code)}
            >
                <X className="h-4 w-4" />
            </Button>

            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl font-bold">{data.code}</CardTitle>
                        <p className="text-xs text-muted-foreground truncate max-w-[150px]">{data.name}</p>
                    </div>
                    <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${isPositive
                        ? "bg-green-500/20 text-green-400 dark:bg-green-500/20 dark:text-green-300"
                        : "bg-red-500/20 text-red-400 dark:bg-red-500/20 dark:text-red-300"
                        }`}
                    >
                        {isPositive ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                        %{Math.abs(data.daily_change_percent).toFixed(2)}
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold tracking-tight">
                        {(data?.last ?? 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-sm text-muted-foreground">TL</span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                        <span>Düşük:</span>
                        <span className="font-medium text-foreground">
                            {(data?.low ?? 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>Yüksek:</span>
                        <span className="font-medium text-foreground">
                            {(data?.high ?? 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>Hacim:</span>
                        <span className="font-medium text-foreground">
                            {(data?.volume_lot ?? 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                    {/*   <div className="flex justify-between">
                        <span>Saat:</span>
                        <span className="font-medium text-foreground">
                            {data.last_update
                                ? dayjs(data.last_update).fromNow()
                                : "~"}
                        </span>
                    </div> */}

                </div>

            </CardContent>
        </Card>
    );
}

