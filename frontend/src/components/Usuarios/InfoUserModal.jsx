import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function InfoUserModal({ user, onClose }) {
  if (!user) return null;

  const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  // Formato de fecha con date-fns
  const fecha = new Date(user.f_creacion);
  const fechaFormateada = format(
    fecha,
    "'Usuario creado el' EEEE d 'de' MMMM 'del' yyyy 'a las' h:mm a",
    { locale: es }
  );

  // Iniciales si no hay foto
  const getInitials = (name) =>
    name
      .split(" ")
      .map((n) => n[0]?.toUpperCase())
      .join("")
      .slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-6 relative">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="bg-red-600 text-white absolute top-4 right-4 hover:bg-red-700 text-lg"
        >
          ✕
        </button>

        {/* Cabecera con foto */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          {user.foto ? (
            <img
              src={`${baseURL}/uploads/fotos/usuarios/${user.foto}`}
              alt={user.nombre}
              className="w-40 h-40 rounded-xl object-cover shadow-md"
            />
          ) : (
            <div className="w-40 h-40 flex items-center justify-center rounded-xl bg-gray-200 text-5xl font-bold text-gray-600 shadow-md">
              {getInitials(user.nombre)}
            </div>
          )}

          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-gray-800">{user.nombre}</h2>
            <p className="text-gray-500">@{user.usuario}</p>
            <p className="text-sm text-gray-400 mt-1">{fechaFormateada}</p>
          </div>
        </div>

        {/* Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 text-gray-700">
          <div>
            <p className="font-semibold">Correo</p>
            <p>{user.correo}</p>
          </div>
          <div>
            <p className="font-semibold">Teléfono</p>
            <p>{user.telefono}</p>
          </div>
          <div>
            <p className="font-semibold">Cédula</p>
            <p>{user.cedula}</p>
          </div>
          <div>
            <p className="font-semibold">Estado</p>
            <p className={user.activo ? "text-green-600" : "text-red-500"}>
              {user.activo ? "Activo" : "Inactivo"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
