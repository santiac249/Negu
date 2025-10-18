import { useState } from "react";

export default function SubcategoriaCard({ subcategoria, onClick, canAdmin, onEdit }) {
  const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  const imageUrl = subcategoria.foto 
    ? `${baseURL}/uploads/fotos/subcategorias/${subcategoria.foto}` 
    : null;
  
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-200 overflow-hidden transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
      onClick={() => onClick(subcategoria)}
    >
      {/* Imagen */}
      <div className="relative h-48 bg-gradient-to-br from-purple-50 to-pink-100 overflow-hidden">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={subcategoria.subcategoria}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-20 h-20 text-purple-300 group-hover:text-purple-400 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Contenido */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
          {subcategoria.subcategoria}
        </h3>
        
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {subcategoria.descripcion || "Sin descripción"}
        </p>

        {/* Contador de productos */}
        {subcategoria.productos && (
          <div className="flex items-center text-xs text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            {subcategoria.productos.length} producto{subcategoria.productos.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Botón de editar */}
      {canAdmin && (
        <div
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onEdit(subcategoria)}
            className="p-2 bg-white/90 backdrop-blur-sm hover:bg-purple-600 text-gray-700 hover:text-white rounded-lg shadow-lg transition-all transform hover:scale-110"
            title="Editar subcategoría"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
      )}

      {/* Indicador de click */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0">
        <div className="bg-purple-600 text-white p-2 rounded-full shadow-lg">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}