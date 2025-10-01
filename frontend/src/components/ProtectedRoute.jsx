// src/routes/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../store/auth";

export default function ProtectedRoute({ children, roles }) {
  const { user, token, loading } = useAuth();

  if (loading) return <div>Cargando...</div>;

  if (!token || !user) return <Navigate to="/login" replace />;

  if (roles && roles.length > 0) {
    const userRol = user.rol?.rol?.toLowerCase();
    if (!roles.includes(userRol)) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}
