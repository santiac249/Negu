// src/components/proveedores/InfoProveedorModal.jsx
import ModalBase from "./ModalBase";

export default function InfoProveedorModal({ proveedor, onClose }) {
  if (!proveedor) return null;
  return (
    <ModalBase title="Información de proveedor" onClose={onClose}>
      <div className="space-y-2 text-sm">
        <p><span className="font-medium">Nombre:</span> {proveedor.nombre}</p>
        <p><span className="font-medium">Teléfono:</span> {proveedor.telefono || "—"}</p>
        <p><span className="font-medium">Correo:</span> {proveedor.correo || "—"}</p>
        <p><span className="font-medium">Dirección:</span> {proveedor.direccion || "—"}</p>
      </div>
    </ModalBase>
  );
}
