import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../store/auth";
import { useDebounce } from "../hooks/useDebounce";
import ProductoBreadcrumbs from "../components/productos/ProductoBreadcrumbs";
import CategoriaCard from "../components/productos/CategoriaCard";
import SubcategoriaCard from "../components/productos/SubcategoriaCard";
import ProductoCard from "../components/productos/ProductoCard";
import ProductoFormModal from "../components/productos/ProductoFormModal";
import StockModal from "../components/productos/StockModal";
import {
  getCategorias,
  getSubcategoriasByCategoria,
  getProductosBySubcategoria,
  getStockByProducto,
} from "../api/productos.js";

export default function Productos() {
  const { user } = useAuth();
  const roleName = useMemo(() => {
    if (!user) return null;
    if (user.rol && typeof user.rol.rol === "string") return user.rol.rol;
    if (typeof user.rol_id === "number") return user.rol_id === 1 ? "Administrador" : "Vendedor";
    return null;
  }, [user]);

  const canAdmin = roleName === "Administrador";

  // Navegación por niveles
  const [level, setLevel] = useState("categorias"); // categorias | subcategorias | productos
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [selectedSubcategoria, setSelectedSubcategoria] = useState(null);

  // Datos
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Búsqueda con debounce
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 350);

  // Modales
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState(null); // 'create-categoria' | 'edit-categoria' | 'create-subcategoria' | etc.
  const [editingItem, setEditingItem] = useState(null);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProductoForStock, setSelectedProductoForStock] = useState(null);

  // Breadcrumbs
  const breadcrumbs = useMemo(() => {
    const items = [{ label: "Categorías", key: "categorias" }];
    if (selectedCategoria) 
      items.push({ label: selectedCategoria.categoria, key: "categoria", id: selectedCategoria.id });
    if (selectedSubcategoria) 
      items.push({ label: selectedSubcategoria.subcategoria, key: "subcategoria", id: selectedSubcategoria.id });
    return items;
  }, [selectedCategoria, selectedSubcategoria]);

  const handleNavigateBreadcrumb = (idx) => {
    if (idx === 0) {
      setLevel("categorias");
      setSelectedCategoria(null);
      setSelectedSubcategoria(null);
      setQuery("");
    } else if (idx === 1) {
      setLevel("subcategorias");
      setSelectedSubcategoria(null);
      setQuery("");
    }
  };

  // Loaders
  const loadCategorias = async () => {
    setLoading(true);
    try {
      const response = await getCategorias({ q: debouncedQuery });
      setCategorias(Array.isArray(response.data) ? response.data : response);
    } catch (e) {
      console.error("Error categorías:", e);
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSubcategorias = async () => {
    if (!selectedCategoria) return;
    setLoading(true);
    try {
      const data = await getSubcategoriasByCategoria(selectedCategoria.id, { q: debouncedQuery });
      setSubcategorias(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error subcategorías:", e);
      setSubcategorias([]);
    } finally {
      setLoading(false);
    }
  };

  const loadProductos = async () => {
    if (!selectedSubcategoria) return;
    setLoading(true);
    try {
      const data = await getProductosBySubcategoria(selectedSubcategoria.id, { q: debouncedQuery });
      setProductos(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error productos:", e);
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    if (level === "categorias") loadCategorias();
  }, [level, debouncedQuery]);

  useEffect(() => {
    if (level === "subcategorias" && selectedCategoria) loadSubcategorias();
  }, [level, selectedCategoria?.id, debouncedQuery]);

  useEffect(() => {
    if (level === "productos" && selectedSubcategoria) loadProductos();
  }, [level, selectedSubcategoria?.id, debouncedQuery]);

  // Handlers de navegación
  const openCategoria = (cat) => {
    setSelectedCategoria(cat);
    setLevel("subcategorias");
    setQuery("");
  };

  const openSubcategoria = (sub) => {
    setSelectedSubcategoria(sub);
    setLevel("productos");
    setQuery("");
  };

  // Handlers de CRUD
  const handleCreate = () => {
    setEditingItem(null);
    if (level === "categorias") {
      setModalMode("create-categoria");
    } else if (level === "subcategorias") {
      setModalMode("create-subcategoria");
    } else if (level === "productos") {
      setModalMode("create-producto");
    }
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    if (level === "categorias") {
      setModalMode("edit-categoria");
    } else if (level === "subcategorias") {
      setModalMode("edit-subcategoria");
    } else if (level === "productos") {
      setModalMode("edit-producto");
    }
    setShowModal(true);
  };

  const handleViewStock = async (producto) => {
    try {
      const stockData = await getStockByProducto(producto.id);
      setSelectedProductoForStock(stockData);
      setShowStockModal(true);
    } catch (error) {
      alert("Error al cargar stock: " + error.message);
    }
  };

  const handleModalSuccess = () => {
    setShowModal(false);
    setEditingItem(null);
    // Recargar datos según nivel
    if (level === "categorias") loadCategorias();
    else if (level === "subcategorias") loadSubcategorias();
    else if (level === "productos") loadProductos();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Gestión de Productos
          </h1>
          <p className="text-gray-600">
            Administra tu catálogo de categorías, subcategorías y productos
          </p>
        </div>

        {/* Breadcrumbs */}
        <ProductoBreadcrumbs
          items={breadcrumbs}
          onNavigate={handleNavigateBreadcrumb}
        />

        {/* Barra de búsqueda y acciones */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full sm:max-w-md">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  level === "categorias"
                    ? "Buscar categorías..."
                    : level === "subcategorias"
                    ? "Buscar subcategorías..."
                    : "Buscar productos..."
                }
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {canAdmin && (
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all transform hover:scale-105 shadow-sm hover:shadow-md"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Crear {level === "categorias" ? "Categoría" : level === "subcategorias" ? "Subcategoría" : "Producto"}
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Grids por nivel */}
        {!loading && (
          <>
            {level === "categorias" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categorias.map((c) => (
                  <CategoriaCard
                    key={c.id}
                    categoria={c}
                    onClick={openCategoria}
                    canAdmin={canAdmin}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            )}

            {level === "subcategorias" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {subcategorias.map((s) => (
                  <SubcategoriaCard
                    key={s.id}
                    subcategoria={s}
                    onClick={openSubcategoria}
                    canAdmin={canAdmin}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            )}

            {level === "productos" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {productos.map((p) => (
                  <ProductoCard
                    key={p.id}
                    producto={p}
                    canAdmin={canAdmin}
                    onEdit={handleEdit}
                    onViewStock={handleViewStock}
                  />
                ))}
              </div>
            )}

            {/* Empty States */}
            {!loading && (
              <>
                {level === "categorias" && categorias.length === 0 && (
                  <div className="text-center py-20">
                    <div className="text-gray-400 text-6xl mb-4">📦</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      No hay categorías
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Comienza creando tu primera categoría
                    </p>
                  </div>
                )}

                {level === "subcategorias" && subcategorias.length === 0 && (
                  <div className="text-center py-20">
                    <div className="text-gray-400 text-6xl mb-4">📂</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      No hay subcategorías
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Agrega subcategorías a esta categoría
                    </p>
                  </div>
                )}

                {level === "productos" && productos.length === 0 && (
                  <div className="text-center py-20">
                    <div className="text-gray-400 text-6xl mb-4">🛍️</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      No hay productos
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Agrega productos a esta subcategoría
                    </p>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Modales */}
        {showModal && (
          <ProductoFormModal
            mode={modalMode}
            item={editingItem}
            parentCategoria={selectedCategoria}
            parentSubcategoria={selectedSubcategoria}
            onClose={() => {
              setShowModal(false);
              setEditingItem(null);
            }}
            onSuccess={handleModalSuccess}
          />
        )}

        {showStockModal && selectedProductoForStock && (
          <StockModal
            stockData={selectedProductoForStock}
            onClose={() => {
              setShowStockModal(false);
              setSelectedProductoForStock(null);
            }}
          />
        )}
      </div>
    </div>
  );
}