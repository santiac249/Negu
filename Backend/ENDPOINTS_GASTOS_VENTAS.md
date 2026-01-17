# 📋 Documentación de Endpoints - Gastos y Ventas

Esta documentación describe todos los endpoints disponibles para los módulos de **Gastos** y **Ventas**.

---

## 🏦 MÓDULO DE GASTOS

### Base URL: `http://localhost:3000/gastos`

### 1. Obtener todos los gastos (con filtros y paginación)

**Endpoint:**
```
GET /gastos
```

**Query Parameters:**
```
- page: number (default: 1) - Número de página
- limit: number (default: 10) - Registros por página
- usuarioId: number (optional) - Filtrar por usuario
- proveedorId: number (optional) - Filtrar por proveedor
- concepto: string (optional) - Filtrar por concepto (búsqueda parcial)
- tipo: string (optional) - Filtrar por tipo (Operativo, Administrativo, etc.)
- fechaInicio: Date (optional) - Fecha inicial del período
- fechaFin: Date (optional) - Fecha final del período
```

**Ejemplo:**
```bash
curl -X GET "http://localhost:3000/gastos?page=1&limit=10&tipo=Operativo&fechaInicio=2026-01-01&fechaFin=2026-01-31"
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "usuarioId": 1,
      "proveedorId": 2,
      "concepto": "Arriendo oficina",
      "monto": 1000000,
      "tipo": "Operativo",
      "fecha": "2026-01-17T21:56:45.000Z",
      "usuario": {
        "id": 1,
        "nombre": "Santiago Castro",
        "usuario": "santiago"
      },
      "proveedor": {
        "id": 2,
        "nombre": "Inmobiliaria XYZ"
      }
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 10,
  "pages": 5
}
```

---

### 2. Obtener un gasto por ID

**Endpoint:**
```
GET /gastos/:id
```

**Parámetros:**
- `id`: number (requerido) - ID del gasto

**Ejemplo:**
```bash
curl -X GET "http://localhost:3000/gastos/1"
```

**Response (200 OK):**
```json
{
  "id": 1,
  "usuarioId": 1,
  "proveedorId": 2,
  "concepto": "Arriendo oficina",
  "monto": 1000000,
  "tipo": "Operativo",
  "fecha": "2026-01-17T21:56:45.000Z",
  "usuario": {
    "id": 1,
    "nombre": "Santiago Castro",
    "usuario": "santiago"
  },
  "proveedor": {
    "id": 2,
    "nombre": "Inmobiliaria XYZ",
    "telefono": "3001234567",
    "correo": "info@inmobiliaria.com"
  }
}
```

---

### 3. Crear un nuevo gasto

**Endpoint:**
```
POST /gastos
```

**Body (JSON):**
```json
{
  "usuarioId": 1,
  "proveedorId": 2,
  "concepto": "Arriendo oficina",
  "monto": 1000000,
  "tipo": "Operativo",
  "fecha": "2026-01-17T00:00:00Z"
}
```

**Campos Requeridos:**
- `usuarioId`: number (ID del usuario que registra el gasto)
- `concepto`: string
- `monto`: number (debe ser > 0)
- `tipo`: string (ej: "Operativo", "Administrativo", "Marketing", etc.)

**Campos Opcionales:**
- `proveedorId`: number
- `fecha`: Date (por defecto es la fecha actual)

**Ejemplo:**
```bash
curl -X POST "http://localhost:3000/gastos" \
  -H "Content-Type: application/json" \
  -d '{
    "usuarioId": 1,
    "proveedorId": 2,
    "concepto": "Arriendo oficina",
    "monto": 1000000,
    "tipo": "Operativo"
  }'
```

**Response (201 Created):**
```json
{
  "id": 10,
  "usuarioId": 1,
  "proveedorId": 2,
  "concepto": "Arriendo oficina",
  "monto": 1000000,
  "tipo": "Operativo",
  "fecha": "2026-01-17T21:56:45.000Z",
  "usuario": {...},
  "proveedor": {...}
}
```

---

### 4. Actualizar un gasto

**Endpoint:**
```
PUT /gastos/:id
```

**Parámetros:**
- `id`: number (requerido)

**Body (JSON):**
```json
{
  "monto": 1200000,
  "concepto": "Arriendo oficina actualizado"
}
```

**Nota:** Todos los campos son opcionales. Solo se actualizarán los campos enviados.

**Ejemplo:**
```bash
curl -X PUT "http://localhost:3000/gastos/1" \
  -H "Content-Type: application/json" \
  -d '{
    "monto": 1200000
  }'
```

---

### 5. Eliminar un gasto

**Endpoint:**
```
DELETE /gastos/:id
```

**Parámetros:**
- `id`: number (requerido)

**Ejemplo:**
```bash
curl -X DELETE "http://localhost:3000/gastos/1"
```

**Response (200 OK):**
```json
{
  "id": 1,
  "usuarioId": 1,
  "proveedorId": 2,
  "concepto": "Arriendo oficina",
  "monto": 1000000,
  "tipo": "Operativo",
  "fecha": "2026-01-17T21:56:45.000Z"
}
```

