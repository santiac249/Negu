import { useState, useEffect } from "react";
import { getStock } from "../../api/planSepare";
import { formatCurrency } from "../../utils/formatters";

export default function ProductSelector({ selectedProducts, onProductsChange, error }) {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // Cargar stock disponible
  useEffect(() => {
    const loadStock = async () => {
      setLoading(true);
      try {
        const data = await getStock();
        // Solo productos con stock disponible
        const availableStock = data.filter(item => item.cantidad > 0);
        setStock(availableStock);
      } catch (error) {
        console.error("Error loading stock:", error);
        setStock([]);
      } finally {
        setLoading(false);
      }
    };
    loadStock();
  }, []);

  // Filtrar stock por búsqueda
  const filteredStock = stock.filter(item => {
    if (!search.trim()) return true;
    
    const searchLower = search.toLowerCase();
    const productName = item.producto?.nombre?.toLowerCase() || "";
    const colorName = item.color?.nombre?.toLowerCase() || "";
    const tallaName = item.talla?.nombre?.toLowerCase() || "";
    
    return (
      productName.includes(searchLower) ||
      colorName.includes(searchLower) ||
      tallaName.includes(searchLower)
    );
  });

  // Agregar producto
  const addProduct = (stockItem) => {
    const existing = selectedProducts.find(p => p.stockId === stockItem.id);
    if (existing) {
      alert("Este producto ya está agregado");
      return;
    }

    const newProduct = {
      stockId: stockItem.id,
      cantidad: 1,
      precio_venta: stockItem.precio_venta,
      // Info para mostrar
      producto: stockItem.producto,
      color: stockItem.color,
      talla: stockItem.talla,
      stockDisponible: stockItem.cantidad
    };

    onProductsChange([...selectedProducts, newProduct]);
    setSearch("");
    setShowSearch(false);
  };

  // Actualizar cantidad
  const updateQuantity = (stockId, newQuantity) => {
    const product = selectedProducts.find(p => p.stockId === stockId);
    if (newQuantity > product.stockDisponible) {
      alert(`Stock insuficiente. Disponible: ${product.stockDisponible}`);
      return;
    }

    onProductsChange(
      selectedProducts.map(p =>
        p.stockId === stockId ? { ...p, cantidad: newQuantity } : p
      )
    );
  };

  // Remover producto
  const removeProduct = (stockId) => {
    onProductsChange(selectedProducts.filter(p => p.stockId !== stockId));
  };

  return (
    <div className="space-y-4">
      {/* Buscador de productos */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowSearch(!showSearch)}
          className="w-full border border-dashed border-gray-300 rounded-lg px-4 py-3 text-left text-gray-500 hover:border-gray-400 transition-colors"
        >
          + Agregar productos del stock
        </button>

        {showSearch && (
          <div className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-300 rounded-lg shadow-lg mt-1">
            <div className="p-3 border-b">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
            
            <div className="max-h-60 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  Cargando productos...
                </div>
              ) : filteredStock.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No hay productos disponibles
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredStock.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => addProduct(item)}
                      className="w-full p-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-900">
                            {item.producto?.nombre}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.color?.nombre && `Color: ${item.color.nombre} `}
                            {item.talla?.nombre && `Talla: ${item.talla.nombre} `}
                            Stock: {item.cantidad}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            {formatCurrency(item.precio_venta)}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lista de productos seleccionados */}
      {selectedProducts.length > 0 && (
        <div className="space-y-2">
          <h5 className="font-medium text-gray-900">Productos Seleccionados</h5>
          
          {selectedProducts.map((product) => (
            <div key={product.stockId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {product.producto?.nombre}
                </div>
                <div className="text-sm text-gray-500">
                  {product.color?.nombre && `Color: ${product.color.nombre} `}
                  {product.talla?.nombre && `Talla: ${product.talla.nombre} `}
                  {formatCurrency(product.precio_venta)} c/u
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Cant:</label>
                <input
                  type="number"
                  value={product.cantidad}
                  onChange={(e) => updateQuantity(product.stockId, parseInt(e.target.value) || 1)}
                  min="1"
                  max={product.stockDisponible}
                  className="w-16 border border-gray-300 rounded px-2 py-1 text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="text-right min-w-24">
                <div className="font-medium text-gray-900">
                  {formatCurrency(product.cantidad * product.precio_venta)}
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => removeProduct(product.stockId)}
                className="text-red-600 hover:text-red-800 p-1"
                title="Eliminar producto"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          
          {/* Total */}
          <div className="flex justify-end pt-2 border-t border-gray-200">
            <div className="text-lg font-semibold text-gray-900">
              Total: {formatCurrency(
                selectedProducts.reduce((sum, p) => sum + (p.cantidad * p.precio_venta), 0)
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
}