// src/components/productos/CategoriaCard.jsx
import CardBase from "./CardBase";
export default function CategoriaCard({ categoria, onClick, canAdmin, onEdit }) {
  const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  const imageUrl = categoria.foto ? `${baseURL}/uploads/fotos/categorias/${categoria.foto}` : null;

  return (
    <CardBase
      title={categoria.categoria}
      imageUrl={imageUrl}
      description={categoria.descripcion}
      onClick={() => onClick?.(categoria)}
      actionSlot={
        canAdmin && (
          <button
            className="px-2 py-1 text-xs rounded bg-yellow-500 text-white hover:bg-yellow-600"
            onClick={() => onEdit?.(categoria)}
          >
            Editar
          </button>
        )
      }
    />
  );
}