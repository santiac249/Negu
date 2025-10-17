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

// Clientes CRUD
export function getClientes(params = {}) {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  const s = qs.toString();
  return request(`/clientes${s ? `?${s}` : ""}`);
}

export function getCliente(id) {
  return request(`/clientes/${id}`);
}

export function createCliente(data) {
  return request(`/clientes`, {
    method: "POST",
    body: data,
  });
}

export function updateCliente(id, data) {
  return request(`/clientes/${id}`, {
    method: "PUT",
    body: data,
  });
}

export function deleteCliente(id) {
  return request(`/clientes/${id}`, { method: "DELETE" });
}