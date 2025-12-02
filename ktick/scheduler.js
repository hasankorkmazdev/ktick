import cron from "node-cron";
import fetch from "node-fetch";
import * as repo from "./repository.js";

async function syncBistData() {
    try {
        const last = await repo.getLastUpdate();
        const now = new Date();

        if (last) {
            const lastDate = new Date(last.updated_at);
            const diffHours = (now - lastDate) / (1000 * 60 * 60);

            if (diffHours < 16) {
                console.log("BIST: 16 saatten az geçti, sync yapılmayacak.");
                return;
            }
        }

        console.log("BIST verisi senkronize ediliyor...");

        const url = "https://bigpara.hurriyet.com.tr/api/v1/hisse/list";
        const response = await fetch(url);
        const results = await response.json();

        const mapped = results.data.map(item => ({
            id: item.id,
            code: item.kod,
            name: item.ad,
            exchange: "BIST",
            type: "HISSE",
            icon: `https://cdn.jsdelivr.net/gh/ahmeterenodaci/Istanbul-Stock-Exchange--BIST--including-symbols-and-logos/logos/${item.kod.toUpperCase()}.png`
        }));

        console.log(`BIST: ${mapped.length} stocks found`);

        await repo.saveStocks(mapped, "BIST");
        await repo.setLastUpdate(now.toISOString());

        console.log("BIST verisi güncellendi!");
    } catch (err) {
        console.error("BIST Sync error:", err);
    }
}

async function syncBinanceData() {
    try {
        console.log("Binance verisi senkronize ediliyor...");

        const response = await fetch("https://api.binance.com/api/v3/exchangeInfo");
        const data = await response.json();

        const usdtPairs = data.symbols
            .filter((s) => s.quoteAsset === "TRY" && s.status === "TRADING")
            .map((s) => ({
                code: s.baseAsset,
                name: s.baseAsset + " / TRY",
                exchange: "BINANCE",
                type: "CryptoCurrency",
                icon: `https://cdn.jsdelivr.net/gh/vadimmalykhin/binance-icons/crypto/${s.baseAsset.toLowerCase()}.svg`
            }));

        console.log(`Binance: ${usdtPairs.length} pairs found`);

        await repo.saveStocks(usdtPairs, "BINANCE");

        console.log("Binance verisi güncellendi!");
    } catch (err) {
        console.error("Binance Sync error:", err);
    }
}

async function syncCurrencyAndCommodityData() {
    try {
        console.log("Döviz ve Emtia verisi senkronize ediliyor...");

        const response = await fetch("https://finans.truncgil.com/v4/today.json");
        const data = await response.json();

        const items = [];

        const currencyCodes = [
            "TRY", "USD", "EUR", "GBP", "CHF",
            "CAD", "RUB", "AED", "AUD",
            "DKK", "SEK", "NOK", "JPY",
            "KWD", "ZAR", "BHD", "LYD",
            "SAR", "IQD", "ILS", "IRR",
            "INR", "MXN", "HUF", "NZD",
            "BRL", "IDR", "CZK", "PLN",
            "RON", "CNY", "ARS", "ALL",
            "AZN", "BAM", "CLP", "COP",
            "CRC", "DZD", "EGP", "HKD",
            "ISK", "KRW", "KZT", "LBP",
            "LKR", "MAD", "MDL", "MKD",
            "MYR", "OMR", "PEN", "PHP",
            "PKR", "QAR", "RSD", "SGD",
            "SYP", "THB", "TWD", "UAH",
            "UYU", "GEL", "TND", "BGN"];

        // TRY'yi manuel ekle (API'de yok)
        items.push({
            code: "TRY",
            name: "Türk Lirası",
            exchange: "DOVIZ",
            type: "Currency",
            icon: "https://flagcdn.com/w40/tr.png"
        });

        for (const code of currencyCodes) {
            if (data[code] && data[code].Type === "Currency") {
                items.push({
                    code: code,
                    name: data[code].Name,
                    exchange: "DOVIZ",
                    type: "Currency",
                    icon: `https://flagcdn.com/w40/${code.toLowerCase().slice(0, 2)}.png`
                });
            }
        }

        const commodityMap = {
            "GRA": { name: "Gram Altın", type: "Gold", icon: "/images/xag.png" },
            "ONS": { name: "Ons Altın", type: "Gold", icon: "/images/ons.png" },
            "GUMUS": { name: "Gümüş", type: "Silver", icon: "/images/xau.png" },
            "HAS": { name: "Gram Has Altın", type: "Gold", icon: "/images/xag.png" },
            "CEYREKALTIN": { name: "Çeyrek Altın", type: "Gold", icon: "/images/xag.png" },
            "YARIMALTIN": { name: "Yarım Altın", type: "Gold", icon: "/images/xag.png" },
            "TAMALTIN": { name: "Tam Altın", type: "Gold", icon: "/images/xag.png" },
            "CUMHURIYETALTINI": { name: "Cumhuriyet Altını", type: "Gold", icon: "/images/xag.png" },
            "ATAALTIN": { name: "Ata Altın", type: "Gold", icon: "/images/xag.png" },
            "14AYARALTIN": { name: "14 Ayar Altın", type: "Gold", icon: "/images/xag.png" },
            "18AYARALTIN": { name: "18 Ayar Altın", type: "Gold", icon: "/images/xag.png" },
            "YIA": { name: "22 Ayar Bilezik", type: "Gold", icon: "/images/xag.png" },
            "IKIBUCUKALTIN": { name: "İkibuçuk Altın", type: "Gold", icon: "/images/xag.png" },
            "BESLIALTIN": { name: "Beşli Altın", type: "Gold", icon: "/images/xag.png" },
            "GREMSEALTIN": { name: "Gremse Altın", type: "Gold", icon: "/images/xag.png" },
            "RESATALTIN": { name: "Reşat Altın", type: "Gold", icon: "/images/xag.png" },
            "HAMITALTIN": { name: "Hamit Altın", type: "Gold", icon: "/images/xag.png" },
            "GPL": { name: "Gram Platin", type: "Platinum", icon: "/images/xau.png" },
            "PAL": { name: "Gram Paladyum", type: "Palladium", icon: "/images/xau.png" }
        };

        for (const [code, info] of Object.entries(commodityMap)) {
            if (data[code]) {
                items.push({
                    code: code,
                    name: info.name,
                    exchange: "EMTIA",
                    type: info.type,
                    icon: info.icon
                });
            }
        }

        await repo.saveStocks(items, "DOVIZ");
        await repo.saveStocks(items.filter(i => i.exchange === "EMTIA"), "EMTIA");

    } catch (err) {
        console.error("Döviz ve Emtia Sync error:", err);
    }
}

