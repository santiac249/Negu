// src/pages/Marcas.jsx
import { useEffect, useMemo, useState } from "react";
import { PlusCircle, Search } from "lucide-react";
import { useAuth } from "../store/auth";
// Helpers de API (elige la variante que uses):
// Si tu backend acepta multipart/form-data para foto:
import {
  findAllMarcas,
  createMarcaFD,
  updateMarcaFD,
  deleteMarca,
} from "../api/marcas.js";
// Si tu backend solo acepta JSON, cambia por createMarca / updateMarca (JSON).

import MarcasTable from "../components/marcas/MarcasTable";
import CreateMarcaModal from "../components/marcas/CreateMarcaModal";
import EditMarcaModal from "../components/marcas/EditMarcaModal";
import InfoMarcaModal from "../components/marcas/InfoMarcaModal";

// Hook de debounce mínimo (o importa tu propio hook)
function useDebounce(value, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function Marcas() {
  const { getToken, user } = useAuth();
  const [marcas, setMarcas] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editMarca, setEditMarca] = useState(null);
  const [infoMarca, setInfoMarca] = useState(null);

  // Buscador
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 250);

  const isAdmin = useMemo(
    () => user?.rol_id === 1 || /admin/i.test(user?.rol?.rol || ""),
    [user]
  );

  const refresh = async () => {
    try {
      const data = await findAllMarcas(getToken);
      setMarcas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      alert(`Error cargando marcas: ${err.message}`);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const marcasFiltradas = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return marcas;
    return marcas.filter((m) => String(m.marca || "").toLowerCase().includes(q));
  }, [marcas, debouncedSearch]);

  if (!isAdmin) {
    return (
      <div className="rounded-2xl border bg-white shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-2">Acceso denegado</h2>
        <p className="text-sm text-gray-600">No hay permisos para gestionar marcas.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {/* Header con buscador y botón crear (mismo look que Usuarios) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">Marcas</h2>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          {/* Search input con icono y ring índigo */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre de marca"
              className="pl-9 pr-3 py-2 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm w-72"
            />
          </div>

          {/* Botón crear primario índigo */}
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md text-sm"
          >
            <PlusCircle className="w-5 h-5" />
            Nueva marca
          </button>
        </div>
      </div>

      {/* Tabla con el mismo diseño que UsuariosTable, incluyendo foto */}
      <MarcasTable
        marcas={marcasFiltradas}
        onInfo={setInfoMarca}
        onEdit={setEditMarca}
        onDelete={async (id) => {
          if (!confirm("¿Eliminar esta marca?")) return;
          try {
            await deleteMarca(id, getToken);
            refresh();
          } catch (err) {
            alert(`Error eliminando marca: ${err.message}`);
          }
        }}
      />

      {/* Crear */}
      {showCreate && (
        <CreateMarcaModal
          onClose={() => setShowCreate(false)}
          onCreate={async (formData) => {
            try {
              // formData: { marca, foto? }
              await createMarcaFD(formData, getToken);
              setShowCreate(false);
              refresh();
            } catch (err) {
              alert(`Error creando marca: ${err.message}`);
            }
          }}
        />
      )}

      {/* Editar */}
      {editMarca && (
        <EditMarcaModal
          marca={editMarca}
          onClose={() => setEditMarca(null)}
          onUpdate={async (formData) => {
            try {
              await updateMarcaFD(editMarca.id, formData, getToken);
              setEditMarca(null);
              refresh();
            } catch (err) {
              alert(`Error actualizando marca: ${err.message}`);
            }
          }}
        />
      )}

      {/* Info */}
      {infoMarca && (
        <InfoMarcaModal marca={infoMarca} onClose={() => setInfoMarca(null)} />
      )}
    </div>
  );
}
