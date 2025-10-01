import { useMemo } from "react";

export default function InfoUser({ user }) {
  const initials = useMemo(() => {
    if (!user?.nombre) return "?";
    const parts = user.nombre.trim().split(/\s+/);
    return parts.slice(0, 2).map(p => p[0]?.toUpperCase() ?? "").join("");
  }, [user?.nombre]);

  const imageUrl = user?.foto
    ? `${import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"}/uploads/fotos/usuarios/${user.foto}`
    : null;

  // Formato de fecha en español
  const fechaFormateada = useMemo(() => {
    if (!user?.f_creacion) return "";
    const fecha = new Date(user.f_creacion);
    const fechaStr = new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(fecha);

    return `Usuario creado el ${fechaStr}`;
  }, [user?.f_creacion]);

  return (
    <div className="flex flex-col items-center text-center">
      {/* Foto o avatar */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Foto de perfil"
          className="w-32 h-32 object-cover rounded-xl border mb-4"
        />
      ) : (
        <div className="w-32 h-32 rounded-xl bg-gray-200 flex items-center justify-center text-3xl font-bold mb-4">
          {initials}
        </div>
      )}

      {/* Nombre */}
      <h2 className="text-xl font-semibold">{user?.nombre}</h2>
      <p className="text-sm text-gray-500 mb-4">{user?.usuario}</p>

      {/* Info del usuario */}
      <div className="w-full text-left space-y-2">
        <p><span className="font-semibold">Correo:</span> {user?.correo}</p>
        <p><span className="font-semibold">Teléfono:</span> {user?.telefono}</p>
        <p><span className="font-semibold">Cédula:</span> {user?.cedula}</p>
        <p><span className="font-semibold">Rol:</span> {user?.rol_id === 1 ? "Administrador" : "Vendedor"}</p>
        <p><span className="font-semibold">Estado:</span> {user?.activo ? "Activo" : "Inactivo"}</p>
        <p className="text-gray-500 text-sm">{fechaFormateada}</p>
      </div>
    </div>
  );
}
