import sqlite3 from "sqlite3";
import { open } from "sqlite";

// DB açma
export async function openDB() {
  return open({
    filename: "./ktick.db",
    driver: sqlite3.Database
  });
}

export async function initDB() {
  const db = await openDB();

  await db.exec(`
      CREATE TABLE IF NOT EXISTS stocks (
        id INTEGER PRIMARY KEY,
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        exchange TEXT NOT NULL,
        type TEXT NOT NULL,
        icon TEXT NOT NULL
      )
    `);

  await db.exec(`
      CREATE TABLE IF NOT EXISTS last_update (
        id INTEGER PRIMARY KEY,
        updated_at TIMESTAMP
      )
    `);

  await db.exec(`
      DROP TABLE IF EXISTS transactions;
    `);

  await db.exec(`
      CREATE TABLE IF NOT EXISTS portfolio_holdings (
        code TEXT PRIMARY KEY,
        quantity REAL NOT NULL,
        avg_cost REAL NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

  await db.exec(`
      CREATE TABLE IF NOT EXISTS prices (
        code TEXT PRIMARY KEY,
        name TEXT,
        exchange TEXT NOT NULL,
        icon TEXT,
        open REAL,
        close REAL,
        high REAL,
        low REAL,
        last REAL,
        daily_change_price REAL,
        daily_change_percent REAL,
        volume_turkish_lira REAL,
        volume_lot REAL,
        volatility REAL,
        buying REAL,
        selling REAL,
        last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

  await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_prices_exchange ON prices(exchange);
    `);
}