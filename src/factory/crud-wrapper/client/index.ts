import { ClientWrapper } from "../../../core/index.js";
import { GetTableOpts, TableBehaviour, UpdateTableOpts } from "../../../types/index.js";
import { SupabaseClient } from "@supabase/supabase-js";
import { getDefaultTableBehaviour } from "../../../core/crud-wrappers/client-wrapper/defaults.js";

/**
 * @description This function is used to configure the client for a specific table.
 * @param supabase The supabase client instance.
 * @param tableName The name of the table.
 * @param behaviour The behaviour of the table.
 * @returns A ClientWrapper instance.
 */
function defineTable<Table, TableFormData extends Partial<Table> = Partial<Table>, GetOptions extends GetTableOpts<Table> = GetTableOpts<Table>, UpdateOptions extends UpdateTableOpts<Table> = UpdateTableOpts<Table>>(supabase: SupabaseClient, tableName: string, behaviour: TableBehaviour<Table> = getDefaultTableBehaviour<Table>()): ClientWrapper<Table, TableFormData, GetOptions, UpdateOptions> {
    return new ClientWrapper<Table, TableFormData, GetOptions, UpdateOptions>(supabase, tableName, behaviour)
}

export { defineTable }