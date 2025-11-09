// src/pages/Clientes.jsx
import { useEffect, useState } from "react";
import { useDebounce } from "../hooks/useDebounce";
import { getClientes } from "../api/clientes.js";
import ClientesTable from "../components/clientes/ClientesTable";
import CreateClienteModal from "../components/clientes/CreateClienteModal";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 350);

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const data = await getClientes({ q: debouncedQuery });
      setClientes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
      setClientes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, [debouncedQuery]);

  return (
    <div className="p-4 md:p-6 w-full h-full overflow-y-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Gestión de Clientes</h1>
          <p className="text-sm text-gray-600 mt-1">{clientes.length} clientes registrados</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, documento, correo..."
            className="w-full sm:w-64 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setShowCreate(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 w-full sm:w-auto text-center"
          >
            Nuevo Cliente
          </button>
        </div>
      </div>

      {loading && <p className="text-center text-gray-500">Cargando clientes...</p>}

      {!loading && <ClientesTable clientes={clientes} refresh={fetchClientes} />}

      {showCreate && (
        <CreateClienteModal
          onClose={() => setShowCreate(false)}
          refresh={fetchClientes}
        />
      )}
    </div>
  );
}