// Fetch BIST prices
async function fetchBistPrices() {
    try {
        const bistStocks = await repo.searchStocks("BIST", "");
        console.log(`📊 Fetching BIST prices for ${bistStocks.length} stocks...`);

        const batchSize = 150;
        let successCount = 0;

        for (let i = 0; i < bistStocks.length; i += batchSize) {
            const batch = bistStocks.slice(i, i + batchSize);
            const symbols = batch.map(s => s.code).join(",");

            const url = `https://api.getlaplace.com/api/v2/stock/stats?symbols=${symbols}&region=tr&api_key=${process.env.LAPLACE_API_KEY}`;

            try {
                const response = await fetch(url);
                if (!response.ok) continue;

                const data = await response.json();
                if (!Array.isArray(data)) continue;

                // 🔍 API veri setini code -> record map’ine dönüştür
                const map = new Map(
                    data.map(item => [item.symbol, item])
                );

                // 🔁 Batch içindeki her stock için code ile eşleşme yap
                for (const stock of batch) {
                    const stockRaw = map.get(stock.code);
                    if (!stockRaw) continue;

                    const priceData = {
                        code: stock.code,
                        name: stock.name,
                        exchange: "BIST",
                        icon: stock.icon,
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
                        buying: stockRaw.latestPrice,
                        selling: stockRaw.latestPrice
                    };
                    console.log("BİST")

                    await repo.savePrice(priceData);
                    successCount++;
                }

            } catch (error) {
                // Batch hatası — sessiz geç
            }
        }

        console.log(`✅ BIST: Cached ${successCount}/${bistStocks.length} prices`);
    } catch (error) {
        console.error("Error in fetchBistPrices:", error);
    }
}


