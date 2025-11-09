import { useState, useEffect } from "react";
import ImagePreview from "./ImagePreview";
import {
  createCategoria,
  updateCategoria,
  createSubcategoria,
  updateSubcategoria,
  createProducto,
  updateProducto,
  getCategorias,
  getSubcategorias,
  getMarcas,
} from "../../api/productos";

export default function ProductoFormModal({ 
  mode, 
  item, 
  parentCategoria, 
  parentSubcategoria, 
  onClose, 
  onSuccess 
}) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Estados para selects
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  
  // Form data dinámico según el modo
  const [formData, setFormData] = useState({
    // Categoría
    categoria: "",
    // Subcategoría
    subcategoria: "",
    categoriaIds: [],
    // Producto
    nombre: "",
    marca_id: "",
    subcategoriaIds: [],
    // Comunes
    descripcion: "",
    foto: null,
    fotoPreview: null,
  });

  // Cargar datos iniciales según el modo
  useEffect(() => {
    loadInitialData();
  }, [mode, item]);

  const loadInitialData = async () => {
    try {
      // Cargar opciones para selects
      if (mode.includes('subcategoria')) {
        const cats = await getCategorias();
        setCategorias(Array.isArray(cats.data) ? cats.data : cats);
      }
      
      if (mode.includes('producto')) {
        const [subs, brands] = await Promise.all([
          getSubcategorias(),
          getMarcas(),
        ]);
        setSubcategorias(Array.isArray(subs.data) ? subs.data : subs);
        setMarcas(Array.isArray(brands) ? brands : []);
      }

      // Si estamos editando, cargar los datos del item
      if (item && mode.startsWith('edit')) {
        if (mode === 'edit-categoria') {
          setFormData({
            categoria: item.categoria || "",
            descripcion: item.descripcion || "",
            foto: null,
            fotoPreview: item.foto ? `${import.meta.env.VITE_BACKEND_URL}/uploads/fotos/categorias/${item.foto}` : null,
          });
        } else if (mode === 'edit-subcategoria') {
          setFormData({
            subcategoria: item.subcategoria || "",
            descripcion: item.descripcion || "",
            categoriaIds: item.categorias?.map(c => c.id) || [],
            foto: null,
            fotoPreview: item.foto ? `${import.meta.env.VITE_BACKEND_URL}/uploads/fotos/subcategorias/${item.foto}` : null,
          });
        } else if (mode === 'edit-producto') {
          setFormData({
            nombre: item.nombre || "",
            descripcion: item.descripcion || "",
            marca_id: item.marca_id || "",
            subcategoriaIds: item.subcategorias?.map(s => s.id) || [],
            foto: null,
            fotoPreview: item.foto ? `${import.meta.env.VITE_BACKEND_URL}/uploads/fotos/productos/${item.foto}` : null,
          });
        }
      } else {
        // Modo crear - precargar sugerencias de padres
        if (mode === 'create-subcategoria' && parentCategoria) {
          setFormData(prev => ({
            ...prev,
            categoriaIds: [parentCategoria.id],
          }));
        } else if (mode === 'create-producto' && parentSubcategoria) {
          setFormData(prev => ({
            ...prev,
            subcategoriaIds: [parentSubcategoria.id],
          }));
        }
      }
    } catch (error) {
      console.error("Error cargando datos iniciales:", error);
    }
  };

  // Determinar título del modal
  const getModalTitle = () => {
    if (mode === 'create-categoria') return "Crear Nueva Categoría";
    if (mode === 'edit-categoria') return "Editar Categoría";
    if (mode === 'create-subcategoria') return "Crear Nueva Subcategoría";
    if (mode === 'edit-subcategoria') return "Editar Subcategoría";
    if (mode === 'create-producto') return "Crear Nuevo Producto";
    if (mode === 'edit-producto') return "Editar Producto";
    return "Formulario";
  };

  // Determinar ícono del header
  const getHeaderIcon = () => {
    if (mode.includes('categoria')) {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      );
    }
    if (mode.includes('subcategoria')) {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      );
    }
    return (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    );
  };

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files;
    if (file) {
      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, foto: "La imagen no puede superar 5MB" }));
        return;
      }
      
      // Validar tipo
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        setErrors(prev => ({ ...prev, foto: "Solo se permiten imágenes JPG, PNG o WEBP" }));
        return;
      }

      setFormData(prev => ({ ...prev, foto: file }));
      setErrors(prev => ({ ...prev, foto: "" }));
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, foto: null, fotoPreview: null }));
  };

  const handleMultiSelectChange = (field, value) => {
    const numValue = parseInt(value);
    setFormData(prev => {
      const currentValues = prev[field] || [];
      if (currentValues.includes(numValue)) {
        return { ...prev, [field]: currentValues.filter(v => v !== numValue) };
      } else {
        return { ...prev, [field]: [...currentValues, numValue] };
      }
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // Validaciones
  const validate = () => {
    const newErrors = {};

    if (mode.includes('categoria')) {
      if (!formData.categoria?.trim()) {
        newErrors.categoria = "El nombre de la categoría es obligatorio";
      }
    }

    if (mode.includes('subcategoria')) {
      if (!formData.subcategoria?.trim()) {
        newErrors.subcategoria = "El nombre de la subcategoría es obligatorio";
      }
      if (!formData.categoriaIds || formData.categoriaIds.length === 0) {
        newErrors.categoriaIds = "Debe seleccionar al menos una categoría";
      }
    }

    if (mode.includes('producto')) {
      if (!formData.nombre?.trim()) {
        newErrors.nombre = "El nombre del producto es obligatorio";
      }
      if (!formData.marca_id) {
        newErrors.marca_id = "Debe seleccionar una marca";
      }
      if (!formData.subcategoriaIds || formData.subcategoriaIds.length === 0) {
        newErrors.subcategoriaIds = "Debe seleccionar al menos una subcategoría";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  // Submit
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validate()) return;

  setLoading(true);
  try {
    const formDataToSend = new FormData();

    console.log("=== FormData que se enviará al backend ===");

    // ✅ CATEGORÍAS
    if (mode === 'create-categoria' || mode === 'edit-categoria') {
      formDataToSend.append('categoria', formData.categoria.trim());
      if (formData.descripcion)
        formDataToSend.append('descripcion', formData.descripcion.trim());
      if (formData.foto) formDataToSend.append('foto', formData.foto);

      if (mode === 'create-categoria') {
        await createCategoria(formDataToSend);
      } else if (mode === 'edit-categoria') {
        if (!item || !item.id)
          throw new Error('No se encontró la categoría a actualizar.');
        await updateCategoria(item.id, formDataToSend);
      }
    }

    // ✅ SUBCATEGORÍAS
    else if (mode === 'create-subcategoria' || mode === 'edit-subcategoria') {
      formDataToSend.append('subcategoria', formData.subcategoria.trim());
      if (formData.descripcion)
        formDataToSend.append('descripcion', formData.descripcion.trim());

      // ✅ Normalizar y enviar como múltiple append
      const categoriaIds = Array.isArray(formData.categoriaIds)
        ? formData.categoriaIds
        : [formData.categoriaIds];
      
      categoriaIds.forEach((id) => {
        formDataToSend.append('categoriaIds', Number(id)); // enviar como número
      });

      if (formData.foto) formDataToSend.append('foto', formData.foto);

      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value);
      }

      console.log(formDataToSend.getAll('categoriaIds'));

      if (mode === 'create-subcategoria') {
        await createSubcategoria(formDataToSend);
      } else if (mode === 'edit-subcategoria') {
        if (!item || !item.id)
          throw new Error('No se encontró la subcategoría a actualizar.');
        await updateSubcategoria(item.id, formDataToSend);
      }
    }

    // ✅ PRODUCTOS
    else if (mode === 'create-producto' || mode === 'edit-producto') {
      formDataToSend.append('nombre', formData.nombre.trim());
      if (formData.descripcion)
        formDataToSend.append('descripcion', formData.descripcion.trim());
      formDataToSend.append('marca_id', Number(formData.marca_id));

      // ✅ Normalizar y enviar como múltiple append
      const subcategoriaIds = Array.isArray(formData.subcategoriaIds)
        ? formData.subcategoriaIds
        : [formData.subcategoriaIds];

      subcategoriaIds.forEach((id) => {
        formDataToSend.append('subcategoriaIds', Number(id)); // enviar como número
      });

/*       formDataToSend.append(
        'subcategoriaIds',
        JSON.stringify(formData.subcategoriaIds)
      ); */
      if (formData.foto) formDataToSend.append('foto', formData.foto);

      if (mode === 'create-producto') {
        await createProducto(formDataToSend);
      } else if (mode === 'edit-producto') {
        if (!item || !item.id)
          throw new Error('No se encontró el producto a actualizar.');
        await updateProducto(item.id, formDataToSend);
      }
    }

    // ✅ Si todo sale bien
    onSuccess();
  } catch (error) {
    alert('Error en la creación: ' + (error.message || 'No se pudo completar la operación'));
  } finally {
    setLoading(false);
  }
};



/*   const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    setLoading(true);
    try {
      const formDataToSend = new FormData();

      if (mode.includes('categoria')) {
        formDataToSend.append('categoria', formData.categoria.trim());
        if (formData.descripcion) formDataToSend.append('descripcion', formData.descripcion.trim());
        if (formData.foto) formDataToSend.append('foto', formData.foto);

        if (mode === 'create-categoria') {
          await createCategoria(formDataToSend);
        } else {
          await updateCategoria(item.id, formDataToSend);
        }
      } else if (mode.includes('subcategoria')) {
        formDataToSend.append('subcategoria', formData.subcategoria.trim());
        if (formData.descripcion) formDataToSend.append('descripcion', formData.descripcion.trim());
        formDataToSend.append('categoriaIds', JSON.stringify(formData.categoriaIds));
        if (formData.foto) formDataToSend.append('foto', formData.foto);

        if (mode === 'create-subcategoria') {
          await createSubcategoria(formDataToSend);
        } else {
          await updateSubcategoria(item.id, formDataToSend);
        } 



      } else if (mode.includes('producto')) {
        formDataToSend.append('nombre', formData.nombre.trim());
        if (formData.descripcion) formDataToSend.append('descripcion', formData.descripcion.trim());
        formDataToSend.append('marca_id', formData.marca_id);
        formDataToSend.append('subcategoriaIds', JSON.stringify(formData.subcategoriaIds));
        if (formData.foto) formDataToSend.append('foto', formData.foto);

        if (mode === 'create-producto') {
          await createProducto(formDataToSend);
        } else {
          await updateProducto(item.id, formDataToSend);
        }
      }

      onSuccess();
    } catch (error) {
      alert("Error: " + (error.message || "No se pudo completar la operación"));
    } finally {
      setLoading(false);
    }
  };
 */
  /////////////////////////////////////////////////////////////////////////////////////

   return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            {getHeaderIcon()}
            <h2 className="text-xl font-bold">{getModalTitle()}</h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* Campos para Categoría */}
          {mode.includes('categoria') && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre de la Categoría *
                </label>
                <input
                  type="text"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.categoria ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Ropa, Electrónica, Hogar..."
                />
                {errors.categoria && (
                  <p className="text-red-500 text-sm mt-1">{errors.categoria}</p>
                )}
              </div>
            </>
          )}

          {/* Campos para Subcategoría */}
          {mode.includes('subcategoria') && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre de la Subcategoría *
                </label>
                <input
                  type="text"
                  name="subcategoria"
                  value={formData.subcategoria}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                    errors.subcategoria ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Camisas, Pantalones, Zapatos..."
                />
                {errors.subcategoria && (
                  <p className="text-red-500 text-sm mt-1">{errors.subcategoria}</p>
                )}
              </div>

              {/* Selector de Categorías (M:N) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Categorías Padre * 
                  <span className="text-gray-500 text-xs ml-1">(seleccione una o varias)</span>
                </label>
                <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                  {categorias.length === 0 ? (
                    <p className="text-gray-500 text-sm">No hay categorías disponibles</p>
                  ) : (
                    categorias.map((cat) => (
                      <label
                        key={cat.id}
                        className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.categoriaIds.includes(cat.id)}
                          onChange={() => handleMultiSelectChange('categoriaIds', cat.id)}
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{cat.categoria}</span>
                      </label>
                    ))
                  )}
                </div>
                {errors.categoriaIds && (
                  <p className="text-red-500 text-sm mt-1">{errors.categoriaIds}</p>
                )}
              </div>
            </>
          )}

          {/* Campos para Producto */}
          {mode.includes('producto') && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${
                    errors.nombre ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Camisa manga larga, Zapatos deportivos..."
                />
                {errors.nombre && (
                  <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
                )}
              </div>

              {/* Selector de Marca */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Marca *
                </label>
                <select
                  name="marca_id"
                  value={formData.marca_id}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${
                    errors.marca_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar marca...</option>
                  {marcas.map((marca) => (
                    <option key={marca.id} value={marca.id}>
                      {marca.marca}
                    </option>
                  ))}
                </select>
                {errors.marca_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.marca_id}</p>
                )}
              </div>

              {/* Selector de Subcategorías (M:N) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subcategorías * 
                  <span className="text-gray-500 text-xs ml-1">(seleccione una o varias)</span>
                </label>
                <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                  {subcategorias.length === 0 ? (
                    <p className="text-gray-500 text-sm">No hay subcategorías disponibles</p>
                  ) : (
                    subcategorias.map((sub) => (
                      <label
                        key={sub.id}
                        className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.subcategoriaIds.includes(sub.id)}
                          onChange={() => handleMultiSelectChange('subcategoriaIds', sub.id)}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{sub.subcategoria}</span>
                      </label>
                    ))
                  )}
                </div>
                {errors.subcategoriaIds && (
                  <p className="text-red-500 text-sm mt-1">{errors.subcategoriaIds}</p>
                )}
              </div>
            </>
          )}

          {/* Descripción (común para todos) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
              placeholder="Descripción detallada..."
            />
          </div>

          {/* Imagen (común para todos) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Imagen
            </label>
            <div className="space-y-3">
              <ImagePreview
                file={formData.foto}
                currentImageUrl={formData.fotoPreview}
                onRemove={handleRemoveImage}
              />
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer"
              />
              {errors.foto && (
                <p className="text-red-500 text-sm">{errors.foto}</p>
              )}
              <p className="text-xs text-gray-500">
                Formatos: JPG, PNG, WEBP. Tamaño máximo: 5MB
              </p>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2.5 text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {loading ? "Guardando..." : mode.startsWith('create') ? "Crear" : "Actualizar"}
          </button>
        </div>
      </div>
    </div>
  );
}