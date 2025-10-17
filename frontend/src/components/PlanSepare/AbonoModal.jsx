import { useState } from "react";
import { useAuth } from "../../store/auth";
import Modal from "../ui/Modal";
import { createAbono } from "../../api/planSepare";
import { formatCurrency } from "../../utils/formatters";

export default function AbonoModal({ plan, onClose, onSuccess }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    monto: "",
    concepto: "Abono parcial",
    usuarioId: user?.id || "",
  });

  const [errors, setErrors] = useState({});

  // Validaciones
  const validateForm = () => {
    const newErrors = {};
    const monto = parseFloat(formData.monto);
    
    if (!formData.monto || monto <= 0) {
      newErrors.monto = "El monto debe ser mayor a 0";
    } else if (monto > plan.deudaParcial) {
      newErrors.monto = "El monto no puede ser mayor a la deuda pendiente";
    }
    
    if (!formData.concepto?.trim()) {
      newErrors.concepto = "El concepto es obligatorio";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const confirmMessage = `¿Confirma el abono de ${formatCurrency(formData.monto)}?\n\nSaldo actual: ${formatCurrency(plan.deudaParcial)}\nNuevo saldo: ${formatCurrency(plan.deudaParcial - parseFloat(formData.monto))}`;
    
    if (!confirm(confirmMessage)) return;
    
    setLoading(true);
    try {
      await createAbono(plan.id, {
        monto: parseFloat(formData.monto),
        concepto: formData.concepto.trim(),
        usuarioId: formData.usuarioId,
      });
      onSuccess();
    } catch (error) {
      alert("Error al registrar abono: " + error.message);
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

  // Calcular nuevo saldo
  const monto = parseFloat(formData.monto) || 0;
  const nuevoSaldo = plan.deudaParcial - monto;
  const nuevoPorcentaje = plan.deudaInicial > 0 
    ? ((plan.deudaInicial - nuevoSaldo) / plan.deudaInicial) * 100 
    : 0;

  return (
    <Modal 
      open={true} 
      onClose={onClose} 
      title={`Hacer Abono - Plan #${plan.id}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Info del Plan */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Información del Plan</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Cliente:</span>
              <p className="font-medium">{plan.cliente?.nombre}</p>
            </div>
            <div>
              <span className="text-gray-600">Saldo Actual:</span>
              <p className="font-bold text-red-600">{formatCurrency(plan.deudaParcial)}</p>
            </div>
          </div>
        </div>

        {/* Monto del Abono */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monto del Abono *
          </label>
          <input
            type="number"
            value={formData.monto}
            onChange={(e) => updateField("monto", e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.monto ? "border-red-500" : "border-gray-300"
            }`}
            min="0"
            max={plan.deudaParcial}
            step="100"
            placeholder="0"
          />
          {errors.monto && (
            <p className="text-red-500 text-sm mt-1">{errors.monto}</p>
          )}
          
          {/* Botones de monto rápido */}
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => updateField("monto", (plan.deudaParcial * 0.25).toString())}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              25%
            </button>
            <button
              type="button"
              onClick={() => updateField("monto", (plan.deudaParcial * 0.5).toString())}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              50%
            </button>
            <button
              type="button"
              onClick={() => updateField("monto", plan.deudaParcial.toString())}
              className="text-xs px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors"
            >
              Pagar Todo
            </button>
          </div>
        </div>

        {/* Concepto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Concepto
          </label>
          <input
            type="text"
            value={formData.concepto}
            onChange={(e) => updateField("concepto", e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.concepto ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Abono parcial"
          />
          {errors.concepto && (
            <p className="text-red-500 text-sm mt-1">{errors.concepto}</p>
          )}
        </div>

        {/* Vista Previa del Resultado */}
        {monto > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-2">Después del Abono:</h5>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Nuevo Saldo:</span>
                <p className="font-bold text-blue-900">
                  {formatCurrency(Math.max(0, nuevoSaldo))}
                </p>
              </div>
              <div>
                <span className="text-blue-700">% Pagado:</span>
                <p className="font-bold text-blue-900">
                  {Math.round(Math.min(100, nuevoPorcentaje))}%
                </p>
              </div>
            </div>
            
            {nuevoSaldo <= 0 && (
              <div className="mt-2 p-2 bg-green-100 text-green-800 rounded text-sm">
                ✅ Este abono completará el pago del plan separe
              </div>
            )}
          </div>
        )}

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
            disabled={loading || !formData.monto || parseFloat(formData.monto) <= 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {loading ? "Registrando..." : "Registrar Abono"}
          </button>
        </div>
      </form>
    </Modal>
  );
}