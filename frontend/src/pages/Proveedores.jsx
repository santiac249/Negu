import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../store/auth";
import {
  findAllProveedores,
  createProveedor,
  updateProveedor,
  deleteProveedor,
} from "../api/proveedores";
import ProveedoresTable from "../components/proveedores/ProveedoresTable";
import CreateProveedorModal from "../components/proveedores/CreateProveedorModal";
import EditProveedorModal from "../components/proveedores/EditProveedorModal";
import InfoProveedorModal from "../components/proveedores/InfoProveedorModal";
import { useDebounce } from "../hooks/useDebounce";

export default function Proveedores() {
  const { getToken, user } = useAuth();
  const [proveedores, setProveedores] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editProveedor, setEditProveedor] = useState(null);
  const [infoProveedor, setInfoProveedor] = useState(null);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 250);

  const isAdmin = useMemo(
    () => user?.rol_id === 1 || /admin/i.test(user?.rol?.rol || ""),
    [user]
  );

  const refresh = async () => {
    const data = await findAllProveedores(getToken);
    setProveedores(data);
  };

  useEffect(() => {
    refresh();
  }, []);

  const proveedoresFiltrados = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return proveedores;
    return proveedores.filter((p) => {
      const has = (v) => String(v || "").toLowerCase().includes(q);
      return has(p.nombre) || has(p.telefono) || has(p.correo) || has(p.direccion);
    });
  }, [proveedores, debouncedSearch]);

  if (!isAdmin) {
    return (
      <div className="rounded-2xl border bg-white shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-2">Acceso denegado</h2>
        <p className="text-sm text-gray-600">No hay permisos para gestionar proveedores.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 w-full h-full overflow-y-auto">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Gestión de Proveedores</h1>

        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar proveedor..."
            className="border border-gray-300 rounded-md px-4 py-2 text-sm w-full md:w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setShowCreate(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 text-sm w-full md:w-auto"
          >
            Nuevo Proveedor
          </button>
        </div>
      </div>

      {/* Tabla */}
      <ProveedoresTable
        proveedores={proveedoresFiltrados}
        onInfo={setInfoProveedor}
        onEdit={setEditProveedor}
        onDelete={async (id) => {
          if (!confirm("¿Eliminar este proveedor?")) return;
          await deleteProveedor(id, getToken);
          refresh();
        }}
      />

      {/* Modales */}
      {showCreate && (
        <CreateProveedorModal
          onClose={() => setShowCreate(false)}
          onCreate={async (payload) => {
            await createProveedor(payload, getToken);
            setShowCreate(false);
            refresh();
          }}
        />
      )}

      {editProveedor && (
        <EditProveedorModal
          proveedor={editProveedor}
          onClose={() => setEditProveedor(null)}
          onUpdate={async (payload) => {
            await updateProveedor(editProveedor.id, payload, getToken);
            setEditProveedor(null);
            refresh();
          }}
        />
      )}

      {infoProveedor && (
        <InfoProveedorModal proveedor={infoProveedor} onClose={() => setInfoProveedor(null)} />
      )}
    </div>
  );
}
