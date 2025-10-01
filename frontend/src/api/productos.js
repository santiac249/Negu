// src/api/productos.api.js

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

// Obtén el token desde tu store de auth si no usas localStorage
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
    // Si usas cookies httpOnly en el backend, activa:
    // credentials: "include",
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

// -------------------- Categorías --------------------

export function getCategorias(params = {}) {
  const q = params.q ? `?q=${encodeURIComponent(params.q)}` : "";
  return request(`/categorias${q}`);
}

export function getSubcategoriasByCategoria(categoriaId, params = {}) {
  const q = params.q ? `?q=${encodeURIComponent(params.q)}` : "";
  return request(`/categorias/${categoriaId}/subcategorias${q}`);
}

export function createCategoria(formDataOrJson) {
  return request(`/categorias`, {
    method: "POST",
    body: formDataOrJson,
  });
}

export function updateCategoria(id, formDataOrJson) {
  return request(`/categorias/${id}`, {
    method: "PUT",
    body: formDataOrJson,
  });
}

export function deleteCategoria(id) {
  return request(`/categorias/${id}`, { method: "DELETE" });
}

// -------------------- Subcategorías --------------------

export function getSubcategorias(params = {}) {
  const q = params.q ? `?q=${encodeURIComponent(params.q)}` : "";
  return request(`/subcategorias${q}`);
}

export function getCategoriasBySubcategoria(subcategoriaId) {
  return request(`/subcategorias/${subcategoriaId}/categorias`);
}

export function createSubcategoria(formDataOrJson) {
  // Si envías arrays en FormData, envíalos como JSON string:
  // fd.append("categoriaIds", JSON.stringify([1,2,3]))
  return request(`/subcategorias`, {
    method: "POST",
    body: formDataOrJson,
  });
}

export function updateSubcategoria(id, formDataOrJson) {
  return request(`/subcategorias/${id}`, {
    method: "PUT",
    body: formDataOrJson,
  });
}

export function deleteSubcategoria(id) {
  return request(`/subcategorias/${id}`, { method: "DELETE" });
}

// -------------------- Productos --------------------

export function getProductos(params = {}) {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.subcategoriaId) qs.set("subcategoriaId", params.subcategoriaId);
  const s = qs.toString();
  return request(`/productos${s ? `?${s}` : ""}`);
}

// Si tienes ruta REST anidada para productos por subcategoría
export function getProductosBySubcategoria(subcategoriaId, params = {}) {
  const q = params.q ? `?q=${encodeURIComponent(params.q)}` : "";
  return request(`/subcategorias/${subcategoriaId}/productos${q}`);
}

export function createProducto(formDataOrJson) {
  // Para M:N subcategoriaIds: fd.append("subcategoriaIds", JSON.stringify([1,2]))
  return request(`/productos`, {
    method: "POST",
    body: formDataOrJson,
  });
}

export function updateProducto(id, formDataOrJson) {
  return request(`/productos/${id}`, {
    method: "PUT",
    body: formDataOrJson,
  });
}

export function deleteProducto(id) {
  return request(`/productos/${id}`, { method: "DELETE" });
}

// -------------------- Marcas (auxiliar para formulario) --------------------

export function getMarcas(params = {}) {
  const q = params.q ? `?q=${encodeURIComponent(params.q)}` : "";
  return request(`/marcas${q}`);
}
