import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { findAllSubcategorias } from '../../api/subcategorias';
import { useAuth } from '../../store/auth';

export default function CreateCategoriaModal({ onClose, onCreate }) {
  const { getToken } = useAuth();
  const [categoria, setCategoria] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [foto, setFoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [subcategorias, setSubcategorias] = useState([]);
  const [selectedSubcategorias, setSelectedSubcategorias] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSubcategorias();
  }, []);

  const loadSubcategorias = async () => {
    try {
      const data = await findAllSubcategorias(getToken, '', 1, 100);
      setSubcategorias(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando subcategorías:', err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFoto(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoria.trim()) {
      alert('El nombre de la categoría es requerido');
      return;
    }

    setLoading(true);
    try {
      await onCreate({
        categoria: categoria.trim(),
        descripcion: descripcion.trim(),
        foto,
        subcategoriaIds: selectedSubcategorias,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSubcategoria = (id) => {
    setSelectedSubcategorias((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Nueva Categoría</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la Categoría <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ej: Ropa, Calzado, Accesorios"
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Descripción de la categoría..."
            />
          </div>

          {/* Foto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Foto de la Categoría
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {previewUrl && (
              <div className="mt-2">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Subcategorías */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subcategorías Asociadas
            </label>
            <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto">
              {subcategorias.length === 0 ? (
                <p className="text-sm text-gray-500">No hay subcategorías disponibles</p>
              ) : (
                <div className="space-y-2">
                  {subcategorias.map((sub) => (
                    <label key={sub.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedSubcategorias.includes(sub.id)}
                        onChange={() => toggleSubcategoria(sub.id)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">{sub.subcategoria}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Categoría'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
