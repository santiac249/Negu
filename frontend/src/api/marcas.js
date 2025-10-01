const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function authHeaders(getToken, isFormData) {
  const token = typeof getToken === "function" ? getToken() : null;
  const base = isFormData ? {} : { "Content-Type": "application/json" };
  return {
    ...base,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseJsonOrThrow(res) {
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
  try { return text ? JSON.parse(text) : {}; } catch { return text; }
}

export async function findAllMarcas(getToken) {
  const res = await fetch(`${BASE_URL}/marcas`, { headers: authHeaders(getToken, false) });
  return parseJsonOrThrow(res);
}

// payload puede ser FormData (marca, foto)
export async function createMarcaFD(formData, getToken) {
  const res = await fetch(`${BASE_URL}/marcas`, {
    method: "POST",
    headers: authHeaders(getToken, true),
    body: formData,
  });
  return parseJsonOrThrow(res);
}

export async function updateMarcaFD(id, formData, getToken) {
  const res = await fetch(`${BASE_URL}/marcas/${id}`, {
    method: "PUT",
    headers: authHeaders(getToken, true),
    body: formData,
  });
  return parseJsonOrThrow(res);
}

export async function deleteMarca(id, getToken) {
  const res = await fetch(`${BASE_URL}/marcas/${id}`, {
    method: "DELETE",
    headers: authHeaders(getToken, false),
  });
  return parseJsonOrThrow(res);
}
