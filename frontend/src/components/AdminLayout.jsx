import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, LogOut } from "lucide-react";
import { useAuth } from "../store/auth";

export default function AdminLayout({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform lg:translate-x-0 lg:static lg:inset-0 z-50
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            ✖
          </button>
        </div>
        <nav className="px-4 py-6 space-y-4">
          <Link to="/admin" className="block text-gray-700 hover:text-blue-600">
            Dashboard
          </Link>
          <Link to="/admin/usuarios" className="block text-gray-700 hover:text-blue-600">
            Gestionar Usuarios
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center text-red-600 mt-4"
          >
            <LogOut className="w-5 h-5 mr-2" /> Cerrar sesión
          </button>
        </nav>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between bg-white shadow px-4 py-3">
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold">Panel de Administrador</h1>
        </header>

        {/* Contenido dinámico */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
