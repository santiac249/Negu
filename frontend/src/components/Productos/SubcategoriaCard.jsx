import CardBase from "./CardBase";
export default function SubcategoriaCard({ subcategoria, onClick, canAdmin, onEdit }) {
  const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  const imageUrl = subcategoria.foto ? `${baseURL}/uploads/fotos/subcategorias/${subcategoria.foto}` : null;

  return (
    <CardBase
      title={subcategoria.subcategoria}
      imageUrl={imageUrl}
      description={subcategoria.descripcion}
      onClick={() => onClick?.(subcategoria)}
      actionSlot={
        canAdmin && (
          <button
            className="px-2 py-1 text-xs rounded bg-yellow-500 text-white hover:bg-yellow-600"
            onClick={() => onEdit?.(subcategoria)}
          >
            Editar
          </button>
        )
      }
    />
  );
}