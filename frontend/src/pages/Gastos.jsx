import { useEffect, useState } from 'react';
import { PlusCircle, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../store/auth';
import {
  findAllGastos,
  createGasto,
  updateGasto,
  deleteGasto,
  getResumenPorTipo,
} from '../api/gastos';
import { findAllProveedores } from '../api/proveedores';

import GastosTable from '../components/gastos/GastosTable';
import CreateGastoModal from '../components/gastos/CreateGastoModal';
import EditGastoModal from '../components/gastos/EditGastoModal';
import InfoGastoModal from '../components/gastos/InfoGastoModal';

export default function Gastos() {
  const { getToken, user } = useAuth();
  const [gastos, setGastos] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editGasto, setEditGasto] = useState(null);
  const [infoGasto, setInfoGasto] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalGastos, setTotalGastos] = useState(0);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const limit = 20;
  
  // Filtros
  const [filters, setFilters] = useState({
    tipo: '',
    concepto: '',
    fechaInicio: '',
    fechaFin: '',
    proveedorId: '',
  });
  const [proveedores, setProveedores] = useState([]);
  const [resumenPorTipo, setResumenPorTipo] = useState([]);

  const tiposGasto = ['Operativo', 'Administrativo', 'Financiero', 'Marketing', 'Otro'];

  useEffect(() => {
    refresh();
    loadProveedores();
    loadResumen();
  }, [currentPage]);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await findAllGastos(getToken, {
        ...filters,
        page: currentPage,
        limit: limit,
      });
      
      // El backend devuelve: { data, total, page, limit, pages }
      if (response && response.data) {
        setGastos(response.data);
        setTotalRegistros(response.total || 0);
        setTotalPages(response.pages || 1);
        
        // Calcular total de montos
        const total = response.data.reduce((sum, g) => sum + (g.monto || 0), 0);
        setTotalGastos(total);
      } else {
        // Manejo si el backend devuelve un array directo (legacy)
        setGastos(Array.isArray(response) ? response : []);
        const total = (Array.isArray(response) ? response : []).reduce(
          (sum, g) => sum + (g.monto || 0),
          0
        );
        setTotalGastos(total);
        setTotalRegistros(Array.isArray(response) ? response.length : 0);
      }
    } catch (err) {
      console.error('Error cargando gastos:', err);
      setError(err.response?.data?.message || err.message || 'Error al cargar gastos');
      setGastos([]);
    } finally {
      setLoading(false);
    }
  };

  const loadProveedores = async () => {
    try {
      const data = await findAllProveedores(getToken);
      setProveedores(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando proveedores:', err);
    }
  };

  const loadResumen = async () => {
    try {
      const data = await getResumenPorTipo(getToken);
      setResumenPorTipo(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando resumen:', err);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setCurrentPage(1); // Reset a página 1 al aplicar filtros
    refresh();
  };

  const clearFilters = () => {
    setFilters({
      tipo: '',
      concepto: '',
      fechaInicio: '',
      fechaFin: '',
      proveedorId: '',
    });
    setCurrentPage(1);
    setTimeout(() => refresh(), 100);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleCreateGasto = async (data) => {
    try {
      await createGasto(data, getToken);
      setShowCreate(false);
      setCurrentPage(1);
      refresh();
      loadResumen();
    } catch (err) {
      console.error('Error creando gasto:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Error al crear gasto';
      alert(`Error: ${errorMsg}`);
      throw err; // Re-throw para que el modal maneje el loading
    }
  };

  const handleUpdateGasto = async (data) => {
    try {
      await updateGasto(editGasto.id, data, getToken);
      setEditGasto(null);
      refresh();
      loadResumen();
    } catch (err) {
      console.error('Error actualizando gasto:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Error al actualizar gasto';
      alert(`Error: ${errorMsg}`);
      throw err;
    }
  };

  const handleDeleteGasto = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este gasto? Esta acción no se puede deshacer.')) return;
    
    try {
      await deleteGasto(id, getToken);
      // Si era el único elemento de la página y no es la primera, volver a la anterior
      if (gastos.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        refresh();
      }
      loadResumen();
    } catch (err) {
      console.error('Error eliminando gasto:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Error al eliminar gasto';
      alert(`Error: ${errorMsg}`);
    }
  };

  return (
    <div className="grid gap-4">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-xl font-semibold">Gestión de Gastos</h2>

          <div className="flex flex-col sm:flex-row gap-2">
            {/* Botón filtros */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                showFilters
                  ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Filter className="w-5 h-5" />
              Filtros
            </button>

            {/* Botón crear */}
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md text-sm"
            >
              <PlusCircle className="w-5 h-5" />
              Nuevo gasto
            </button>
          </div>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="bg-white rounded-xl border p-4 shadow-sm">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Filtros de Búsqueda</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Concepto */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Concepto
                </label>
                <input
                  type="text"
                  value={filters.concepto}
                  onChange={(e) => handleFilterChange('concepto', e.target.value)}
                  placeholder="Buscar en concepto..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Tipo de Gasto
                </label>
                <select
                  value={filters.tipo}
                  onChange={(e) => handleFilterChange('tipo', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Todos los tipos</option>
                  {tiposGasto.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha Inicio */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  value={filters.fechaInicio}
                  onChange={(e) => handleFilterChange('fechaInicio', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Fecha Fin */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  value={filters.fechaFin}
                  onChange={(e) => handleFilterChange('fechaFin', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Proveedor */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Proveedor
                </label>
                <select
                  value={filters.proveedorId}
                  onChange={(e) => handleFilterChange('proveedorId', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Todos los proveedores</option>
                  {proveedores.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={applyFilters}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg disabled:opacity-50"
              >
                Aplicar Filtros
              </button>
              <button
                onClick={clearFilters}
                disabled={loading}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg"
              >
                Limpiar
              </button>
            </div>
          </div>
        )}

        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total de gastos */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 text-white">
            <p className="text-sm opacity-90">Total de Gastos</p>
            <p className="text-2xl font-bold">{formatCurrency(totalGastos)}</p>
            <p className="text-xs opacity-75 mt-1">{totalRegistros} registros</p>
          </div>

          {/* Gasto promedio */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
            <p className="text-sm opacity-90">Gasto Promedio</p>
            <p className="text-2xl font-bold">
              {totalRegistros > 0 ? formatCurrency(totalGastos / totalRegistros) : formatCurrency(0)}
            </p>
            <p className="text-xs opacity-75 mt-1">Por registro</p>
          </div>

          {/* Gastos por tipo más frecuente */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
            <p className="text-sm opacity-90">Tipo Más Frecuente</p>
            <p className="text-2xl font-bold">
              {resumenPorTipo.length > 0
                ? resumenPorTipo.reduce((max, item) =>
                    item.cantidad > max.cantidad ? item : max
                  ).tipo
                : 'N/A'}
            </p>
            <p className="text-xs opacity-75 mt-1">
              {resumenPorTipo.length > 0
                ? `${resumenPorTipo.reduce((max, item) =>
                    item.cantidad > max.cantidad ? item : max
                  ).cantidad} gastos`
                : 'Sin datos'}
            </p>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-2xl border p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-600">Cargando gastos...</p>
        </div>
      )}

      {/* Tabla */}
      {!loading && (
        <>
          <GastosTable
            gastos={gastos}
            onInfo={setInfoGasto}
            onEdit={setEditGasto}
            onDelete={handleDeleteGasto}
          />

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-lg border p-4">
              <div className="text-sm text-gray-600">
                Página {currentPage} de {totalPages} ({totalRegistros} registros totales)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modales */}
      {showCreate && (
        <CreateGastoModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreateGasto}
        />
      )}

      {editGasto && (
        <EditGastoModal
          gasto={editGasto}
          onClose={() => setEditGasto(null)}
          onUpdate={handleUpdateGasto}
        />
      )}

      {infoGasto && (
        <InfoGastoModal gasto={infoGasto} onClose={() => setInfoGasto(null)} />
      )}
    </div>
  );
}
