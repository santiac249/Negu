import { X } from 'lucide-react';

export default function InfoGastoModal({ gasto, onClose }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Detalles del Gasto</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                ID del Gasto
              </label>
              <p className="text-base text-gray-900">#{gasto.id}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Fecha
              </label>
              <p className="text-base text-gray-900">
                {gasto.fecha
                  ? new Date(gasto.fecha).toLocaleDateString('es-CO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : '-'}
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Concepto
              </label>
              <p className="text-base text-gray-900">{gasto.concepto}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Tipo de Gasto
              </label>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                {gasto.tipo}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Monto
              </label>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(gasto.monto)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Proveedor
              </label>
              <p className="text-base text-gray-900">
                {gasto.proveedor?.nombre || 'No asociado'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Registrado por
              </label>
              <p className="text-base text-gray-900">
                {gasto.usuario?.nombre || '-'}
              </p>
            </div>
          </div>

          {/* Información adicional del proveedor si existe */}
          {gasto.proveedor && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Información del Proveedor
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {gasto.proveedor.telefono && (
                  <div>
                    <label className="block text-xs text-gray-500">Teléfono</label>
                    <p className="text-sm text-gray-900">{gasto.proveedor.telefono}</p>
                  </div>
                )}
                {gasto.proveedor.correo && (
                  <div>
                    <label className="block text-xs text-gray-500">Correo</label>
                    <p className="text-sm text-gray-900">{gasto.proveedor.correo}</p>
                  </div>
                )}
                {gasto.proveedor.direccion && (
                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-500">Dirección</label>
                    <p className="text-sm text-gray-900">{gasto.proveedor.direccion}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
