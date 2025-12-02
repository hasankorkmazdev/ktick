export interface StockListItem {
    id: number;
    code: string;
    name: string;
    type: string;
    icon: string;
    exchange: string;
}

export interface StockDetail {
    name: string,
    code: string;
    icon: string;
    open: number;
    close: number;
    high: number;
    low: number;
    last: number;
    daily_change_price: number;
    daily_change_percent: number;
    volume_turkish_lira: number;
    volume_lot: number;
    volatility: number;
    last_update: string;
}
export interface StockListItem {
    id: number;
    code: string;
    name: string;
    type: string;
    icon: string;
    exchange: string;
}

export interface StockDetail {
    name: string,
    exchange: string,
    code: string;
    icon: string;
    open: number;
    close: number;
    high: number;
    low: number;
    last: number;
    daily_change_price: number;
    daily_change_percent: number;
    volume_turkish_lira: number;
    volume_lot: number;
    volatility: number;
    last_update: string;
    buying?: number;
    selling?: number;
}



// Proxy is configured in vite.config.ts to forward /api requests to http://localhost:3001
const BASE_URL = '/api';

export interface PortfolioItem {
    icon: string,
    name: string
    code: string;
    quantity: number;
    avg_cost: number;
    created_at?: string;
    updated_at?: string;
}

export const api = {
    async getStockList(code: string = "", exchange: string = "BIST"): Promise<StockListItem[]> {
        try {
            let url = `${BASE_URL}/search?code=${code}&exchange=${exchange}`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Failed to fetch stock list');
            }
            const data = await response.json();
            return data;

        } catch (error) {
            console.error('Error fetching stock list:', error);
            throw error;
        }
    },

    async getStockPrice(code: string): Promise<StockDetail> {

        try {
            const response = await fetch(`${BASE_URL}/getprice?code=${code}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch price for ${code}`);
            }
            const data = await response.json();
            return data
        } catch (error) {
            console.error(`Error fetching price for ${code}:`, error);
            throw error;
        }
    },

    async getPortfolio(): Promise<PortfolioItem[]> {
        try {
            const response = await fetch(`${BASE_URL}/portfolio`);
            if (!response.ok) throw new Error('Failed to fetch portfolio');
            return await response.json();
        } catch (error) {
            console.error('Error fetching portfolio:', error);
            throw error;
        }
    },

    async saveHolding(holding: { code: string, quantity: number, avg_cost: number }): Promise<{ message: string }> {
        try {
            const response = await fetch(`${BASE_URL}/portfolio`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(holding)
            });
            if (!response.ok) throw new Error('Failed to save holding');
            return await response.json();
        } catch (error) {
            console.error('Error saving holding:', error);
            throw error;
        }
    },

    async deleteHolding(code: string): Promise<{ message: string }> {
        try {
            const response = await fetch(`${BASE_URL}/portfolio/${code}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete holding');
            return await response.json();
        } catch (error) {
            console.error('Error deleting holding:', error);
            throw error;
        }
    }
};
