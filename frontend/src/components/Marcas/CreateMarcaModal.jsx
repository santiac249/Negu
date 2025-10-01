import ModalBase from "../proveedores/ModalBase"; // o crea uno en /marcas
import MarcaForm from "./MarcaForm";

export default function CreateMarcaModal({ onClose, onCreate }) {
  return (
    <ModalBase title="Nueva marca" onClose={onClose}>
      <MarcaForm onSubmit={onCreate} />
    </ModalBase>
  );
}
