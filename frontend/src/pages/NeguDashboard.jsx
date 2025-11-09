import Usuarios from "./Usuarios";
import Proveedores from "./Proveedores";
import Marcas from "./Marcas";
import Productos from "./Productos";
import PlanSepare from "./PlanSepare";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Menu,
  LogOut,
  UserCircle2,
  Package,
  ShoppingCart,
  Wallet,
  BarChart3,
  Home,
  PackageCheck ,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";
import SessionErrorModal from "@/components/SessionErrorModal";
import Clientes from "./Clientes";

const ROLE_LABEL_BY_ID = {
  1: "Administrador",
  2: "Vendedor",
};

const MENU_BY_ROLE = {
  Administrador: [
    { key: "inicio", label: "Inicio", icon: Home },
    { key: "usuarios", label: "Usuarios", icon: UserCircle2 },
    { key: "clientes", label: "Clientes", icon: UserCircle2 },
    { key: "proveedores", label: "Proveedores", icon: Package }, // agregado aquí
    { key: "marcas", label: "Marcas", icon: Package },
    { key: "productos", label: "Productos", icon: Package },
    { key: "stock", label: "Stock", icon: PackageCheck },
    { key: "vender", label: "Vender", icon: ShoppingCart },
    { key: "plansepare", label: "Plan separe", icon: ShoppingCart },
    { key: "gastos", label: "Gastos", icon: Wallet },
    { key: "reportes", label: "Reportes de ventas", icon: BarChart3 },
  ],
  Vendedor: [
    { key: "inicio", label: "Inicio", icon: Home },
    { key: "clientes", label: "Clientes", icon: UserCircle2 },
    { key: "productos", label: "Productos", icon: Package },
    { key: "stock", label: "Stock", icon: PackageCheck },
    { key: "vender", label: "Vender", icon: ShoppingCart },
    { key: "plansepare", label: "Plan separe", icon: ShoppingCart },
    { key: "gastos", label: "Gastos", icon: Wallet },
  ],
};

function getRoleName(user) {
  if (!user) return null;
  if (user.rol && typeof user.rol.rol === "string") return user.rol.rol;
  if (typeof user.rol_id === "number")
    return ROLE_LABEL_BY_ID[user.rol_id] ?? null;
  return null;
}

function Avatar({ name, foto }) {
  const initials = useMemo(() => {
    if (!name) return "?";
    const parts = String(name).trim().split(/\s+/);
    return parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("");
  }, [name]);

  const imageUrl = foto
    ? `${
        import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"
      }/uploads/fotos/usuarios/${foto}`
    : null;

  return (
    <div className="flex items-center gap-3">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Foto de perfil"
          className="w-12 h-12 rounded-full object-cover border"
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-indigo-200 flex items-center justify-center text-sm font-semibold text-indigo-800">
          {initials}
        </div>
      )}
      <div className="leading-tight">
        <div className="text-sm font-medium text-gray-900">
          {name || "Usuario"}
        </div>
        <div className="text-xs text-gray-500">Conectado</div>
      </div>
    </div>
  );
}

