import { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";

import type {
  RealtimeOptions,
  BaseRealtimeCBFunction,
  RealtimeEventType,
  OnInsertCB,
  OnUpdateCB,
  OnDeleteCB,
  OnChangeCB,
  BaseRealtimeRow,
} from "../../../types/index.js";
import { BaseChannelWrapper } from "../base/index.js";

export class RealtimeListener<T extends BaseRealtimeRow = BaseRealtimeRow> extends BaseChannelWrapper {
  constructor(
    supabase: SupabaseClient,
    private readonly tableName: string
  ) {
    super(
      supabase,
      `sw-realtime-${tableName}`
    );
  }

  private listen<E extends RealtimeEventType>(
    event: E,
    cb: BaseRealtimeCBFunction<T, E>,
    opts: RealtimeOptions = {}
  ): RealtimeChannel {
    const { filter } = opts;

    return this.channel.on(
      "postgres_changes",
      {
        event,
        schema: "public",
        table: this.tableName,
        filter,
      },
      (payload) => cb(payload as any)
    )
      .subscribe();
  }

  info() {
    return {
      ...super.info(),
      tableName: this.tableName,
    };
  }

  onInsert(cb: OnInsertCB<T>, opts?: RealtimeOptions): RealtimeChannel {
    return this.listen("INSERT", cb, opts);
  }

  onUpdate(cb: OnUpdateCB<T>, opts?: RealtimeOptions): RealtimeChannel {
    return this.listen("UPDATE", cb, opts);
  }

  onDelete(cb: OnDeleteCB<T>, opts?: RealtimeOptions): RealtimeChannel {
    return this.listen("DELETE", cb, opts);
  }

  onChange(cb: OnChangeCB<T>, opts?: RealtimeOptions): RealtimeChannel {
    return this.listen("*", cb, opts);
  }
}
