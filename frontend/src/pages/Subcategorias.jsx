import { useEffect, useMemo, useState } from 'react';
import { PlusCircle, Search } from 'lucide-react';
import { useAuth } from '../store/auth';
import {
  findAllSubcategorias,
  createSubcategoriaFD,
  updateSubcategoriaFD,
} from '../api/subcategorias';

import SubcategoriasTable from '../components/subcategorias/SubcategoriasTable';
import CreateSubcategoriaModal from '../components/subcategorias/CreateSubcategoriaModal';
import EditSubcategoriaModal from '../components/subcategorias/EditSubcategoriaModal';
import InfoSubcategoriaModal from '../components/subcategorias/InfoSubcategoriaModal';

function useDebounce(value, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function Subcategorias() {
  const { getToken, user } = useAuth();
  const [subcategorias, setSubcategorias] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editSubcategoria, setEditSubcategoria] = useState(null);
  const [infoSubcategoria, setInfoSubcategoria] = useState(null);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 250);

  const isAdmin = useMemo(
    () => user?.rol_id === 1 || /admin/i.test(user?.rol?.rol || ''),
    [user]
  );

  const refresh = async () => {
    try {
      const data = await findAllSubcategorias(getToken);
      setSubcategorias(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      alert(`Error cargando subcategorías: ${err.message}`);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const subcategoriasFiltradas = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return subcategorias;
    return subcategorias.filter((s) =>
      String(s.subcategoria || '').toLowerCase().includes(q)
    );
  }, [subcategorias, debouncedSearch]);

  if (!isAdmin) {
    return (
      <div className="rounded-2xl border bg-white shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-2">Acceso denegado</h2>
        <p className="text-sm text-gray-600">
          No tienes permisos para gestionar subcategorías.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">Subcategorías</h2>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar subcategoría"
              className="pl-9 pr-3 py-2 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm w-72"
            />
          </div>

          {/* Botón crear */}
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md text-sm"
          >
            <PlusCircle className="w-5 h-5" />
            Nueva subcategoría
          </button>
        </div>
      </div>

      {/* Tabla */}
      <SubcategoriasTable
        subcategorias={subcategoriasFiltradas}
        onInfo={setInfoSubcategoria}
        onEdit={setEditSubcategoria}
        onDelete={async (id) => {
          if (!confirm('¿Eliminar esta subcategoría?')) return;
          try {
            // Note: No delete endpoint in backend, you may need to add it
            alert('Funcionalidad de eliminar no implementada en el backend');
          } catch (err) {
            alert(`Error eliminando subcategoría: ${err.message}`);
          }
        }}
      />

      {/* Modales */}
      {showCreate && (
        <CreateSubcategoriaModal
          onClose={() => setShowCreate(false)}
          onCreate={async (formData) => {
            try {
              await createSubcategoriaFD(formData, getToken);
              setShowCreate(false);
              refresh();
            } catch (err) {
              alert(`Error creando subcategoría: ${err.message}`);
            }
          }}
        />
      )}

      {editSubcategoria && (
        <EditSubcategoriaModal
          subcategoria={editSubcategoria}
          onClose={() => setEditSubcategoria(null)}
          onUpdate={async (formData) => {
            try {
              await updateSubcategoriaFD(editSubcategoria.id, formData, getToken);
              setEditSubcategoria(null);
              refresh();
            } catch (err) {
              alert(`Error actualizando subcategoría: ${err.message}`);
            }
          }}
        />
      )}

      {infoSubcategoria && (
        <InfoSubcategoriaModal
          subcategoria={infoSubcategoria}
          onClose={() => setInfoSubcategoria(null)}
        />
      )}
    </div>
  );
}
