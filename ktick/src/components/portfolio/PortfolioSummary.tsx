import { Wallet, TrendingUp, TrendingDown } from "lucide-react";

interface PortfolioSummaryProps {
    totalValue: number;
    totalCost: number;
    totalPL: number;
    totalPLPercent: number;
}

export function PortfolioSummary({ totalValue, totalCost, totalPL, totalPLPercent }: PortfolioSummaryProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Value Card */}
            <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                    <Wallet className="w-4 h-4" />
                    Toplam Değer
                </div>
                <div className="text-2xl font-bold">
                    {totalValue.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </div>
            </div>

            {/* Total Cost Card */}
            <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                    <TrendingUp className="w-4 h-4" />
                    Toplam Maliyet
                </div>
                <div className="text-2xl font-bold">
                    {totalCost.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </div>
            </div>

            {/* Total P/L Card */}
            <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                    {totalPL >= 0 ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
                    Toplam Kar/Zarar
                </div>
                <div className={`text-2xl font-bold ${totalPL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {totalPL.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    <span className="text-sm ml-2 font-normal">
                        ({totalPLPercent.toFixed(2)}%)
                    </span>
                </div>
            </div>
        </div>
    );
}
