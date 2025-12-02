import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, StockListItem, StockDetail } from '@/services/api';

interface WatchlistState {
    // State
    selectedStocks: StockListItem[];
    stockData: StockDetail[];
    intervalMs: number;
    lastUpdated: Date | null;
    viewMode: "card" | "row";

    // Actions
    addStock: (stock: StockListItem) => Promise<void>;
    removeStock: (code: string) => void;
    setIntervalMs: (ms: number) => void;
    setViewMode: (mode: "card" | "row") => void;
    fetchStockData: () => Promise<void>;
    updateLastUpdated: () => void;
}

export const useWatchlistStore = create<WatchlistState>()(
    persist(
        (set, get) => ({
            // Initial State
            selectedStocks: [],
            stockData: [],
            intervalMs: 10000,
            lastUpdated: null,
            viewMode: "card",

            // Add Stock
            addStock: async (stock: StockListItem) => {
                const { selectedStocks, fetchStockData } = get();
                if (!selectedStocks.find(s => s.code === stock.code)) {
                    set({ selectedStocks: [...selectedStocks, stock] });
                    // Immediately fetch data for the new stock
                    await fetchStockData();
                }
            },

            // Remove Stock
            removeStock: (code: string) => {
                set(state => ({
                    selectedStocks: state.selectedStocks.filter(s => s.code !== code)
                }));
            },

            // Set Interval
            setIntervalMs: (ms: number) => {
                set({ intervalMs: ms });
            },

            // Set View Mode
            setViewMode: (mode: "card" | "row") => {
                set({ viewMode: mode });
            },

            // Fetch Stock Data
            fetchStockData: async () => {
                const { selectedStocks } = get();
                const data: StockDetail[] = [];

                for (const stock of selectedStocks) {
                    try {
                        const detail = await api.getStockPrice(stock.code);
                        data.push(detail);
                    } catch (error) {
                        console.error(`Failed to fetch ${stock.code}:`, error);
                    }
                }

                set({ stockData: data });
                get().updateLastUpdated();
            },

            // Update Last Updated
            updateLastUpdated: () => {
                set({ lastUpdated: new Date() });
            },
        }),
        {
            name: 'watchlist-storage',
            partialize: (state) => ({
                selectedStocks: state.selectedStocks,
                intervalMs: state.intervalMs,
                viewMode: state.viewMode,
            }),
        }
    )
);

// Auto-refresh setup
let watchlistInterval: NodeJS.Timeout | null = null;

export const startWatchlistRefresh = () => {
    if (watchlistInterval) return;

    const store = useWatchlistStore.getState();

    // Initial fetch
    store.fetchStockData();

    // Refresh based on interval
    const updateInterval = () => {
        if (watchlistInterval) clearInterval(watchlistInterval);

        const currentInterval = useWatchlistStore.getState().intervalMs;
        watchlistInterval = setInterval(() => {
            useWatchlistStore.getState().fetchStockData();
        }, currentInterval);
    };

    updateInterval();

    // Subscribe to interval changes
    useWatchlistStore.subscribe(
        (state) => state.intervalMs,
        () => updateInterval()
    );
};

export const stopWatchlistRefresh = () => {
    if (watchlistInterval) {
        clearInterval(watchlistInterval);
        watchlistInterval = null;
    }
};
