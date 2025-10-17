import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../store/auth";
import { useDebounce } from "../hooks/useDebounce";
import { getPlanSepares, deletePlanSepare } from "../api/planSepare";
import PlanSepareTable from "../components/planSepare/PlanSepareTable";
import CreatePlanSepareModal from "../components/planSepare/CreatePlanSepareModal";
import EditPlanSepareModal from "../components/planSepare/EditPlanSepareModal";
import ViewPlanSepareModal from "../components/planSepare/ViewPlanSepareModal";
import AbonoModal from "../components/planSepare/AbonoModal";

export default function PlanSepare() {
  const { user } = useAuth();
  const roleName = useMemo(() => {
    if (!user) return null;
    if (user.rol && typeof user.rol.rol === "string") return user.rol.rol;
    if (typeof user.rol_id === "number") return user.rol_id === 1 ? "Administrador" : "Vendedor";
    return null;
  }, [user]);

  const canAdmin = roleName === "Administrador";

  // Estados principales
  const [planSepares, setPlanSepares] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modales
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showAbono, setShowAbono] = useState(false);
  
  // Datos para modales
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  // Filtros y búsqueda
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);

  // Cargar datos
  const fetchPlanSepares = async () => {
    setLoading(true);
    try {
      const estado = estadoFiltro === "todos" ? undefined : estadoFiltro;
      const data = await getPlanSepares({ estado });
      setPlanSepares(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching plan separes:", error);
      setPlanSepares([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanSepares();
  }, [estadoFiltro]);

  // Filtrar por búsqueda
  const planSeparesFiltrados = useMemo(() => {
    if (!debouncedSearch.trim()) return planSepares;
    
    const normalizar = (texto) =>
      String(texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    
    const q = normalizar(debouncedSearch.trim());
    
    return planSepares.filter((plan) => {
      const has = (v) => normalizar(v).includes(q);
      return (
        has(plan.cliente?.nombre) ||
        has(plan.cliente?.documento) ||
        has(plan.usuario?.nombre) ||
        has(plan.estado) ||
        plan.id.toString().includes(q)
      );
    });
  }, [planSepares, debouncedSearch]);

  // Handlers
  const handleEdit = (plan) => {
    setSelectedPlan(plan);
    setShowEdit(true);
  };

  const handleView = (plan) => {
    setSelectedPlan(plan);
    setShowView(true);
  };

  const handleAbono = (plan) => {
    if (plan.estado !== "Activo") {
      alert("Solo se pueden hacer abonos a planes activos");
      return;
    }
    setSelectedPlan(plan);
    setShowAbono(true);
  };

  const handleDelete = async (plan) => {
    if (!confirm(`¿Está seguro de eliminar el plan separe #${plan.id}?`)) return;
    
    try {
      await deletePlanSepare(plan.id);
      await fetchPlanSepares();
    } catch (error) {
      alert("Error al eliminar: " + error.message);
    }
  };

  const closeModals = () => {
    setShowCreate(false);
    setShowEdit(false);
    setShowView(false);
    setShowAbono(false);
    setSelectedPlan(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Plan Separe</h1>
          <p className="text-gray-600 mt-1">Gestión de apartados y abonos</p>
        </div>
        
        <div className="flex gap-3">
          {canAdmin && (
            <button
              onClick={() => setShowCreate(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Plan Separe
            </button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Filtro por Estado */}
          <div className="flex flex-col min-w-40">
            <label className="text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos</option>
              <option value="Activo">Activo</option>
              <option value="Finalizado">Finalizado</option>
              <option value="Anulado">Anulado</option>
              <option value="Incumplido">Incumplido</option>
            </select>
          </div>

          {/* Búsqueda */}
          <div className="flex-1 max-w-md">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Buscar</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por cliente, cédula, ID..."
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Resumen */}
          <div className="text-sm text-gray-600">
            {planSeparesFiltrados.length} de {planSepares.length} planes
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow-sm border">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <PlanSepareTable
            planSepares={planSeparesFiltrados}
            canAdmin={canAdmin}
            onEdit={handleEdit}
            onView={handleView}
            onAbono={handleAbono}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Modales */}
      {showCreate && (
        <CreatePlanSepareModal
          onClose={closeModals}
          onSuccess={() => {
            fetchPlanSepares();
            closeModals();
          }}
        />
      )}

      {showEdit && selectedPlan && (
        <EditPlanSepareModal
          plan={selectedPlan}
          onClose={closeModals}
          onSuccess={() => {
            fetchPlanSepares();
            closeModals();
          }}
        />
      )}

      {showView && selectedPlan && (
        <ViewPlanSepareModal
          plan={selectedPlan}
          onClose={closeModals}
          onAbono={() => {
            setShowView(false);
            setShowAbono(true);
          }}
        />
      )}

      {showAbono && selectedPlan && (
        <AbonoModal
          plan={selectedPlan}
          onClose={closeModals}
          onSuccess={() => {
            fetchPlanSepares();
            closeModals();
          }}
        />
      )}
    </div>
  );
}