function Sidebar({ role, menu, activeKey, onSelect, onClose, isMobile }) {
  return (
    <aside className="w-64 shrink-0 bg-gradient-to-b from-indigo-600 to-indigo-800 text-white h-screen flex flex-col fixed left-0 top-0">
      {/* Header del Sidebar */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-indigo-500">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-white/20">
            <Menu className="w-5 h-5" />
          </div>
          <span className="font-semibold text-lg">Negu</span>
        </div>
        {isMobile && (
          <button onClick={onClose} className="text-white">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Menú */}
      <nav className="p-4 flex-1 overflow-auto space-y-2">
        {menu.map(({ key, label, icon: Icon }) => {
          const active = key === activeKey;
          return (
            <button
              key={key}
              onClick={() => {
                onSelect(key);
                if (isMobile) onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-white text-indigo-700 shadow"
                  : "hover:bg-indigo-700 text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 text-xs text-white/70 border-t border-indigo-500">
        <p>© {new Date().getFullYear()} Negu</p>
        <p className="mt-1">{role || "—"}</p>
      </div>
    </aside>
  );
}

function ContentArea({ role, activeKey }) {
  const labelByKey = useMemo(() => {
    const base = {
      inicio: "Inicio",
      usuarios: "Usuarios",
      clientes: "Clientes",
      proveedores: "Proveedores",
      marcas: "Marcas",
      productos: "Productos",
      stock: "Stock",
      vender: "Vender",
      plansepare: "Plan separe",
      gastos: "Gastos",
      reportes: "Reportes de ventas",
    };
    return base[activeKey] ?? "Sección";
  }, [activeKey]);

  const componentByKey = {
    inicio: (
      <PlaceholderCard
        title={`Bienvenido${role ? ", " + role : ""}`}
        description="Este es tu panel principal. Aquí podrás ver métricas y accesos rápidos una vez estén listos."
      />
    ),
    usuarios: <Usuarios />,
    clientes: <Clientes />,
    proveedores: role === "Administrador" ? <Proveedores /> : <PlaceholderCard title="Acceso denegado" description="No tienes permisos para acceder a esta sección." />,
    marcas: role === "Administrador" ? <Marcas /> : <PlaceholderCard title="Acceso denegado" description="No tienes permisos para acceder a esta sección." />,
    productos: <Productos />,
    plansepare: role === "Administrador" ? <PlanSepare /> : <PlaceholderCard title="Acceso denegado" description="No tienes permisos para acceder a esta sección." />,
    
  };

  return (
    <div className="flex-1 min-h-screen bg-gray-50">
      <header className="h-16 border-b bg-white flex items-center px-6 sticky top-0 z-10">
        <h1 className="text-lg font-semibold">{labelByKey}</h1>
      </header>
      <main className="p-6 grid gap-4">
        {componentByKey[activeKey] ?? (
          <PlaceholderCard
            title="Sección en construcción"
            description="Pronto estará disponible esta funcionalidad."
          />
        )}
      </main>
    </div>
  );
}

function PlaceholderCard({ title, description }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl border bg-white shadow-sm p-6"
    >
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-sm text-gray-600">{description}</p>
    </motion.div>
  );
}

export default function NeguDashboard() {
  const { user, logout, initializeSession } = useAuth();
  const [activeKey, setActiveKey] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    initializeSession();
  }, []);

  const roleName = getRoleName(user);

  const menu = useMemo(() => {
    if (!roleName) return [];
    const normalized = roleName.toLowerCase();
    if (normalized.includes("admin")) return MENU_BY_ROLE.Administrador;
    if (normalized.includes("vend")) return MENU_BY_ROLE.Vendedor;
    if (user?.rol_id === 1) return MENU_BY_ROLE.Administrador;
    if (user?.rol_id === 2) return MENU_BY_ROLE.Vendedor;
    return [];
  }, [roleName, user?.rol_id]);

  useEffect(() => {
    if (menu.length && !activeKey) setActiveKey(menu[0].key);
  }, [menu, activeKey]);

  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
    navigate("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <SessionErrorModal open={true} onLogout={handleLogout} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar Desktop */}
      <div className="hidden lg:flex">
        <Sidebar
          role={roleName}
          menu={menu}
          activeKey={activeKey}
          onSelect={setActiveKey}
        />
      </div>

      {/* Sidebar Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 flex lg:hidden">
          <Sidebar
            role={roleName}
            menu={menu}
            activeKey={activeKey}
            onSelect={setActiveKey}
            onClose={() => setSidebarOpen(false)}
            isMobile
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-0 lg:ml-64">
        {/* Header fijo */}
        <div className="h-16 border-b bg-white flex items-center justify-between px-6 fixed top-0 left-0 lg:left-64 right-0 z-20 shadow-sm">
          <button
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <Avatar name={user?.nombre || user?.usuario} foto={user?.foto} />
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl border hover:bg-gray-50 flex items-center gap-2 text-sm"
          >
            <LogOut className="w-4 h-4" />
            Salir
          </button>
        </div>

        {/* Contenido Scrollable */}
        <div className="mt-16 flex-1 overflow-y-auto">
          <ContentArea role={roleName} activeKey={activeKey} />
        </div>
      </div>
    </div>
  );
}
