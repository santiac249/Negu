import React from 'react';

export default function SessionErrorModal({ open, onLogout }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg text-center">
        <h2 className="text-lg font-semibold text-red-600 mb-2">Error de sesión</h2>
        <p className="text-sm text-gray-600 mb-4">Tu sesión ha expirado o no es válida.</p>
        <button
          onClick={onLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Volver a iniciar sesión
        </button>
      </div>
    </div>
  );
}
