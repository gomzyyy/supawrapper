import { ZodSchema } from "zod";

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
  // Auto-handled fields like timestamps, userId, etc.
  timestamps?: TimestampsConfig;

  // Validation options
  validator?: {
    enabled?: boolean;
    schema?: ZodSchema<Schema>;
  };

  // Soft deletion
  supportsSoftDeletion?: boolean;
  softDeleteConfig?: SoftDeleteConfig;

  // Debugging
  debug?: DebugConfig;
}
export interface BucketBehaviour {
  debug?: DebugConfig;
}
