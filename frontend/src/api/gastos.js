import axiosClient from './axiosClient';

/**
 * Obtener todos los gastos con filtros
 */
export const findAllGastos = async (getToken, filters = {}) => {
  const token = getToken();
  const params = new URLSearchParams();
  
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.tipo) params.append('tipo', filters.tipo);
  if (filters.fechaInicio) params.append('fechaInicio', filters.fechaInicio);
  if (filters.fechaFin) params.append('fechaFin', filters.fechaFin);
  if (filters.proveedorId) params.append('proveedorId', filters.proveedorId.toString());
  if (filters.usuarioId) params.append('usuarioId', filters.usuarioId.toString());

  const res = await axiosClient.get(`/gastos?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

/**
 * Obtener un gasto por ID
 */
export const findOneGasto = async (id, getToken) => {
  const token = getToken();
  const res = await axiosClient.get(`/gastos/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

/**
 * Obtener resumen de gastos por tipo
 */
export const getResumenPorTipo = async (getToken) => {
  const token = getToken();
  const res = await axiosClient.get('/gastos/resumen/por-tipo', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

/**
 * Obtener gastos por período
 */
export const getGastosPorPeriodo = async (fechaInicio, fechaFin, getToken) => {
  const token = getToken();
  const res = await axiosClient.get(
    `/gastos/periodo?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

/**
 * Obtener total de gastos en un período
 */
export const getTotalGastosPeriodo = async (fechaInicio, fechaFin, getToken) => {
  const token = getToken();
  const res = await axiosClient.get(
    `/gastos/total-periodo?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

/**
 * Crear un nuevo gasto
 */
export const createGasto = async (data, getToken) => {
  const token = getToken();
  const res = await axiosClient.post('/gastos', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

/**
 * Actualizar un gasto
 */
export const updateGasto = async (id, data, getToken) => {
  const token = getToken();
  const res = await axiosClient.put(`/gastos/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

/**
 * Eliminar un gasto
 */
export const deleteGasto = async (id, getToken) => {
  const token = getToken();
  const res = await axiosClient.delete(`/gastos/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
