export default function ProveedoresTable({ proveedores, onInfo, onEdit, onDelete }) {
  return (
    <div className="rounded-lg shadow p-4 bg-white h-full flex flex-col">
      <div className="w-full overflow-x-auto">
        <table className="w-full table-fixed">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-2 w-1/5">Nombre</th>
              <th className="px-4 py-2 w-1/5">Teléfono</th>
              <th className="px-4 py-2 w-1/5">Correo</th>
              <th className="px-4 py-2 w-1/5">Dirección</th>
              <th className="px-4 py-2 w-1/5">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proveedores.map((p) => (
              <tr key={p.id} className="text-center border-t">
                <td>{p.nombre}</td>
                <td>{p.telefono || "—"}</td>
                <td>{p.correo || "—"}</td>
                <td>{p.direccion || "—"}</td>
                <td>
                    <button
                      onClick={() => onInfo(p)}
                      className="bg-blue-500 text-white px-2 py-1 rounded mr-2 mb-1"
                    >
                      Info
                    </button>
                    <button
                      onClick={() => onEdit(p)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 mb-1"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDelete(p.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded mr-2 mb-1"
                    >
                      Eliminar
                    </button>
                </td>
              </tr>
            ))}

            {proveedores.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-gray-500 text-center">
                  No hay proveedores registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