---

### 6. Obtener resumen de gastos por tipo

**Endpoint:**
```
GET /gastos/resumen/por-tipo
```

**Ejemplo:**
```bash
curl -X GET "http://localhost:3000/gastos/resumen/por-tipo"
```

**Response (200 OK):**
```json
[
  {
    "tipo": "Operativo",
    "total": 5000000,
    "cantidad": 5
  },
  {
    "tipo": "Administrativo",
    "total": 2000000,
    "cantidad": 2
  }
]
```

---

### 7. Obtener gastos por período

**Endpoint:**
```
GET /gastos/periodo
```

**Query Parameters:**
- `fechaInicio`: Date (requerido) - Formato: YYYY-MM-DD
- `fechaFin`: Date (requerido) - Formato: YYYY-MM-DD

**Ejemplo:**
```bash
curl -X GET "http://localhost:3000/gastos/periodo?fechaInicio=2026-01-01&fechaFin=2026-01-31"
```

---

### 8. Obtener total de gastos en un período

**Endpoint:**
```
GET /gastos/total-periodo
```

**Query Parameters:**
- `fechaInicio`: Date (requerido)
- `fechaFin`: Date (requerido)

**Ejemplo:**
```bash
curl -X GET "http://localhost:3000/gastos/total-periodo?fechaInicio=2026-01-01&fechaFin=2026-01-31"
```

**Response (200 OK):**
```json
{
  "total": 7000000,
  "cantidad": 7
}
```

---

## 🛍️ MÓDULO DE VENTAS

### Base URL: `http://localhost:3000/ventas`

### 1. Obtener todas las ventas (con filtros y paginación)

**Endpoint:**
```
GET /ventas
```

**Query Parameters:**
```
- page: number (default: 1)
- limit: number (default: 10)
- clienteId: number (optional)
- usuarioId: number (optional)
- metPagoId: number (optional)
- estado: string (optional) - "Completada", "Cancelada"
- fechaInicio: Date (optional)
- fechaFin: Date (optional)
```

**Ejemplo:**
```bash
curl -X GET "http://localhost:3000/ventas?page=1&limit=10&estado=Completada&fechaInicio=2026-01-01&fechaFin=2026-01-31"
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "clienteId": 5,
      "usuarioId": 1,
      "metPagoId": 1,
      "total": 250000,
      "descuento": 0,
      "estado": "Completada",
      "fecha": "2026-01-17T21:56:45.000Z",
      "cliente": {
        "id": 5,
        "nombre": "Juan Pérez",
        "documento": "1234567890"
      },
      "usuario": {
        "id": 1,
        "nombre": "Santiago Castro",
        "usuario": "santiago"
      },
      "metodoPago": {
        "id": 1,
        "metodo": "Efectivo"
      },
      "detalles": [
        {
          "id": 1,
          "ventaId": 1,
          "stockId": 10,
          "cantidad": 2,
          "precio": 125000,
          "stock": {
            "id": 10,
            "productoId": 5,
            "colorId": 1,
            "tallaId": 1,
            "precio_venta": 125000,
            "producto": {
              "id": 5,
              "nombre": "Vodka Smirnoff"
            },
            "color": {
              "id": 1,
              "nombre": "Transparente"
            },
            "talla": {
              "id": 1,
              "nombre": "750ml"
            }
          }
        }
      ]
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10,
  "pages": 3
}
```

---

### 2. Obtener una venta por ID

**Endpoint:**
```
GET /ventas/:id
```

**Ejemplo:**
```bash
curl -X GET "http://localhost:3000/ventas/1"
```

---

### 3. Crear una nueva venta

**Endpoint:**
```
POST /ventas
```

**Body (JSON):**
```json
{
  "usuarioId": 1,
  "clienteId": 5,
  "metPagoId": 1,
  "descuento": 0,
  "detalles": [
    {
      "stockId": 10,
      "cantidad": 2,
      "precio": 125000
    },
    {
      "stockId": 11,
      "cantidad": 1,
      "precio": 50000
    }
  ]
}
```

**Campos Requeridos:**
- `usuarioId`: number
- `metPagoId`: number
- `detalles`: array de objetos con stockId, cantidad y precio

**Campos Opcionales:**
- `clienteId`: number
- `descuento`: number
- `fecha`: Date (por defecto es la fecha actual)

**Nota Importante:**
- La venta maneja **transacciones atómicas**: si algo falla, se revierte todo.
- Valida automáticamente que haya suficiente stock.
- Descuenta del inventario cuando se registra la venta.
- Calcula automáticamente el total.

**Ejemplo:**
```bash
curl -X POST "http://localhost:3000/ventas" \
  -H "Content-Type: application/json" \
  -d '{
    "usuarioId": 1,
    "clienteId": 5,
    "metPagoId": 1,
    "detalles": [
      {
        "stockId": 10,
        "cantidad": 2,
        "precio": 125000
      }
    ]
  }'
```

