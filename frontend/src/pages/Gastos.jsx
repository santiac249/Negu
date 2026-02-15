import { useEffect, useState } from 'react';
import { PlusCircle, Filter } from 'lucide-react';
import { useAuth } from '../store/auth';
import {
  findAllGastos,
  createGasto,
  updateGasto,
  deleteGasto,
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
  
  // Filtros
  const [filters, setFilters] = useState({
    tipo: '',
    fechaInicio: '',
    fechaFin: '',
    proveedorId: '',
  });
  const [proveedores, setProveedores] = useState([]);
  const [totalGastos, setTotalGastos] = useState(0);

  const tiposGasto = ['Operativo', 'Administrativo', 'Financiero', 'Marketing', 'Otro'];

  useEffect(() => {
    refresh();
    loadProveedores();
  }, []);

  const refresh = async () => {
    try {
      const data = await findAllGastos(getToken, {
        ...filters,
        page: 1,
        limit: 100,
      });
      setGastos(Array.isArray(data) ? data : []);
      
      // Calcular total
      const total = (Array.isArray(data) ? data : []).reduce(
        (sum, g) => sum + (g.monto || 0),
        0
      );
      setTotalGastos(total);
    } catch (err) {
      console.error(err);
      alert(`Error cargando gastos: ${err.message}`);
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

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    refresh();
  };

  const clearFilters = () => {
    setFilters({
      tipo: '',
      fechaInicio: '',
      fechaFin: '',
      proveedorId: '',
    });
    setTimeout(() => refresh(), 100);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid gap-4">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-xl font-semibold">Gastos</h2>

          <div className="flex flex-col sm:flex-row gap-2">
            {/* Botón filtros */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm"
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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
                  <option value="">Todos</option>
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
                  <option value="">Todos</option>
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
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg"
              >
                Aplicar Filtros
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg"
              >
                Limpiar
              </button>
            </div>
          </div>
        )}

        {/* Total de gastos */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total de Gastos</p>
              <p className="text-2xl font-bold">{formatCurrency(totalGastos)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Registros</p>
              <p className="text-2xl font-bold">{gastos.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <GastosTable
        gastos={gastos}
        onInfo={setInfoGasto}
        onEdit={setEditGasto}
        onDelete={async (id) => {
          if (!confirm('¿Eliminar este gasto?')) return;
          try {
            await deleteGasto(id, getToken);
            refresh();
          } catch (err) {
            alert(`Error eliminando gasto: ${err.message}`);
          }
        }}
      />

      {/* Modales */}
      {showCreate && (
        <CreateGastoModal
          onClose={() => setShowCreate(false)}
          onCreate={async (data) => {
            try {
              await createGasto(data, getToken);
              setShowCreate(false);
              refresh();
            } catch (err) {
              alert(`Error creando gasto: ${err.message}`);
            }
          }}
        />
      )}

      {editGasto && (
        <EditGastoModal
          gasto={editGasto}
          onClose={() => setEditGasto(null)}
          onUpdate={async (data) => {
            try {
              await updateGasto(editGasto.id, data, getToken);
              setEditGasto(null);
              refresh();
            } catch (err) {
              alert(`Error actualizando gasto: ${err.message}`);
            }
          }}
        />
      )}

      {infoGasto && (
        <InfoGastoModal gasto={infoGasto} onClose={() => setInfoGasto(null)} />
      )}
    </div>
  );
}
