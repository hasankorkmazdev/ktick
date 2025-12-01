import { openDB } from "./db.js";

// --- Stock Operations ---

export async function searchStocks(exchange, query) {
    const db = await openDB();
    let stocks = await db.all("SELECT * FROM stocks");
    if (exchange) {
        const ex = exchange.toLowerCase();
        stocks = stocks.filter(item => item.exchange?.toLowerCase() === ex);
    }
    if (query) {
        query = query.toLowerCase();
        stocks = stocks.filter(
            (item) =>
                item.name.toLowerCase().includes(query) ||
                item.code.toLowerCase().includes(query)
        );
    }
    return stocks;
}

export async function getStockByCode(code) {
    const db = await openDB();
    return await db.get(
        `SELECT code, name, type, exchange, icon FROM stocks WHERE code = ?`,
        [code]
    );
}

export async function saveStocks(stocks, exchange) {
    const db = await openDB();

    if (exchange) {
        await db.run("DELETE FROM stocks WHERE exchange = ?", [exchange]);
    } else {
        console.warn("saveStocks called without exchange! Clearing all stocks.");
        await db.exec("DELETE FROM stocks");
    }

    const stmt = await db.prepare(`
        INSERT INTO stocks (code, name, exchange, type, icon)
        VALUES (?, ?, ?, ?, ?)
    `);

    for (const item of stocks) {
        await stmt.run(
            item.code,
            item.name,
            item.exchange || exchange,
            item.type,
            item.icon
        );
    }

    await stmt.finalize();
}

export async function getPortfolioHoldings() {
    const db = await openDB();
    var res = await db.all(
        "SELECT * FROM portfolio_holdings ORDER BY code ASC"
    );
    return res;
}

export async function savePortfolioHolding(holding) {
    const db = await openDB();
    await db.run(
        `INSERT INTO portfolio_holdings (code, quantity, avg_cost, updated_at)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(code) DO UPDATE SET
       quantity = excluded.quantity,
       avg_cost = excluded.avg_cost,
       updated_at = CURRENT_TIMESTAMP`,
        [holding.code, holding.quantity, holding.avg_cost]
    );
}

export async function deletePortfolioHolding(code) {
    const db = await openDB();
    await db.run("DELETE FROM portfolio_holdings WHERE code = ?", [code]);
}

// --- Price Caching ---

export async function savePrice(priceData) {
    const db = await openDB();
    await db.run(
        `INSERT INTO prices (
            code, name, exchange, icon, open, close, high, low, last,
            daily_change_price, daily_change_percent, volume_turkish_lira,
            volume_lot, volatility, buying, selling, last_update
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(code) DO UPDATE SET
            name = excluded.name,
            exchange = excluded.exchange,
            icon = excluded.icon,
            open = excluded.open,
            close = excluded.close,
            high = excluded.high,
            low = excluded.low,
            last = excluded.last,
            daily_change_price = excluded.daily_change_price,
            daily_change_percent = excluded.daily_change_percent,
            volume_turkish_lira = excluded.volume_turkish_lira,
            volume_lot = excluded.volume_lot,
            volatility = excluded.volatility,
            buying = excluded.buying,
            selling = excluded.selling,
            last_update = CURRENT_TIMESTAMP`,
        [
            priceData.code,
            priceData.name,
            priceData.exchange,
            priceData.icon,
            priceData.open,
            priceData.close,
            priceData.high,
            priceData.low,
            priceData.last,
            priceData.daily_change_price,
            priceData.daily_change_percent,
            priceData.volume_turkish_lira,
            priceData.volume_lot,
            priceData.volatility,
            priceData.buying,
            priceData.selling
        ]
    );
}

export async function getPriceFromCache(code) {
    const db = await openDB();
    return await db.get("SELECT * FROM prices WHERE code = ?", [code]);
}

export async function getAllCachedPrices(exchange = null) {
    const db = await openDB();
    if (exchange) {
        return await db.all("SELECT * FROM prices WHERE exchange = ?", [exchange]);
    }
    return await db.all("SELECT * FROM prices");
}

// --- System Operations ---

export async function getLastUpdate() {
    const db = await openDB();
    return await db.get("SELECT updated_at FROM last_update ORDER BY updated_at DESC LIMIT 1");
}

export async function setLastUpdate(date) {
    const db = await openDB();
    await db.run(
        "INSERT INTO last_update (updated_at) VALUES (?)",
        date
    );
}


export async function seedPortfolio() {
    const db = await openDB();
    const count = await db.get("SELECT COUNT(*) as count FROM portfolio_holdings");

    if (count.count === 0) {
        const initialHoldings = [
            { code: "BIMAS", quantity: 9, avg_cost: 513.55 },
            { code: "KCHOL", quantity: 30, avg_cost: 172.51 },
            { code: "TUPRS", quantity: 8, avg_cost: 163.93 },
            { code: "EREGL", quantity: 44, avg_cost: 26.97 },
            { code: "AKBNK", quantity: 3, avg_cost: 63.4 },
            { code: "TOASO", quantity: 15, avg_cost: 255.54 },
            { code: "ASELS", quantity: 12, avg_cost: 204.88 },
            { code: "SISE", quantity: 18, avg_cost: 37.14 },
            { code: "ENKAI", quantity: 20, avg_cost: 69.12 },
            { code: "FROTO", quantity: 15, avg_cost: 100.15 },
            { code: "SAHOL", quantity: 23, avg_cost: 86.11 },
            { code: "ASTOR", quantity: 22, avg_cost: 102.39 },
            { code: "EBEBK", quantity: 73, avg_cost: 51.85 },
            { code: "TURSG", quantity: 21, avg_cost: 9.00 },
            { code: "TRCAS", quantity: 34, avg_cost: 36.28 },
            { code: "QUAGR", quantity: 5, avg_cost: 9.12 },
            { code: "OYAKC", quantity: 50, avg_cost: 22.36 },
            { code: "BIGCH", quantity: 11, avg_cost: 50.72 },
            { code: "GRA", quantity: 8.2, avg_cost: 5449.22 }
        ];

        for (const holding of initialHoldings) {
            await savePortfolioHolding(holding);
        }

        console.log("Portfolio seeded successfully with 18 holdings.");
    }
}
