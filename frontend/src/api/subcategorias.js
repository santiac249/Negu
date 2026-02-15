import axiosClient from './axiosClient';

/**
 * Obtener todas las subcategorías
 */
export const findAllSubcategorias = async (getToken, query = '', page = 1, limit = 50) => {
  const token = getToken();
  const params = new URLSearchParams();
  if (query) params.append('q', query);
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  const res = await axiosClient.get(`/subcategorias?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

/**
 * Obtener una subcategoría por ID
 */
export const findOneSubcategoria = async (id, getToken) => {
  const token = getToken();
  const res = await axiosClient.get(`/subcategorias/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

/**
 * Obtener productos de una subcategoría
 */
export const findProductosBySubcategoria = async (id, getToken, query = '') => {
  const token = getToken();
  const params = query ? `?q=${encodeURIComponent(query)}` : '';
  const res = await axiosClient.get(`/subcategorias/${id}/productos${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

/**
 * Obtener categorías de una subcategoría
 */
export const findCategoriasBySubcategoria = async (id, getToken) => {
  const token = getToken();
  const res = await axiosClient.get(`/subcategorias/${id}/categorias`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

/**
 * Crear subcategoría con FormData (para subir foto)
 */
export const createSubcategoriaFD = async (formData, getToken) => {
  const token = getToken();
  const fd = new FormData();
  
  fd.append('subcategoria', formData.subcategoria);
  if (formData.descripcion) fd.append('descripcion', formData.descripcion);
  if (formData.foto) fd.append('foto', formData.foto);
  if (formData.categoriaIds && formData.categoriaIds.length > 0) {
    formData.categoriaIds.forEach(id => fd.append('categoriaIds[]', id.toString()));
  }

  const res = await axiosClient.post('/subcategorias', fd, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

/**
 * Actualizar subcategoría con FormData
 */
export const updateSubcategoriaFD = async (id, formData, getToken) => {
  const token = getToken();
  const fd = new FormData();
  
  if (formData.subcategoria) fd.append('subcategoria', formData.subcategoria);
  if (formData.descripcion !== undefined) fd.append('descripcion', formData.descripcion);
  if (formData.foto) fd.append('foto', formData.foto);
  if (formData.categoriaIds) {
    formData.categoriaIds.forEach(id => fd.append('categoriaIds[]', id.toString()));
  }

  const res = await axiosClient.put(`/subcategorias/${id}`, fd, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};
