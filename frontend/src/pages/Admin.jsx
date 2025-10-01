// src/pages/Admin.jsx
import { useNavigate } from "react-router-dom";
import { LogOut, Users, Package, BarChart } from "lucide-react";
import { useAuth } from "../store/auth";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";


export default function Admin() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">Panel de Administración</h1>
        <Button
          onClick={handleLogout}
          variant="destructive"
          className="flex items-center gap-2"
        >
          <LogOut size={18} /> Cerrar sesión
        </Button>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Gestión de Usuarios */}
        <Card
          className="hover:shadow-lg transition cursor-pointer"
          onClick={() => navigate("/admin/usuarios")}
        >
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Users size={40} className="text-blue-600 mb-3" />
            <h2 className="text-lg font-semibold">Gestión de Usuarios</h2>
            <p className="text-gray-600 text-sm mt-2">
              Crear, editar y eliminar usuarios con sus roles.
            </p>
          </CardContent>
        </Card>

        {/* Gestión de Productos */}
        <Card
          className="hover:shadow-lg transition cursor-pointer"
          onClick={() => navigate("/admin/productos")}
        >
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Package size={40} className="text-green-600 mb-3" />
            <h2 className="text-lg font-semibold">Gestión de Productos</h2>
            <p className="text-gray-600 text-sm mt-2">
              Agregar, modificar o eliminar productos del catálogo.
            </p>
          </CardContent>
        </Card>

        {/* Reportes */}
        <Card
          className="hover:shadow-lg transition cursor-pointer"
          onClick={() => navigate("/admin/reportes")}
        >
          <CardContent className="p-6 flex flex-col items-center text-center">
            <BarChart size={40} className="text-purple-600 mb-3" />
            <h2 className="text-lg font-semibold">Reportes</h2>
            <p className="text-gray-600 text-sm mt-2">
              Visualiza ventas, rendimiento y métricas importantes.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
