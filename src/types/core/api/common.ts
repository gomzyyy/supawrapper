import type { Response } from "./response.js";

export enum Flag {
  Success = "SUCCESS",
  InternalError = "INTERNAL_ERROR",
  APIError = "API_ERROR",
  ValidationError = "VALIDATION_ERROR",
  UnknownOrSuccess = "UNKNOWN_OR_SUCCESS",
  Unknown = "UNKNOWN"
}

export type WrapperFunctionType<
  T = unknown,
  Args extends unknown[] = []
> = (...args: Args) => Promise<Response<T>>;
