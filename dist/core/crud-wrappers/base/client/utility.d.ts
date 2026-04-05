import { Callbacks, Response, SoftDeleteConfig, TableBehaviour } from "../../../../types/index.js";
import { SupabaseClient } from "@supabase/supabase-js";
import { SupawrapperClient } from "../../../base-client/index.js";
export declare class UtilityMethods<TableFormData, GetOptions, UpdateOptions> extends SupawrapperClient {
    constructor(supabase: SupabaseClient, tableName: string, behaviour?: TableBehaviour);
    protected getDebugLogs(metaData: any): any;
    protected withLoading<T>(cbs: Callbacks | undefined, cb: () => Promise<T>): Promise<T>;
    protected handleError(error: unknown): Response<any>;
    protected preparePayload(payload: Partial<TableFormData> | TableFormData, cbs?: Callbacks, allowFalsy?: boolean): Partial<TableFormData>;
    protected isEmptyPayload(payload: object): boolean;
    protected applyFilters(query: any, opts: Partial<GetOptions | UpdateOptions>): any;
    protected getSoftDeleteConfig(): SoftDeleteConfig;
    protected info(): {
        tableName: string;
        table_behaviour: TableBehaviour;
    };
}
