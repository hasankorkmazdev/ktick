import { PortfolioItem, StockDetail } from "@/services/api";
import { PortfolioRow } from "./PortfolioRow";

interface PortfolioTableProps {
    holdings: PortfolioItem[];
    stockPrices: Record<string, StockDetail>;
    onEdit: (item: PortfolioItem) => void;
    onDelete: (code: string) => void;
}

export function PortfolioTable({ holdings, stockPrices, onEdit, onDelete }: PortfolioTableProps) {
    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-medium">
                        <tr>
                            <th className="px-4 py-3">Varlık</th>
                            <th className="px-4 py-3 text-right">Adet</th>
                            <th className="px-4 py-3 text-right">Ort. Maliyet</th>
                            <th className="px-4 py-3 text-right">Güncel Fiyat</th>
                            <th className="px-4 py-3 text-right">Toplam Değer</th>
                            <th className="px-4 py-3 text-right">Kar/Zarar</th>
                            <th className="px-4 py-3 text-center">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {holdings.map((item) => (

                            <PortfolioRow
                                key={item.code}
                                item={item}
                                currentPrice={stockPrices[item.code]?.buying || 0}
                                onEdit={() => onEdit(item)}
                                onDelete={() => onDelete(item.code)}
                            />
                        ))}
                        {holdings.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                    Bu kategoride varlık bulunmuyor.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
