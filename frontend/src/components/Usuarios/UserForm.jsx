import { useState, useEffect } from "react";
import { HiUserAdd } from "react-icons/hi";

export default function UserForm({ onSubmit, initialData }) {
  const [form, setForm] = useState({
    nombre: "",
    usuario: "",
    correo: "",
    telefono: "",
    cedula: "",
    contrasena: "",
    rol_id: 2,
  });
  const [foto, setFoto] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setForm({
        nombre: initialData.nombre || "",
        usuario: initialData.usuario || "",
        correo: initialData.correo || "",
        telefono: initialData.telefono || "",
        cedula: initialData.cedula || "",
        contrasena: "",
        rol_id: initialData.rol_id || 2,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFotoChange = (e) => {
    if (e.target.files.length > 0) {
      setFoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const formData = new FormData();
      for (const key in form) {
        if (form[key] !== "") {
          formData.append(key, form[key]);
        }
      }

      if (foto) {
        formData.append("foto", foto);
      }

      if (!initialData && !form.contrasena.trim()) {
        setError("La contraseña es obligatoria");
        return;
      }

      if (onSubmit) {
        await onSubmit(formData, !!initialData, initialData?.id);
      }
    } catch (err) {
      console.error("Error al enviar el formulario:", err);
      setError(err.message || "Error al enviar el formulario");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 bg-white p-6 rounded-lg shadow-md w-full"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
        <Input label="Usuario" name="usuario" value={form.usuario} onChange={handleChange} required />
        <Input label="Correo" name="correo" type="email" value={form.correo} onChange={handleChange} />
        <Input label="Teléfono" name="telefono" type="tel" value={form.telefono} onChange={handleChange} />
        <Input label="Cédula" name="cedula" value={form.cedula} onChange={handleChange} required />
        <Input
          label="Contraseña"
          name="contrasena"
          type="password"
          value={form.contrasena}
          onChange={handleChange}
          required={!initialData}
        />

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Rol</label>
          <select
            name="rol_id"
            value={form.rol_id}
            onChange={(e) => setForm((prev) => ({ ...prev, rol_id: Number(e.target.value) }))}
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={1}>Administrador</option>
            <option value={2}>Vendedor</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Foto</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFotoChange}
            className="border rounded-lg px-3 py-2 focus:outline-none"
          />
        </div>
      </div>

      {foto && (
        <div className="mt-2">
          <p className="text-sm text-gray-600 mb-1">Vista previa:</p>
          <img
            src={URL.createObjectURL(foto)}
            alt="Vista previa"
            className="h-32 w-32 object-cover rounded border"
          />
        </div>
      )}

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        className="mt-4 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
      >
        <HiUserAdd className="text-lg" />
        {initialData ? "Actualizar Usuario" : "Crear Usuario"}
      </button>
    </form>
  );
}

// Componente reutilizable para inputs
function Input({ label, name, type = "text", value, onChange, required = false }) {
  return (
    <div className="flex flex-col">
      <label htmlFor={name} className="text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        required={required}
        className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
