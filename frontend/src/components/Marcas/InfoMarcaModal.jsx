import ModalBase from "../proveedores/ModalBase";

export default function InfoMarcaModal({ marca, onClose }) {
  if (!marca) return null;
  const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  return (
    <ModalBase title="Información de marca" onClose={onClose}>
      <div className="text-sm space-y-3">
        <div className="flex items-center gap-3">
          {marca.foto ? (
            <img
              src={`${baseURL}/uploads/fotos/marcas/${marca.foto}`}
              alt={marca.marca}
              className="w-12 h-12 rounded-full object-cover border"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-200 grid place-items-center text-gray-500 text-xs">
              Sin foto
            </div>
          )}
          <div>
            <p className="text-gray-600">Marca</p>
            <p className="font-medium">{marca.marca}</p>
          </div>
        </div>
      </div>
    </ModalBase>
  );
}
