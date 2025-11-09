// src/components/clientes/ClienteForm.jsx
import { useEffect, useState } from "react";

function Input({ label, name, type = "text", value, onChange, required = false, error, placeholder }) {
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
        placeholder={placeholder}
        className={`border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
          error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
        }`}
      />
      {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
    </div>
  );
}

const validationRules = {
  nombre: {
    validate: (v) => v && v.trim().length >= 3 && v.trim().length <= 100,
    message: "El nombre debe tener entre 3 y 100 caracteres",
  },
  documento: {
    validate: (v) => /^[0-9]{6,15}$/.test(v),
    message: "El documento debe contener entre 6 y 15 dígitos",
  },
  correo: {
    validate: (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    message: "Correo inválido",
  },
  telefono: {
    validate: (v) => !v || /^[0-9]{7,15}$/.test(v),
    message: "El teléfono debe contener entre 7 y 15 dígitos",
  },
  direccion: {
    validate: (v) => !v || (v.trim().length >= 5 && v.trim().length <= 255),
    message: "La dirección debe tener entre 5 y 255 caracteres",
  },
  fecha_nacimiento: {
    validate: (v) => {
      if (!v) return true;
      const date = new Date(v);
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      return age >= 18 && age <= 120;
    },
    message: "El cliente debe ser mayor de 18 años",
  },
};

export default function ClienteForm({ onSubmit, initialData }) {
  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    documento: "",
    direccion: "",
    fecha_nacimiento: "",
    sexo: "M",
  });

  const [foto, setFoto] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      const fechaNac = initialData.fecha_nacimiento
        ? new Date(initialData.fecha_nacimiento).toISOString().split("T")[0]
        : "";
      setForm({
        nombre: initialData.nombre || "",
        correo: initialData.correo || "",
        telefono: initialData.telefono || "",
        documento: initialData.documento || "",
        direccion: initialData.direccion || "",
        fecha_nacimiento: fechaNac,
        sexo: initialData.sexo || "M",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Limpiar error al editar
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, foto: "La foto no debe superar 5MB" }));
        return;
      }
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setErrors((prev) => ({ ...prev, foto: "Solo se aceptan JPEG, PNG o WebP" }));
        return;
      }
      setFoto(file);
      setErrors((prev) => ({ ...prev, foto: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    for (const [field, rule] of Object.entries(validationRules)) {
      if (!rule.validate(form[field])) {
        newErrors[field] = rule.message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      for (const [key, value] of Object.entries(form)) {
        if (value !== "" && value !== null && value !== undefined) {
          formData.append(key, value);
        }
      }

      if (foto) {
        formData.append("foto", foto);
      }

      await onSubmit(formData, !!initialData, initialData?.id);
    } catch (err) {
      setErrors({ submit: err.message || "Error al guardar cliente" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white p-6 rounded-lg shadow-md w-full">
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {errors.submit}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nombre*"
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          error={errors.nombre}
          placeholder="Juan Pérez"
          required
        />
        <Input
          label="Documento*"
          name="documento"
          value={form.documento}
          onChange={handleChange}
          error={errors.documento}
          placeholder="1234567"
          required
        />
        <Input
          label="Correo"
          name="correo"
          type="email"
          value={form.correo}
          onChange={handleChange}
          error={errors.correo}
          placeholder="juan@example.com"
        />
        <Input
          label="Teléfono"
          name="telefono"
          type="tel"
          value={form.telefono}
          onChange={handleChange}
          error={errors.telefono}
          placeholder="3001234567"
        />
        <div className="md:col-span-2">
          <Input
            label="Dirección"
            name="direccion"
            value={form.direccion}
            onChange={handleChange}
            error={errors.direccion}
            placeholder="Calle 123 #45-67, Apto 801"
          />
        </div>

        <Input
          label="Fecha de Nacimiento"
          name="fecha_nacimiento"
          type="date"
          value={form.fecha_nacimiento}
          onChange={handleChange}
          error={errors.fecha_nacimiento}
        />

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Sexo</label>
          <select
            name="sexo"
            value={form.sexo}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="O">Otro</option>
          </select>
        </div>

        <div className="flex flex-col md:col-span-2">
          <label className="text-sm font-medium text-gray-700 mb-1">Foto (JPG, PNG, WebP - Máx 5MB)</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFotoChange}
            className={`border rounded-lg px-3 py-2 ${errors.foto ? "border-red-500" : "border-gray-300"}`}
          />
          {errors.foto && <span className="text-red-500 text-xs mt-1">{errors.foto}</span>}
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

      <button
        type="submit"
        disabled={loading}
        className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
      >
        {loading ? "Guardando..." : initialData ? "Actualizar Cliente" : "Crear Cliente"}
      </button>
    </form>
  );
}