async function fetchBinancePrices() {
    try {
        // DB'den tüm Binance stoklarını çek
        const binanceStocks = await repo.searchStocks("BINANCE", "");
        console.log(`📊 Fetching BINANCE prices for ${binanceStocks.length} stocks...`);

        // Binance'ten tek seferde tüm ticker'lar
        const response = await fetch("https://api.binance.com/api/v3/ticker/24hr");
        if (!response.ok) throw new Error("Failed to fetch Binance ticker data");
        const allData = await response.json();

        // TRY çiftlerini filtrele
        const tryData = allData.filter(item => item.symbol.endsWith("TRY"));

        // Stock listemizi Map'e çevir, hızlı eşleştirme için
        const stockMap = new Map();
        for (const stock of binanceStocks) {
            stockMap.set(stock.code.toUpperCase(), stock);
        }

        let successCount = 0;

        for (const data of tryData) {
            const code = data.symbol.replace("TRY", "");
            const stock = stockMap.get(code);
            if (!stock) continue; // DB'de olmayanları atla

            const priceData = {
                code: code,
                name: stock.name,
                exchange: "BINANCE",
                icon: stock.icon,
                open: Number(data.openPrice),
                close: Number(data.prevClosePrice),
                high: Number(data.highPrice),
                low: Number(data.lowPrice),
                last: Number(data.lastPrice),
                daily_change_price: Number(data.priceChange),
                daily_change_percent: Number(data.priceChangePercent),
                volume_turkish_lira: Number(data.quoteVolume),
                volume_lot: Number(data.volume),
                volatility: 0,
                buying: Number(data.bidPrice),
                selling: Number(data.askPrice)
            };

            // DB'ye kaydet
            await repo.savePrice(priceData);
            successCount++;
        }

        console.log(`✅ BINANCE: Cached ${successCount}/${binanceStocks.length} prices`);
    } catch (error) {
        console.error("Error in fetchBinancePrices:", error);
    }
}


// Fetch DOVIZ and EMTIA prices (they use the same API)
async function fetchDovizEmtiaPrices() {
    try {
        const dovizStocks = await repo.searchStocks("DOVIZ", "");
        const emtiaStocks = await repo.searchStocks("EMTIA", "");
        const allStocks = [...dovizStocks, ...emtiaStocks];

        console.log(`📊 Fetching DOVIZ/EMTIA prices for ${allStocks.length} items...`);
        let successCount = 0;

        // Fetch once from Truncgil API
        const url = "https://finans.truncgil.com/v4/today.json";
        const response = await fetch(url);

        if (response.ok) {
            const data = await response.json();

            // TRY için manuel fiyat ekle (API'de yok)
            const tryStock = allStocks.find(s => s.code === "TRY");
            if (tryStock) {
                const tryPriceData = {
                    code: "TRY",
                    name: tryStock.name,
                    exchange: "DOVIZ",
                    icon: tryStock.icon,
                    open: null,
                    close: null,
                    high: 1.00,
                    low: 1.00,
                    last: 1.00,
                    daily_change_price: 0,
                    daily_change_percent: 0,
                    volume_turkish_lira: null,
                    volume_lot: null,
                    volatility: 0,
                    buying: 1.00,
                    selling: 1.00
                };
                await repo.savePrice(tryPriceData);
                successCount++;
            }

            for (const stock of allStocks) {
                try {
                    const code = stock.code;

                    // TRY'yi atla, zaten yukarıda ekledik
                    if (code === "TRY") continue;

                    const item = data[code];

                    if (item) {
                        const priceData = {
                            code: code,
                            name: stock.name,
                            exchange: stock.exchange,
                            icon: stock.icon,
                            open: null,
                            close: null,
                            high: item.Yuksek || null,
                            low: item.Dusuk || null,
                            last: (item.Buying + item.Selling) / 2,
                            daily_change_price: item.Change || 0,
                            daily_change_percent: item.Change || 0,
                            volume_turkish_lira: null,
                            volume_lot: null,
                            volatility: 0,
                            buying: item.Buying,
                            selling: item.Selling
                        };
                        console.log("EMTİA")
                        await repo.savePrice(priceData);
                        successCount++;
                    }
                } catch (error) {
                    // Silently skip individual errors
                }
            }
        }

        console.log(`✅ DOVIZ/EMTIA: Cached ${successCount}/${allStocks.length} prices`);
    } catch (error) {
        console.error("Error in fetchDovizEmtiaPrices:", error);
    }
}

// Main function that calls all three in parallel
async function fetchAndCachePrices() {
    console.log("🔄 Starting price update cycle...");
    await Promise.all([
        fetchBistPrices(),
        fetchBinancePrices(),
        fetchDovizEmtiaPrices()
    ]);
    console.log("✅ Price update cycle completed!");
}

async function initialSync() {
    await syncBistData();
    await syncBinanceData();
    await syncCurrencyAndCommodityData();
    console.log("Initial data sync completed!");
}

export function startSchedulers() {
    initialSync();

    // Daily sync at 5:00 AM
    cron.schedule("0 5 * * *", async () => {
        console.log("Running daily sync...");
        await syncBistData();
        await syncBinanceData();
        await syncCurrencyAndCommodityData();
    });

    // Price fetching every 10 seconds
    setInterval(async () => {
        await fetchAndCachePrices();
    }, 300 * 1000);

    // Initial price fetch after 2 seconds
    setTimeout(() => {
        fetchAndCachePrices();
    }, 2000);

    console.log("Schedulers started! Prices will update every 10 seconds.");
}
