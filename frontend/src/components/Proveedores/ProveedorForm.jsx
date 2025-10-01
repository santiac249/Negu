// src/components/proveedores/ProveedorForm.jsx
import { useEffect, useState } from "react";

export default function ProveedorForm({ initialData, onSubmit }) {
  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    correo: "",
    direccion: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setForm({
        nombre: initialData.nombre || "",
        telefono: initialData.telefono || "",
        correo: initialData.correo || "",
        direccion: initialData.direccion || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.nombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    await onSubmit(form);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Nombre *</label>
        <input
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Teléfono</label>
          <input
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Correo</label>
          <input
            type="email"
            name="correo"
            value={form.correo}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Dirección</label>
        <input
          name="direccion"
          value={form.direccion}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
          Guardar
        </button>
      </div>
    </form>
  );
}
