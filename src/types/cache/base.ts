export interface CacheRecord<T> {
    data: T;
    created_at: string;
    updated_at: string;
    expires_at: string;
}

export interface StorageAdapter {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
    clear?(): void;
    keys?(): string[];
}

export interface CacheConfig {
    enable?: boolean;
    ttl?: number;
    maxEntries?: number;
    storage?: StorageAdapter;
    cleanupInterval?: number;
    autoCleanup?: boolean;
}