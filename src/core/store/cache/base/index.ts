import type { CacheConfig, CacheRecord, StorageAdapter } from "../../../../types/cache/base.js";
import { getDefaultStorage } from "../../storage/index.js";
import { parseCacheRecord } from "../../../../helpers/fn.js"

function hasUnref(timer: unknown): timer is { unref: () => void } {
    return (
        typeof timer === "object" &&
        timer !== null &&
        "unref" in timer &&
        typeof (timer as { unref?: unknown }).unref === "function"
    );
}

export class CacheClient {
    private readonly ttl: number;
    private readonly maxEntries: number;
    private readonly storage: StorageAdapter;
    private cleanupTimer?: ReturnType<typeof setInterval>;
    private readonly enabled: boolean;

    constructor(config: CacheConfig = {}) {
        this.enabled = !!config.enabled;
        this.ttl = config.ttl ?? 60_000;
        this.maxEntries = config.maxEntries ?? 500;
        this.storage = getDefaultStorage(config.storage);

        if (this.enabled && config.autoCleanup !== false) {
            const interval = config.cleanupInterval ?? 30_000;

            this.cleanupTimer = setInterval(() => {
                this.cleanupExpired();
            }, interval);

            if (hasUnref(this.cleanupTimer)) {
                this.cleanupTimer.unref();
            }
        }
    }

    set<T = unknown>(key: string, value: T, customTTL?: number): CacheRecord<T> {
        const now = new Date();
        const ttl = customTTL ?? this.ttl;

        const record: CacheRecord<T> = {
            data: value,
            created_at: now.toISOString(),
            updated_at: now.toISOString(),
            expires_at: new Date(now.getTime() + ttl).toISOString(),
        };

        if (!this.enabled) return record;

        this.storage.setItem(key, JSON.stringify(record));

        this.enforceLRU();

        return record;
    }

    get<T = unknown>(key: string): CacheRecord<T> | null {
        if (!this.enabled) return null;

        const raw = this.storage.getItem(key);

        const record = parseCacheRecord<T>(raw);

        if (!record) {
            this.storage.removeItem(key);
            return null;
        }

        if (this.isExpired(record)) {
            this.storage.removeItem(key);
            return null;
        }

        return record;
    }

    has(key: string): boolean {
        return this.get(key) !== null;
    }

    delete(key: string): void {
        if (!this.enabled) return;
        this.storage.removeItem(key);
    }

    deleteByPrefix(prefix: string): void {
        if (!this.enabled) return;

        const keys = this.storage.keys?.() ?? [];
        for (const key of keys) {
            if (key.startsWith(prefix)) {
                this.storage.removeItem(key);
            }
        }
    }

    clear(): void {
        this.storage.clear?.();
    }

    destroy(): void {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
        }

        this.clear();
    }

    remainingTTL(key: string): number | null {
        const record = this.get(key);

        if (!record) return null;

        const remaining = new Date(record.expires_at).getTime() - Date.now();

        return remaining > 0 ? remaining : null;
    }

    touch<T = unknown>(key: string, customTTL?: number): boolean {
        const record = this.get<T>(key);

        if (!record) return false;

        this.set<T>(key, record.data, customTTL);

        return true;
    }

    keys(): string[] {
        this.cleanupExpired();
        return this.storage.keys?.() ?? [];
    }

    size(): number {
        return this.keys().length;
    }

    private isExpired<T = unknown>(record: CacheRecord<T>): boolean {
        return Date.now() >= new Date(record.expires_at).getTime();
    }

    private cleanupExpired<T = unknown>(): void {
        if (!this.enabled) return;

        const keys = this.storage.keys?.() ?? [];

        for (const key of keys) {
            const raw = this.storage.getItem(key);

            const record = parseCacheRecord<T>(raw);

            if (!record || this.isExpired(record)) {
                this.storage.removeItem(key);
            }
        }
    }

    private enforceLRU(): void {
        const keys = this.storage.keys?.() ?? [];

        while (keys.length > this.maxEntries) {
            const oldestKey = keys[0];

            if (!oldestKey) break;

            this.storage.removeItem(oldestKey);
            keys.shift();
        }
    }
}
