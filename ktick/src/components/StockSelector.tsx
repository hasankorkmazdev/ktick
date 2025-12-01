import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from "cmdk";
import { api, StockListItem } from "@/services/api";
import { Loader2, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { IconWrapper } from "./IconWrapper";

interface StockSelectorProps {
    onSelect: (stock: StockListItem) => void;
    selectedCodes: string[]; // Changed from selectedStocks object array to simple code array
    trigger?: React.ReactNode; // Optional custom trigger
}

export function StockSelector({ onSelect, selectedCodes, trigger }: StockSelectorProps) {
    const [open, setOpen] = useState(false);
    const [stocks, setStocks] = useState<StockListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [exchange, setExchange] = useState<"BIST" | "NASDAQ" | "BINANCE" | "DOVIZ" | "EMTIA">("BIST");

    useEffect(() => {
        if (open) {
            const timer = setTimeout(() => {
                fetchStocks(searchQuery);
            }, 300); // Debounce

            return () => clearTimeout(timer);
        }
    }, [open, searchQuery, exchange]);

    const fetchStocks = async (query: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getStockList(query, exchange);
            setStocks(data);
        } catch (err) {
            setError("Hisse listesi yüklenemedi");
            console.error("Error fetching stocks:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (stock: StockListItem) => {
        onSelect(stock);
        // We don't close automatically to allow multiple selections if needed, 
        // but for portfolio adding one by one might be better. 
        // Let's keep it open for now or close it? 
        // If we use it for "Add New", we probably want to close it after select.
        // But for Watchlist we wanted multiple. 
        // Let's decide based on usage. For now, keep behavior same (don't close).
    };

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
                {trigger ? trigger : (
                    <Button variant="outline">
                        <Plus className="w-5 h-5" />
                    </Button>
                )}
            </Dialog.Trigger>

            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <Dialog.Content className="fixed top-1/2 left-1/2  w-[500px]  -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-popover border border-border shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
                    <div className="border-b border-border p-6 pb-4">
                        <div className="flex items-center justify-between mb-4">
                            <Dialog.Title className="text-xl font-bold text-popover-foreground flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                Stok Ara ve Seç
                            </Dialog.Title>
                            <Dialog.Close className="text-muted-foreground hover:text-foreground transition-colors hover:bg-accent rounded-lg p-1">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </Dialog.Close>
                        </div>
                        <div className="flex items-center justify-center">
                            <div className="inline-flex rounded-lg border bg-muted p-1 flex-wrap gap-1">
                                <Button
                                    variant={exchange === "BIST" ? "default" : "ghost"}
                                    onClick={() => setExchange("BIST")}
                                    className="flex-1 text-sm font-medium cursor-pointer">
                                    BIST
                                </Button>
                                <Button
                                    variant={exchange === "NASDAQ" ? "default" : "ghost"}
                                    onClick={() => setExchange("NASDAQ")}
                                    className="flex-1 text-sm font-medium cursor-pointer">
                                    NASDAQ
                                </Button>
                                <Button
                                    variant={exchange === "BINANCE" ? "default" : "ghost"}
                                    onClick={() => setExchange("BINANCE")}
                                    className="flex-1 text-sm font-medium cursor-pointer">
                                    BINANCE
                                </Button>
                                <Button
                                    variant={exchange === "DOVIZ" ? "default" : "ghost"}
                                    onClick={() => setExchange("DOVIZ")}
                                    className="flex-1 text-sm font-medium cursor-pointer">
                                    DÖVİZ
                                </Button>
                                <Button
                                    variant={exchange === "EMTIA" ? "default" : "ghost"}
                                    onClick={() => setExchange("EMTIA")}
                                    className="flex-1 text-sm font-medium cursor-pointer">
                                    EMTİA
                                </Button>
                            </div></div>
                    </div>

                    <div className="p-6 pt-2">
                        <Command shouldFilter={false} className="w-full rounded-lg border border-border shadow-sm overflow-hidden bg-background">
                            <div className="flex items-center border-b border-border px-3">
                                <svg className="w-4 h-4 text-muted-foreground mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <CommandInput
                                    placeholder="Stok kodu veya ismi ara..."
                                    value={searchQuery}
                                    onValueChange={setSearchQuery}
                                    className="flex-1 py-3 outline-none bg-transparent text-sm placeholder:text-muted-foreground"
                                />
                            </div>
                            <CommandList className="max-h-[500px] overflow-y-auto p-2">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-6">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
                                        <p className="text-xs text-muted-foreground">Aranıyor...</p>
                                    </div>
                                ) : error ? (
                                    <div className="py-6 text-center">
                                        <p className="text-sm text-destructive mb-2">{error}</p>
                                        <button
                                            onClick={() => fetchStocks(searchQuery)}
                                            className="text-xs underline text-muted-foreground hover:text-foreground"
                                        >
                                            Tekrar Dene
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                                            Sonuç bulunamadı
                                        </CommandEmpty>
                                        {stocks.slice(0, 20).map((stock) => {
                                            const isSelected = selectedCodes.includes(stock.code);
                                            return (
                                                <CommandItem
                                                    key={stock.code}
                                                    value={`${stock.code} ${stock.name}`}
                                                    onSelect={() => {
                                                        if (!isSelected) {
                                                            handleSelect(stock);
                                                        }
                                                    }}
                                                    className={`flex items-center justify-between px-3 py-3 rounded-lg cursor-pointer 
                                                        transition-all duration-200 mb-1
                                                        ${isSelected
                                                            ? 'bg-primary/10 border border-primary/30 shadow-sm'
                                                            : 'hover:bg-accent border border-transparent'
                                                        }
                                                        `}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <IconWrapper stock={stock} />
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-sm text-foreground">{stock.code}</span>
                                                            <span className="text-xs text-muted-foreground">{stock.name}</span>
                                                        </div>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                                            <svg
                                                                className="w-3 h-3 text-primary-foreground"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24">
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={3}
                                                                    d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </CommandItem>
                                            );
                                        })}
                                    </>
                                )}
                            </CommandList>
                        </Command>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-border p-6 pt-4 bg-muted/30 rounded-b-2xl">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                                <span className="font-semibold text-primary">{selectedCodes.length}</span> stok seçildi
                            </span>
                            <Dialog.Close className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium transition-all duration-200 hover:bg-primary/90 hover:shadow-lg hover:scale-105 active:scale-95">
                                Tamam
                            </Dialog.Close>
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
