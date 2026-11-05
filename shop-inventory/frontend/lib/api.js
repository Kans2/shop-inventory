const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const getToken = () => { try { return localStorage.getItem("token"); } catch { return null; } };
export const setToken = (t) => localStorage.setItem("token", t);
export const clearToken = () => { try { localStorage.removeItem("token"); } catch {} };

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token && !path.startsWith("/auth/login")) {
      clearToken();
      if (typeof window !== "undefined") window.location.href = "/login";
    }
    throw new Error(data.message || "Request failed");
  }
  return data;
}

const qs = (params = {}) => {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v && p.set(k, v));
  const s = p.toString();
  return s ? `?${s}` : "";
};

export const api = {
  login: (body) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  register: (body) => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  me: () => request("/auth/me"),
  getDashboard: () => request("/dashboard"),
  getProducts: (params) => request(`/products${qs(params)}`),
  getCategories: () => request("/products/categories"),
  getCategoryDetails: () => request("/categories"),
  createCategory: (body) => request("/categories", { method: "POST", body: JSON.stringify(body) }),
  updateCategory: (id, body) => request(`/categories/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: "DELETE" }),
  createProduct: (body) => request("/products", { method: "POST", body: JSON.stringify(body) }),
  updateProduct: (id, body) => request(`/products/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: "DELETE" }),
  adjustStock: (id, body) => request(`/products/${id}/stock`, { method: "POST", body: JSON.stringify(body) }),
  getMovements: (params) => request(`/movements${qs(params)}`),
  getProductMovements: (id) => request(`/products/${id}/movements`),
};
