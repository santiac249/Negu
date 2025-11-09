// src/components/clientes/ClientesTable.jsx
import { useState, useMemo } from "react";
import EditClienteModal from "./EditClienteModal";
import InfoClienteModal from "./InfoClienteModal";
import { deleteCliente } from "../../api/clientes.js";

export default function ClientesTable({ clientes, refresh }) {
  const [editCliente, setEditCliente] = useState(null);
  const [viewCliente, setViewCliente] = useState(null);
  const [sexoFiltro, setSexoFiltro] = useState("todos");
  const [deletingId, setDeletingId] = useState(null);

  const clientesFiltrados = useMemo(() => {
    return clientes.filter((c) => {
      let coincideSexo = sexoFiltro === "todos" || c.sexo === sexoFiltro;
      return coincideSexo;
    });
  }, [clientes, sexoFiltro]);

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
  };

  const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  const sexoLabel = (s) => {
    return { M: "Masculino", F: "Femenino", O: "Otro" }[s] || "—";
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este cliente?")) return;

    setDeletingId(id);
    try {
      await deleteCliente(id);
      refresh();
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="rounded-lg shadow p-4 bg-white h-full flex flex-col">
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex-1 min-w-[140px] max-w-[250px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
          <select
            value={sexoFiltro}
            onChange={(e) => setSexoFiltro(e.target.value)}
            className="border rounded px-3 py-1 text-sm w-full"
          >
            <option value="todos">Todos</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="O">Otro</option>
          </select>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-2 text-left">Foto</th>
              <th className="px-4 py-2 text-left">Nombre</th>
              <th className="px-4 py-2 text-left">Documento</th>
              <th className="px-4 py-2 text-left">Correo</th>
              <th className="px-4 py-2 text-left">Teléfono</th>
              <th className="px-4 py-2 text-left">Sexo</th>
              <th className="px-4 py-2 text-center">P. separe activos</th>
              <th className="px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.map((c) => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="p-2">
                  {c.foto ? (
                    <img
                      src={`${baseURL}/uploads/fotos/clientes/${c.foto}`}
                      alt={c.nombre}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center text-xs font-semibold text-indigo-800">
                      {getInitials(c.nombre)}
                    </div>
                  )}
                </td>
                <td className="px-4 py-2 font-medium">{c.nombre}</td>
                <td className="px-4 py-2 text-sm">{c.documento}</td>
                <td className="px-4 py-2 text-sm">{c.correo || "—"}</td>
                <td className="px-4 py-2 text-sm">{c.telefono || "—"}</td>
                <td className="px-4 py-2 text-sm">{sexoLabel(c.sexo)}</td>
                <td className="px-4 py-2 text-center">
                  <span className="inline-block bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {c.planSepares?.length || 0}
                  </span>
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => setEditCliente(c)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 mr-2"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setViewCliente(c)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 mr-2"
                  >
                    Ver
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    disabled={deletingId === c.id}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:bg-gray-400"
                  >
                    {deletingId === c.id ? "..." : "Eliminar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editCliente && (
        <EditClienteModal
          cliente={editCliente}
          onClose={() => setEditCliente(null)}
          refresh={refresh}
        />
      )}

      {viewCliente && (
        <InfoClienteModal
          cliente={viewCliente}
          onClose={() => setViewCliente(null)}
        />
      )}
    </div>
  );
}
