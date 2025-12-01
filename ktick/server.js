import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { initDB } from "./db.js";
import { startSchedulers } from "./scheduler.js";
import * as repo from "./repository.js";

dotenv.config();

const app = express();
const port = 3001;
const API_KEY = process.env.RAPID_API_KEY;

app.use(cors());
app.use(express.json());

await initDB();
await repo.seedPortfolio();

// Start price caching schedulers
startSchedulers();

// Search endpoints
app.get("/api/search", async (req, res) => {
    const exchange = req.query.exchange || "";  // Örn: "BIST", "NASDAQ"
    const code = req.query.code || "";            // Kod veya isim araması
    try {
        const stocks = await repo.searchStocks(exchange, code);
        res.json(stocks);
    } catch (err) {
        console.error("Search error:", err);
        res.status(500).json({ error: "Failed to fetch search results" });
    }
});


// Get Price endpoints - with caching
app.get("/api/getprice", async (req, res) => {
    try {
        const code = req.query.code?.toString().toUpperCase();
        if (!code) return res.status(400).json({ error: "Code is required" });

        const cached = await repo.getPriceFromCache(code);
        if (cached) {
            return res.json(cached);
        }

        // If not in cache, return 404
        return res.status(404).json({
            error: "Price not found in cache",
            message: `Price for ${code} is not available yet. Please wait for the next update cycle (every 10 seconds).`
        });
    }
    catch (err) {
        console.error("Get price error:", err);
        res.status(500).json({ error: "Failed to fetch price" });
    }
});


app.get("/api/portfolio", async (req, res) => {
    try {
        const holdings = await repo.getPortfolioHoldings();
        res.json(holdings);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch portfolio" });
    }
});

app.post("/api/portfolio", async (req, res) => {
    const { code, quantity, avg_cost } = req.body;

    if (!code || quantity === undefined || avg_cost === undefined) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        await repo.savePortfolioHolding({ code, quantity, avg_cost });
        res.json({ message: "Holding saved" });
    } catch (err) {
        console.error("Save holding error:", err);
        res.status(500).json({ error: "Failed to save holding" });
    }
});

app.delete("/api/portfolio/:code", async (req, res) => {
    const { code } = req.params;

    try {
        await repo.deletePortfolioHolding(code);
        res.json({ message: "Holding deleted" });
    } catch (err) {
        console.error("Delete holding error:", err);
        res.status(500).json({ error: "Failed to delete holding" });
    }
});

// Start server
app.listen(port, () => {
    console.log(`✅ Server running on http://localhost:${port}`);
    console.log(`📊 Price caching active - updates every 10 seconds`);
});
