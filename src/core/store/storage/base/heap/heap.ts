import type { StorageAdapter } from "../../../../../types/index.js";

/**
 * In-memory storage adapter for caching data in RAM.
 *
 * This adapter stores all data in a JavaScript `Map` object, providing:
 * - Fast read/write operations (O(1) average time complexity)
 * - No disk I/O or network latency
 * - Data is lost when the application restarts
 *
 * This is the default storage implementation used when no specific
 * storage adapter is provided.
 *
 * @example
 * ```ts
 * import { MemoryStorage } from "supabase-wrapper/core";
 *
 * const storage = new MemoryStorage();
 * storage.setItem("user_id", "123");
 * const userId = storage.getItem("user_id"); // "123"
 * ```
 */

class MemoryStorage implements StorageAdapter {
    private store = new Map<string, string>();

    getItem(key: string): string | null {
        return this.store.get(key) ?? null;
    }

    setItem(key: string, value: string): void {
        this.store.set(key, value);
    }

    removeItem(key: string): void {
        this.store.delete(key);
    }

    clear(): void {
        this.store.clear();
    }

    keys(): string[] {
        return Array.from(this.store.keys());
    }
}

function getDefaultStorage(storage?: StorageAdapter): StorageAdapter {
    if (storage) return storage;
    else return new MemoryStorage();
}

export { MemoryStorage, getDefaultStorage }