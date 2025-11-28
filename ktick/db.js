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
}