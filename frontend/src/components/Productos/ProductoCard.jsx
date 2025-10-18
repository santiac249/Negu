import { useState } from "react";

export default function ProductoCard({ producto, canAdmin, onEdit, onViewStock }) {
  const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  const imageUrl = producto.foto 
    ? `${baseURL}/uploads/fotos/productos/${producto.foto}` 
    : null;
  
  const [imageError, setImageError] = useState(false);

  // Calcular stock total si existe
  const stockTotal = producto.stock 
    ? producto.stock.reduce((sum, s) => sum + s.cantidad, 0)
    : 0;

  return (
    <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-200 overflow-hidden transition-all duration-300 transform hover:-translate-y-2">
      {/* Imagen */}
      <div className="relative h-56 bg-gradient-to-br from-green-50 to-emerald-100 overflow-hidden">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={producto.nombre}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-20 h-20 text-green-300 group-hover:text-green-400 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
        )}
        
        {/* Badge de stock */}
        {producto.stock && (
          <div className="absolute top-3 left-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              stockTotal > 10 
                ? 'bg-green-500 text-white' 
                : stockTotal > 0 
                  ? 'bg-yellow-500 text-white'
                  : 'bg-red-500 text-white'
            }`}>
              Stock: {stockTotal}
            </span>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Contenido */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-green-600 transition-colors line-clamp-1">
          {producto.nombre}
        </h3>
        
        {producto.marca && (
          <p className="text-xs text-gray-500 mb-2 font-medium">
            {producto.marca.marca}
          </p>
        )}
        
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
          {producto.descripcion || "Sin descripción"}
        </p>

        {/* Acciones */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewStock(producto)}
            className="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Stock
          </button>

          {canAdmin && (
            <button
              onClick={() => onEdit(producto)}
              className="flex-1 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}