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

  const ct = res.headers.get("content-type") || "";
  let responseBody;

  if (ct.includes("application/json")) {
    responseBody = await res.json();
  } else {
    responseBody = await res.text();
  }

  if (res.status === 401 || res.status === 403) {
    throw new Error(responseBody?.message || "No autorizado");
  }

  if (!res.ok) {
    const errorMsg = responseBody?.message || responseBody?.error || `Error HTTP ${res.status}`;
    throw new Error(errorMsg);
  }

  return responseBody;
}

export async function getClientes(params = {}) {
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  const s = qs.toString();
  return request(`/clientes${s ? `?${s}` : ""}`);
}

export async function getClienteById(id) {
  return request(`/clientes/${id}`);
}

export async function createCliente(formDataOrJson) {
  return request(`/clientes`, {
    method: "POST",
    body: formDataOrJson,
  });
}

export async function updateCliente(id, formDataOrJson) {
  return request(`/clientes/${id}`, {
    method: "PUT",
    body: formDataOrJson,
  });
}

export async function deleteCliente(id) {
  return request(`/clientes/${id}`, { method: "DELETE" });
}