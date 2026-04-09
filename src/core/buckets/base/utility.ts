import { APIResponse } from "../../response/index.js";
import { BaseError } from "../../errors/index.js";
import type {
  BucketBehaviour,
  Callbacks,

  Response,
  PathBuilderOptions,
  SupabaseClientAdapter
} from "../../../types/index.js";
import { Flag } from "../../../types/index.js"

/**
 * @underdevelopment - Please note that BucketUtilityMethods is currently under development and may undergo significant changes. The current implementation serves as a foundational structure for bucket-related operations, but we are actively working on refining the API, enhancing error handling, and optimizing performance. We recommend using this class for testing and prototyping purposes, but be prepared for potential breaking changes in future releases as we continue to improve and expand its capabilities.
 * 
 * BucketUtilityMethods is a utility class that provides foundational methods for handling bucket operations in Supabase. It includes functionalities for building file paths, managing loading states, and handling errors. This class is designed to be extended by specific bucket wrapper classes, allowing for code reuse and consistency across different bucket implementations. The methods in this class are intended to assist developers in managing file uploads, transformations, and searches within Supabase storage buckets while providing robust error handling and debugging support.
 */
export class BucketUtilityMethods<TClient extends SupabaseClientAdapter> {
  constructor(
    protected readonly supabase: TClient,
    protected readonly bucketName: string,
    protected readonly behaviour: BucketBehaviour = {
      debug: {
        returnHintsOnError: false,
      },
    }
  ) { }

  protected buildPath({
    folder,
    fileName,
    extension,
  }: PathBuilderOptions): string {
    const cleanFolder = folder ? `${folder.replace(/\/$/, "")}/` : "";

    const ext = extension ? `.${extension.replace(".", "")}` : "";

    return `${cleanFolder}${fileName}${ext}`;
  }

  protected buildTimestampPath(
    fileName: string,
    extension?: string,
    folder?: string
  ): string {
    const timestamp = Date.now();

    return this.buildPath({
      folder,
      fileName: `${timestamp}-${fileName}`,
      extension,
    });
  }

  protected getDebugLogs(metaData: any) {
    if (this.behaviour.debug?.returnHintsOnError) {
      return {
        ...metaData,
        bucket: this.bucketName,
        bucketBehaviour: this.behaviour,
      };
    }
    return null;
  }

  protected async withLoading<T>(
    cbs: Callbacks | undefined,
    cb: () => Promise<T>
  ): Promise<T> {
    cbs?.onLoadingStateChange?.(true);

    try {
      return await cb();
    } finally {
      cbs?.onLoadingStateChange?.(false);
    }
  }

  protected handleError(error: unknown): Response<any> {
    if (error instanceof BaseError) {
      return new APIResponse(null, error.flag, {
        message: error.message,
        hints: error.hints,
        output: error.output,
      }).build();
    }

    return new APIResponse(null, Flag.InternalError, {
      output: error,
    }).build();
  }

  protected isEmptyPayload(payload: object) {
    return !payload || Object.keys(payload).length === 0;
  }

  protected info() {
    return {
      bucketName: this.bucketName,
    };
  }
}
