// src/pages/Productos.jsx
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../store/auth";
import { useDebounce } from "../hooks/useDebounce";
import Breadcrumbs from "../components/productos/Breadcrumbs";
import CategoriaCard from "../components/productos/CategoriaCard";
import SubcategoriaCard from "../components/productos/SubcategoriaCard";
import ProductoCard from "../components/productos/ProductoCard";
import CategoriaFormModal from "../components/productos/modals/CategoriaFormModal";
import SubcategoriaFormModal from "../components/productos/modals/SubcategoriaFormModal";
import ProductoFormModal from "../components/productos/modals/ProductoFormModal";
import {
  getCategorias,
  getSubcategoriasByCategoria,
  getProductosBySubcategoria,
  createCategoria,
  updateCategoria,
  createSubcategoria,
  updateSubcategoria,
  createProducto,
  updateProducto,
} from "../api/productos.js";

export default function Productos() {
  const { user } = useAuth();
  const roleName = useMemo(() => {
    if (!user) return null;
    if (user.rol && typeof user.rol.rol === "string") return user.rol.rol;
    if (typeof user.rol_id === "number") return user.rol_id === 1 ? "Administrador" : "Vendedor";
    return null;
  }, [user]); // Determina el rol legible según tu store [1].

  const canAdmin = roleName === "Administrador"; // Controla visibilidad de acciones de administración [1].

  // Navegación por niveles
  const [level, setLevel] = useState("categorias"); // categorias | subcategorias | productos [3].
  const [selectedCategoria, setSelectedCategoria] = useState(null); // Para filtrar subcategorías por categoría [3].
  const [selectedSubcategoria, setSelectedSubcategoria] = useState(null); // Para filtrar productos por subcategoría [3].

  // Datos
  const [categorias, setCategorias] = useState([]); // Lista de categorías mostradas en tarjetas [3].
  const [subcategorias, setSubcategorias] = useState([]); // Lista de subcategorías para la categoría seleccionada [3].
  const [productos, setProductos] = useState([]); // Lista de productos para la subcategoría seleccionada [3].

  // Búsqueda con debounce
  const [query, setQuery] = useState(""); // Valor del input de búsqueda [1].
  const debouncedQuery = useDebounce(query, 350); // Reduce llamadas al backend durante tipeo [1].

  // Modales y edición
  const [openCatModal, setOpenCatModal] = useState(false); // Crear/Editar categoría [5].
  const [openSubModal, setOpenSubModal] = useState(false); // Crear/Editar subcategoría [5].
  const [openProdModal, setOpenProdModal] = useState(false); // Crear/Editar producto [5].
  const [editCat, setEditCat] = useState(null); // Categoría a editar [5].
  const [editSub, setEditSub] = useState(null); // Subcategoría a editar [5].
  const [editProd, setEditProd] = useState(null); // Producto a editar [5].

  // Breadcrumbs
  const breadcrumbs = useMemo(() => {
    const items = [{ label: "Categorías", key: "categorias" }];
    if (selectedCategoria) items.push({ label: selectedCategoria.categoria, key: "categoria", id: selectedCategoria.id });
    if (selectedSubcategoria) items.push({ label: selectedSubcategoria.subcategoria, key: "subcategoria", id: selectedSubcategoria.id });
    return items;
  }, [selectedCategoria, selectedSubcategoria]); // Genera la ruta de navegación visible [3][4].

  const handleNavigateBreadcrumb = (idx) => {
    if (idx === 0) {
      // Volver a categorías
      setLevel("categorias");
      setSelectedCategoria(null);
      setSelectedSubcategoria(null);
      setQuery("");
    } else if (idx === 1) {
      // Volver a subcategorías de la categoría seleccionada
      setLevel("subcategorias");
      setSelectedSubcategoria(null);
      setQuery("");
    }
  }; // Control del click en migas de pan para volver niveles arriba [3][4].

  // Fetchers
  const loadCategorias = async () => {
    const data = await getCategorias({ q: debouncedQuery }).catch((e) => {
      console.error("Error categorías:", e);
      return [];
    });
    setCategorias(Array.isArray(data) ? data : []);
  }; // Trae categorías opcionalmente filtradas por q [1][2].

  const loadSubcategorias = async () => {
    if (!selectedCategoria) return;
    const data = await getSubcategoriasByCategoria(selectedCategoria.id, { q: debouncedQuery }).catch((e) => {
      console.error("Error subcategorías:", e);
      return [];
    });
    setSubcategorias(Array.isArray(data) ? data : []);
  }; // Trae subcategorías para la categoría actual [1][2].

  const loadProductos = async () => {
    if (!selectedSubcategoria) return;
    const data = await getProductosBySubcategoria(selectedSubcategoria.id, { q: debouncedQuery }).catch((e) => {
      console.error("Error productos:", e);
      return [];
    });
    setProductos(Array.isArray(data) ? data : []);
  }; // Trae productos para la subcategoría actual [1][2].

  // Efectos por nivel y búsqueda
  useEffect(() => {
    if (level === "categorias") loadCategorias(); // Carga categorías cuando estás en el primer nivel [1].
  }, [level, debouncedQuery]); // Depende del nivel y del query debounced [1].

  useEffect(() => {
    if (level === "subcategorias" && selectedCategoria) loadSubcategorias(); // Carga subcategorías al cambiar categoría o query [1].
  }, [level, selectedCategoria?.id, debouncedQuery]); // Mantiene datos coherentes al navegar [1].

  useEffect(() => {
    if (level === "productos" && selectedSubcategoria) loadProductos(); // Carga productos al cambiar subcategoría o query [1].
  }, [level, selectedSubcategoria?.id, debouncedQuery]); // Evita llamadas cuando no hay selección [1].

  // Handlers de navegación mediante tarjetas
  const openCategoria = (cat) => {
    setSelectedCategoria(cat);
    setLevel("subcategorias");
    setQuery("");
  }; // Al hacer click en tarjeta de categoría navega al nivel siguiente [6][7].

  const openSubcategoria = (sub) => {
    setSelectedSubcategoria(sub);
    setLevel("productos");
    setQuery("");
  }; // Al hacer click en tarjeta de subcategoría navega a productos [6][7].

  // CRUD: reusa servicio api; refresca la lista actual
  const submitCategoria = async (formData, isUpdate, id) => {
    if (isUpdate) await updateCategoria(id, formData);
    else await createCategoria(formData);
    setOpenCatModal(false);
    setEditCat(null);
    await loadCategorias();
  }; // Crea/actualiza categoría y recarga la grilla actual [1][2].

  const submitSubcategoria = async (formData, isUpdate, id) => {
    if (isUpdate) await updateSubcategoria(id, formData);
    else await createSubcategoria(formData);
    setOpenSubModal(false);
    setEditSub(null);
    await loadSubcategorias();
  }; // Crea/actualiza subcategoría y recarga la grilla actual [1][2].

  const submitProducto = async (formData, isUpdate, id) => {
    if (isUpdate) await updateProducto(id, formData);
    else await createProducto(formData);
    setOpenProdModal(false);
    setEditProd(null);
    await loadProductos();
  }; // Crea/actualiza producto y recarga la grilla actual [1][2].

  return (
    <div className="p-4 md:p-6 w-full h-full overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="space-y-2">
          <h1 className="text-xl md:text-2xl font-bold">Productos</h1>
          <Breadcrumbs items={breadcrumbs} onNavigate={handleNavigateBreadcrumb} />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              level === "categorias"
                ? "Buscar categorías..."
                : level === "subcategorias"
                ? "Buscar subcategorías..."
                : "Buscar productos..."
            }
            className="w-full sm:w-64 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {canAdmin && (
            <>
              {level === "categorias" && (
                <button
                  onClick={() => setOpenCatModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Nueva Categoría
                </button>
              )}
              {level === "subcategorias" && (
                <button
                  onClick={() => setOpenSubModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Nueva Subcategoría
                </button>
              )}
              {level === "productos" && (
                <button
                  onClick={() => setOpenProdModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Nuevo Producto
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Grids por nivel */}
      {level === "categorias" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categorias.map((c) => (
            <CategoriaCard
              key={c.id}
              categoria={c}
              onClick={openCategoria}
              canAdmin={canAdmin}
              onEdit={(cat) => {
                setEditCat(cat);
                setOpenCatModal(true);
              }}
            />
          ))}
        </div>
      )}

      {level === "subcategorias" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {subcategorias.map((s) => (
            <SubcategoriaCard
              key={s.id}
              subcategoria={s}
              onClick={openSubcategoria}
              canAdmin={canAdmin}
              onEdit={(sub) => {
                setEditSub(sub);
                setOpenSubModal(true);
              }}
            />
          ))}
        </div>
      )}

      {level === "productos" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {productos.map((p) => (
            <ProductoCard
              key={p.id}
              producto={p}
              onClick={() => {}}
              canAdmin={canAdmin}
              onEdit={(prod) => {
                setEditProd(prod);
                setOpenProdModal(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Modales CRUD */}
      <CategoriaFormModal
        open={openCatModal}
        onClose={() => {
          setOpenCatModal(false);
          setEditCat(null);
        }}
        onSubmit={submitCategoria}
        initialData={editCat}
      />
      <SubcategoriaFormModal
        open={openSubModal}
        onClose={() => {
          setOpenSubModal(false);
          setEditSub(null);
        }}
        onSubmit={submitSubcategoria}
        initialData={editSub}
        parentCategoria={selectedCategoria}
      />
      <ProductoFormModal
        open={openProdModal}
        onClose={() => {
          setOpenProdModal(false);
          setEditProd(null);
        }}
        onSubmit={submitProducto}
        initialData={editProd}
        parentSubcategoria={selectedSubcategoria}
      />
    </div>
  );
}
