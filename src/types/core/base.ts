export interface SupabaseClientAdapter {
    from: (table: string) => any;
    channel: (name: string) => any;
    storage: {
        from: (bucket: string) => any;
    };
}