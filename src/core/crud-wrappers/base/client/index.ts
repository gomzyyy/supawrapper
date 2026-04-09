import {
  Flag,
  type Callbacks,
  type Response,
  type TableBehaviour,
} from "../../../../types/index.js";
import { APIResponse } from "../../../response/index.js";
import { APIError, ValidationError } from "../../../index.js";
import { UtilityMethods } from "./utility.js";
import { CacheClient } from "../../../../core/store/index.js";
import type { SupabaseClientAdapter } from "../../../../types/index.js";

/**
 * @undertesting - Please note that BaseClientCRUDWrapper is currently under testing and may undergo significant changes. The current implementation serves as a foundational structure for CRUD operations, but we are actively working on refining the API, enhancing error handling, and optimizing performance. We recommend using this class for testing and prototyping purposes, but be prepared for potential breaking changes in future releases as we continue to improve and expand its capabilities.
 *
 * BaseClientCRUDWrapper is a foundational class that provides core CRUD functionalities for a specified bucket in Supabase. It includes methods for creating, reading, updating, and deleting records, as well as handling soft deletion if configured. The class also incorporates error handling and debugging capabilities to assist developers in identifying issues during development and production.
 */
export class BaseClientCRUDWrapper<
  Table,
  TClient extends SupabaseClientAdapter,
  GetOptions,
  UpdateOptions
