import { formatCurrency } from "../../utils/formatters";

export default function StockModal({ stockData, onClose }) {
  const { producto, stock, resumen } = stockData;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <div>
              <h2 className="text-xl font-bold">Stock del Producto</h2>
              <p className="text-blue-100 text-sm">{producto.nombre}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Resumen */}
        <div className="px-6 py-4 bg-gray-50 border-b grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Total de Variantes</p>
            <p className="text-2xl font-bold text-gray-900">{resumen.totalVariantes}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Stock Total</p>
            <p className="text-2xl font-bold text-blue-600">{resumen.stockTotal} unidades</p>
          </div>
        </div>

        {/* Contenido scrollable */}
        <div className="px-6 py-4 max-h-96 overflow-y-auto">
          {stock.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-500">No hay variantes de stock para este producto</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Color</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Talla</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Cantidad</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Precio</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Valor Total</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stock.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm">
                        <span className="font-medium text-gray-900">
                          {item.color?.nombre || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {item.talla?.nombre || '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                          item.cantidad > 10 
                            ? 'bg-green-100 text-green-800' 
                            : item.cantidad > 0
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {item.cantidad}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                        {formatCurrency(item.precio_venta)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-blue-600">
                        {formatCurrency(item.precio_venta * item.cantidad)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {item.cantidad > 0 ? (
                          <span className="inline-flex items-center text-green-600">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Disponible
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-red-600">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            Agotado
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}