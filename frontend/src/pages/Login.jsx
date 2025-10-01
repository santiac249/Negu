import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";
import logo from "../assets/negu/Negu.jpg";

export default function Login() {
  const navigate = useNavigate();
  const login = useAuth((state) => state.login);

  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(usuario, contrasena);
    setLoading(false);

    if (result.ok) {
      navigate("/inicio");
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      {/* Panel izquierdo con logo */}
      <div className="hidden md:flex md:w-1/2 bg-blue-900 text-white flex-col justify-center items-center p-8">
        <motion.img
          src={logo}
          alt="Negu Logo"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="w-40 h-40 object-contain mb-6 rounded-xl shadow-md"
        />
        <h1 className="text-3xl font-bold tracking-wide text-blue-200">Negu</h1>
        <p className="text-sm text-blue-200 mt-2">
          Sistema de administración interna
        </p>
      </div>

      {/* Panel derecho con formulario */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="bg-white border border-gray-200 shadow-lg rounded-2xl w-full max-w-md p-8"
        >
          {/* Logo visible solo en móviles */}
          <div className="flex md:hidden justify-center mb-6">
            <img
              src={logo}
              alt="Negu Logo"
              className="w-24 h-24 object-contain rounded-xl shadow-md"
            />
          </div>

          <motion.h2
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-2xl font-bold text-center text-gray-800 mb-6"
          >
            Bienvenido a <span className="text-blue-700">Negu</span>
          </motion.h2>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuario
              </label>
              <input
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Ingresa tu usuario"
                className="w-full px-4 py-3 border border-gray-300 bg-white rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none transition text-gray-800"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="Ingresa tu contraseña"
                className="w-full px-4 py-3 border border-gray-300 bg-white rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none transition text-gray-800"
                required
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-100 text-red-700 text-sm p-3 rounded-lg text-center"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl shadow-md transition"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </motion.button>
          </form>

          {/* Footer */}
          <p className="text-xs text-gray-500 text-center mt-8">
            © {new Date().getFullYear()} Negu. Todos los derechos reservados.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
