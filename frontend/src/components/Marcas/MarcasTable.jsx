import { useState, useMemo } from "react";
import { Info, Pencil, Trash2 } from "lucide-react";

// Props esperadas:
// - marcas: array de { id, marca, foto }
// - onInfo(marcaObj), onEdit(marcaObj), onDelete(id)
// - baseURL opcional (si no, usa env)
export default function MarcasTable({ marcas = [], onInfo, onEdit, onDelete }) {
  const [textoFiltro, setTextoFiltro] = useState("");

  const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  const marcasFiltradas = useMemo(() => {
    const q = textoFiltro.trim().toLowerCase();
    if (!q) return marcas;
    return marcas.filter((m) => String(m.marca || "").toLowerCase().includes(q));
  }, [marcas, textoFiltro]);

  return (
    <div className="rounded-lg shadow p-4 bg-white h-full flex flex-col">
      {/* Filtro simple por marca (puedes quitarlo si filtras en el parent) */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex-1 min-w-[200px] max-w-[320px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buscar marca
          </label>
          <input
            value={textoFiltro}
            onChange={(e) => setTextoFiltro(e.target.value)}
            placeholder="Escribe para filtrar..."
            className="border rounded px-3 py-1 text-sm w-full"
          />
        </div>
      </div>

      {/* Contenedor scrollable y tabla con el mismo estilo de Usuarios */}
      <div className="w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-2">Foto</th>
              <th className="px-4 py-2">Marca</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {marcasFiltradas.map((m) => (
              <tr key={m.id} className="text-center border-t">
                <td className="p-2">
                  {m.foto ? (
                    <img
                      src={`${baseURL}/uploads/fotos/marcas/${m.foto}`}
                      alt={m.marca}
                      className="w-10 h-10 rounded-full mx-auto object-cover"
                    />
                  ) : (
                    <span className="text-gray-400">Sin foto</span>
                  )}
                </td>
                <td className="px-4 py-2">{m.marca}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onInfo?.(m)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md border hover:bg-gray-100 text-sm"
                      title="Ver"
                    >
                      <Info className="w-4 h-4" />
                      Ver
                    </button>
                    <button
                      onClick={() => onEdit?.(m)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md border hover:bg-gray-100 text-sm"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => onDelete?.(m.id)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md border text-red-600 hover:bg-red-50 text-sm"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {marcasFiltradas.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-gray-500" colSpan={3}>
                  No hay marcas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
