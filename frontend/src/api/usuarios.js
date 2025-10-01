import axios from "axios";

const API_URL = "http://localhost:3000/usuarios";

// Obtener todos los usuarios
export const findAllUsuarios = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

// Buscar por cédula (según tu controlador actual)
export const findUsuarioByCedula = async (cedula) => {
  const res = await axios.get(`${API_URL}/${cedula}`);
  return res.data;
};

// Crear usuario (el backend espera JSON, no multipart)
export async function createUsuario(formData) {
  const response = await fetch(API_URL, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error al crear el usuario");
  }

  return await response.json();
}

export async function updateUsuario(formData, isUpdate, id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Error al actualizar usuario");
  }

  return await res.json();
}

// Eliminar usuario
export const deleteUsuario = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};
