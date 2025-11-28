import { StockDetail } from "@/services/api"
import { StockCard } from "@/components/StockCard"
import { StockRow } from "@/components/StockRow"
import { Activity } from "lucide-react"

interface StockListProps {
    stockData: StockDetail[]
    onRemove: (code: string) => void
    viewMode: "card" | "row"   // Yeni parametre
}

export function StockList({ stockData, onRemove, viewMode }: StockListProps) {
    if (stockData.length === 0) {
        return (
            <div className="text-center py-20 border-2 border-dashed rounded-xl bg-muted/30">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">Takip edilen hisse yok</h3>
                <p className="text-muted-foreground mb-6">Başlamak için yukarıdan bir hisse senedi ekleyin.</p>
            </div>
        )
    }

    if (viewMode === "card") {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {stockData.map((data, index) => (
                    <StockCard key={`${data.code}-${index}`} data={data} onRemove={onRemove} />
                ))}
            </div>
        )
    }

    // Row view
    return (
        <div className="flex flex-col divide-y">
            {stockData.map((data, index) => (
                <StockRow key={`${data.code}-${index}`} data={data} onRemove={onRemove} />
            ))}
        </div>
    )
}
