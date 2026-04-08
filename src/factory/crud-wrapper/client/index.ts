import { ClientWrapper } from "../../../core/index.js";
import { GetTableOpts, SupabaseClientAdapter, TableBehaviour, UpdateTableOpts } from "../../../types/index.js";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * @description This function is used to configure the client for a specific table.
 * @param supabase The supabase client instance.
 * @param tableName The name of the table.
 * @param behaviour The behaviour of the table.
 * @returns A ClientWrapper instance.
 */
function defineTable<Table, TClient extends SupabaseClientAdapter, GetOptions extends GetTableOpts<Table>, UpdateOptions extends UpdateTableOpts<Table>>(supabase: TClient, tableName: string, behaviour: TableBehaviour<Table>): ClientWrapper<Table, TClient, GetOptions, UpdateOptions> {
    return new ClientWrapper<Table, TClient, GetOptions, UpdateOptions>(supabase, tableName, behaviour)
}

export { defineTable }