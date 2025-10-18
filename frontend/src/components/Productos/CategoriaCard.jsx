import { useState } from "react";

export default function CategoriaCard({ categoria, onClick, canAdmin, onEdit }) {
  const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  const imageUrl = categoria.foto 
    ? `${baseURL}/uploads/fotos/categorias/${categoria.foto}` 
    : null;
  
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-200 overflow-hidden transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
      onClick={() => onClick(categoria)}
    >
      {/* Imagen */}
      <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={categoria.categoria}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-20 h-20 text-blue-300 group-hover:text-blue-400 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Contenido */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {categoria.categoria}
        </h3>
        
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {categoria.descripcion || "Sin descripción"}
        </p>

        {/* Contador de subcategorías */}
        {categoria.subcategorias && (
          <div className="flex items-center text-xs text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            {categoria.subcategorias.length} subcategoría{categoria.subcategorias.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Botón de editar (solo admin) */}
      {canAdmin && (
        <div
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onEdit(categoria)}
            className="p-2 bg-white/90 backdrop-blur-sm hover:bg-blue-600 text-gray-700 hover:text-white rounded-lg shadow-lg transition-all transform hover:scale-110"
            title="Editar categoría"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
      )}

      {/* Indicador de click */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0">
        <div className="bg-blue-600 text-white p-2 rounded-full shadow-lg">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}