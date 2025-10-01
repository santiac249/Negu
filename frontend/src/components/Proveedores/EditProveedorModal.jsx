// src/components/proveedores/EditProveedorModal.jsx
import ModalBase from "./ModalBase";
import ProveedorForm from "./ProveedorForm";

export default function EditProveedorModal({ proveedor, onClose, onUpdate }) {
  if (!proveedor) return null;
  return (
    <ModalBase title="Editar proveedor" onClose={onClose}>
      <ProveedorForm initialData={proveedor} onSubmit={onUpdate} />
    </ModalBase>
  );
}
