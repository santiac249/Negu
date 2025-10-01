import { useEffect, useState } from "react";
import { findAllUsuarios } from "../api/usuarios";
import { useDebounce } from "@/hooks/useDebounce";
import UsuariosTable from "../components/usuarios/UsuariosTable";
import CreateUserModal from "../components/usuarios/CreateUserModal";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [showCreate, setShowCreate] = useState(false);

  const fetchUsuarios = async () => {
    const data = await findAllUsuarios();
    setUsuarios(data);
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  return (
    <div className="p-4 md:p-6 w-full h-full overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Gestión de Usuarios</h1>

        <button
          onClick={() => setShowCreate(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 w-full md:w-auto text-center"
        >
          Nuevo Usuario
        </button>
      </div>

      {/* Tabla */}
      <UsuariosTable usuarios={usuarios} refresh={fetchUsuarios} />

      {/* Modal Crear */}
      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          refresh={fetchUsuarios}
        />
      )}
    </div>
  );
}
