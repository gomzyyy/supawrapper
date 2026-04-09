import type { CacheConfig } from "../../../types/cache/base.js";
import { type ZodSchema } from "zod";

export interface SoftDeleteConfig {
  timestampKey?: string | null;
  flagKey?: string | null;
}

export interface HintsConfig {
  includeTableMetadata?: boolean;
  includeRawResults?: boolean;
  includeArguments?: boolean;
}

export interface DebugConfig {
  returnHintsOnError?: boolean;
  hintsConfig?: HintsConfig;
}
export interface TimeStampConfig {
  createdAtKey?: string;
  updatedAtKey?: string;
}

export interface TimestampsConfig {
  /**
   * Automatically updates timestamps (created_at / updated_at)
   * Default behavior: Supabase-compatible ISO string dates
   */
  autoTimestamps?: boolean;
  config?: TimeStampConfig;
}

export interface TableBehaviour<Schema = unknown> {
  timestamps?: TimestampsConfig;

  uniqueIdentifiers?: string[]

  validator?: {
    enabled?: boolean;
    schema?: ZodSchema<Schema>;
  };

  supportsSoftDeletion?: boolean;
  softDeleteConfig?: SoftDeleteConfig;

  debug?: DebugConfig;

  cachingStrategy?: CacheConfig;

  // new addition
  presets?: {
    isActiveKey?: string;
    userIdKey?: string;
  }
}
export interface BucketBehaviour {
  debug?: DebugConfig;
}
