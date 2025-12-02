import { create } from 'zustand';
import { api, PortfolioItem, StockDetail } from '@/services/api';

interface PortfolioState {
    // State
    holdings: PortfolioItem[];
    stockPrices: Record<string, StockDetail>;
    isLoading: boolean;

    // Actions
    fetchPortfolio: () => Promise<void>;
    fetchPrices: (items: PortfolioItem[]) => Promise<void>;
    saveHolding: (item: PortfolioItem) => Promise<void>;
    deleteHolding: (code: string) => Promise<void>;
    getStockPrice: (code: string) => Promise<number>;

    // Computed
    getTotalValue: () => number;
    getTotalCost: () => number;
    getTotalPL: () => number;
    getTotalPLPercent: () => number;
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
    // Initial State
    holdings: [],
    stockPrices: {},
    isLoading: false,

    // Fetch Portfolio
    fetchPortfolio: async () => {
        try {
            set({ isLoading: true });
            const data = await api.getPortfolio();
            set({ holdings: data });
            await get().fetchPrices(data);
        } catch (error) {
            console.error("Failed to fetch portfolio:", error);
        } finally {
            set({ isLoading: false });
        }
    },

    // Fetch Prices for Holdings
    fetchPrices: async (items: PortfolioItem[]) => {
        const prices: Record<string, StockDetail> = {};
        for (const item of items) {
            try {
                const detail = await api.getStockPrice(item.code);
                prices[item.code] = detail;
            } catch (error) {
                console.error(`Failed to fetch price for ${item.code}`, error);
            }
        }
        set({ stockPrices: prices });
    },

    // Save Holding
    saveHolding: async (item: PortfolioItem) => {
        try {
            const dataToSave = {
                code: item.code,
                quantity: Number(item.quantity),
                avg_cost: Number(item.avg_cost)
            };
            await api.saveHolding(dataToSave);
            await get().fetchPortfolio();
        } catch (error) {
            console.error("Failed to save holding:", error);
            throw error;
        }
    },

    // Delete Holding
    deleteHolding: async (code: string) => {
        try {
            await api.deleteHolding(code);
            await get().fetchPortfolio();
        } catch (error) {
            console.error("Failed to delete holding:", error);
            throw error;
        }
    },

    // Get Stock Price
    getStockPrice: async (code: string): Promise<number> => {
        try {
            const detail = await api.getStockPrice(code);
            return detail.last;
        } catch (error) {
            console.error("Failed to fetch stock price:", error);
            return 0;
        }
    },

    // Computed Values
    getTotalValue: () => {
        const { holdings, stockPrices } = get();
        return holdings.reduce((sum, item) => {
            const price = stockPrices[item.code]?.buying || 0;
            return sum + (item.quantity * price);
        }, 0);
    },

    getTotalCost: () => {
        const { holdings } = get();
        return holdings.reduce((sum, item) => sum + (item.quantity * item.avg_cost), 0);
    },

    getTotalPL: () => {
        return get().getTotalValue() - get().getTotalCost();
    },

    getTotalPLPercent: () => {
        const totalCost = get().getTotalCost();
        const totalPL = get().getTotalPL();
        return totalCost > 0 ? (totalPL / totalCost) * 100 : 0;
    },
}));

// Auto-refresh setup
let refreshInterval: NodeJS.Timeout | null = null;

export const startPortfolioRefresh = () => {
    if (refreshInterval) return;

    // Initial fetch
    usePortfolioStore.getState().fetchPortfolio();

    // Refresh every minute
    refreshInterval = setInterval(() => {
        usePortfolioStore.getState().fetchPortfolio();
    }, 60000);
};

export const stopPortfolioRefresh = () => {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
};
