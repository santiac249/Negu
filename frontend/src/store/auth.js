/* // src/store/auth.js
import { create } from "zustand";
import axiosClient from "../api/axiosClient";

export const useAuth = create((set) => ({
  user: null,
  token: null,
  loading: true,

  // Login
  login: async (usuario, contrasena) => {
    try {
      const { data } = await axiosClient.post("/auth/login", { usuario, contrasena });

      localStorage.setItem("token", data.access_token);
      set({ user: data.user, token: data.access_token, loading: false });
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message: error.response?.data?.message || "Error al iniciar sesión",
      };
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null, loading: false });
  },

  // Inicializa sesión (cuando abres la app)
  initializeSession: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      set({ user: null, token: null, loading: false });
      return;
    }

    try {
      const { data } = await axiosClient.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ user: data, token, loading: false });
    } catch (error) {
      localStorage.removeItem("token");
      set({ user: null, token: null, loading: false });
    }
  },
}));
 */


import { create } from "zustand";
import axiosClient from "../api/axiosClient";

export const useAuth = create((set, get) => ({
  user: null,
  token: null,
  loading: true,

  // Devuelve el token actual desde el estado o localStorage
  getToken: () => {
    const st = get();
    return st.token || localStorage.getItem("token") || null;
  },

  // Login
  login: async (usuario, contrasena) => {
    try {
      const { data } = await axiosClient.post("/auth/login", { usuario, contrasena });
      localStorage.setItem("token", data.access_token);
      set({ user: data.user, token: data.access_token, loading: false });
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message: error?.response?.data?.message || "Error al iniciar sesión",
      };
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null, loading: false });
  },

  // Inicializa sesión (cuando abres la app)
  initializeSession: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      set({ user: null, token: null, loading: false });
      return;
    }
    try {
      const { data } = await axiosClient.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ user: data, token, loading: false });
    } catch (error) {
      localStorage.removeItem("token");
      set({ user: null, token: null, loading: false });
    }
  },
}));
