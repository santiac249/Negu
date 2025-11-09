// src/components/clientes/InfoClienteModal.jsx
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useState, useEffect } from "react";
import { getClienteById } from "../../api/clientes.js";

export default function InfoClienteModal({ cliente: initialCliente, onClose }) {
  const [cliente, setCliente] = useState(initialCliente);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialCliente?.id && !initialCliente.ventas) {
      setLoading(true);
      getClienteById(initialCliente.id)
        .then(setCliente)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [initialCliente?.id]);

  if (!cliente) return null;

  const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  const getInitials = (name) =>
    name
      .split(" ")
      .map((n) => n[0]?.toUpperCase())
      .join("")
      .slice(0, 2);

  const fechaCreacion = cliente.f_creacion
    ? format(new Date(cliente.f_creacion), "'Creado el' EEEE d 'de' MMMM 'del' yyyy 'a las' h:mm a", { locale: es })
    : "";

  const fechaNacimiento = cliente.fecha_nacimiento
    ? format(new Date(cliente.fecha_nacimiento), "d 'de' MMMM 'de' yyyy", { locale: es })
    : "No especificada";

  const sexoLabel = {
    M: "Masculino",
    F: "Femenino",
    O: "Otro",
  }[cliente.sexo] || "No especificado";

  const planesActivos = cliente.planSepares?.filter((p) => p.estado === "Activo" || p.estado === "activo").length || 0;
  const totalVentas = cliente.ventas?.length || 0;
  const totalGastado = cliente.ventas?.reduce((sum, v) => sum + v.total, 0) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="bg-red-600 text-white absolute top-4 right-4 hover:bg-red-700 text-lg rounded"
        >
          ✕
        </button>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          {cliente.foto ? (
            <img
              src={`${baseURL}/uploads/fotos/clientes/${cliente.foto}`}
              alt={cliente.nombre}
              className="w-40 h-40 rounded-xl object-cover shadow-md"
            />
          ) : (
            <div className="w-40 h-40 flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-200 to-indigo-400 text-5xl font-bold text-white shadow-md">
              {getInitials(cliente.nombre)}
            </div>
          )}

          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-gray-800">{cliente.nombre}</h2>
            <p className="text-gray-600 font-semibold">{cliente.documento}</p>
            <p className="text-sm text-gray-400 mt-1">{fechaCreacion}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 text-gray-700">
          <div className="border-l-4 border-indigo-500 pl-4">
            <p className="font-semibold text-gray-900">Correo</p>
            <p className="text-sm">{cliente.correo || "No especificado"}</p>
          </div>
          <div className="border-l-4 border-indigo-500 pl-4">
            <p className="font-semibold text-gray-900">Teléfono</p>
            <p className="text-sm">{cliente.telefono || "No especificado"}</p>
          </div>
          <div className="border-l-4 border-indigo-500 pl-4 sm:col-span-2">
            <p className="font-semibold text-gray-900">Dirección</p>
            <p className="text-sm">{cliente.direccion || "No especificada"}</p>
          </div>
          <div className="border-l-4 border-indigo-500 pl-4">
            <p className="font-semibold text-gray-900">Fecha de Nacimiento</p>
            <p className="text-sm">{fechaNacimiento}</p>
          </div>
          <div className="border-l-4 border-indigo-500 pl-4">
            <p className="font-semibold text-gray-900">Sexo</p>
            <p className="text-sm">{sexoLabel}</p>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 sm:col-span-2">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600">{planesActivos}</p>
                <p className="text-xs text-gray-600">Planes Activos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600">{totalVentas}</p>
                <p className="text-xs text-gray-600">Total Ventas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600">${totalGastado.toFixed(2)}</p>
                <p className="text-xs text-gray-600">Total Gastado</p>
              </div>
            </div>
          </div>
        </div>

        {loading && <p className="text-center text-gray-500 text-sm mt-4">Cargando datos...</p>}
      </div>
    </div>
  );
}
