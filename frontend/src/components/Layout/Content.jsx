// src/components/Content.jsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const Content = ({ user, children }) => {
  // Obtener fecha actual con formato largo (ejemplo: martes, 19 de agosto de 2025)
  const fecha = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex-1 p-6">
      <Card className="mb-6 shadow-md rounded-2xl">
        <CardContent className="flex items-center gap-4 p-6">
          {/* Foto del usuario */}
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.photoURL || ""} alt={user?.name || "User"} />
            <AvatarFallback>
              {user?.name ? user.name[0].toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>

          {/* Texto de bienvenida */}
          <div>
            <h2 className="text-xl font-semibold">
              Bienvenido {user?.name || "Usuario"}!
            </h2>
            <p className="text-sm text-muted-foreground">{fecha}</p>
          </div>
        </CardContent>
      </Card>

      {/* Contenido dinámico */}
      <div className="mt-4">{children}</div>
    </div>
  );
};

export default Content;
