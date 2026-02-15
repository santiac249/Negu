import axiosClient from './axiosClient';

/**
 * Obtener todas las ventas con filtros
 */
export const findAllVentas = async (getToken, filters = {}) => {
  const token = getToken();
  const params = new URLSearchParams();
  
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.clienteId) params.append('clienteId', filters.clienteId.toString());
  if (filters.usuarioId) params.append('usuarioId', filters.usuarioId.toString());
  if (filters.estado) params.append('estado', filters.estado);
  if (filters.metPagoId) params.append('metPagoId', filters.metPagoId.toString());
  if (filters.fechaInicio) params.append('fechaInicio', filters.fechaInicio);
  if (filters.fechaFin) params.append('fechaFin', filters.fechaFin);

  const res = await axiosClient.get(`/ventas?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

/**
 * Obtener una venta por ID
 */
export const findOneVenta = async (id, getToken) => {
  const token = getToken();
  const res = await axiosClient.get(`/ventas/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

/**
 * Obtener ventas por período
 */
export const getVentasPorPeriodo = async (fechaInicio, fechaFin, getToken) => {
  const token = getToken();
  const res = await axiosClient.get(
    `/ventas/periodo?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

/**
 * Obtener total de ventas en un período
 */
export const getTotalVentasPeriodo = async (fechaInicio, fechaFin, getToken) => {
  const token = getToken();
  const res = await axiosClient.get(
    `/ventas/total-periodo?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

/**
 * Obtener productos más vendidos
 */
export const getProductosMasVendidos = async (getToken, limit = 10) => {
  const token = getToken();
  const res = await axiosClient.get(
    `/ventas/analisis/productos-top?limit=${limit}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

/**
 * Obtener resumen por método de pago
 */
export const getResumenPorMetodoPago = async (getToken) => {
  const token = getToken();
  const res = await axiosClient.get('/ventas/analisis/resumen-metodo-pago', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

/**
 * Obtener ventas de un cliente
 */
export const getVentasPorCliente = async (clienteId, getToken) => {
  const token = getToken();
  const res = await axiosClient.get(`/ventas/cliente/${clienteId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

/**
 * Crear una nueva venta
 */
export const createVenta = async (data, getToken) => {
  const token = getToken();
  const res = await axiosClient.post('/ventas', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

/**
 * Actualizar una venta
 */
export const updateVenta = async (id, data, getToken) => {
  const token = getToken();
  const res = await axiosClient.put(`/ventas/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

/**
 * Cancelar una venta (eliminar y revertir stock)
 */
export const cancelarVenta = async (id, getToken) => {
  const token = getToken();
  const res = await axiosClient.delete(`/ventas/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
