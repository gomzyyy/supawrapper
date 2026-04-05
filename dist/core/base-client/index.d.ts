import { TableBehaviour } from "../../types/index.js";
import { SupabaseClient } from "@supabase/supabase-js";
export declare class SupawrapperClient {
    protected supabase: SupabaseClient;
    protected readonly tableName: string;
    protected readonly behaviour: TableBehaviour;
    constructor(supabase: SupabaseClient, tableName: string, behaviour: TableBehaviour);
}
