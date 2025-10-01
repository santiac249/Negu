// src/components/productos/CardBase.jsx
export default function CardBase({ title, subtitle, imageUrl, description, onClick, actionSlot }) {
  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer rounded-xl border bg-white shadow-sm hover:shadow-md transition overflow-hidden"
    >
      <div className="aspect-[4/3] w-full bg-gray-100">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">Sin imagen</div>
        )}
      </div>

      <div className="p-3">
        <h3 className="text-sm font-semibold text-gray-900 truncate">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 truncate">{subtitle}</p>}
      </div>

      {/* Overlay de descripción al hover */}
      {description && (
        <div className="pointer-events-none absolute inset-0 bg-black/0 group-hover:bg-black/40 transition">
          <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition">
            <p className="text-xs text-white line-clamp-3">{description}</p>
          </div>
        </div>
      )}

      {/* Zona de acciones (botones editar/eliminar) sin propagar click */}
      {actionSlot && (
        <div
          className="absolute top-2 right-2 flex gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {actionSlot}
        </div>
      )}
    </div>
  );
}
