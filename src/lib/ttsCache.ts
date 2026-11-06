"use client";

export const TTS_CACHE_VERSION = 1;

const DB_NAME = "taskmanager-tts";
const DB_VERSION = 1;
const STORE_NAME = "segments";
const MEMORY_MAX_BYTES = 20 * 1024 * 1024;
const INDEXEDDB_MAX_BYTES = 50 * 1024 * 1024;
const INDEXEDDB_MAX_ENTRIES = 500;
const SEGMENT_TTL_MS = 60 * 24 * 60 * 60 * 1000;
const TOUCH_INTERVAL_MS = 60 * 60 * 1000;
const EVICTION_INTERVAL_MS = 60 * 1000;

export interface TtsCacheEntry {
  id: string;
  text: string;
  blob: Blob;
  bytes: number;
  createdAt: number;
  lastUsedAt: number;
}

const memory = new Map<string, TtsCacheEntry>();
let memoryBytes = 0;
let dbPromise: Promise<IDBDatabase | null> | null = null;
let lastEvictionAt = 0;
let cacheEpoch = 0;

function openDb(): Promise<IDBDatabase | null> {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return Promise.resolve(null);
  }
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve) => {
    let request: IDBOpenDBRequest;
    try {
      request = indexedDB.open(DB_NAME, DB_VERSION);
    } catch {
      dbPromise = null;
      resolve(null);
      return;
    }

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("lastUsedAt", "lastUsedAt", { unique: false });
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => {
        db.close();
        dbPromise = null;
      };
      resolve(db);
    };

    request.onerror = () => {
      dbPromise = null;
      resolve(null);
    };

    request.onblocked = () => {
      dbPromise = null;
      resolve(null);
    };
  });

  return dbPromise;
}

function memorySet(entry: TtsCacheEntry) {
  const existing = memory.get(entry.id);
  if (existing) memoryBytes -= existing.bytes;

  memory.set(entry.id, entry);
  memoryBytes += entry.bytes;

  while (memoryBytes > MEMORY_MAX_BYTES && memory.size > 1) {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, value] of memory) {
      if (value.lastUsedAt < oldestTime) {
        oldestTime = value.lastUsedAt;
        oldestKey = key;
      }
    }

    if (!oldestKey) break;
    const removed = memory.get(oldestKey);
    if (removed) memoryBytes -= removed.bytes;
    memory.delete(oldestKey);
  }
}

export async function getTtsSegment(
  id: string
): Promise<TtsCacheEntry | null> {
  const inMemory = memory.get(id);
  if (inMemory) {
    const now = Date.now();
    const shouldPersistTouch = now - inMemory.lastUsedAt > TOUCH_INTERVAL_MS;
    inMemory.lastUsedAt = now;
    if (shouldPersistTouch) void touchTtsSegment(id, now);
    return inMemory;
  }

  const db = await openDb();
  if (!db) return null;

  const entry = await new Promise<TtsCacheEntry | null>((resolve) => {
    try {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const request = transaction.objectStore(STORE_NAME).get(id);
      request.onsuccess = () => {
        resolve((request.result as TtsCacheEntry | undefined) ?? null);
      };
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });

  if (!entry) return null;

  const now = Date.now();
  const shouldPersistTouch = now - entry.lastUsedAt > TOUCH_INTERVAL_MS;
  entry.lastUsedAt = now;
  memorySet(entry);
  if (shouldPersistTouch) void touchTtsSegment(entry.id, now);
  return entry;
}

export async function touchTtsSegment(
  id: string,
  lastUsedAt = Date.now()
): Promise<void> {
  const db = await openDb();
  if (!db) return;

  await new Promise<void>((resolve) => {
    try {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        const entry = request.result as TtsCacheEntry | undefined;
        if (entry) {
          entry.lastUsedAt = lastUsedAt;
          store.put(entry);
        }
      };

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => resolve();
      transaction.onabort = () => resolve();
    } catch {
      resolve();
    }
  });
}

function writeEntry(
  db: IDBDatabase,
  entry: TtsCacheEntry
): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).put(entry);
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => resolve(false);
      transaction.onabort = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

export async function putTtsSegment(entry: TtsCacheEntry): Promise<void> {
  const epoch = cacheEpoch;
  memorySet(entry);

  const db = await openDb();
  if (!db || epoch !== cacheEpoch) return;

  const stored = await writeEntry(db, entry);
  if (!stored) {
    await evictTtsCache(true);
    const retried = await writeEntry(db, entry);
    if (!retried) {
      console.warn("[TTS] No se pudo guardar el segmento en IndexedDB");
      return;
    }
  }

  void evictTtsCache();
}

export async function evictTtsCache(force = false): Promise<void> {
  const now = Date.now();
  if (!force && now - lastEvictionAt < EVICTION_INTERVAL_MS) return;
  lastEvictionAt = now;

  const db = await openDb();
  if (!db) return;

  await new Promise<void>((resolve) => {
    try {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const entries = (request.result as TtsCacheEntry[]) ?? [];
        let totalBytes = entries.reduce((sum, entry) => sum + entry.bytes, 0);
        let totalEntries = entries.length;

        const oldestFirst = [...entries].sort(
          (a, b) => a.lastUsedAt - b.lastUsedAt
        );

        for (const entry of oldestFirst) {
          const expired = now - entry.lastUsedAt > SEGMENT_TTL_MS;
          const overLimit =
            totalEntries > INDEXEDDB_MAX_ENTRIES ||
            totalBytes > INDEXEDDB_MAX_BYTES;

          if (expired || overLimit) {
            store.delete(entry.id);
            totalBytes -= entry.bytes;
            totalEntries -= 1;
          }
        }
      };

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => resolve();
      transaction.onabort = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function clearTtsCache(): Promise<void> {
  cacheEpoch += 1;
  lastEvictionAt = 0;
  memory.clear();
  memoryBytes = 0;

  const db = await openDb();
  if (!db) return;

  await new Promise<void>((resolve) => {
    try {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).clear();
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => resolve();
      transaction.onabort = () => resolve();
    } catch {
      resolve();
    }
  });
}
