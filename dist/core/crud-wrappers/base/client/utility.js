import { APIResponse } from "../../../response/index.js";
import { BaseError, ValidationError } from "../../../errors/index.js";
import { Flag, } from "../../../../types/index.js";
import { validator } from "../../../../helpers/index.js";
import { SupawrapperClient } from "../../../base-client/index.js";
const { amend: { deleteUnwantedValues }, } = validator;
export class UtilityMethods extends SupawrapperClient {
    constructor(supabase, tableName, behaviour = {
        supportsSoftDeletion: true,
        softDeleteConfig: {
            flagKey: "is_deleted",
            timestampKey: "deleted_at",
        },
        debug: {
            returnHintsOnError: false,
        },
    }) {
        super(supabase, tableName, behaviour);
    }
    getDebugLogs(metaData) {
        if (this.behaviour.debug?.returnHintsOnError) {
            return {
                ...metaData,
                table: this.tableName,
                tableBehaviour: this.behaviour,
            };
        }
        return null;
    }
    async withLoading(cbs, cb) {
        cbs?.onLoadingStateChange?.(true);
        try {
            return await cb();
        }
        finally {
            cbs?.onLoadingStateChange?.(false);
        }
    }
    handleError(error) {
        if (error instanceof BaseError) {
            return new APIResponse(null, error.flag, {
                message: error.message,
                hints: error.hints,
                output: error.output,
            }).build();
        }
        return new APIResponse(null, Flag.InternalError, {
            output: error,
        }).build();
    }
    preparePayload(payload, cbs, allowFalsy = false) {
        let newPayload = allowFalsy
            ? payload
            : deleteUnwantedValues(payload, ["undefined", "emptystrings"]);
        return (cbs?.amendArgs?.({
            formData: newPayload,
        }) ?? newPayload);
    }
    isEmptyPayload(payload) {
        return !payload || Object.keys(payload).length === 0;
    }
    applyFilters(query, opts) {
        const { eq, or, contains, overlaps, ilike, inValue } = opts;
        if (Array.isArray(eq) && eq.length > 0) {
            eq.forEach(({ key, value }) => {
                query = query.eq(key, value);
            });
        }
        if (Array.isArray(contains) && contains.length > 0) {
            contains.forEach(({ key, value }) => {
                query = query.contains(key, Array.isArray(value) ? value : [value]);
            });
        }
        if (Array.isArray(overlaps) && overlaps.length > 0) {
            overlaps.forEach(({ key, value }) => {
                query = query.overlaps(key, value);
            });
        }
        if (Array.isArray(ilike) && ilike.length > 0) {
            ilike.forEach(({ key, value }) => {
                query = query.ilike(key, value);
            });
        }
        if (or && typeof or === "string") {
            query = query.or(or);
        }
        if (inValue?.key && inValue?.value?.length) {
            query = query.in(inValue.key, inValue.value);
        }
        return query;
    }
    getSoftDeleteConfig() {
        const config = this.behaviour.softDeleteConfig ?? {
            flagKey: "is_deleted",
            timestampKey: "deleted_at",
        };
        if (!config.flagKey && !config.timestampKey) {
            throw new ValidationError("Invalid soft delete config: provide at least one key.");
        }
        return config;
    }
    info() {
        return {
            tableName: this.tableName,
            table_behaviour: this.behaviour,
        };
    }
}
