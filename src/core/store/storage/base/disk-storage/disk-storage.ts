// import type { StorageAdapter } from "../../../../../types/index.js";
// import fs from "node:fs";
// import path from "node:path";

// class FileStorage implements StorageAdapter {
//     private readonly filePath: string;

//     constructor(filePath: string) {
//         this.filePath = `${filePath}.json`;
//         this.ensureFile();
//     }

//     private ensureFile(): void {
//         const dir = path.dirname(this.filePath);

//         if (!fs.existsSync(dir)) {
//             fs.mkdirSync(dir, { recursive: true });
//         }

//         if (!fs.existsSync(this.filePath)) {
//             fs.writeFileSync(this.filePath, "{}", "utf-8");
//         }
//     }

//     private readStore(): Record<string, string> {
//         try {
//             this.ensureFile();

//             const raw = fs.readFileSync(this.filePath, "utf-8");

//             return raw.trim() ? JSON.parse(raw) : {};
//         } catch {
//             return {};
//         }
//     }

//     private writeStore(store: Record<string, string>): void {
//         this.ensureFile();

//         fs.writeFileSync(
//             this.filePath,
//             JSON.stringify(store, null, 2),
//             "utf-8"
//         );
//     }

//     getItem(key: string): string | null {
//         const store = this.readStore();
//         return store[key] ?? null;
//     }

//     setItem(key: string, value: string): void {
//         const store = this.readStore();
//         store[key] = value;
//         this.writeStore(store);
//     }

//     removeItem(key: string): void {
//         const store = this.readStore();

//         if (!(key in store)) return;

//         delete store[key];
//         this.writeStore(store);
//     }

//     clear(): void {
//         this.writeStore({});
//     }

//     keys(): string[] {
//         return Object.keys(this.readStore());
//     }
// }

// /**
//  * Creates a persistent file-based storage adapter for caching data on disk.
//  *
//  * This storage implementation is **Node.js only** and relies on the built-in
//  * `node:fs` module for synchronous file system operations.
//  *
//  * It is intended for server-side environments such as:
//  * - Node.js backend servers
//  * - CLI scripts
//  * - cron jobs / workers
//  * - local development tools
//  *
//  * This adapter is **not supported in browser or frontend environments**
//  * because the `fs` module is unavailable outside Node.js.
//  *
//  * @param filePath Absolute or relative path to the cache file.
//  * If the file or its parent directories do not exist, they will be created automatically.
//  *
//  * @returns A persistent `StorageAdapter` instance that stores cache data
//  * inside the specified file.
//  * 
//  * @throws May throw file system related errors in restricted environments
//  * or when write permissions are denied.
//  *
//  * @example
//  * ```ts
//  * import { createPersistentStorage } from "supawrapper/node";
//  *
//  * const storage = createPersistentStorage("./cache"); // automatically creates cache.json from root dir.
//  * ```
//  */

// function createPersistentStorage(filePath: string): StorageAdapter {
//     return new FileStorage(filePath);
// }

// export { createPersistentStorage };