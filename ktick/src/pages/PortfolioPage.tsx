import { StockListItem } from "@/services/api";
import { usePortfolioStore } from "@/stores/usePortfolioStore";
import { useUIStore } from "@/stores/useUIStore";
import { PortfolioSummary } from "@/components/portfolio/PortfolioSummary";
import { PortfolioTable } from "@/components/portfolio/PortfolioTable";
import { HoldingDialog } from "@/components/portfolio/HoldingDialog";
import { DeleteHoldingDialog } from "@/components/portfolio/DeleteHoldingDialog";
import { StockSelector } from "@/components/StockSelector";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useEffect } from "react";
import { startPortfolioRefresh, stopPortfolioRefresh } from "@/stores/usePortfolioStore";

export function PortfolioPage() {
    // Zustand stores
    const { holdings, stockPrices, saveHolding, deleteHolding, getStockPrice, getTotalValue, getTotalCost, getTotalPL, getTotalPLPercent } = usePortfolioStore();
    const { isEditDialogOpen, editingItem, isDeleteDialogOpen, itemToDelete, openEditDialog, closeEditDialog, openDeleteDialog, closeDeleteDialog } = useUIStore();

    // Start auto-refresh on mount
    useEffect(() => {
        startPortfolioRefresh();
        return () => stopPortfolioRefresh();
    }, []);

    const handleAddStock = async (stock: StockListItem) => {
        const currentPrice = await getStockPrice(stock.code);
        console.log(currentPrice)
        openEditDialog({
            icon: stock.icon,
            name: stock.name,
            code: stock.code,
            quantity: 0,
            avg_cost: currentPrice
        });
    };

    const handleEditStock = (item: any) => {
        openEditDialog({ ...item });
    };

    const handleDeleteClick = (code: string) => {
        openDeleteDialog(code);
    };

    const handleConfirmDelete = async () => {
        if (itemToDelete) {
            await deleteHolding(itemToDelete);
            closeDeleteDialog();
        }
    };

    // Only group holdings if we have price data
    const hasPriceData = Object.keys(stockPrices).length > 0;
    const groupedHoldings = hasPriceData ? {
        BIST: holdings.filter(h => {
            const exchange = stockPrices[h.code]?.exchange || "";
            return exchange === "BIST" || exchange === "";
        }),
        BINANCE: holdings.filter(h => stockPrices[h.code]?.exchange === "BINANCE"),
        DOVIZ: holdings.filter(h => stockPrices[h.code]?.exchange === "DOVIZ"),
        EMTIA: holdings.filter(h => stockPrices[h.code]?.exchange === "EMTIA"),
    } : {
        BIST: [],
        BINANCE: [],
        DOVIZ: [],
        EMTIA: []
    };
    const calculateGroupTotals = (items: any[]) => {
        const totalValue = items.reduce((sum, item) => {
            const price = stockPrices[item.code]?.buying || 0;
            return sum + (item.quantity * price);
        }, 0);

        const totalCost = items.reduce((sum, item) => sum + (item.quantity * item.avg_cost), 0);
        const totalPL = totalValue - totalCost;
        const totalPLPercent = totalCost > 0 ? (totalPL / totalCost) * 100 : 0;

        return { totalValue, totalCost, totalPL, totalPLPercent };
    };

    const renderExchangeSection = (title: string, items: any[], emoji: string) => {
        if (items.length === 0) return null;

        const totals = calculateGroupTotals(items);

        return (
            <div className="space-y-4" key={title}>
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <span>{emoji}</span>
                        {title}
                        <span className="text-sm text-muted-foreground">({items.length})</span>
                    </h3>
                    <div className="text-sm">
                        <span className="text-muted-foreground">Toplam: </span>
                        <span className={`font-semibold ${totals.totalPL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {totals.totalValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                        </span>
                        <span className={`ml-2 text-xs ${totals.totalPL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            ({totals.totalPL >= 0 ? '+' : ''}{totals.totalPLPercent.toFixed(2)}%)
                        </span>
                    </div>
                </div>
                <PortfolioTable
                    holdings={items}
                    stockPrices={stockPrices}
                    onEdit={handleEditStock}
                    onDelete={handleDeleteClick}
                />
            </div>
        );
    };

    const calculations = {
        totalValue: getTotalValue(),
        totalCost: getTotalCost(),
        totalPL: getTotalPL(),
        totalPLPercent: getTotalPLPercent()
    };

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <PortfolioSummary
                totalValue={calculations.totalValue}
                totalCost={calculations.totalCost}
                totalPL={calculations.totalPL}
                totalPLPercent={calculations.totalPLPercent}
            />

            {/* Actions */}
            <div className="flex justify-end">
                <StockSelector
                    onSelect={handleAddStock}
                    selectedCodes={holdings.map(h => h.code)}
                    trigger={
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" />
                            Varlık Ekle
                        </Button>
                    }
                />
            </div>

            {/* Loading State */}
            {holdings.length > 0 && !hasPriceData && (
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-8 text-center text-muted-foreground">
                    Fiyatlar yükleniyor...
                </div>
            )}

            {/* Grouped Tables by Exchange */}
            <div className="space-y-8">
                {renderExchangeSection("BIST Hisseleri", groupedHoldings.BIST, "🇹🇷")}
                {renderExchangeSection("Binance Kripto", groupedHoldings.BINANCE, "₿")}
                {renderExchangeSection("Döviz", groupedHoldings.DOVIZ, "💱")}
                {renderExchangeSection("Emtia", groupedHoldings.EMTIA, "🪙")}
            </div>

            {holdings.length === 0 && (
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-8 text-center text-muted-foreground">
                    Portföyünüzde henüz varlık bulunmuyor.
                </div>
            )}

            {/* Edit Dialog */}
            <HoldingDialog
                open={isEditDialogOpen}
                onOpenChange={closeEditDialog}
                editingItem={editingItem}
                onSave={saveHolding}
            />

            {/* Delete Confirmation Dialog */}
            <DeleteHoldingDialog
                open={isDeleteDialogOpen}
                onOpenChange={closeDeleteDialog}
                stockCode={itemToDelete || ""}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
}
