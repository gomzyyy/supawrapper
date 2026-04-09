import { ClientWrapper } from "../index.js";
import type { TableBehaviour, SupabaseClientAdapter } from "../../../../types/index.js";

export class Presets<T, TClient extends SupabaseClientAdapter> {
    constructor(private client: ClientWrapper<T, TClient>, private readonly behaviour: TableBehaviour) { }

    /**
     * Retrieves all "active" records.
     * 
     * @configuration Requires `presets.isActiveKey` to be configured in TableBehaviour.
     * @db Expected DB column type: `boolean` (compares key === true).
     */
    active() {
        if (!this.behaviour.presets?.isActiveKey) {
            throw new Error("isActiveKey is not enabled/configured for this table.");
        }
        return this.client.get({ eq: [{ key: this.behaviour?.presets?.isActiveKey as keyof T, value: true as T[keyof T] }] });
    }

    /**
     * Retrieves the most recently created records.
     * 
     * @param limit - Maximum number of records to return (default: 10).
     * @configuration Requires `timestamps.config.createdAtKey` to be configured.
     * @db Expected DB column type: `Timestamp` / `Timestamptz`. Sorts descending.
     */
    recent(limit = 10) {
        if (!this.behaviour.timestamps?.config?.createdAtKey) {
            throw new Error("Timestamps are not enabled/configured for this table.");
        }
        return this.client.get({ sortBy: this.behaviour.timestamps?.config?.createdAtKey as keyof T, orderBy: "dec", limit });
    }

    /**
     * Retrieves all records belonging to a specific user.
     * 
     * @param userId - The ID of the user to match.
     * @configuration Requires `presets.userIdKey` to be configured in TableBehaviour.
     * @db Expected DB column type: `UUID` or `String` (matches exact ID).
     */
    byUser(userId: string) {
        if (!this.behaviour.presets?.userIdKey) {
            throw new Error("userIdKey is not enabled/configured for this table.");
        }
        return this.client.get({ eq: [{ key: this.behaviour?.presets?.userIdKey as keyof T, value: userId as T[keyof T] }] });
    }

    /**
     * Retrieves all "inactive" records.
     * 
     * @param limit - Maximum number of records to return (default: 10).
     * @configuration Requires `presets.isActiveKey` to be configured in TableBehaviour.
     * @db Expected DB column type: `boolean` (compares key === false).
     */
    inactive(limit: number = 10) {
        if (!this.behaviour.presets?.isActiveKey) {
            throw new Error("isActiveKey is not enabled/configured for this table.");
        }
        return this.client.get({ eq: [{ key: this.behaviour?.presets?.isActiveKey as keyof T, value: false as T[keyof T] }], limit });
    }

    /**
     * Retrieves all soft-deleted records.
     * 
     * @param limit - Maximum number of records to return (default: 10).
     * @configuration Requires `supportsSoftDeletion` mapped accurately to `softDeleteConfig.flagKey`.
     * @db Expected DB column type: `boolean` (compares flagKey === true).
     */
    deleted(limit: number = 10) {
        if (!this.behaviour.supportsSoftDeletion || !this.behaviour.softDeleteConfig?.flagKey) {
            throw new Error("Soft deletion is not enabled/configured for this table.");
        }
        return this.client.get({ eq: [{ key: this.behaviour.softDeleteConfig.flagKey as keyof T, value: true as T[keyof T] }], limit });
    }

    /**
     * Retrieves the most recently updated records.
     * 
     * @param limit - Maximum number of records to return (default: 10).
     * @configuration Requires `timestamps.config.updatedAtKey` to be configured.
     * @db Expected DB column type: `Timestamp` / `Timestamptz`. Sorts descending.
     */
    recentlyUpdated(limit = 10) {
        if (!this.behaviour.timestamps?.config?.updatedAtKey) {
            throw new Error("Updated timestamp is not enabled/configured for this table.");
        }
        return this.client.get({ sortBy: this.behaviour.timestamps.config.updatedAtKey as keyof T, orderBy: "dec", limit });
    }

    /**
     * Retrieves records created within the last specified number of days.
     * 
     * @param days - Integer representing the number of days back to search.
     * @configuration Requires `timestamps.config.createdAtKey` to be configured.
     * @db Expected DB column type: `Timestamp` / `Timestamptz` (compares ISO string `>= cutoff`).
     */
    createdWithin(days: number) {
        if (!this.behaviour.timestamps?.config?.createdAtKey) {
            throw new Error("Timestamps are not enabled/configured for this table.");
        }
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);

        return this.client.get({
            gte: [{ key: this.behaviour.timestamps.config.createdAtKey as keyof T, value: cutoff.toISOString() as T[keyof T] }],
            sortBy: this.behaviour.timestamps.config.createdAtKey as keyof T,
            orderBy: "dec",
        });
    }

    /**
     * Retrieves records belonging to multiple users.
     * 
     * @param userIds - Array of user IDs.
     * @configuration Requires `presets.userIdKey` to be configured in TableBehaviour.
     * @db Expected DB column type: `UUID` or `String` (uses an SQL `IN` array match).
     */
    byUsers(userIds: string[]) {
        if (!this.behaviour.presets?.userIdKey) {
            throw new Error("userIdKey is not enabled/configured for this table.");
        }
        return this.client.get({
            inValue: { key: this.behaviour?.presets?.userIdKey as keyof T, value: userIds as T[keyof T][] },
        });
    }

    /**
     * Counts the total number of "active" records.
     * 
     * @configuration Requires `presets.isActiveKey` to be configured in TableBehaviour.
     * @db Expected DB column type: `boolean` (counts where key === true).
     */
    countActive() {
        if (!this.behaviour.presets?.isActiveKey) {
            throw new Error("isActiveKey is not enabled/configured for this table.");
        }
        return this.client.count({ eq: [{ key: this.behaviour?.presets?.isActiveKey as keyof T, value: true as T[keyof T] }] });
    }

    /**
     * Counts the total number of soft-deleted records.
     * 
     * @configuration Requires `supportsSoftDeletion` and `softDeleteConfig.flagKey`.
     * @db Expected DB column type: `boolean` (counts where flagKey === true).
     */
    countDeleted() {
        if (!this.behaviour.supportsSoftDeletion || !this.behaviour.softDeleteConfig?.flagKey) {
            throw new Error("Soft deletion is not enabled/configured for this table.");
        }
        return this.client.count({ eq: [{ key: this.behaviour.softDeleteConfig.flagKey as keyof T, value: true as T[keyof T] }] });
    }
}