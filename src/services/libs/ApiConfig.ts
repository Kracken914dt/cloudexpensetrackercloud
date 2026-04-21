const apiBaseFromEnv = process.env.NEXT_PUBLIC_API_BASE?.trim();
const isInternalAlbHost = /^https?:\/\/internal-/i.test(apiBaseFromEnv ?? "");

export const API_URLS = {
  // Use same-origin by default so browser calls /api/* and Next rewrites server-side.
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
