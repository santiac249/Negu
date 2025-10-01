// src/components/productos/modals/ProductoFormModal.jsx
import { useEffect, useMemo, useState } from "react";

export default function ProductoFormModal({
  open,
  onClose,
  onSubmit,              // (formData, isUpdate, id)
  initialData,           // producto existente
  parentSubcategoria,    // opcional: para preseleccionar
}) {
  const isUpdate = !!initialData;
  const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    marca_id: "",
    subcategoriaIds: [],
  });
  const [foto, setFoto] = useState(null);
  const [marcas, setMarcas] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);

  const imagePreview = useMemo(() => {
    if (foto) return URL.createObjectURL(foto);
    if (initialData?.foto) return `${baseURL}/uploads/fotos/productos/${initialData.foto}`;
    return null;
  }, [foto, initialData?.foto, baseURL]);

  // Cargar opciones
  useEffect(() => {
    if (!open) return;
    // Marcas
    fetch(`${baseURL}/marcas`)
      .then((r) => r.json())
      .then(setMarcas)
      .catch(console.error);
    // Subcategorías
    fetch(`${baseURL}/subcategorias`)
      .then((r) => r.json())
      .then(setSubcategorias)
      .catch(console.error);
  }, [open, baseURL]);

  // Inicializar form
  useEffect(() => {
    if (initialData) {
      setForm({
        nombre: initialData.nombre || "",
        descripcion: initialData.descripcion || "",
        marca_id: initialData.marca_id || initialData.marca?.id || "",
        subcategoriaIds: (initialData.subcategorias || []).map((s) => s.id),
      });
    } else {
      setForm({
        nombre: "",
        descripcion: "",
        marca_id: "",
        subcategoriaIds: parentSubcategoria ? [parentSubcategoria.id] : [],
      });
      setFoto(null);
    }
  }, [initialData, parentSubcategoria, open]);

  const toggleSubcategoria = (id) => {
    setForm((prev) => {
      const exists = prev.subcategoriaIds.includes(id);
      return {
        ...prev,
        subcategoriaIds: exists
          ? prev.subcategoriaIds.filter((x) => x !== id)
          : [...prev.subcategoriaIds, id],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("nombre", form.nombre);
    if (form.descripcion) fd.append("descripcion", form.descripcion);
    if (form.marca_id) fd.append("marca_id", String(form.marca_id));
    fd.append("subcategoriaIds", JSON.stringify(form.subcategoriaIds));
    if (foto) fd.append("foto", foto);
    await onSubmit(fd, isUpdate, initialData?.id);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] p-6 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {isUpdate ? "Editar Producto" : "Crear Producto"}
          </h2>
          <button onClick={onClose} className="bg-red-600 text-white rounded px-2 py-1 text-lg">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                name="nombre"
                value={form.nombre}
                onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
                required
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Marca</label>
              <select
                value={form.marca_id}
                onChange={(e) => setForm((p) => ({ ...p, marca_id: Number(e.target.value) || "" }))}
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona una marca</option>
                {marcas.map((m) => (
                  <option key={m.id} value={m.id}>{m.marca}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
                rows={3}
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-2">Subcategorías</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {subcategorias.map((s) => {
                  const checked = form.subcategoriaIds.includes(s.id);
                  return (
                    <label key={s.id} className="flex items-center gap-2 border rounded-lg px-3 py-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSubcategoria(s.id)}
                      />
                      <span className="text-sm">{s.subcategoria}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1">Foto</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFoto(e.target.files?.[0] ?? null)}
                className="border rounded-lg px-3 py-2"
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Vista previa"
                  className="mt-2 h-32 w-32 object-cover rounded border"
                />
              )}
            </div>
          </div>

          <button type="submit" className="mt-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
            {isUpdate ? "Actualizar" : "Crear"}
          </button>
        </form>
      </div>
    </div>
  );
}
