import { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import { getPlanSepare } from "../../api/planSepare";
import { formatCurrency, formatDate, formatDateTime } from "../../utils/formatters";

const ESTADO_COLORS = {
  "Activo": "bg-green-100 text-green-800",
  "Finalizado": "bg-blue-100 text-blue-800", 
  "Anulado": "bg-red-100 text-red-800",
  "Incumplido": "bg-yellow-100 text-yellow-800"
};

export default function ViewPlanSepareModal({ plan: initialPlan, onClose, onAbono }) {
  const [plan, setPlan] = useState(initialPlan);
  const [loading, setLoading] = useState(false);

  // Recargar datos completos al abrir
  useEffect(() => {
    const loadFullPlan = async () => {
      if (!initialPlan?.id) return;
      
      setLoading(true);
      try {
        const fullPlan = await getPlanSepare(initialPlan.id);
        setPlan(fullPlan);
      } catch (error) {
        console.error("Error loading plan details:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadFullPlan();
  }, [initialPlan?.id]);

  if (!plan) return null;

  return (
    <Modal 
      open={true} 
      onClose={onClose} 
      title={`Plan Separe #${plan.id}`}
      size="lg"
    >
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Información General */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Información del Cliente</h4>
              <div className="space-y-2">
                <div>
                  <label className="text-sm text-gray-600">Nombre:</label>
                  <p className="font-medium">{plan.cliente?.nombre || "Sin nombre"}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Documento:</label>
                  <p className="font-medium">{plan.cliente?.documento || "Sin documento"}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Teléfono:</label>
                  <p className="font-medium">{plan.cliente?.telefono || "No registrado"}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Correo:</label>
                  <p className="font-medium">{plan.cliente?.correo || "No registrado"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Información del Plan</h4>
              <div className="space-y-2">
                <div>
                  <label className="text-sm text-gray-600">Estado:</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ml-2 ${
                    ESTADO_COLORS[plan.estado] || "bg-gray-100 text-gray-800"
                  }`}>
                    {plan.estado}
                  </span>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Fecha Creación:</label>
                  <p className="font-medium">{formatDate(plan.fechaCreacion)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Fecha Vencimiento:</label>
                  <p className="font-medium">{formatDate(plan.fechaVencimiento)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Usuario:</label>
                  <p className="font-medium">{plan.usuario?.nombre || "Sin usuario"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Resumen Financiero */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-4">Resumen Financiero</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Deuda Total</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(plan.deudaInicial)}
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">Pagado</p>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(plan.deudaInicial - plan.deudaParcial)}
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">Saldo Pendiente</p>
                <p className="text-lg font-bold text-red-600">
                  {formatCurrency(plan.deudaParcial)}
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">% Pagado</p>
                <p className="text-lg font-bold text-blue-600">
                  {Math.round(plan.porcentajePagado)}%
                </p>
              </div>
            </div>

            {/* Barra de Progreso */}
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all"
                style={{ width: `${Math.min(100, plan.porcentajePagado)}%` }}
              ></div>
            </div>
          </div>

          {/* Productos Apartados */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Productos Apartados</h4>
            
            {plan.productos && plan.productos.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Producto</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Variante</th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Cantidad</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Precio Unit.</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {plan.productos.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">
                            {item.stock?.producto?.nombre || "Producto eliminado"}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {item.stock?.color?.nombre && `Color: ${item.stock.color.nombre}`}
                          {item.stock?.color?.nombre && item.stock?.talla?.nombre && " | "}
                          {item.stock?.talla?.nombre && `Talla: ${item.stock.talla.nombre}`}
                        </td>
                        <td className="px-4 py-3 text-center font-medium">
                          {item.cantidad}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatCurrency(item.stock?.precio_venta || 0)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold">
                          {formatCurrency((item.stock?.precio_venta || 0) * item.cantidad)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No hay productos registrados</p>
            )}
          </div>

          {/* Historial de Abonos */}
          {plan.abonos && plan.abonos.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Historial de Abonos</h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Fecha</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Concepto</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Monto</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Usuario</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {plan.abonos.map((abono) => (
                      <tr key={abono.id}>
                        <td className="px-4 py-3 text-sm">
                          {formatDateTime(abono.fecha)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {abono.concepto || "Abono"}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-green-600">
                          {formatCurrency(abono.monto)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {abono.usuario?.nombre || "Sin usuario"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cerrar
            </button>
            
            {plan.estado === "Activo" && plan.deudaParcial > 0 && (
              <button
                onClick={onAbono}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Hacer Abono
              </button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}