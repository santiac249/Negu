import React, { useEffect, useState } from "react";

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({
    rol_id: 1,
    nombre: "",
    usuario: "",
    contrasena: "",
    correo: "",
    telefono: "",
    cedula: "",
  });

  useEffect(() => {
    fetch("http://localhost:3000/usuarios")
      .then((res) => res.json())
      .then((data) => setUsuarios(data))
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const createUsuario = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setUsuarios([...usuarios, data]);
      setForm({
        rol_id: 1,
        nombre: "",
        usuario: "",
        contrasena: "",
        correo: "",
        telefono: "",
        cedula: "",
      });
    } catch (err) {
      console.error("Error al crear usuario:", err);
    }
  };

  return (
    <div>
      <h1>Lista de Usuarios</h1>
      <form onSubmit={createUsuario}>
        <input
          type="number"
          name="rol_id"
          placeholder="Rol ID"
          value={form.rol_id}
          onChange={handleChange}
        />
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={form.nombre}
          onChange={handleChange}
        />
        <input
          type="text"
          name="usuario"
          placeholder="Usuario"
          value={form.usuario}
          onChange={handleChange}
        />
        <input
          type="password"
          name="contrasena"
          placeholder="Contraseña"
          value={form.contrasena}
          onChange={handleChange}
        />
        <input
          type="email"
          name="correo"
          placeholder="Correo"
          value={form.correo}
          onChange={handleChange}
        />
        <input
          type="text"
          name="telefono"
          placeholder="Teléfono"
          value={form.telefono}
          onChange={handleChange}
        />
        <input
          type="text"
          name="cedula"
          placeholder="Cédula"
          value={form.cedula}
          onChange={handleChange}
        />
        <button type="submit">Crear Usuario</button>
      </form>

      <ul>
        {usuarios.map((u) => (
          <li key={u.cedula}>
            {u.nombre} ({u.usuario}) - Activo: {u.activo ? "Sí" : "No"}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Usuarios;
