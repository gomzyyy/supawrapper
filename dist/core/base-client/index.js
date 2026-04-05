export class SupawrapperClient {
    supabase;
    tableName;
    behaviour;
    constructor(supabase, tableName, behaviour) {
        this.supabase = supabase;
        this.tableName = tableName;
        this.behaviour = behaviour;
    }
}
