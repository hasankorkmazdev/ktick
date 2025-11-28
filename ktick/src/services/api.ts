export interface StockListItem {
    id: number;
    code: string;
    name: string;
    type: string;
    icon: string;
    exchange: string;
}

export interface StockDetail {
    name:string,
    code: string;
    icon:string;
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



// Proxy is configured in vite.config.ts to forward /api requests to http://localhost:3001
const BASE_URL = '/api';

export const api = {
    async getStockList(query: string = "",exchange: string = "BIST"): Promise<StockListItem[]> {
        try {
            // If no query provided, default to searching for BIST stocks to populate initial list
            let url = `${BASE_URL}/${exchange}/search?q=${query}`;
          

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

    async getStockPrice(stock: StockListItem): Promise<StockDetail> {
        console.log(stock);
      
        try {
            console.log(stock)
            const response = await fetch(`${BASE_URL}/${stock.exchange}/getprice?code=${stock.code}`);
            console.log(response);
            if (!response.ok) {
                throw new Error(`Failed to fetch price for ${stock.code}`);
            }
            const data = await response.json();
            console.log(data);
            return data
        } catch (error) {
            console.error(`Error fetching price for ${stock.code}:`, error);
            throw error;
        }
    }
};
