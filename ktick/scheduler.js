import cron from "node-cron";
import fetch from "node-fetch";
import { openDB } from "./db.js";

async function syncBistData() {
    try {
        const db = await openDB();

        // Son sync kontrolü
        const last = await db.get("SELECT updated_at FROM last_update ORDER BY updated_at DESC LIMIT 1");
        const now = new Date();
        console.log(last)
        if (last) {
            const lastDate = new Date(last.updated_at);
            const diffHours = (now - lastDate) / (1000 * 60 * 60);
            console.log(lastDate)
            if (diffHours < 16) {
                console.log("16 saatten az geçti, sync yapılmayacak.");
                return;
            }
        }

        console.log("BIST verisi senkronize ediliyor...");

        const url = "https://bigpara.hurriyet.com.tr/api/v1/hisse/list";
        const response = await fetch(url);
        const results = await response.json();
        
        // Asıl array => results.data
        const mapped = results.data.map(item => ({
            id: item.id,
            code: item.kod,
            name: item.ad,
            exchange: "BIST",
            type: "HISSE",
            icon: `https://cdn.jsdelivr.net/gh/ahmeterenodaci/Istanbul-Stock-Exchange--BIST--including-symbols-and-logos/logos/${item.kod.toUpperCase()}.png`
        }));
        
        console.log(mapped);
        
        await db.exec("DELETE FROM stocks");
        
        const stmt = await db.prepare(`
            INSERT INTO stocks (code, name, exchange, type, icon)
            VALUES (?, ?, ?, ?, ?)
        `);
        
        for (const item of mapped) {
            await stmt.run(
                item.code,
                item.name,
                item.exchange,
                item.type,
                item.icon
            );
        }
        
        await stmt.finalize();
        
        await db.run(
            "INSERT INTO last_update (updated_at) VALUES (?)",
            now.toISOString()
        );

        console.log("BIST verisi güncellendi!");
    } catch (err) {
        console.error("Sync error:", err);
    }
}

// Nodemon veya uygulama restart olsa bile tek seferlik sync
syncBistData();

// Cron: her gün sabah 5:00'te kontrol
cron.schedule("0 5 * * *", async () => {
    await syncBistData();
});
