import { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import { updatePlanSepare } from "../../api/planSepare";
import { formatCurrency } from "../../utils/formatters";

const ESTADOS = ["Activo", "Incumplido", "Anulado", "Finalizado"];

export default function EditPlanSepareModal({ plan, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    estado: plan.estado || "Activo",
    fechaVencimiento: plan.fechaVencimiento ? plan.fechaVencimiento.split('T') : "",
  });

  const [errors, setErrors] = useState({});

  // Validaciones
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.estado) {
      newErrors.estado = "Seleccione un estado";
    }
    
    if (!formData.fechaVencimiento) {
      newErrors.fechaVencimiento = "La fecha de vencimiento es obligatoria";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Confirmación para cambios críticos
    if (formData.estado !== plan.estado) {
      const confirmMessage = `¿Está seguro de cambiar el estado de "${plan.estado}" a "${formData.estado}"?`;
      if (!confirm(confirmMessage)) return;
    }
    
    setLoading(true);
    try {
      await updatePlanSepare(plan.id, formData);
      onSuccess();
    } catch (error) {
      alert("Error al actualizar plan separe: " + error.message);
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

  return (
    <Modal 
      open={true} 
      onClose={onClose} 
      title={`Editar Plan Separe #${plan.id}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Info del Plan (solo lectura) */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Información del Plan</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Cliente:</span>
              <p className="font-medium">{plan.cliente?.nombre}</p>
            </div>
            <div>
              <span className="text-gray-600">Deuda Total:</span>
              <p className="font-medium">{formatCurrency(plan.deudaInicial)}</p>
            </div>
            <div>
              <span className="text-gray-600">Saldo Pendiente:</span>
              <p className="font-medium text-red-600">{formatCurrency(plan.deudaParcial)}</p>
            </div>
            <div>
              <span className="text-gray-600">% Pagado:</span>
              <p className="font-medium">{Math.round(plan.porcentajePagado)}%</p>
            </div>
          </div>
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado *
          </label>
          <select
            value={formData.estado}
            onChange={(e) => updateField("estado", e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.estado ? "border-red-500" : "border-gray-300"
            }`}
          >
            {ESTADOS.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
          {errors.estado && (
            <p className="text-red-500 text-sm mt-1">{errors.estado}</p>
          )}
          
          {/* Advertencias por estado */}
          {formData.estado === "Anulado" && (
            <p className="text-red-600 text-sm mt-1">
              ⚠️ Al anular se devolverá el stock apartado
            </p>
          )}
          {formData.estado === "Finalizado" && plan.deudaParcial > 0 && (
            <p className="text-yellow-600 text-sm mt-1">
              ⚠️ Aún hay saldo pendiente de {formatCurrency(plan.deudaParcial)}
            </p>
          )}
        </div>

        {/* Fecha de Vencimiento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Vencimiento *
          </label>
          <input
            type="date"
            value={formData.fechaVencimiento}
            onChange={(e) => updateField("fechaVencimiento", e.target.value)}
            min={today}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.fechaVencimiento ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.fechaVencimiento && (
            <p className="text-red-500 text-sm mt-1">{errors.fechaVencimiento}</p>
          )}
        </div>

        {/* Nota Informativa */}
        <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
          <p className="font-medium mb-1">Nota:</p>
          <ul className="space-y-1 text-xs">
            <li>• Los montos y productos no se pueden editar desde aquí</li>
            <li>• Use "Hacer Abono" para registrar pagos</li>
            <li>• El cambio de estado es permanente</li>
          </ul>
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
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {loading ? "Actualizando..." : "Actualizar Plan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}