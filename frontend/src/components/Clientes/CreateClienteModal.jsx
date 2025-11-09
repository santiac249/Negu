// src/components/clientes/CreateClienteModal.jsx
import React, { useState } from "react";
import ClienteForm from "./ClienteForm";
import { createCliente } from "../../api/clientes.js";

export default function CreateClienteModal({ onClose, refresh }) {
  const [error, setError] = useState("");

  const handleSubmit = async (formData, isUpdate, id) => {
    try {
      setError("");
      await createCliente(formData);
      refresh();
      onClose();
    } catch (err) {
      setError(err.message || "Error al crear cliente");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-xl max-h-[90vh] p-6 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Crear Cliente</h2>
          <button onClick={onClose} className="bg-red-600 text-white hover:bg-red-700 rounded px-2 py-1 text-lg">
            ✕
          </button>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <ClienteForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
