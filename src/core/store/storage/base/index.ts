import { StorageAdapter } from "../../../../types/index.js";

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

function getStorage(storage?: StorageAdapter): StorageAdapter {
    if (storage) return storage;
    else if (typeof window !== "undefined" && "localStorage" in window) return window.localStorage;
    else return new MemoryStorage();
}

export { getStorage, MemoryStorage }