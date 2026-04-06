import { TableBehaviour } from "../../../types/index.js";

export function getDefaultTableBehaviour<T>(): TableBehaviour<T> {
    return {
        timestamps: {
            autoTimestamps: true,
            config: {
                createdAtKey: "created_at",
                updatedAtKey: "updated_at",
            },
        },
        uniqueIdentifiers: ["id"],
        validator: {
            enabled: false,
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
    }
}