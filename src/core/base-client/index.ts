import { TableBehaviour, SupabaseClientAdapter } from "../../types/index.js";

export class SupawrapperClient<Table = any, TClient extends SupabaseClientAdapter = SupabaseClientAdapter> {

    constructor(protected supabase: TClient, protected readonly tableName: string, protected readonly behaviour: TableBehaviour<Table>) { }
}