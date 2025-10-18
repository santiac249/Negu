const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function getToken() {
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

async function request(path, { method = "GET", body, headers = {}, auth = true } = {}) {
  const url = `${BASE_URL}${path}`;
  const token = getToken();
  const isForm = body instanceof FormData;

  const res = await fetch(url, {
    method,
    headers: {
      ...(isForm ? {} : { "Content-Type": "application/json" }),
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 || res.status === 403) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Unauthorized");
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

// ==================== CATEGORÍAS ====================
export function getCategorias(params = {}) {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.page) qs.set("page", params.page);
  if (params.limit) qs.set("limit", params.limit);
  const s = qs.toString();
  return request(`/categorias${s ? `?${s}` : ""}`);
}

export function getCategoria(id) {
  return request(`/categorias/${id}`);
}

export function getSubcategoriasByCategoria(categoriaId, params = {}) {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  const s = qs.toString();
  return request(`/categorias/${categoriaId}/subcategorias${s ? `?${s}` : ""}`);
}

export function createCategoria(formData) {
  return request(`/categorias`, { method: "POST", body: formData });
}

export function updateCategoria(id, formData) {
  return request(`/categorias/${id}`, { method: "PUT", body: formData });
}

// ==================== SUBCATEGORÍAS ====================
export function getSubcategorias(params = {}) {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.page) qs.set("page", params.page);
  if (params.limit) qs.set("limit", params.limit);
  const s = qs.toString();
  return request(`/subcategorias${s ? `?${s}` : ""}`);
}

export function getSubcategoria(id) {
  return request(`/subcategorias/${id}`);
}

export function getProductosBySubcategoria(subcategoriaId, params = {}) {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  const s = qs.toString();
  return request(`/subcategorias/${subcategoriaId}/productos${s ? `?${s}` : ""}`);
}

export function createSubcategoria(formData) {
  return request(`/subcategorias`, { method: "POST", body: formData });
}

export function updateSubcategoria(id, formData) {
  return request(`/subcategorias/${id}`, { method: "PUT", body: formData });
}

// ==================== PRODUCTOS ====================
export function getProductos(params = {}) {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.page) qs.set("page", params.page);
  if (params.limit) qs.set("limit", params.limit);
  const s = qs.toString();
  return request(`/productos${s ? `?${s}` : ""}`);
}

export function getProducto(id) {
  return request(`/productos/${id}`);
}

export function getStockByProducto(productoId) {
  return request(`/productos/${productoId}/stock`);
}

export function createProducto(formData) {
  return request(`/productos`, { method: "POST", body: formData });
}

export function updateProducto(id, formData) {
  return request(`/productos/${id}`, { method: "PUT", body: formData });
}

// ==================== MARCAS ====================
export function getMarcas(params = {}) {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  const s = qs.toString();
  return request(`/marcas${s ? `?${s}` : ""}`);
}