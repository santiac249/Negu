import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { findAllProveedores } from '../../api/proveedores';
import { useAuth } from '../../store/auth';

export default function CreateGastoModal({ onClose, onCreate }) {
  const { getToken, user } = useAuth();
  const [concepto, setConcepto] = useState('');
  const [tipo, setTipo] = useState('Operativo');
  const [monto, setMonto] = useState('');
  const [proveedorId, setProveedorId] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const tiposGasto = ['Operativo', 'Administrativo', 'Financiero', 'Marketing', 'Otro'];

  useEffect(() => {
    loadProveedores();
  }, []);

  const loadProveedores = async () => {
    try {
      const data = await findAllProveedores(getToken);
      setProveedores(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando proveedores:', err);
    }
  };

  const validateForm = () => {
    if (!concepto.trim()) {
      setError('El concepto es requerido');
      return false;
    }
    if (!monto || parseFloat(monto) <= 0) {
      setError('El monto debe ser mayor a 0');
      return false;
    }
    if (!tipo) {
      setError('El tipo de gasto es requerido');
      return false;
    }
    if (!fecha) {
      setError('La fecha es requerida');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onCreate({
        concepto: concepto.trim(),
        tipo,
        monto: parseFloat(monto),
        proveedorId: proveedorId ? parseInt(proveedorId) : undefined,
        usuarioId: user.id,
        fecha: new Date(fecha).toISOString(),
      });
      // No cerramos aquí, el padre lo hace si onCreate es exitoso
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al crear el gasto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Nuevo Gasto</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Concepto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Concepto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={concepto}
              onChange={(e) => {
                setConcepto(e.target.value);
                setError(null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ej: Pago de servicios, Compra de materiales"
              disabled={loading}
            />
          </div>

          {/* Tipo y Monto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Gasto <span className="text-red-500">*</span>
              </label>
              <select
                value={tipo}
                onChange={(e) => {
                  setTipo(e.target.value);
                  setError(null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              >
                {tiposGasto.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto (COP) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={monto}
                onChange={(e) => {
                  setMonto(e.target.value);
                  setError(null);
                }}
                min="0"
                step="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0"
                disabled={loading}
              />
            </div>
          </div>

          {/* Fecha y Proveedor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => {
                  setFecha(e.target.value);
                  setError(null);
                }}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proveedor (Opcional)
              </label>
              <select
                value={proveedorId}
                onChange={(e) => setProveedorId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              >
                <option value="">Sin proveedor</option>
                {proveedores.map((prov) => (
                  <option key={prov.id} value={prov.id}>
                    {prov.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Usuario info */}
          <div className="bg-gray-50 rounded-lg p-3 text-sm">
            <p className="text-gray-600">
              <strong>Registrado por:</strong> {user?.nombre || user?.usuario}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creando...
                </span>
              ) : (
                'Crear Gasto'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
