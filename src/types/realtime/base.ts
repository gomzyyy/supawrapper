import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
  RealtimePostgresDeletePayload,
  RealtimePostgresInsertPayload,
  RealtimePostgresUpdatePayload,
} from "@supabase/supabase-js";

export interface RealtimeOptions {
  filter?: string;
}

export type RealtimeEventType =
  | "INSERT"
  | "UPDATE"
  | "DELETE"
  | "*";

export type BaseRealtimeRow = {
  [key: string]: any;
};

export type RealtimePayloadMap<
  T extends BaseRealtimeRow = BaseRealtimeRow
> = {
  INSERT: RealtimePostgresInsertPayload<T>;
  UPDATE: RealtimePostgresUpdatePayload<T>;
  DELETE: RealtimePostgresDeletePayload<T>;
  "*": RealtimePostgresChangesPayload<T>;
};

export type BaseRealtimeCBFunction<
  T extends BaseRealtimeRow,
  E extends RealtimeEventType
> = (payload: RealtimePayloadMap<T>[E]) => void;

export type OnInsertCB<
  T extends BaseRealtimeRow = BaseRealtimeRow
> = BaseRealtimeCBFunction<T, "INSERT">;

export type OnUpdateCB<
  T extends BaseRealtimeRow = BaseRealtimeRow
> = BaseRealtimeCBFunction<T, "UPDATE">;

export type OnDeleteCB<
  T extends BaseRealtimeRow = BaseRealtimeRow
> = BaseRealtimeCBFunction<T, "DELETE">;

export type OnChangeCB<
  T extends BaseRealtimeRow = BaseRealtimeRow
> = BaseRealtimeCBFunction<T, "*">;

export interface BaseRealtimeListenerType<
  T extends BaseRealtimeRow = BaseRealtimeRow
> {
  onInsert(
    cb: OnInsertCB<T>,
    opts?: RealtimeOptions
  ): RealtimeChannel;

  onUpdate(
    cb: OnUpdateCB<T>,
    opts?: RealtimeOptions
  ): RealtimeChannel;

  onDelete(
    cb: OnDeleteCB<T>,
    opts?: RealtimeOptions
  ): RealtimeChannel;

  onChange(
    cb: OnChangeCB<T>,
    opts?: RealtimeOptions
  ): RealtimeChannel;
}