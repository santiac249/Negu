// src/components/productos/modals/CategoriaFormModal.jsx
import { useState, useEffect } from "react";

export default function CategoriaFormModal({ open, onClose, onSubmit, initialData }) {
  const [form, setForm] = useState({ categoria: "", descripcion: "" });
  const [foto, setFoto] = useState(null);
  const isUpdate = !!initialData;

  useEffect(() => {
    if (initialData) {
      setForm({
        categoria: initialData.categoria || "",
        descripcion: initialData.descripcion || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("categoria", form.categoria);
    if (form.descripcion) fd.append("descripcion", form.descripcion);
    if (foto) fd.append("foto", foto);
    await onSubmit(fd, isUpdate, initialData?.id);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-auto">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-xl max-h-[90vh] p-6 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">{isUpdate ? "Editar Categoría" : "Crear Categoría"}</h2>
          <button onClick={onClose} className="bg-red-600 text-white rounded px-2 py-1 text-lg">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input name="categoria" value={form.categoria} onChange={handleChange}
                     className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea name="descripcion" value={form.descripcion} onChange={handleChange}
                        className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
            </div>
            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1">Foto</label>
              <input type="file" accept="image/*" onChange={(e) => setFoto(e.target.files?.[0] ?? null)}
                     className="border rounded-lg px-3 py-2" />
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
