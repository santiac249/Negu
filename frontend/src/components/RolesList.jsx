import { useEffect, useState } from "react";

export default function RolesList() {
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/roles") // URL de tu backend
      .then((res) => res.json())
      .then((data) => setRoles(data))
      .catch((err) => console.error("Error al traer roles:", err));
  }, []);

  return (
    <div>
      <h2>Lista de Roles</h2>
      <ul>
        {roles.map((rol) => (
          <li key={rol.id}>
            {rol.id} - {rol.rol}
          </li>
        ))}
      </ul>
    </div>
  );
}
