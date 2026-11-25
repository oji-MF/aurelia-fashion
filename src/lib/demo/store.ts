import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createSeedData, type DemoStore } from "./seed-data";

// Vercel's serverless filesystem is read-only except for os.tmpdir().
// Local development writes to ./.data (gitignored) so state survives restarts.
const DATA_DIR = process.env.VERCEL
  ? path.join(os.tmpdir(), "aurelia-demo")
  : path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "store.json");

let cache: DemoStore | null = null;

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function getStore(): DemoStore {
  if (cache) return cache;
  ensureDir();
  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, "utf8");
      cache = JSON.parse(raw) as DemoStore;
      return cache;
    }
  } catch {
    // Corrupt store — rebuild from seed.
  }
  cache = createSeedData();
  saveStore(cache);
  return cache;
}

export function saveStore(store: DemoStore) {
  ensureDir();
  cache = store;
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), "utf8");
}

/** Mutate the demo store atomically (single-process) and persist. */
export function mutateStore<T>(fn: (store: DemoStore) => T): T {
  const store = getStore();
  const result = fn(store);
  saveStore(store);
  return result;
}

export function resetStore() {
  cache = createSeedData();
  saveStore(cache);
  return cache;
}
