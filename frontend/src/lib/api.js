export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export function apiUrl(path) {
  const normalizedPath = String(path).startsWith("/")
    ? String(path)
    : `/${String(path)}`;
  return `${API_BASE_URL}${normalizedPath}`;
}