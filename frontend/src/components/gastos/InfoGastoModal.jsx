import { X, Calendar, DollarSign, Tag, Building2, User, Clock } from 'lucide-react';

export default function InfoGastoModal({ gasto, onClose }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTipoBadgeColor = (tipo) => {
    const colors = {
      Operativo: 'bg-blue-100 text-blue-800',
      Administrativo: 'bg-purple-100 text-purple-800',
      Financiero: 'bg-green-100 text-green-800',
      Marketing: 'bg-pink-100 text-pink-800',
      Otro: 'bg-gray-100 text-gray-800',
    };
    return colors[tipo] || colors.Otro;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Detalles del Gasto</h2>
            <p className="text-sm text-gray-500 mt-0.5">ID: #{gasto.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Información principal */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-6 h-6" />
              <p className="text-sm opacity-90">Monto del Gasto</p>
            </div>
            <p className="text-4xl font-bold">{formatCurrency(gasto.monto)}</p>
          </div>

          {/* Grid de información */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Concepto */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                <Tag className="w-4 h-4" />
                Concepto
              </div>
              <p className="text-base text-gray-900 bg-gray-50 rounded-lg p-3">
                {gasto.concepto}
              </p>
            </div>

            {/* Tipo */}
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                <Tag className="w-4 h-4" />
                Tipo de Gasto
              </div>
              <span
                className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${
                  getTipoBadgeColor(gasto.tipo)
                }`}
              >
                {gasto.tipo}
              </span>
            </div>

            {/* Fecha */}
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                <Calendar className="w-4 h-4" />
                Fecha del Gasto
              </div>
              <p className="text-base text-gray-900">
                {gasto.fecha
                  ? new Date(gasto.fecha).toLocaleDateString('es-CO', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : '-'}
              </p>
            </div>

            {/* Usuario */}
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                <User className="w-4 h-4" />
                Registrado por
              </div>
              <p className="text-base text-gray-900">
                {gasto.usuario?.nombre || 'Desconocido'}
              </p>
              {gasto.usuario?.usuario && (
                <p className="text-sm text-gray-500">@{gasto.usuario.usuario}</p>
              )}
            </div>

            {/* Fecha de creación */}
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                <Clock className="w-4 h-4" />
                Fecha de Registro
              </div>
              <p className="text-base text-gray-900">
                {gasto.f_creacion
                  ? new Date(gasto.f_creacion).toLocaleString('es-CO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'No disponible'}
              </p>
            </div>
          </div>

          {/* Información del proveedor */}
          {gasto.proveedor ? (
            <div className="border-t pt-6">
              <div className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-4">
                <Building2 className="w-5 h-5 text-indigo-600" />
                Información del Proveedor
              </div>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Nombre del Proveedor</p>
                  <p className="text-base font-medium text-gray-900">
                    {gasto.proveedor.nombre}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {gasto.proveedor.telefono && (
                    <div>
                      <p className="text-xs text-gray-500">Teléfono</p>
                      <p className="text-sm text-gray-900">{gasto.proveedor.telefono}</p>
                    </div>
                  )}
                  {gasto.proveedor.correo && (
                    <div>
                      <p className="text-xs text-gray-500">Correo Electrónico</p>
                      <p className="text-sm text-gray-900">{gasto.proveedor.correo}</p>
                    </div>
                  )}
                  {gasto.proveedor.direccion && (
                    <div className="md:col-span-2">
                      <p className="text-xs text-gray-500">Dirección</p>
                      <p className="text-sm text-gray-900">{gasto.proveedor.direccion}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="border-t pt-6">
              <div className="flex items-center gap-2 text-base font-semibold text-gray-400 mb-2">
                <Building2 className="w-5 h-5" />
                Sin Proveedor Asociado
              </div>
              <p className="text-sm text-gray-500">
                Este gasto no tiene un proveedor asignado.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
