import { useState } from "react"
import { Menu, X, LayoutDashboard, ShoppingCart, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Layout({ role, children }) {
  const [isOpen, setIsOpen] = useState(false)

  // Menú dinámico según rol
  const menuItems = {
    administrador: [
      { name: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/admin/dashboard" },
      { name: "Usuarios", icon: <Users size={20} />, path: "/admin/usuarios" },
      { name: "Ventas", icon: <ShoppingCart size={20} />, path: "/admin/ventas" },
    ],
    vendedor: [
      { name: "Mis Ventas", icon: <ShoppingCart size={20} />, path: "/ventas" },
      { name: "Clientes", icon: <Users size={20} />, path: "/clientes" },
    ],
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-md transform transition-transform duration-300 z-50
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 w-64`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Negu</h2>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </Button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems[role]?.map((item, index) => (
            <a
              key={index}
              href={item.path}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 text-gray-700 font-medium"
            >
              {item.icon}
              {item.name}
            </a>
          ))}
        </nav>
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Header */}
        <header className="flex items-center justify-between bg-white shadow-md p-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Menu size={24} />
          </Button>
          <h1 className="text-xl font-bold">Panel {role === "administrador" ? "Administrador" : "Vendedor"}</h1>
        </header>

        {/* Children */}
        <main className="p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
