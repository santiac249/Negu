import { formatCurrency, formatDate } from "../../utils/formatters";

const ESTADO_COLORS = {
  "Activo": "bg-green-100 text-green-800",
  "Finalizado": "bg-blue-100 text-blue-800", 
  "Anulado": "bg-red-100 text-red-800",
  "Incumplido": "bg-yellow-100 text-yellow-800"
};

export default function PlanSepareTable({ 
  planSepares, 
  canAdmin, 
  onEdit, 
  onView, 
  onAbono, 
  onDelete 
}) {
  if (planSepares.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">No hay planes separe registrados</div>
        <div className="text-gray-400 text-sm mt-2">
          Los planes creados aparecerán aquí
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">ID</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Cliente</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Estado</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Deuda Total</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Deuda Pendiente</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">% Pagado</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Vencimiento</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {planSepares.map((plan) => (
            <tr key={plan.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                #{plan.id}
              </td>
              
              <td className="px-4 py-3">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {plan.cliente?.nombre || "Sin cliente"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {plan.cliente?.documento || "Sin documento"}
                  </div>
                </div>
              </td>
              
              <td className="px-4 py-3">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  ESTADO_COLORS[plan.estado] || "bg-gray-100 text-gray-800"
                }`}>
                  {plan.estado}
                </span>
              </td>
              
              <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                {formatCurrency(plan.deudaInicial)}
              </td>
              
              <td className="px-4 py-3 text-sm text-gray-900">
                {formatCurrency(plan.deudaParcial)}
              </td>
              
              <td className="px-4 py-3">
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(100, plan.porcentajePagado)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-900 min-w-12">
                    {Math.round(plan.porcentajePagado)}%
                  </span>
                </div>
              </td>
              
              <td className="px-4 py-3 text-sm text-gray-900">
                {formatDate(plan.fechaVencimiento)}
              </td>
              
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  {/* Ver detalles */}
                  <button
                    onClick={() => onView(plan)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    title="Ver detalles"
                  >
                    Ver
                  </button>
                  
                  {/* Abonar (solo planes activos) */}
                  {plan.estado === "Activo" && (
                    <button
                      onClick={() => onAbono(plan)}
                      className="text-green-600 hover:text-green-800 text-sm font-medium"
                      title="Hacer abono"
                    >
                      Abonar
                    </button>
                  )}
                  
                  {/* Editar (solo admin) */}
                  {canAdmin && (
                    <button
                      onClick={() => onEdit(plan)}
                      className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                      title="Editar"
                    >
                      Editar
                    </button>
                  )}
                  
                  {/* Eliminar (solo admin) */}
                  {canAdmin && (
                    <button
                      onClick={() => onDelete(plan)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                      title="Eliminar"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}