import ModalBase from "../proveedores/ModalBase";
import MarcaForm from "./MarcaForm";

export default function EditMarcaModal({ marca, onClose, onUpdate }) {
  if (!marca) return null;
  return (
    <ModalBase title="Editar marca" onClose={onClose}>
      <MarcaForm initialData={marca} onSubmit={onUpdate} />
    </ModalBase>
  );
}
