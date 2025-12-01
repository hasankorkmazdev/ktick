import { StockSelector } from "@/components/StockSelector";
import { IntervalSelector } from "@/components/IntervalSelector";
import { StockList } from "@/components/StockList";
import { StockListItem } from "@/services/api";
import { LayoutGrid, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useWatchlistStore, startWatchlistRefresh, stopWatchlistRefresh } from "@/stores/useWatchlistStore";
import { useEffect } from "react";

export function WatchlistPage() {
    const {
        selectedStocks,
        stockData,
        intervalMs,
        lastUpdated,
        viewMode,
        addStock,
        removeStock,
        setIntervalMs,
        setViewMode
    } = useWatchlistStore();

    // Start auto-refresh on mount
    useEffect(() => {
        startWatchlistRefresh();
        return () => stopWatchlistRefresh();
    }, []);

    const handleSelectStock = (stock: StockListItem) => {
        addStock(stock);
    };

    const handleRemoveStock = (code: string) => {
        removeStock(code);
    };

    return (
        <div className="space-y-6">
            {/* Watchlist Controls */}
            <div className="flex justify-end items-center gap-4">
                <div className="text-right hidden md:block">
                    <p className="text-xs text-muted-foreground">Son Güncelleme</p>
                    <p className="text-sm font-medium font-mono">
                        {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : "-"}
                    </p>
                </div>
                <IntervalSelector intervalMs={intervalMs} onChange={setIntervalMs} />
                <StockSelector
                    onSelect={handleSelectStock}
                    selectedCodes={selectedStocks.map(s => s.code)}
                />
                <ButtonGroup>
                    <Button
                        variant={viewMode === "card" ? "default" : "outline"}
                        onClick={() => setViewMode("card")}
                        aria-label="Card view"
                    >
                        <LayoutGrid className="w-5 h-5" />
                    </Button>
                    <Button
                        variant={viewMode === "row" ? "default" : "outline"}
                        onClick={() => setViewMode("row")}
                        aria-label="Row view"
                    >
                        <LayoutList className="w-5 h-5" />
                    </Button>
                </ButtonGroup>
            </div>

            <StockList
                stockData={stockData}
                onRemove={handleRemoveStock}
                viewMode={viewMode}
            />
        </div>
    );
}