**Response (201 Created):**
```json
{
  "id": 10,
  "clienteId": 5,
  "usuarioId": 1,
  "metPagoId": 1,
  "total": 250000,
  "descuento": 0,
  "estado": "Completada",
  "fecha": "2026-01-17T21:56:45.000Z",
  ...
}
```

---

### 4. Actualizar una venta

**Endpoint:**
```
PUT /ventas/:id
```

**Body (JSON):**
```json
{
  "descuento": 50000,
  "clienteId": 6
}
```

**Nota:**
- Solo permite actualizar clientes y descuentos.
- La venta debe estar en estado "Completada".

**Ejemplo:**
```bash
curl -X PUT "http://localhost:3000/ventas/1" \
  -H "Content-Type: application/json" \
  -d '{
    "descuento": 50000
  }'
```

---

### 5. Cancelar una venta

**Endpoint:**
```
DELETE /ventas/:id
```

**Nota:**
- Cancela la venta.
- **Restaura el stock** automáticamente.
- Marca la venta como "Cancelada".

**Ejemplo:**
```bash
curl -X DELETE "http://localhost:3000/ventas/1"
```

**Response (200 OK):**
```json
{
  "id": 1,
  "estado": "Cancelada",
  ...
}
```

---

### 6. Obtener ventas por período

**Endpoint:**
```
GET /ventas/periodo
```

**Query Parameters:**
- `fechaInicio`: Date (requerido)
- `fechaFin`: Date (requerido)

**Ejemplo:**
```bash
curl -X GET "http://localhost:3000/ventas/periodo?fechaInicio=2026-01-01&fechaFin=2026-01-31"
```

---

### 7. Obtener total de ventas en un período

**Endpoint:**
```
GET /ventas/total-periodo
```

**Query Parameters:**
- `fechaInicio`: Date (requerido)
- `fechaFin`: Date (requerido)

**Ejemplo:**
```bash
curl -X GET "http://localhost:3000/ventas/total-periodo?fechaInicio=2026-01-01&fechaFin=2026-01-31"
```

**Response (200 OK):**
```json
{
  "totalVentas": 5000000,
  "cantidad": 25,
  "promedioVenta": 200000
}
```

---

### 8. Obtener ventas por cliente

**Endpoint:**
```
GET /ventas/cliente/:clienteId
```

**Parámetros:**
- `clienteId`: number (requerido)

**Ejemplo:**
```bash
curl -X GET "http://localhost:3000/ventas/cliente/5"
```

---

### 9. Obtener top 10 productos más vendidos

**Endpoint:**
```
GET /ventas/analisis/productos-top
```

**Query Parameters:**
- `limit`: number (opcional, default: 10)

**Ejemplo:**
```bash
curl -X GET "http://localhost:3000/ventas/analisis/productos-top?limit=5"
```

**Response (200 OK):**
```json
[
  {
    "producto": {
      "id": 5,
      "nombre": "Vodka Smirnoff",
      "descripcion": "Vodka premium",
      "marca_id": 2
    },
    "color": {
      "id": 1,
      "nombre": "Transparente"
    },
    "talla": {
      "id": 1,
      "nombre": "750ml"
    },
    "cantidadVendida": 45,
    "transacciones": 12
  }
]
```

---

### 10. Obtener resumen de ventas por método de pago

**Endpoint:**
```
GET /ventas/analisis/resumen-metodo-pago
```

**Ejemplo:**
```bash
curl -X GET "http://localhost:3000/ventas/analisis/resumen-metodo-pago"
```

**Response (200 OK):**
```json
[
  {
    "metodo": "Efectivo",
    "totalVentas": 3000000,
    "cantidad": 15
  },
  {
    "metodo": "Tarjeta Crédito",
    "totalVentas": 2000000,
    "cantidad": 10
  }
]
```

---

## 📝 Códigos de Error Comunes

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "El monto debe ser mayor a 0",
  "error": "Bad Request"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Gasto con ID 999 no encontrado",
  "error": "Not Found"
}
```

### 422 Unprocessable Entity
```json
{
  "statusCode": 422,
  "message": [
    "usuarioId must be a number conforming to the specified constraints",
    "concepto must be a string"
  ],
  "error": "Unprocessable Entity"
}
```

---

## 🚀 Notas Importantes

1. **Transacciones Atómicas**: Las operaciones de venta usan transacciones para garantizar consistencia de datos.

2. **Control de Stock**: Las ventas automáticamente descontar del inventario. Las cancelaciones restauran el stock.

3. **Validación de Datos**: Todos los DTOs incluyen validación automática de tipos y valores.

4. **Paginación**: Los endpoints de listado incluyen paginación para mejorar performance.

5. **Filtrado Flexible**: Combina múltiples filtros para consultas específicas.

---

## 📌 Próximos Pasos

- [ ] Implementar autenticación/autorización en endpoints
- [ ] Agregar Swagger/OpenAPI documentation
- [ ] Crear tests unitarios y e2e
- [ ] Implementar auditoría de cambios
- [ ] Exportación de reportes (PDF/Excel)

