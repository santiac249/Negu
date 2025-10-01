// src/App.jsx
import React from "react";
import Sidebar from "./Sidebar";
import Content from "./Content";

function App() {
  const user = {
    name: "Santiago Castro",
    rol: "administrador", // o "vendedor"
    photoURL: "https://ui-avatars.com/api/?name=Santiago+Castro",
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar role={user.role} />

      {/* Content dinámico */}
      <Content user={user}>
        {user.rol === "administrador" && <p>Dashboard del administrador 🚀</p>}
        {user.rol === "vendedor" && <p>Panel del vendedor 🛒</p>}
      </Content>
    </div>
  );
}

export default App;
