import type { CacheRecord, JSDataType } from "../types/index.js"

export function getDataType(value: unknown): JSDataType {
  if (value === null) return "null"
  if (typeof value === 'string' && value.trim().length === 0) return "emptystrings" as JSDataType
  return typeof value as JSDataType
}

export function isValidCacheRecord<T>(value: unknown): value is CacheRecord<T> {
  if (!value || typeof value !== "object") return false;

  const obj = value as Record<string, unknown>;

  return (
    "data" in obj &&
    typeof obj.created_at === "string" &&
    typeof obj.updated_at === "string" &&
    typeof obj.expires_at === "string"
  );
}

export function parseCacheRecord<T>(raw: string | null): CacheRecord<T> | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);

    if (!isValidCacheRecord<T>(parsed)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}