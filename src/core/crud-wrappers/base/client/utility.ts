import { APIResponse } from "../../../response/index.js";
import { BaseError, ValidationError } from "../../../errors/index.js";
import {
  Callbacks,
  Flag,
  Response,
  SoftDeleteConfig,
  TableBehaviour,
} from "../../../../types/index.js";
import { SupabaseClient } from "@supabase/supabase-js";
import { validator } from "../../../../helpers/index.js";
import { SupawrapperClient } from "../../../base-client/index.js";

const {
  amend: { deleteUnwantedValues },
} = validator;

export class UtilityMethods<
  TableFormData,
  GetOptions,
  UpdateOptions
> extends SupawrapperClient {
  constructor(
    supabase: SupabaseClient,
    tableName: string,
    behaviour: TableBehaviour = {
      supportsSoftDeletion: true,
      softDeleteConfig: {
        flagKey: "is_deleted",
        timestampKey: "deleted_at",
      },
      debug: {
        returnHintsOnError: false,
      },
    }
  ) {
    super(supabase, tableName, behaviour);
  }

  protected getDebugLogs(metaData: any) {

    if (this.behaviour.debug?.returnHintsOnError) {
      return {
        ...metaData,
        table: this.tableName,
        tableBehaviour: this.behaviour,
      };
    }
    return null;
  }

  protected async withLoading<T>(
    cbs: Callbacks | undefined,
    cb: () => Promise<T>
  ): Promise<T> {
    cbs?.onLoadingStateChange?.(true);

    try {
      return await cb();
    } finally {
      cbs?.onLoadingStateChange?.(false);
    }
  }

  protected handleError(error: unknown): Response<any> {
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

  protected preparePayload(
    payload: Partial<TableFormData> | TableFormData,
    cbs?: Callbacks,
    allowFalsy = false
  ) {
    let newPayload = allowFalsy
      ? payload
      : deleteUnwantedValues<Partial<TableFormData>>(payload, ["undefined", "emptystrings"]);

    return (
      cbs?.amendArgs?.({
        formData: newPayload,
      }) ?? newPayload
    );
  }

  protected isEmptyPayload(payload: object) {
    return !payload || Object.keys(payload).length === 0;
  }

  protected applyFilters(
    query: any,
    opts: Partial<GetOptions | UpdateOptions>
  ) {
    const { eq, or, contains, overlaps, ilike, inValue } = opts as any;

    if (Array.isArray(eq) && eq.length > 0) {
      eq.forEach(({ key, value }: any) => {
        query = query.eq(key as string, value);
      });
    }

    if (Array.isArray(contains) && contains.length > 0) {
      contains.forEach(({ key, value }: any) => {
        query = query.contains(
          key as string,
          Array.isArray(value) ? value : [value]
        );
      });
    }

    if (Array.isArray(overlaps) && overlaps.length > 0) {
      overlaps.forEach(({ key, value }: any) => {
        query = query.overlaps(key as string, value);
      });
    }

    if (Array.isArray(ilike) && ilike.length > 0) {
      ilike.forEach(({ key, value }: any) => {
        query = query.ilike(key as string, value);
      });
    }

    if (or && typeof or === "string") {
      query = query.or(or);
    }

    if (inValue?.key && inValue?.value?.length) {
      query = query.in(inValue.key as string, inValue.value);
    }

    return query;
  }

  protected getSoftDeleteConfig(): SoftDeleteConfig {
    const config = this.behaviour.softDeleteConfig ?? {
      flagKey: "is_deleted",
      timestampKey: "deleted_at",
    };

    if (!config.flagKey && !config.timestampKey) {
      throw new ValidationError(
        "Invalid soft delete config: provide at least one key."
      );
    }

    return config;
  }

  protected info() {
    return {
      tableName: this.tableName,
      table_behaviour: this.behaviour,
    };
  }
}
