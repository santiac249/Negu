const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

// getToken es una función: se pasa desde useAuth y se evalúa por request
function authHeaders(getToken) {
  const token = typeof getToken === "function" ? getToken() : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseJsonOrThrow(res) {
  const text = await res.text(); // lee siempre texto primero
  if (!res.ok) {
    // muestra el cuerpo real del error (evita "Unexpected token <")
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    // si el backend devolvió texto plano válido en éxito
    return text;
  }
}

export async function findAllProveedores(getToken) {
  const res = await fetch(`${BASE_URL}/proveedores`, {
    method: "GET",
    headers: authHeaders(getToken),
  });
  return parseJsonOrThrow(res);
}

export async function createProveedor(payload, getToken) {
  const res = await fetch(`${BASE_URL}/proveedores`, {
    method: "POST",
    headers: authHeaders(getToken),
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow(res);
}

export async function updateProveedor(id, payload, getToken) {
  const res = await fetch(`${BASE_URL}/proveedores/${id}`, {
    method: "PUT",
    headers: authHeaders(getToken),
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow(res);
}

export async function deleteProveedor(id, getToken) {
  const res = await fetch(`${BASE_URL}/proveedores/${id}`, {
    method: "DELETE",
    headers: authHeaders(getToken),
  });
  return parseJsonOrThrow(res);
}
