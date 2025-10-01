import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./store/auth";

import Login from "./pages/Login";
import Inicio from "./pages/NeguDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const initializeSession = useAuth((state) => state.initializeSession);

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  return (
    <Routes>
      {/* Página de login */}
      <Route path="/login" element={<Login />} />

      {/* Página de inicio (acceso solo logueados) */}
      <Route
        path="/inicio"
        element={
          <ProtectedRoute roles={["administrador", "vendedor"]}>
            <Inicio />
          </ProtectedRoute>
        }
      />

      {/* Ejemplo: solo administradores */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["administrador"]}>
            <Inicio />
          </ProtectedRoute>
        }
      />

      {/* Ejemplo: solo vendedores */}
      <Route
        path="/ventas"
        element={
          <ProtectedRoute roles={["vendedor"]}>
            <Inicio />
          </ProtectedRoute>
        }
      />

      {/* Redirigir por defecto */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
