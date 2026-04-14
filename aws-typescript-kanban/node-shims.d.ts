declare const process: {
  cwd(): string;
  env: Record<string, string | undefined>;
  on(event: string, listener: (...args: any[]) => void): void;
  exit(code?: number): never;
};

declare const Buffer: {
  from(input: string): Uint8Array;
  concat(chunks: Uint8Array[]): { toString(encoding: string): string };
};

declare module "node:fs/promises" {
  export function access(path: string): Promise<void>;
  export function copyFile(source: string, destination: string): Promise<void>;
  export function cp(source: string, destination: string): Promise<void>;
  export function mkdir(path: string, options?: { recursive?: boolean }): Promise<void>;
  export function readFile(path: string, encoding?: string): Promise<any>;
  export function rm(path: string, options?: { force?: boolean; recursive?: boolean }): Promise<void>;
  export function writeFile(path: string, data: string | Uint8Array, encoding?: string): Promise<void>;
}

declare module "node:path" {
  const path: {
    join: (...parts: string[]) => string;
    resolve: (...parts: string[]) => string;
    dirname: (value: string) => string;
  };
  export default path;
}

declare module "node:url" {
  export function fileURLToPath(url: string | URL): string;
}

declare module "node:http" {
  export type IncomingMessage = any;
  export type ServerResponse = any;
  export function createServer(handler: (request: any, response: any) => void | Promise<void>): {
    listen(port: number, hostname?: string, callback?: () => void): void;
  };
}
