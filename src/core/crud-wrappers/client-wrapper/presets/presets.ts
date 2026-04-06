import { ClientWrapper } from "../index.js";
import type { TableBehaviour } from "../../../../types/index.js";

export class Presets<T> {
    constructor(private client: ClientWrapper<T>, private readonly behaviour: TableBehaviour) { }

    // Existing presets
    active() {
        return this.client.get({ eq: [{ key: "is_active" as keyof T, value: true as T[keyof T] }] });
    }

    recent(limit = 10) {
        if (!this.behaviour.timestamps?.config?.createdAtKey) {
            throw new Error("Timestamps are not enabled/configured for this table.");
        }
        return this.client.get({ sortBy: this.behaviour.timestamps?.config?.createdAtKey as keyof T, orderBy: "dec", limit });
    }

    byUser(userId: string) {
        return this.client.get({ eq: [{ key: "user_id" as keyof T, value: userId as T[keyof T] }] });
    }

    // ✅ New useful presets

    // All inactive records
    inactive() {
        return this.client.get({ eq: [{ key: "is_active" as keyof T, value: false as T[keyof T] }] });
    }

    // Soft-deleted records (requires supportsSoftDeletion)
    deleted() {
        if (!this.behaviour.supportsSoftDeletion || !this.behaviour.softDeleteConfig?.flagKey) {
            throw new Error("Soft deletion is not enabled/configured for this table.");
        }
        return this.client.get({ eq: [{ key: this.behaviour.softDeleteConfig.flagKey as keyof T, value: true as T[keyof T] }] });
    }

    // Recently updated records (requires updatedAtKey)
    recentlyUpdated(limit = 10) {
        if (!this.behaviour.timestamps?.config?.updatedAtKey) {
            throw new Error("Updated timestamp is not enabled/configured for this table.");
        }
        return this.client.get({ sortBy: this.behaviour.timestamps.config.updatedAtKey as keyof T, orderBy: "dec", limit });
    }

    // Records created within the last X days
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

    // Example: records belonging to multiple users
    byUsers(userIds: string[]) {
        return this.client.get({
            inValue: { key: "user_id" as keyof T, value: userIds as T[keyof T][] },
        });
    }

    // Count active records shortcut
    countActive() {
        return this.client.count({ eq: [{ key: "is_active" as keyof T, value: true as T[keyof T] }] });
    }

    // Count soft-deleted records shortcut
    countDeleted() {
        if (!this.behaviour.supportsSoftDeletion || !this.behaviour.softDeleteConfig?.flagKey) {
            throw new Error("Soft deletion is not enabled/configured for this table.");
        }
        return this.client.count({ eq: [{ key: this.behaviour.softDeleteConfig.flagKey as keyof T, value: true as T[keyof T] }] });
    }
}