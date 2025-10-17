import { useState, useEffect } from "react";
import { useAuth } from "../../store/auth";
import Modal from "../ui/Modal";
import ProductSelector from "./ProductSelector";
import { createPlanSepare, getClientes } from "../../api/planSepare";
import { formatCurrency } from "../../utils/formatters";

export default function CreatePlanSepareModal({ onClose, onSuccess }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState([]);
  
  // Form data
  const [formData, setFormData] = useState({
    clienteId: "",
    usuarioId: user?.id || "",
    productos: [],
    deudaInicial: 0,
    deudaParcial: 0,
    fechaVencimiento: "",
  });

  const [errors, setErrors] = useState({});

  // Cargar clientes
  useEffect(() => {
    const loadClientes = async () => {
      try {
        const data = await getClientes();
        setClientes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error loading clientes:", error);
      }
    };
    loadClientes();
  }, []);

  // Calcular totales automáticamente
  useEffect(() => {
    if (formData.productos.length > 0) {
      const total = formData.productos.reduce((sum, p) => 
        sum + (p.cantidad * p.precio_venta), 0
      );
      setFormData(prev => ({
        ...prev,
        deudaInicial: total,
        deudaParcial: total // Inicialmente toda la deuda está pendiente
      }));
    }
  }, [formData.productos]);

  // Validaciones
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.clienteId) newErrors.clienteId = "Seleccione un cliente";
    if (formData.productos.length === 0) newErrors.productos = "Agregue al menos un producto";
    if (formData.deudaInicial <= 0) newErrors.deudaInicial = "La deuda debe ser mayor a 0";
    if (formData.deudaParcial < 0) newErrors.deudaParcial = "La deuda parcial no puede ser negativa";
    if (formData.deudaParcial > formData.deudaInicial) {
      newErrors.deudaParcial = "La deuda parcial no puede ser mayor que la total";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await createPlanSepare(formData);
      onSuccess();
    } catch (error) {
      alert("Error al crear plan separe: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // Fecha mínima (hoy)
  const today = new Date().toISOString().split('T');
  
  // Fecha por defecto (1 mes)
  const defaultDate = new Date();
  defaultDate.setMonth(defaultDate.getMonth() + 1);
  const defaultDateStr = defaultDate.toISOString().split('T');

  return (
    <Modal 
      open={true} 
      onClose={onClose} 
      title="Crear Nuevo Plan Separe" 
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cliente */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cliente *
          </label>
          <select
            value={formData.clienteId}
            onChange={(e) => updateField("clienteId", e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.clienteId ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Seleccionar cliente...</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombre} - {cliente.documento || "Sin documento"}
              </option>
            ))}
          </select>
          {errors.clienteId && (
            <p className="text-red-500 text-sm mt-1">{errors.clienteId}</p>
          )}
        </div>

        {/* Selector de Productos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Productos *
          </label>
          <ProductSelector
            selectedProducts={formData.productos}
            onProductsChange={(productos) => updateField("productos", productos)}
            error={errors.productos}
          />
        </div>

        {/* Resumen Financiero */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Resumen Financiero</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Deuda Total */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deuda Total
              </label>
              <input
                type="number"
                value={formData.deudaInicial}
                onChange={(e) => updateField("deudaInicial", parseFloat(e.target.value) || 0)}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.deudaInicial ? "border-red-500" : "border-gray-300"
                }`}
                min="0"
                step="100"
              />
              <p className="text-xs text-gray-600 mt-1">
                {formatCurrency(formData.deudaInicial)}
              </p>
              {errors.deudaInicial && (
                <p className="text-red-500 text-sm mt-1">{errors.deudaInicial}</p>
              )}
            </div>

            {/* Abono Inicial */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Abono Inicial
              </label>
              <input
                type="number"
                value={formData.deudaInicial - formData.deudaParcial}
                onChange={(e) => {
                  const abono = parseFloat(e.target.value) || 0;
                  updateField("deudaParcial", formData.deudaInicial - abono);
                }}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                min="0"
                max={formData.deudaInicial}
                step="100"
              />
              <p className="text-xs text-gray-600 mt-1">
                {formatCurrency(formData.deudaInicial - formData.deudaParcial)}
              </p>
            </div>

            {/* Saldo Pendiente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Saldo Pendiente
              </label>
              <div className="w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-700">
                {formatCurrency(formData.deudaParcial)}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {formData.deudaInicial > 0 
                  ? `${Math.round(((formData.deudaInicial - formData.deudaParcial) / formData.deudaInicial) * 100)}% pagado`
                  : "0% pagado"
                }
              </p>
              {errors.deudaParcial && (
                <p className="text-red-500 text-sm mt-1">{errors.deudaParcial}</p>
              )}
            </div>
          </div>
        </div>

        {/* Fecha de Vencimiento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Vencimiento
          </label>
          <input
            type="date"
            value={formData.fechaVencimiento || defaultDateStr}
            onChange={(e) => updateField("fechaVencimiento", e.target.value)}
            min={today}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Si no especifica, se establecerá 1 mes desde hoy
          </p>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || formData.productos.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {loading ? "Creando..." : "Crear Plan Separe"}
          </button>
        </div>
      </form>
    </Modal>
  );
}