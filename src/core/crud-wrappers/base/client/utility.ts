import { APIResponse } from "../../../response/index.js";
import { BaseError, ValidationError } from "../../../errors/index.js";
import type {
  Callbacks,
  Response,
  SoftDeleteConfig,
  TableBehaviour,
  SupabaseClientAdapter
} from "../../../../types/index.js";
import { Flag } from "../../../../types/core/api/common.js";
import { validator } from "../../../../helpers/index.js";
import { SupawrapperClient } from "../../../base-client/index.js";

const {
  amend: { deleteUnwantedValues },
} = validator;

export class UtilityMethods<
  Table,
  TClient extends SupabaseClientAdapter,
  GetOptions,
  UpdateOptions
> extends SupawrapperClient<Table, TClient> {
  constructor(
    supabase: TClient,
    tableName: string,
    behaviour: TableBehaviour<Table>
  ) {
    super(supabase, tableName, behaviour);
  }

  protected getDebugLogs(metaData: Record<string, unknown>) {

    if (this.behaviour.debug?.returnHintsOnError) {
      return {
        ...metaData,
        table: this.tableName,
        tableBehaviour: this.behaviour,
      };
    }
    return null;
  }

  protected updateTimestamps<P>(payload: P, isUpdate: boolean = false): P {
    if (!this.behaviour?.timestamps?.autoTimestamps) return payload;

    const { createdAtKey = "created_at", updatedAtKey } = this.behaviour.timestamps?.config ?? {};
    const now = new Date().toISOString();

    const applyToSingle = <T>(item: T): T => {
      const newItem = { ...item } as Record<string, unknown>;
      if (!isUpdate && createdAtKey) {
        newItem[createdAtKey] = now;
      }
      if (updatedAtKey) {
        newItem[updatedAtKey] = now;
      }
      return newItem as unknown as T;
    };

    if (Array.isArray(payload)) {
      return payload.map(applyToSingle) as unknown as P;
    }

    return applyToSingle(payload) as unknown as P;
  }

  protected validateSchema<P>(
    data: P,
    schema?: import("zod").ZodSchema<unknown>,
    enabled: boolean = false
  ): P {
    if (!enabled || !schema) return data;

    const validateSingle = <T>(item: T): T => {
      try {
        return schema.parse(item) as T;
      } catch (err) {
        if (this.isZodError(err)) {
          console.error("Validation Error:", err);
          throw err;
        }
        throw err;
      }
    };

    if (Array.isArray(data)) {
      return data.map(validateSingle) as unknown as P;
    }

    return validateSingle(data) as unknown as P;
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

  protected handleError<R = any>(error: unknown): Response<R> {
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

  protected preparePayload<T>(
    payload: T,
    cbs?: Callbacks,
    allowFalsy = false
  ): T {
    let newPayload = allowFalsy
      ? payload
      : deleteUnwantedValues<T>(payload, ["undefined", "emptystrings"]);

    return (
      cbs?.amendArgs?.<T>({
        formData: newPayload,
      }) ?? newPayload
    ) as T;
  }

  protected isEmptyPayload(payload: object) {
    return !payload || Object.keys(payload).length === 0;
  }

  protected applyFilters<Table>(
    query: any,
    opts: Partial<GetOptions | UpdateOptions> = {}
  ) {
    const { eq, or, contains, overlaps, ilike, inValue, gt, gte, lt, lte } = opts as any;

    if (Array.isArray(eq)) {
      eq.forEach(({ key, value }: { key: keyof Table; value: Table[keyof Table] }) => {
        query = query.eq(key as string, value);
      });
    }
    const operators: Record<string, { key: keyof Table; value: Table[keyof Table] }[]> = {
      gt: gt as { key: keyof Table; value: Table[keyof Table] }[] ?? [],
      gte: gte as { key: keyof Table; value: Table[keyof Table] }[] ?? [],
      lt: lt as { key: keyof Table; value: Table[keyof Table] }[] ?? [],
      lte: lte as { key: keyof Table; value: Table[keyof Table] }[] ?? [],
    };
    for (const [op, items] of Object.entries(operators)) {
      items.forEach(({ key, value }) => {
        query = (query as Record<string, Function>)[op](key as string, value);
      });
    }

    if (Array.isArray(contains)) {
      contains.forEach(({ key, value }: { key: keyof Table; value: Table[keyof Table] }) => {
        query = query.contains(key as string, Array.isArray(value) ? value : [value]);
      });
    }

    if (Array.isArray(overlaps)) {
      overlaps.forEach(({ key, value }: { key: keyof Table; value: Table[keyof Table] }) => {
        query = query.overlaps(key as string, value);
      });
    }

    if (Array.isArray(ilike)) {
      ilike.forEach(({ key, value }: { key: keyof Table; value: Table[keyof Table] }) => {
        query = query.ilike(key as string, value);
      });
    }
    if (or && typeof or === "string") {
      query = query.or(or);
    }

    if (inValue && typeof inValue === "object" && "key" in inValue && "value" in inValue) {
      const { key, value } = inValue as { key: keyof Table; value: (Table[keyof Table])[] };
      if (Array.isArray(value) && value.length) {
        query = query.in(key as string, value);
      }
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

  private isZodError(error: unknown): error is { issues: unknown[] } {
    return (
      typeof error === "object" &&
      error !== null &&
      "issues" in error &&
      Array.isArray((error as { issues?: unknown[] }).issues)
    );
  }
}
