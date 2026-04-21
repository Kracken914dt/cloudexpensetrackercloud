const apiBaseFromEnv = process.env.NEXT_PUBLIC_API_BASE?.trim();
const isInternalAlbHost = /^https?:\/\/internal-/i.test(apiBaseFromEnv ?? "");

export const API_URLS = {
  // Empty base URL keeps calls same-origin (/api/*), then Next rewrites proxy to BACKEND_URL.
  Base:
    apiBaseFromEnv && apiBaseFromEnv.length > 0 && !isInternalAlbHost
      ? apiBaseFromEnv
      : "",
  ImportExport:
    process.env.NEXT_PUBLIC_IMPORT_EXPORT_API_BASE ?? "http://localhost:9000",
};

export const API_CONFIG = {
  withCredentials: process.env.NEXT_PUBLIC_API_WITH_CREDENTIALS === "true",
};
