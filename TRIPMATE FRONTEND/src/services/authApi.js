const AUTH_API_BASE = (
  import.meta.env.VITE_AUTH_API_URL || "http://localhost:4000"
).replace(/\/+$/, "");

async function request(path, options = {}) {
  const response = await fetch(`${AUTH_API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success)
    throw new Error(data.error || "Authentication failed.");
  return data;
}

export const getCurrentUser = () => request("/api/auth/me");
export const login = (credentials) =>
  request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
export const register = (details) =>
  request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(details),
  });
export const logout = () => request("/api/auth/logout", { method: "POST" });
