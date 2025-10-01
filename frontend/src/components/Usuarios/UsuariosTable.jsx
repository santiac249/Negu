import { useState, useMemo } from "react";
import EditUserModal from "./EditUserModal";
import InfoUserModal from "./InfoUserModal";
import { useDebounce } from "@/hooks/useDebounce";

const ROLES = {
  1: "Administrador",
  2: "Vendedor",
};

export default function UsuariosTable({ usuarios, refresh }) {
  const [editUser, setEditUser] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [rolFiltro, setRolFiltro] = useState("todos");

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 250);

  const usuariosFiltrados = useMemo(() => {
  const normalizar = (texto) =>
    String(texto || "")
      .normalize("NFD") // descompone caracteres acentuados
      .replace(/[\u0300-\u036f]/g, "") // elimina los acentos
      .toLowerCase();

  const q = normalizar(debouncedSearch.trim());

  return usuarios.filter((u) => {
    const coincideEstado =
      estadoFiltro === "todos" ||
      (estadoFiltro === "activos" && u.activo) ||
      (estadoFiltro === "inactivos" && !u.activo);

    const coincideRol =
      rolFiltro === "todos" || String(u.rol_id) === rolFiltro;

    const coincideBusqueda =
      q === "" ||
      (() => {
        const has = (v) => normalizar(v).includes(q);
        return (
          has(u.nombre) ||
          has(u.usuario) ||
          has(u.telefono) ||
          has(ROLES[u.rol_id])
        );
      })();

    return coincideEstado && coincideRol && coincideBusqueda;
  });
}, [usuarios, estadoFiltro, rolFiltro, debouncedSearch]);


  return (
    <div className="rounded-lg shadow p-4 bg-white h-full flex flex-col">
      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex-1 min-w-[140px] max-w-[250px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
            className="border rounded px-3 py-1 text-sm w-full"
          >
            <option value="todos">Todos</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
          </select>
        </div>

        <div className="flex-1 min-w-[140px] max-w-[250px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rol
          </label>
          <select
            value={rolFiltro}
            onChange={(e) => setRolFiltro(e.target.value)}
            className="border rounded px-3 py-1 text-sm w-full"
          >
            <option value="todos">Todos</option>
            {Object.entries(ROLES).map(([id, nombre]) => (
              <option key={id} value={id}>
                {nombre}
              </option>
            ))}
          </select>
        </div>

                {/* Buscar usuario con debounce */}
        <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar usuario..."
            className="border border-gray-300 rounded-md px-4 py-2 text-sm w-full md:w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Contenedor scrollable */}
{/*       <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[80vh]">
        <table className="min-w-[900px] bg-white border border-gray-200"> */}
      <div className="w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-2">Foto</th>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Usuario</th>
              <th className="px-4 py-2">Rol</th>
              <th className="px-4 py-2">Teléfono</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map((u) => (
              <tr key={u.id} className="text-center border-t">
                <td className="p-2">
                  {u.foto ? (
                    <img
                      src={`http://localhost:3000/uploads/fotos/usuarios/${u.foto}`}
                      alt={u.nombre}
                      className="w-10 h-10 rounded-full mx-auto object-cover"
                    />
                  ) : (
                    <span className="text-gray-400">Sin foto</span>
                  )}
                </td>
                <td>{u.nombre}</td>
                <td>{u.usuario}</td>
                <td>{ROLES[u.rol_id] || "Sin rol"}</td>
                <td>{u.telefono}</td>
                <td>
                  {u.activo ? (
                    <span className="text-green-600 font-medium">Activo</span>
                  ) : (
                    <span className="text-red-500 font-medium">Inactivo</span>
                  )}
                </td>
                <td>
                  <button
                    onClick={() => setEditUser(u)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 mb-1"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setViewUser(u)}
                    className="bg-blue-600 text-white px-2 py-1 rounded"
                  >
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editUser && (
        <EditUserModal
          user={editUser}
          onClose={() => setEditUser(null)}
          refresh={refresh}
        />
      )}

      {viewUser && (
        <InfoUserModal
          user={viewUser}
          onClose={() => setViewUser(null)}
        />
      )}
    </div>
  );
}
