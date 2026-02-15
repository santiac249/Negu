import axiosClient from './axiosClient';

/**
 * Obtener todas las categorías
 */
export const findAllCategorias = async (getToken, query = '', page = 1, limit = 50) => {
  const token = getToken();
  const params = new URLSearchParams();
  if (query) params.append('q', query);
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  const res = await axiosClient.get(`/categorias?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

/**
 * Obtener una categoría por ID
 */
export const findOneCategoria = async (id, getToken) => {
  const token = getToken();
  const res = await axiosClient.get(`/categorias/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

/**
 * Obtener subcategorías de una categoría
 */
export const findSubcategoriasByCategoria = async (id, getToken, query = '') => {
  const token = getToken();
  const params = query ? `?q=${encodeURIComponent(query)}` : '';
  const res = await axiosClient.get(`/categorias/${id}/subcategorias${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

/**
 * Crear categoría con FormData (para subir foto)
 */
export const createCategoriaFD = async (formData, getToken) => {
  const token = getToken();
  const fd = new FormData();
  
  fd.append('categoria', formData.categoria);
  if (formData.descripcion) fd.append('descripcion', formData.descripcion);
  if (formData.foto) fd.append('foto', formData.foto);
  if (formData.subcategoriaIds && formData.subcategoriaIds.length > 0) {
    formData.subcategoriaIds.forEach(id => fd.append('subcategoriaIds[]', id.toString()));
  }

  const res = await axiosClient.post('/categorias', fd, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

/**
 * Actualizar categoría con FormData
 */
export const updateCategoriaFD = async (id, formData, getToken) => {
  const token = getToken();
  const fd = new FormData();
  
  if (formData.categoria) fd.append('categoria', formData.categoria);
  if (formData.descripcion !== undefined) fd.append('descripcion', formData.descripcion);
  if (formData.foto) fd.append('foto', formData.foto);
  if (formData.subcategoriaIds) {
    formData.subcategoriaIds.forEach(id => fd.append('subcategoriaIds[]', id.toString()));
  }

  const res = await axiosClient.put(`/categorias/${id}`, fd, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};
