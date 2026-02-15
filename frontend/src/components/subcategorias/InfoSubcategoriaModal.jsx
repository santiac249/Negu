import { X } from 'lucide-react';

export default function InfoSubcategoriaModal({ subcategoria, onClose }) {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Detalles de la Subcategoría</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Foto */}
          {subcategoria.foto && (
            <div className="flex justify-center">
              <img
                src={`${API_URL}/uploads/fotos/subcategorias/${subcategoria.foto}`}
                alt={subcategoria.subcategoria}
                className="w-48 h-48 object-cover rounded-lg shadow-md"
              />
            </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Nombre
              </label>
              <p className="text-base text-gray-900">{subcategoria.subcategoria}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                ID
              </label>
              <p className="text-base text-gray-900">#{subcategoria.id}</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Descripción
              </label>
              <p className="text-base text-gray-900">
                {subcategoria.descripcion || 'Sin descripción'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Fecha de Creación
              </label>
              <p className="text-base text-gray-900">
                {subcategoria.f_creacion
                  ? new Date(subcategoria.f_creacion).toLocaleDateString('es-CO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : '-'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Número de Categorías
              </label>
              <p className="text-base text-gray-900">
                {subcategoria.categorias?.length || 0}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Número de Productos
              </label>
              <p className="text-base text-gray-900">
                {subcategoria.productos?.length || 0}
              </p>
            </div>
          </div>

          {/* Categorías */}
          {subcategoria.categorias && subcategoria.categorias.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Categorías Asociadas
              </label>
              <div className="flex flex-wrap gap-2">
                {subcategoria.categorias.map((cat) => (
                  <span
                    key={cat.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
                  >
                    {cat.categoria}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
