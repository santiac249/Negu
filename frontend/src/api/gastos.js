import axiosClient from './axiosClient';

/**
 * Obtener todos los gastos con filtros y paginación
 * El backend devuelve: { data: [...], total, page, limit, pages }
 */
export const findAllGastos = async (getToken, filters = {}) => {
  const token = getToken();
  const params = new URLSearchParams();
  
  // Filtros
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.tipo) params.append('tipo', filters.tipo);
  if (filters.concepto) params.append('concepto', filters.concepto);
  if (filters.fechaInicio) params.append('fechaInicio', filters.fechaInicio);
  if (filters.fechaFin) params.append('fechaFin', filters.fechaFin);
  if (filters.proveedorId) params.append('proveedorId', filters.proveedorId.toString());
  if (filters.usuarioId) params.append('usuarioId', filters.usuarioId.toString());

  const res = await axiosClient.get(`/gastos?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  // El backend devuelve un objeto con data, total, page, limit, pages
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
 * Devuelve: [{ tipo, total, cantidad }]
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
 * Devuelve array de gastos en el período
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
 * Devuelve: { total, cantidad }
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
 * Requiere: { usuarioId, concepto, monto, tipo, proveedorId?, fecha? }
 */
export const createGasto = async (data, getToken) => {
  const token = getToken();
  
  // Asegurar que los datos estén en el formato correcto
  const payload = {
    usuarioId: parseInt(data.usuarioId),
    concepto: data.concepto,
    monto: parseFloat(data.monto),
    tipo: data.tipo,
  };

  // Campos opcionales
  if (data.proveedorId) {
    payload.proveedorId = parseInt(data.proveedorId);
  }
  if (data.fecha) {
    payload.fecha = data.fecha;
  }

  const res = await axiosClient.post('/gastos', payload, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });
  return res.data;
};

/**
 * Actualizar un gasto
 * Puede actualizar cualquier campo del gasto
 */
export const updateGasto = async (id, data, getToken) => {
  const token = getToken();
  
  // Preparar payload solo con campos que se van a actualizar
  const payload = {};
  
  if (data.concepto !== undefined) payload.concepto = data.concepto;
  if (data.monto !== undefined) payload.monto = parseFloat(data.monto);
  if (data.tipo !== undefined) payload.tipo = data.tipo;
  if (data.proveedorId !== undefined) {
    payload.proveedorId = data.proveedorId ? parseInt(data.proveedorId) : null;
  }
  if (data.usuarioId !== undefined) payload.usuarioId = parseInt(data.usuarioId);
  if (data.fecha !== undefined) payload.fecha = data.fecha;

  const res = await axiosClient.put(`/gastos/${id}`, payload, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
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
