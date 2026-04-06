import {
    RealtimeChannel,
    SupabaseClient,
} from "@supabase/supabase-js";

interface RealtimeChannelConfig {
    channelId?: string;
}

export class BaseChannelWrapper {
    protected readonly supabase: SupabaseClient;
    protected readonly channel: RealtimeChannel;
    protected readonly channelName: string;

    protected readonly channelConfig: RealtimeChannelConfig;

    constructor(
        supabase: SupabaseClient,
        channelName: string,
        channelConfig: RealtimeChannelConfig = {}
    ) {
        this.supabase = supabase;
        this.channelConfig = channelConfig;
        this.channelName = this.channelConfig.channelId ? `${channelName}:${channelConfig.channelId}` : channelName;

        // create and persist one channel instance
        this.channel = this.supabase.channel(this.channelName);
    }

    /**
     * Subscribe to current channel
     */
    subscribe(): RealtimeChannel {
        return this.channel.subscribe();
    }

    /**
     * Unsubscribe and cleanup current channel
     */
    async unsubscribe(): Promise<
        "ok" | "timed out" | "error"
    > {
        return this.supabase.removeChannel(this.channel);
    }

    /**
     * Get underlying raw realtime channel
     * Useful for advanced custom usage
     */
    getRawChannel(): RealtimeChannel {
        return this.channel;
    }

    /**
     * Get current channel metadata
     */
    info() {
        return {
            channelName: this.channelName,
        };
    }
}