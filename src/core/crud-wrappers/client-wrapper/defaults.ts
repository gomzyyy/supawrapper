import { TableBehaviour } from "@/types/index.js";

export const defaultTableBehaviour: TableBehaviour = {
    timestamps: {
        autoTimestamps: true,
        config: {
            createdAtKey: "created_at",
            updatedAtKey: null,
        },
    },
    validator: {
        enabled: false,
        schema: null
    },
    supportsSoftDeletion: false,
    softDeleteConfig: {
        timestampKey: "deleted_at",
        flagKey: "is_deleted",
    },
    debug: {
        returnHintsOnError: true,
        hintsConfig: {
            includeTableMetadata: true,
            includeRawResults: true,
            includeArguments: true,
        },
    },
};