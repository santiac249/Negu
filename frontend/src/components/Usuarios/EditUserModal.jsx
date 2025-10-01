import React from "react";
import EditUser from "./EditUser";
import { updateUsuario } from "../../api/usuarios";

export default function EditUserModal({ onClose, refresh, user }) {
  const handleSubmit = async (formData, isUpdate, id) => {
    await updateUsuario(formData, isUpdate, id);
    refresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-xl max-h-[90vh] p-6 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Editar Usuario</h2>
          <button
            onClick={onClose}
            className="bg-red-600 text-white hover:bg-red-700 rounded px-2 py-1 text-lg"
          >
            ✕
          </button>
        </div>
        <EditUser onSubmit={handleSubmit} initialData={user} />
      </div>
    </div>
  );
}
