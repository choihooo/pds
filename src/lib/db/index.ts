import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

function createDb() {
  const url = process.env.TURSO_DB_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) {
    throw new Error("TURSO_DB_URL and TURSO_AUTH_TOKEN must be set");
  }
  return drizzle(createClient({ url, authToken }));
}

let _db: ReturnType<typeof createDb> | null = null;

export function getDb() {
  if (!_db) _db = createDb();
  return _db;
}
