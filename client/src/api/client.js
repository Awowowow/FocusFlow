const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export const api = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error?.message ?? "Request failed.");
    error.code = data.error?.code;
    error.details = data.error?.details;
    throw error;
  }
  return data;
};

export const post = (path, body) => api(path, { method: "POST", body: JSON.stringify(body) });
export const patch = (path, body) => api(path, { method: "PATCH", body: JSON.stringify(body) });
export const remove = (path) => api(path, { method: "DELETE" });
