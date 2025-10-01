import CardBase from "./CardBase";
export default function ProductoCard({ producto, onClick, canAdmin, onEdit }) {
  const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  const imageUrl = producto.foto ? `${baseURL}/uploads/fotos/productos/${producto.foto}` : null;

  return (
    <CardBase
      title={producto.nombre}
      subtitle={producto.marca?.marca}
      imageUrl={imageUrl}
      description={producto.descripcion}
      onClick={() => onClick?.(producto)}
      actionSlot={
        canAdmin && (
          <button
            className="px-2 py-1 text-xs rounded bg-yellow-500 text-white hover:bg-yellow-600"
            onClick={() => onEdit?.(producto)}
          >
            Editar
          </button>
        )
      }
    />
  );
}