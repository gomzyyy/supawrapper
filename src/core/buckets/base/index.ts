import { BucketUtilityMethods } from "./utility.js";
import type {
  BucketBehaviour,
  OnLoadingStateChangeCallback,
  UploadOptions,
  TransformOptions,
  SearchOptions,
  SupabaseClientAdapter
} from "../../../types/index.js";

export class BaseBucketWrapper<TClient extends SupabaseClientAdapter> extends BucketUtilityMethods<TClient> {
  constructor(
    bucketName: string,
    supabase: TClient,
    behaviour: BucketBehaviour = {
      debug: {
        returnHintsOnError: true,
      },
    }
  ) {
    super(supabase, bucketName, behaviour);
  }

  private bucket() {
    return this.supabase.storage.from(this.bucketName);
  }

  async uploadOne(
    path: string,
    file: File | Blob,
    opts: UploadOptions = {},
    cbs?: OnLoadingStateChangeCallback
  ) {
    return this.withLoading(cbs, async () => {
      try {
        const { data, error } = await this.bucket().upload(path, file, {
          upsert: opts.upsert ?? false,
          contentType: opts.contentType,
          cacheControl: opts.cacheControl,
        });

        if (error) throw error;
        return data;
      } catch (error) {
        return this.handleError(error);
      }
    });
  }

  async uploadMany(
    files: {
      path: string;
      file: File | Blob;
      options?: UploadOptions;
    }[],
    cbs?: OnLoadingStateChangeCallback
  ) {
    return this.withLoading(cbs, async () => {
      try {
        const results = await Promise.all(
          files.map((item) =>
            this.bucket().upload(item.path, item.file, {
              upsert: item.options?.upsert ?? false,
              contentType: item.options?.contentType,
              cacheControl: item.options?.cacheControl,
            })
          )
        );

        return results;
      } catch (error) {
        return this.handleError(error);
      }
    });
  }

  async deleteOne(path: string, cbs?: OnLoadingStateChangeCallback) {
    return this.withLoading(cbs, async () => {
      return this.deleteMany([path]);
    });
  }

  async deleteMany(paths: string[], cbs?: OnLoadingStateChangeCallback) {
    return this.withLoading(cbs, async () => {
      try {
        const { data, error } = await this.bucket().remove(paths);

        if (error) throw error;

        return data;
      } catch (error) {
        return this.handleError(error);
      }
    });
  }

  async downloadOne(path: string, opts?: { transform?: TransformOptions }, cbs?: OnLoadingStateChangeCallback) {
    return this.withLoading(cbs, async () => {
      try {
        const { data, error } = await this.bucket().download(path, opts);

        if (error) throw error;

        return data;
      } catch (error) {
        return this.handleError(error);
      }
    });
  }

  getPublicUrl(
    path: string,
    opts?: { download?: string | boolean; transform?: TransformOptions }
  ): string {
    const { data } = this.bucket().getPublicUrl(path, opts);

    return data.publicUrl;
  }

  async getSignedUrl(path: string, expiresIn = 60 * 60) {
    try {
      const { data, error } = await this.bucket().createSignedUrl(
        path,
        expiresIn
      );

      if (error) throw error;

      return data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async list(
    folder?: string,
    searchOptions?: SearchOptions
  ): Promise<any[] | any> {
    try {
      const { data, error } = await this.bucket().list(folder, searchOptions);

      if (error) throw error;

      return data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async move(fromPath: string, toPath: string) {
    try {
      const { data, error } = await this.bucket().move(fromPath, toPath);

      if (error) throw error;

      return data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async exists(path: string) {
    try {
      const files = await this.list(path);
      return files?.some((file: any) => file.name === path);
    } catch {
      return false;
    }
  }
}
