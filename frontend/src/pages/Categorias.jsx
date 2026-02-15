import { useEffect, useMemo, useState } from 'react';
import { PlusCircle, Search } from 'lucide-react';
import { useAuth } from '../store/auth';
import {
  findAllCategorias,
  createCategoriaFD,
  updateCategoriaFD,
} from '../api/categorias';

import CategoriasTable from '../components/categorias/CategoriasTable';
import CreateCategoriaModal from '../components/categorias/CreateCategoriaModal';
import EditCategoriaModal from '../components/categorias/EditCategoriaModal';
import InfoCategoriaModal from '../components/categorias/InfoCategoriaModal';

function useDebounce(value, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function Categorias() {
  const { getToken, user } = useAuth();
  const [categorias, setCategorias] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editCategoria, setEditCategoria] = useState(null);
  const [infoCategoria, setInfoCategoria] = useState(null);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 250);

  const isAdmin = useMemo(
    () => user?.rol_id === 1 || /admin/i.test(user?.rol?.rol || ''),
    [user]
  );

  const refresh = async () => {
    try {
      const data = await findAllCategorias(getToken);
      setCategorias(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      alert(`Error cargando categorías: ${err.message}`);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const categoriasFiltradas = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return categorias;
    return categorias.filter((c) =>
      String(c.categoria || '').toLowerCase().includes(q)
    );
  }, [categorias, debouncedSearch]);

  if (!isAdmin) {
    return (
      <div className="rounded-2xl border bg-white shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-2">Acceso denegado</h2>
        <p className="text-sm text-gray-600">
          No tienes permisos para gestionar categorías.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">Categorías</h2>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar categoría"
              className="pl-9 pr-3 py-2 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm w-72"
            />
          </div>

          {/* Botón crear */}
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md text-sm"
          >
            <PlusCircle className="w-5 h-5" />
            Nueva categoría
          </button>
        </div>
      </div>

      {/* Tabla */}
      <CategoriasTable
        categorias={categoriasFiltradas}
        onInfo={setInfoCategoria}
        onEdit={setEditCategoria}
        onDelete={async (id) => {
          if (!confirm('¿Eliminar esta categoría?')) return;
          try {
            // Note: No delete endpoint in backend, you may need to add it
            alert('Funcionalidad de eliminar no implementada en el backend');
          } catch (err) {
            alert(`Error eliminando categoría: ${err.message}`);
          }
        }}
      />

      {/* Modales */}
      {showCreate && (
        <CreateCategoriaModal
          onClose={() => setShowCreate(false)}
          onCreate={async (formData) => {
            try {
              await createCategoriaFD(formData, getToken);
              setShowCreate(false);
              refresh();
            } catch (err) {
              alert(`Error creando categoría: ${err.message}`);
            }
          }}
        />
      )}

      {editCategoria && (
        <EditCategoriaModal
          categoria={editCategoria}
          onClose={() => setEditCategoria(null)}
          onUpdate={async (formData) => {
            try {
              await updateCategoriaFD(editCategoria.id, formData, getToken);
              setEditCategoria(null);
              refresh();
            } catch (err) {
              alert(`Error actualizando categoría: ${err.message}`);
            }
          }}
        />
      )}

      {infoCategoria && (
        <InfoCategoriaModal
          categoria={infoCategoria}
          onClose={() => setInfoCategoria(null)}
        />
      )}
    </div>
  );
}
