import React from "react";
import UserForm from "./UserForm";
import { createUsuario } from "../../api/usuarios";

export default function CreateUserModal({ onClose, refresh }) {
  const handleSubmit = async (formData, isUpdate, id) => {
    await createUsuario(formData);
    refresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-xl max-h-[90vh] p-6 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Crear Usuario</h2>
          <button
            onClick={onClose}
            className="bg-red-600 text-white-500 hover:bg-red-700 text-lg"
          >
            ✕
          </button>
        </div>
        <UserForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}