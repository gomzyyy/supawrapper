import {
  RealtimeChannel,
  SupabaseClient,
} from "@supabase/supabase-js";
import { BaseChannelWrapper } from "../base/index.js";

export class BroadcastWrapper extends BaseChannelWrapper {
  constructor(
    supabase: SupabaseClient,
    channelName: string
  ) {
    super(
      supabase,
      `sw-broadcast-${channelName}`
    );
  }

  async send<T>(
    event: string,
    payload: T
  ): Promise<void> {
    await this.channel.send({
      type: "broadcast",
      event,
      payload,
    });
  }

  on<T>(
    event: string,
    cb: (payload: T) => void
  ): RealtimeChannel {
    return this.channel
      .on(
        "broadcast",
        { event },
        (payload) => cb(payload.payload as T)
      )
      .subscribe();
  }
}