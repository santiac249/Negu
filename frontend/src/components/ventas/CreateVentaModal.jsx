import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { findAllClientes } from '../../api/clientes';
import { findAllStock } from '../../api/stock';
import { useAuth } from '../../store/auth';
import axiosClient from '../../api/axiosClient';

export default function CreateVentaModal({ onClose, onCreate }) {
  const { getToken, user } = useAuth();
  const [clienteId, setClienteId] = useState('');
  const [metPagoId, setMetPagoId] = useState('');
  const [descuento, setDescuento] = useState('0');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [detalles, setDetalles] = useState([]);
  
  const [clientes, setClientes] = useState([]);
  const [metodosPago, setMetodosPago] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [clientesData, stockData, metodosData] = await Promise.all([
        findAllClientes(getToken),
        findAllStock(getToken),
        axiosClient.get('/metodos-pago', {
          headers: { Authorization: `Bearer ${getToken()}` },
        }),
      ]);
      
      setClientes(Array.isArray(clientesData) ? clientesData : []);
      setStockItems(Array.isArray(stockData) ? stockData : []);
      setMetodosPago(Array.isArray(metodosData.data) ? metodosData.data : []);
    } catch (err) {
      console.error('Error cargando datos:', err);
    }
  };

  const addDetalle = () => {
    setDetalles([...detalles, { stockId: '', cantidad: 1, precio: 0 }]);
  };

  const removeDetalle = (index) => {
    setDetalles(detalles.filter((_, i) => i !== index));
  };

  const updateDetalle = (index, field, value) => {
    const newDetalles = [...detalles];
    newDetalles[index][field] = value;
    
    // Auto-completar precio cuando se selecciona un stock
    if (field === 'stockId' && value) {
      const stock = stockItems.find((s) => s.id === parseInt(value));
      if (stock) {
        newDetalles[index].precio = stock.precio_venta;
      }
    }
    
    setDetalles(newDetalles);
  };

  const calculateTotal = () => {
    const subtotal = detalles.reduce(
      (sum, d) => sum + (parseFloat(d.precio) || 0) * (parseInt(d.cantidad) || 0),
      0
    );
    return subtotal - (parseFloat(descuento) || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!metPagoId || detalles.length === 0) {
      alert('Debe seleccionar un método de pago y agregar al menos un producto');
      return;
    }

    const invalidDetail = detalles.find(
      (d) => !d.stockId || !d.cantidad || d.cantidad <= 0 || !d.precio
    );
    if (invalidDetail) {
      alert('Todos los productos deben tener stock, cantidad y precio válidos');
      return;
    }

    setLoading(true);
    try {
      await onCreate({
        clienteId: clienteId ? parseInt(clienteId) : null,
        usuarioId: user.id,
        metPagoId: parseInt(metPagoId),
        descuento: parseFloat(descuento) || 0,
        fecha: new Date(fecha).toISOString(),
        detalles: detalles.map((d) => ({
          stockId: parseInt(d.stockId),
          cantidad: parseInt(d.cantidad),
          precio: parseFloat(d.precio),
        })),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Nueva Venta</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información general */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliente (Opcional)
              </label>
              <select
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Cliente General</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método de Pago <span className="text-red-500">*</span>
              </label>
              <select
                value={metPagoId}
                onChange={(e) => setMetPagoId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Seleccionar</option>
                {metodosPago.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.metodo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Productos */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Productos <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={addDetalle}
                className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
              >
                <Plus className="w-4 h-4" />
                Agregar producto
              </button>
            </div>

            <div className="space-y-3">
              {detalles.map((detalle, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <select
                      value={detalle.stockId}
                      onChange={(e) => updateDetalle(index, 'stockId', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Seleccionar producto</option>
                      {stockItems.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.producto?.nombre} - {s.color?.nombre || 'S/C'} - {s.talla?.nombre || 'S/T'} (Stock: {s.cantidad})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      value={detalle.cantidad}
                      onChange={(e) => updateDetalle(index, 'cantidad', e.target.value)}
                      min="1"
                      placeholder="Cant."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      value={detalle.precio}
                      onChange={(e) => updateDetalle(index, 'precio', e.target.value)}
                      min="0"
                      step="0.01"
                      placeholder="Precio"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDetalle(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {detalles.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No hay productos agregados. Haz clic en "Agregar producto".
              </p>
            )}
          </div>

          {/* Descuento y Total */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descuento
                </label>
                <input
                  type="number"
                  value={descuento}
                  onChange={(e) => setDescuento(e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total a Pagar
                </label>
                <div className="text-2xl font-bold text-indigo-600">
                  {formatCurrency(calculateTotal())}
                </div>
              </div>
            </div>
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
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Registrar Venta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
