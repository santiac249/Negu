import React, { useEffect, useState } from "react";

const API_URL = import.meta.env?.VITE_API_URL || "http://localhost:3000";

export default function EditUsuarioModal() {
  const [cedula, setCedula] = useState("");
  const [usuario, setUsuario] = useState(null); // { id, nombre, usuario, correo, telefono, rol_id, activo, cedula, ... }
  const [password, setPassword] = useState(""); // NUEVA contraseña (opcional)
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Cargar roles al montar
  useEffect(() => {
    const loadRoles = async () => {
      try {
        setRolesLoading(true);
        setRolesError("");
        const res = await fetch(`${API_URL}/roles`);
        if (!res.ok) throw new Error("No se pudieron obtener los roles");
        const data = await res.json();
        // Espera una lista con objetos { id, rol }
        setRoles(Array.isArray(data) ? data : []);
      } catch (err) {
        setRolesError(err.message || "Error cargando roles");
        setRoles([]);
      } finally {
        setRolesLoading(false);
      }
    };
    loadRoles();
  }, []);

  // Buscar usuario por cédula
  const handleBuscar = async () => {
    setErrorMsg("");
    setUsuario(null);
    setPassword("");

    if (!cedula.trim()) {
      setErrorMsg("Ingresa una cédula para buscar.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/usuarios/${encodeURIComponent(cedula.trim())}`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Usuario no encontrado");
      }
      const data = await res.json();
      // data debe incluir al menos { id, nombre, usuario, correo?, telefono?, rol_id, activo, cedula }
      setUsuario({
        ...data,
        correo: data.correo ?? "",
        telefono: data.telefono ?? "",
      });
      setOpen(true);
    } catch (err) {
      setErrorMsg(err.message || "Ocurrió un error al buscar");
    }
  };

  // Handlers del formulario
  const onFieldChange = (e) => {
    const { name, value } = e.target;
    setUsuario((prev) => ({ ...prev, [name]: value }));
  };

  const onRolChange = (e) => {
    const value = e.target.value;
    // aseguramos número
    setUsuario((prev) => ({ ...prev, rol_id: Number(value) }));
  };

  const onActivoChange = (val) => {
    setUsuario((prev) => ({ ...prev, activo: Boolean(val) }));
  };

  // Guardar cambios
  const handleGuardar = async () => {
    if (!usuario?.id) {
      setErrorMsg("No hay usuario cargado para actualizar.");
      return;
    }
    setSaving(true);
    setErrorMsg("");

    try {
      // Construir payload: solo campos permitidos por tu DTO/servicio
      const payload = {
        nombre: usuario.nombre,
        usuario: usuario.usuario,
        correo: usuario.correo || null,
        telefono: usuario.telefono || null,
        rol_id: Number(usuario.rol_id),
        activo: Boolean(usuario.activo),
        // contrasena SOLO si se escribió algo
        ...(password.trim().length > 0 ? { contrasena: password.trim() } : {}),
      };

      const res = await fetch(`${API_URL}/usuarios/${usuario.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "No se pudo actualizar el usuario");
      }

      // Éxito: cerramos modal y limpiamos
      setOpen(false);
      setUsuario(null);
      setCedula("");
      setPassword("");
      alert("Usuario actualizado con éxito");
    } catch (err) {
      setErrorMsg(err.message || "Error guardando cambios");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Editar Usuario por Cédula</h2>

      {/* Buscador */}
      <div style={styles.searchBar}>
        <input
          style={styles.input}
          type="text"
          placeholder="Ingresa cédula..."
          value={cedula}
          onChange={(e) => setCedula(e.target.value)}
        />
        <button style={styles.primaryButton} onClick={handleBuscar}>Buscar</button>
      </div>

      {errorMsg ? <p style={styles.error}>{errorMsg}</p> : null}

      {/* Modal */}
      {open && usuario && (
        <div style={styles.overlay} onClick={() => setOpen(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Editar Usuario</h3>
              <button style={styles.closeBtn} onClick={() => setOpen(false)}>✕</button>
            </div>

            <div style={styles.formGrid}>
              <div style={styles.field}>
                <label style={styles.label}>Cédula</label>
                <input
                  style={styles.input}
                  type="text"
                  value={usuario.cedula || ""}
                  disabled
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Nombre</label>
                <input
                  style={styles.input}
                  type="text"
                  name="nombre"
                  value={usuario.nombre || ""}
                  onChange={onFieldChange}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Usuario</label>
                <input
                  style={styles.input}
                  type="text"
                  name="usuario"
                  value={usuario.usuario || ""}
                  onChange={onFieldChange}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Nueva contraseña</label>
                <input
                  style={styles.input}
                  type="password"
                  placeholder="Deja en blanco para no cambiar"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Correo</label>
                <input
                  style={styles.input}
                  type="email"
                  name="correo"
                  value={usuario.correo || ""}
                  onChange={onFieldChange}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Teléfono</label>
                <input
                  style={styles.input}
                  type="text"
                  name="telefono"
                  value={usuario.telefono || ""}
                  onChange={onFieldChange}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Rol</label>
                <select
                  style={styles.input}
                  name="rol_id"
                  value={Number(usuario.rol_id) || ""}
                  onChange={onRolChange}
                >
                  <option value="" disabled>Selecciona un rol…</option>
                  {rolesLoading && <option value="">Cargando roles…</option>}
                  {rolesError && <option value="">{rolesError}</option>}
                  {!rolesLoading && !rolesError && roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.rol}</option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Estado</label>
                <div style={styles.radioGroup}>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="activo"
                      checked={usuario.activo === true}
                      onChange={() => onActivoChange(true)}
                    />
                    Activo
                  </label>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="activo"
                      checked={usuario.activo === false}
                      onChange={() => onActivoChange(false)}
                    />
                    Inactivo
                  </label>
                </div>
              </div>
            </div>

            {errorMsg ? <p style={styles.error}>{errorMsg}</p> : null}

            <div style={styles.modalFooter}>
              <button style={styles.secondaryButton} onClick={() => setOpen(false)}>Cancelar</button>
              <button style={styles.primaryButton} onClick={handleGuardar} disabled={saving}>
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ====== Estilos inline (contrastados y responsivos) ====== */
const styles = {
  page: { maxWidth: 900, margin: "30px auto", padding: "0 16px", color: "#111" },
  title: { marginBottom: 12 },
  searchBar: { display: "flex", gap: 8, alignItems: "center", marginBottom: 8 },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#111",
    outline: "none",
  },
  primaryButton: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "none",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },
  secondaryButton: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#111",
    cursor: "pointer",
    fontWeight: 600,
  },
  error: { color: "#b91c1c", marginTop: 8 },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 50,
    backdropFilter: "blur(2px)",
  },
  modal: {
    width: "100%",
    maxWidth: 720,
    background: "#ffffff",
    borderRadius: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    padding: 18,
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalTitle: { margin: 0, fontSize: 20 },
  closeBtn: {
    background: "transparent",
    border: "none",
    fontSize: 20,
    cursor: "pointer",
    color: "#111",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, color: "#374151", fontWeight: 600 },
  radioGroup: { display: "flex", gap: 16, alignItems: "center" },
  radioLabel: { display: "flex", gap: 8, alignItems: "center", color: "#111" },
  modalFooter: {
    marginTop: 16,
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
  },
};
