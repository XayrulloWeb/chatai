const DEFAULT_AUTH_API_BASE_URL = "http://localhost:4000";

export function getAuthApiBaseUrl() {
  const raw = String(import.meta.env.VITE_AUTH_API_URL || "").trim();
  if (!raw) {
    return DEFAULT_AUTH_API_BASE_URL;
  }

  return raw.replace(/\/+$/, "");
}

export function buildAuthApiUrl(path) {
  const baseUrl = getAuthApiBaseUrl();
  const normalizedPath = String(path || "").startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}
