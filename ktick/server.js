import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { openDB, initDB } from "./db.js";
import "./scheduler.js"; // scheduler otomatik başlar

dotenv.config();

const app = express();
const port = 3001;
const API_KEY = process.env.RAPID_API_KEY;

app.use(cors());
app.use(express.json());

await initDB();

// Search endpoint
app.get("/api/bist/search", async (req, res) => {
  const query = (req.query.q || "").toLowerCase();
  try {
    const db = await openDB();
    let stocks = await db.all("SELECT * FROM stocks");
    console.log(query);
    if (query) {
      stocks = stocks.filter(
        (item) =>
          item.ad.toLowerCase().includes(query) ||
          item.kod.toLowerCase().includes(query)
      );
    }

    res.json(stocks);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Failed to fetch search results" });
  }
});


app.get("/api/bist/getprice", async (req, res) => {
    const code = req.query.code?.toString().toUpperCase();
    if (!code) return res.status(400).json({ error: "Code is required" });
  
    if (!API_KEY || API_KEY === 'REPLACE_WITH_YOUR_API_KEY') {
      return res.status(500).json({ error: "RAPIDAPI_KEY is not configured" });
    }
  
    try {
      // 1. DB'den hisse bilgilerini çek
      const db = await openDB();
      const stockFromDB = await db.get(`SELECT kod, ad, exchange, icon FROM stocks WHERE kod = ?`, [code]);
  
      // 2. API'den fiyat bilgilerini çek
      const url = `https://api.getlaplace.com/api/v2/stock/stats?symbols=${code}&region=tr&api_key=${API_KEY}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Get Price API Error: ${response.statusText}`);
      const stockRaw = (await response.json())[0];
  
      // 3. DB ve API verilerini birleştir
      const stockDetail = {
        code: stockRaw.symbol,
        name: stockFromDB?.ad ?? "",
        exchange: stockFromDB?.exchange ?? "",
        icon: stockFromDB?.icon ?? "",
        open: stockRaw.dayOpen,
        close: stockRaw.previousClose,
        high: stockRaw.dayHigh,
        low: stockRaw.dayLow,
        last: stockRaw.latestPrice,
        daily_change_price: stockRaw.latestPrice - stockRaw.previousClose,
        daily_change_percent: stockRaw.dailyChange * 100,
        volume_turkish_lira: stockRaw.marketCap,
        volume_lot: 0,
        volatility: 0,
        last_update: new Date().toISOString()
      };
  
      res.json(stockDetail);
    } catch (error) {
      console.error("GetPrice error:", error);
      res.status(500).json({ error: "Failed to fetch stock price" });
    }
  });

app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
});
