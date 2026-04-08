import {
  Callbacks,
  Flag,
  GetTableOpts,
  Response,
  TableBehaviour,
  UpdateTableOpts,
  SupabaseClientAdapter
} from "../../../types/index.js";
import { BaseClientCRUDWrapper } from "../base/client/index.js";
import { APIResponse } from "../../../core/response/index.js";
import { APIError } from "../../../core/errors/index.js";
import { Presets } from "./presets/presets.js";
import { Chainable } from "../base/client/chainable.js";
import { getDefaultTableBehaviour } from "./defaults.js";

type ExistsFunctionOmitKeys = "validator" | "amendArgs";

export class ClientWrapper<
  Table,
  TClient extends SupabaseClientAdapter,
  GetOptions extends GetTableOpts<Table> = GetTableOpts<Table>,
  UpdateOptions extends UpdateTableOpts<Table> = UpdateTableOpts<Table>
> extends BaseClientCRUDWrapper<
  Table,
  TClient,
  GetOptions,
  UpdateOptions
> {
  public presets: Presets<Table, TClient>
  public chainable: Chainable<Table, TClient>
  constructor(
    supabase: TClient,
    tableName: string,
    behaviour: TableBehaviour<Table> = getDefaultTableBehaviour<Table>()
  ) {
    super(supabase, tableName, behaviour);
    this.presets = new Presets<Table, TClient>(this, this.behaviour);
    this.chainable = new Chainable<Table, TClient>(this)
  }

  /**
   * @classmethod exists() Checks if a record with the specified ID exists in the table. It uses the `withLoading` method to manage loading state and accepts callbacks for additional control over the operation. The method returns a boolean indicating the existence of the record, wrapped in a Response object for consistent API responses.
   */
  async exists(
    tableId: string,
    cbs?: Omit<Callbacks, ExistsFunctionOmitKeys>
  ): Promise<Response<boolean>> {
    return this.withLoading(cbs, async () => {
      try {
        const { data, error } = await this.supabase
          .from(this.tableName)
          .select("*")
          .eq("id", tableId)
          .single();

        if (error) {
          console.error("Error checking existence:", error);
          throw new APIError(
            "Failed to check existence",
            this.getDebugLogs({ error })
          );
        }
        return new APIResponse(!!data, Flag.Success).build();
      } catch (error) {
        console.error("Error checking existence:", error);
        return this.handleError(error);
      }
    });
  }
  /**
   * @classmethod count() Counts the number of records in the table that match the specified criteria. It accepts optional filtering options and callbacks for managing loading state. The method constructs a query based on the provided options, executes it, and returns the count of matching records wrapped in a Response object. If an error occurs during the operation, it is handled gracefully and returned as an APIError response.
   */
  async count(opts?: GetOptions, cbs?: Callbacks): Promise<Response<number>> {
    return this.withLoading(cbs, async () => {
      try {
        let query = this.supabase.from(this.tableName).select("*", {
          count: "exact",
          head: true,
        });

        if (opts) {
          query = this.applyFilters(query, opts);
        }

        const { count, error } = await query;

        if (error) {
          throw new APIError("Failed to count records", error.hint, error);
        }

        return new APIResponse(count ?? 0, Flag.Success).build();
      } catch (error) {
        return this.handleError(error);
      }
    });
  }
}