> extends UtilityMethods<Table, TClient, GetOptions, UpdateOptions> {
  private readonly cache: CacheClient
  constructor(
    supabase: TClient,
    tableName: string,
    behaviour: TableBehaviour<Table>
  ) {
    super(supabase, tableName, behaviour);
    this.cache = new CacheClient(this.behaviour.cachingStrategy)
  }

  /**
   * @method clearCache() Manually clears all active cache records across this table's wrapper instance. Useful for forced invalidation if caching becomes buggy or stale.
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * @method rawQuery() Allows you to run custom Supabase queries on the table. It accepts a callback function that receives the raw query builder and returns the result. This method is useful for operations that are not covered by the standard CRUD methods.
   * @param queryCallback Callback function that receives the raw query builder and returns the query result.
   * @param data Optional payload data to be used in the query.
   * @param cbs Optional callbacks for track loading states and handling errors.
   * @returns A promise resolving to a unified Response object containing the query result.
   */
  async rawQuery<R = any>(
    queryCallback: (query: ReturnType<TClient["from"]>, data?: Partial<Table>) => any,
    data?: Partial<Table> | Table,
    cbs?: Callbacks
  ): Promise<Response<R>> {
    return this.withLoading(cbs, async () => {
      try {
        let payload = data;

        payload = this.preparePayload(payload, cbs);

        if (payload && this.behaviour.validator?.enabled && this.behaviour.validator?.schema) {
          payload = this.validateSchema<Partial<Table>>(
            payload,
            this.behaviour.validator.schema,
            !!this.behaviour.validator.enabled
          );

          payload = this.updateTimestamps<Partial<Table>>(payload);
        }

        const query = this.supabase.from(this.tableName);
        const result = await queryCallback(query, payload);

        if (result.error) {
          const hints = this.getDebugLogs({
            rawPayload: data,
            injectedPayload: payload,
            operation: "rawQuery",
            rawOutput: {
              data: result.data,
              error: result.error,
            },
          });
          throw new APIError(result.error.message, hints, result.error);
        }

        return new APIResponse(result?.data || null, Flag.Success).build();
      } catch (error) {
        return this.handleError<R>(error);
      }
    });
  }


  /**
   * @method createOne() Creates a new record in the specified table with the provided data. It accepts optional callbacks for managing loading state and allows for falsy values in the payload if specified in the options. The method prepares the payload, executes the insert operation, and returns the created record wrapped in a Response object. If an error occurs during the operation, it is handled gracefully and returned as an APIError response.
   * @param data Data for the record to be created.
   * @param cbs Optional callbacks for reacting to loading states.
   * @param opts Insert configuration options, for example whether to allow falsy fields into payload.
   * @returns A promise resolving to a Response wrapper containing the created record.
   */
  async createOne(
    data: Partial<Table> | Table,
    cbs?: Callbacks,
    opts = { allowFalsy: false }
  ): Promise<Response<Table>> {
    return this.withLoading(cbs, async () => {
      try {
        const newPayload = this.preparePayload(data, cbs, opts.allowFalsy);

        const validatedPayload = this.validateSchema<Partial<Table>>(
          newPayload,
          this.behaviour.validator?.schema,
          !!this.behaviour.validator?.enabled
        );

        const payloadWithUpdatedTimestamps = this.updateTimestamps<Partial<Table>>(validatedPayload);

        const { data: apiData, error } = await this.supabase
          .from(this.tableName)
          .insert(payloadWithUpdatedTimestamps)
          .select("*")
          .maybeSingle();

        if (error) {
          const hints = this.getDebugLogs({
            rawPayload: data,
            injectedPayload: payloadWithUpdatedTimestamps,
            operation: "createOne",
            rawOutput: {
              data: apiData,
              error,
            },
          });
          throw new APIError(error.message, hints, error);
        }

        this.invalidateTableQueryCaches();

        return new APIResponse(apiData || null, Flag.Success).build();
      } catch (error) {
        return this.handleError(error);
      }
    });
  }


  /**
   * @method createMany() Creates multiple records in the specified table with the provided array of data. The method executes a bulk insert operation and returns the created records wrapped in a Response object. If an error occurs during the operation, it is handled gracefully and returned as an APIError response.
   * @param arr Array of record configurations to be created.
   * @returns A promise resolving to a Response containing an array of successfully created records.
   */
  async createMany(
    arr: Partial<Table>[] | Table[]
  ): Promise<Response<Table[]>> {
    return this.withLoading(undefined, async () => {
      try {
        const sourcePayloads = Array.isArray(arr) ? arr : [arr];
        const newPayloads = sourcePayloads.map(p => this.preparePayload(p));

        const validatedPayloads = this.validateSchema<Partial<Table>[]>(
          newPayloads,
          this.behaviour.validator?.schema,
          !!this.behaviour.validator?.enabled
        );

        const payloadsWithUpdatedTimestamps = this.updateTimestamps<Partial<Table>[]>(validatedPayloads);

        const { data, error } = await this.supabase
          .from(this.tableName)
          .insert(payloadsWithUpdatedTimestamps)
          .select("*");

        if (error) {
          const hints = this.getDebugLogs({
            rawPayload: arr,
            injectedPayload: payloadsWithUpdatedTimestamps,
            operation: "createMany",
            rawOutput: {
              data,
              error,
            },
          });
          throw new APIError(error.message, hints, error);
        }

        this.invalidateTableQueryCaches();

        return new APIResponse(data, Flag.Success).build();
      } catch (error) {
        return this.handleError(error);
      }
    });
  }

  /**
   * @method upsertOne() Inserts or updates a single record in the specified table with the provided data. It accepts optional callbacks for managing loading state and uses the table's unique identifiers for conflict resolution. The method prepares the payload, executes the upsert operation, and returns the created or updated record wrapped in a Response object. If an error occurs during the operation, it is handled gracefully and returned as an APIError response.
   * @param data Record payload used for the upsert operation.
   * @param cbs Optional callbacks to track loading states natively.
   * @returns A promise resolving to a Response containing the upserted record.
   */
  async upsertOne(
    data: Partial<Table> | Table,
    cbs?: Callbacks
  ): Promise<Response<Table>> {
    return this.withLoading(cbs, async () => {
      try {
        const payload = this.preparePayload(data, cbs);

        const validatedPayload = this.validateSchema<Partial<Table>>(
          payload,
          this.behaviour.validator?.schema,
          !!this.behaviour.validator?.enabled
        );

        const finalPayload = this.updateTimestamps<Partial<Table>>(validatedPayload);

        const onConflict = this.behaviour.uniqueIdentifiers?.length
          ? this.behaviour.uniqueIdentifiers.join(",")
          : undefined;

        const { data: apiData, error } = await this.supabase
          .from(this.tableName)
          .upsert(finalPayload, { onConflict })
          .select("*")
          .maybeSingle();

        if (error) {
          const hints = this.getDebugLogs({
            rawPayload: data,
            injectedPayload: finalPayload,
            operation: "upsertOne",
            rawOutput: { data: apiData, error },
          });
          throw new APIError(error.message, hints, error);
        }

        if (apiData && typeof apiData === 'object' && "id" in apiData) {
          this.cache.delete(this.createIdCacheKey(String((apiData as any).id)));
        }
        this.invalidateTableQueryCaches();

        return new APIResponse(apiData || null, Flag.Success).build();
      } catch (error) {
        return this.handleError(error);
      }
    });
  }

  /**
   * @method upsertMany() Inserts or updates multiple records in the specified table with the provided array of data. It accepts optional callbacks for managing loading state and uses the table's unique identifiers for conflict resolution. The method executes a bulk upsert operation and returns the created or updated records wrapped in a Response object. If an error occurs during the operation, it is handled gracefully and returned as an APIError response.
   * @param data Array of records to bulk upsert.
   * @param cbs Optional loading state callbacks.
   * @returns A promise resolving to a Response containing an array of upserted records.
   */
  async upsertMany(
    data: (Partial<Table> | Table)[],
    cbs?: Callbacks
  ): Promise<Response<Table[]>> {
    return this.withLoading(cbs, async () => {
      try {
        const payloads = data.map((d) => this.preparePayload(d, cbs));

        const validatedPayloads = payloads.map((p) =>
          this.validateSchema<Partial<Table>>(
            p,
            this.behaviour.validator?.schema,
            !!this.behaviour.validator?.enabled
          )
        );

        const finalPayloads = validatedPayloads.map((p) =>
          this.updateTimestamps<Partial<Table>>(p)
        );

        const onConflict = this.behaviour.uniqueIdentifiers?.length
          ? this.behaviour.uniqueIdentifiers.join(",")
          : undefined;

        const { data: apiData, error } = await this.supabase
          .from(this.tableName)
          .upsert(finalPayloads, { onConflict })
          .select("*");

        if (error) {
          const hints = this.getDebugLogs({
            rawPayload: data,
            injectedPayload: finalPayloads,
            operation: "upsertMany",
            rawOutput: { data: apiData, error },
          });
          throw new APIError(error.message, hints, error);
        }

        this.invalidateTableQueryCaches();

        return new APIResponse(apiData || [], Flag.Success).build();
      } catch (error) {
        return this.handleError(error);
      }
    });
  }


  /**
   * @method updateById() Updates a single record identified by its ID with the provided update data. It accepts optional callbacks for managing loading state and allows for falsy values in the update payload if specified in the options. The method prepares the payload, executes the update operation, and returns the updated record wrapped in a Response object. If an error occurs during the operation, it is handled gracefully and returned as an APIError response.
   * @param tableId The ID linking to the exact record inside the table.
   * @param update Partial object containing the changes applying to the record.
   * @param cbs Optional callbacks to listen on loading states.
   * @param opts Internal database update configuration flags (e.g. `allowFalsy` boolean).
   * @returns A promise resolving to a Response tracking the completed updated record.
   */
  async updateById(
    tableId: string | number,
    update: Partial<Table>,
    cbs?: Callbacks,
    opts: {
      allowFalsy: boolean;
    } = { allowFalsy: false }
  ): Promise<Response<Table>> {
    return this.withLoading(cbs, async () => {
      try {
        const newPayload = this.preparePayload<Partial<Table>>(update, cbs, opts.allowFalsy);

        if (this.isEmptyPayload(newPayload)) {
          throw new ValidationError("No updates found.");
        }

        const validatedPayload = this.validateSchema<Partial<Table>>(
          newPayload,
          this.behaviour.validator?.schema,
          !!this.behaviour.validator?.enabled
        );

        const payloadWithUpdatedTimestamps = this.updateTimestamps<Partial<Table>>(validatedPayload, true);

        const { data, error } = await this.supabase
          .from(this.tableName)
          .update(payloadWithUpdatedTimestamps)
          .eq("id", tableId)
          .select("*")
          .maybeSingle();

        if (error) {
          const hints = this.getDebugLogs({
            rawPayload: update,
            injectedPayload: payloadWithUpdatedTimestamps,
            operation: "updateById",
            rawOutput: {
              data,
              error,
            },
          });
          throw new APIError(error.message, hints, error);
        }

        this.cache.delete(this.createIdCacheKey(tableId));
        this.invalidateTableQueryCaches();

        return new APIResponse(data || null, Flag.Success).build();
      } catch (error) {
        return this.handleError(error);
      }
    });
  }
  /**
   * @method getById() Retrieves a single record from the specified table by its ID. It accepts optional callbacks for managing loading state. The method executes a select operation and returns the retrieved record wrapped in a Response object. If an error occurs during the operation, it is handled gracefully and returned as an APIError response.
   * @param tableId Evaluated unique string mapped to the ID within Supabase.
   * @param cbs Optional callbacks binding loading scopes.
   * @returns A promise unlocking a unified Response containing the requested record.
   */
  async getById(tableId: string | number, cbs?: Callbacks): Promise<Response<Table>> {
    return this.withLoading(cbs, async () => {
      try {
        const cacheKey = this.createIdCacheKey(tableId);
        const cached = this.cache.get<Table>(cacheKey);

        if (cached) {
          return new APIResponse(cached.data, Flag.Success).build();
        }

        const { data, error } = await this.supabase
          .from(this.tableName)
          .select("*")
          .eq("id", tableId)
          .maybeSingle();

        if (error) {
          const hints = this.getDebugLogs({
            tableId,
            operation: "getById",
            rawOutput: {
              data,
              error,
            },
          });
          throw new APIError(error.message, hints, error);
        }

        this.cache.set<Table | null>(cacheKey, data || null);

        return new APIResponse(data || null, Flag.Success).build();
      } catch (error) {
        return this.handleError(error);
      }
    });
  }

  /**
   * @method batchUpdate() Updates multiple records that match the specified conditions with the provided update data. It accepts optional callbacks for managing loading state. The method prepares the payload, applies filters based on the conditions, executes the update operation, and returns the updated records wrapped in a Response object. If an error occurs during the operation, it is handled gracefully and returned as an APIError response.
   * @param update Partial properties that override values matching query results.
   * @param filters Criteria/filters governing update target reach.
   * @param cbs Optional native listener callbacks interacting while executing updates.
   * @returns A promise containing an array of records that successfully finished the batch update.
   */  async batchUpdate(
    update: Partial<Table>,
    filters: UpdateOptions,
    cbs?: Callbacks
  ): Promise<Response<Table[]>> {
    return this.withLoading(cbs, async () => {
      try {
        if (this.isEmptyPayload(update)) {
          throw new ValidationError("No updates found.");
        }

        const newPayload = this.preparePayload(update, cbs, false);

        const validatedPayload = this.validateSchema(
          newPayload,
          this.behaviour.validator?.schema,
          !!this.behaviour.validator?.enabled
        );

        const payloadWithUpdatedTimestamps = this.updateTimestamps(validatedPayload, true);

        let query = this.supabase
          .from(this.tableName)
          .update(payloadWithUpdatedTimestamps)
          .select("*");

        query = this.applyFilters(query, filters);

        const { data, error } = await query;

        if (error) {
          const hints = this.getDebugLogs({
            rawPayload: update,
            injectedPayload: payloadWithUpdatedTimestamps,
            operation: "batchUpdate",
            rawOutput: {
              data,
              error,
            },
          });
          throw new APIError(error.message, hints, error);
        }

        this.invalidateTableQueryCaches();

        return new APIResponse(data, Flag.Success).build();
      } catch (error) {
        return this.handleError(error);
      }
    });
  }
  /**
   * @method get() Retrieves records from the specified table based on the provided options. It accepts optional callbacks for managing loading state. The method constructs a query based on the options, executes it, and returns the retrieved records along with pagination information wrapped in a Response object. If an error occurs during the operation, it is handled gracefully and returned as an APIError response.
   * @param getOptions Options mapping parameters like sorting, filtering, ranges, and search flags.
   * @param cbs Optional runtime bindings monitoring request load states.
   * @returns A promise resolving to a unified Response struct filled with array or object dataset including pagination metadata.
   */
  async get(
    getOptions: GetOptions,
    cbs?: Callbacks
  ): Promise<Response<Table | Table[]>> {
    return this.withLoading(cbs, async () => {
      try {
        const cacheKey = this.createQueryCacheKey(getOptions);

        type QueryPayload = {
          data: Table | Table[] | null;
          pagination: {
            page: number;
            limit: number;
            total: number | null;
            totalPages: number;
          };
        };

        const cached = this.cache.get<QueryPayload>(cacheKey);

        if (cached) {
          return new APIResponse(cached.data, Flag.Success).build();
        }

        const {
          limit,
          single,
          maybeSingle,
          orderBy,
          sortBy,
          search,
          searchFields,
          page = 1,
          offset,
        } = getOptions as any;

        let query: any = this.supabase
          .from(this.tableName)
          .select("*", { count: "exact" });

        query = this.applyFilters(query, getOptions);

        if (
          typeof offset === "number" &&
          offset >= 0 &&
          typeof limit === "number"
        ) {
          query = query.range(offset, offset + limit - 1);
        } else if (
          typeof page === "number" &&
          page > 0 &&
          typeof limit === "number" &&
          limit > 0
        ) {
          const from = (page - 1) * limit;
          const to = from + limit - 1;

          query = query.range(from, to);
        }

        if (limit && !single && !maybeSingle) {
          query = query.limit(limit);
        }

        if (single && !maybeSingle) {
          query = query.single();
        }

        if (maybeSingle && !single) {
          query = query.maybeSingle();
        }

        if (sortBy) {
          const orderStrToBool: Record<"asc" | "dec", boolean> = {
            asc: true,
            dec: false,
          };
          const ascending = orderStrToBool[orderBy as "asc" | "dec"] || true;
          query = query.order(sortBy, {
            ascending,
          });
        }

        if (search?.trim()) {
          const trimmed = search.trim();

          const fields = searchFields?.length > 0 ? searchFields : [];

          const pattern = `%${trimmed}%`;

          const orFilters = fields
            .map((field: string) => `${field}.ilike.${pattern}`)
            .join(",");

          query = query.or(orFilters);
        }

        const { data, error, count } = await query;

        if (error) {
          const hints = this.getDebugLogs({
            providedOptions: getOptions,
            operation: "get",
            rawOutput: {
              data,
              error,
              count,
            },
          });
          throw new APIError(error.message, hints, error);
        }

        const payloadToCache: QueryPayload = {
          data,
          pagination: {
            page,
            limit,
            total: count,
            totalPages:
              typeof limit === "number" && limit > 0
                ? Math.ceil((count || 0) / limit)
                : 1,
          },
        };

        this.cache.set<QueryPayload>(cacheKey, payloadToCache);

        return new APIResponse(payloadToCache, Flag.Success).build();
      } catch (error) {
        return this.handleError(error);
      }
    });
  }
  /**
   * @method deleteOneById() Permanently deletes a single record identified by its ID from the specified table. It accepts optional callbacks for managing loading state. The method executes a delete operation and returns a success response if the deletion  is successful. If an error occurs during the operation, it is handled gracefully and returned as an APIError response.
   * @param tableId A valid matching string to target a specific row to delete.
   * @param cbs Optional listener reacting to runtime scopes.
   * @returns A promise tracking a unified null Response object affirming task execution securely.
   */
  async deleteOneById(
    tableId: string | number,
    cbs?: Callbacks
  ): Promise<Response<null>> {
    return this.withLoading(cbs, async () => {
      try {
        const { error } = await this.supabase
          .from(this.tableName)
          .delete()
          .eq("id", tableId);

        if (error) {
          const hints = this.getDebugLogs({
            tableId,
            operation: "deleteOneById",
            rawOutput: {
              error,
            },
          });
          throw new APIError(error.message, hints, error);
        }

        this.cache.delete(this.createIdCacheKey(tableId));
        this.invalidateTableQueryCaches();

        return new APIResponse(null, Flag.Success).build();
      } catch (error) {
        return this.handleError(error);
      }
    });
  }
  /**
   * @method setSoftDeletedById() Toggles the soft deletion state of a single record identified by its ID. It accepts an intent boolean to indicate whether to soft delete (true) or restore (false) the record, along with optional callbacks for managing loading state. The method checks if soft deletion is supported, prepares the update payload based on the configured soft delete keys, executes the update operation, and returns the updated record wrapped in a Response object. If an error occurs during the operation, it is handled gracefully and returned as an APIError response.
   * @param tableId Target's unique primary identifier.
   * @param intent Truthy switch instructing table wrapper flags whether marking item alive/deleted.
   * @param cbs Optional generic interface managing callbacks directly out-of-scope.
   * @returns Promise returning mutated item's final soft delete state instance safely verified.
   */
  async setSoftDeletedById(
    tableId: string | number,
    intent: boolean,
    cbs?: Callbacks
  ) {
    return this.withLoading(cbs, async () => {
      try {
        if (!this.behaviour.supportsSoftDeletion) {
          throw new ValidationError(
            `Table '${this.tableName}' doesn't support soft deletion.` +
            "\n\n" +
            "You can configure this by passing the appropriate behaviour object to the respective instance."
          );
        }

        const { flagKey, timestampKey } = this.getSoftDeleteConfig();

        const updatePayload: Record<string, any> = {};

        if (flagKey) {
          updatePayload[flagKey] = intent;
        }

        if (timestampKey) {
          updatePayload[timestampKey] = intent
            ? new Date().toISOString()
            : null;
        }

        const { data, error } = await this.supabase
          .from(this.tableName)
          .update(updatePayload)
          .eq("id", tableId)
          .select("*")
          .maybeSingle();

        if (error) {
          const hints = this.getDebugLogs({
            tableId,
            shouldDelete: intent,
            configuredSoftDeleteKeys: this.behaviour.softDeleteConfig,
            operation: "setSoftDeletedById",
            rawOutput: {
              data,
              error,
            },
          });
          throw new APIError(error.message, hints, error);
        }

        this.cache.delete(this.createIdCacheKey(tableId));
        this.invalidateTableQueryCaches();

        return new APIResponse(data || null, Flag.Success).build();
      } catch (error) {
        return this.handleError(error);
      }
    });
  }

  // Caching Helpers
  private createIdCacheKey(id: string | number): string {
    return `${this.tableName}:id:${String(id)}`;
  }

  private stableStringify(input: unknown): string {
    const normalize = (value: unknown): unknown => {
      if (Array.isArray(value)) {
        return value.map(normalize);
      }

      if (value && typeof value === "object") {
        return Object.keys(value as object)
          .sort()
          .reduce((acc, key) => {
            acc[key] = normalize(
              (value as Record<string, unknown>)[key]
            );
            return acc;
          }, {} as Record<string, unknown>);
      }

      return value;
    };

    return JSON.stringify(normalize(input));
  }

  private createQueryCacheKey(options: unknown): string {
    return `${this.tableName}:query:${this.stableStringify(options)}`;
  }

  private invalidateTableQueryCaches(): void {
    this.cache.deleteByPrefix(`${this.tableName}:query:`);
  }
}
