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

// Plan Separe CRUD
export function getPlanSepares(params = {}) {
  const qs = new URLSearchParams();
  if (params.estado) qs.set("estado", params.estado);
  const s = qs.toString();
  return request(`/plan-separe${s ? `?${s}` : ""}`);
}

export function getPlanSepare(id) {
  return request(`/plan-separe/${id}`);
}

export function createPlanSepare(data) {
  return request(`/plan-separe`, {
    method: "POST",
    body: data,
  });
}

export function updatePlanSepare(id, data) {
  return request(`/plan-separe/${id}`, {
    method: "PUT",
    body: data,
  });
}

export function deletePlanSepare(id) {
  return request(`/plan-separe/${id}`, { method: "DELETE" });
}

// Abonos
export function createAbono(planSepareId, data) {
  return request(`/plan-separe/${planSepareId}/abonos`, {
    method: "POST",
    body: data,
  });
}

export function getAbonos(planSepareId) {
  return request(`/plan-separe/${planSepareId}/abonos`);
}

// Búsquedas específicas
export function getPlanSeparesByCliente(nombre) {
  return request(`/plan-separe/cliente/nombre/${encodeURIComponent(nombre)}`);
}

export function getPlanSeparesByCedula(cedula) {
  return request(`/plan-separe/cliente/cedula/${encodeURIComponent(cedula)}`);
}

// APIs auxiliares
export function getClientes() {
  return request(`/clientes`);
}

export function getStock() {
  return request(`/stock`);
}