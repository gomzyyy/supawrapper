import { TableBehaviour } from "../../types/index.js";
import { SupabaseClient } from "@supabase/supabase-js";

export class SupawrapperClient {
    constructor(protected supabase: SupabaseClient, protected readonly tableName: string, protected readonly behaviour: TableBehaviour) { }
}