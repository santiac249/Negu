// src/components/proveedores/CreateProveedorModal.jsx
import ModalBase from "./ModalBase";
import ProveedorForm from "./ProveedorForm";

export default function CreateProveedorModal({ onClose, onCreate }) {
  return (
    <ModalBase title="Crear proveedor" onClose={onClose}>
      <ProveedorForm onSubmit={onCreate} />
    </ModalBase>
  );
}
