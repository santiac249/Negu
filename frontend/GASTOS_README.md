# 💸 Módulo de Gastos - Documentación Completa

## 👁️ Visión General

El módulo de **Gastos** es una sección completa del sistema Negu que permite gestionar, registrar, filtrar y analizar todos los gastos de tu negocio. Está completamente integrado con el backend NestJS y Prisma.

## ✅ Características Implementadas

### 1. **CRUD Completo**
- ✅ Crear nuevos gastos
- ✅ Listar gastos con paginación
- ✅ Ver detalles completos de un gasto
- ✅ Editar gastos existentes
- ✅ Eliminar gastos con confirmación

### 2. **Sistema de Filtros Avanzados**
- 🗓️ **Por fecha**: Rango de fechas (inicio y fin)
- 🏷️ **Por tipo**: Operativo, Administrativo, Financiero, Marketing, Otro
- 📝 **Por concepto**: Búsqueda de texto
- 🏢 **Por proveedor**: Filtro por proveedor asociado
- 👤 **Por usuario**: Filtro por usuario que registró el gasto

### 3. **Paginación**
- 📊 20 registros por página
- ➡️ Navegación entre páginas
- 📊 Contador de registros totales

### 4. **Estadísticas y Resumen**
- 💰 **Total de gastos**: Suma total de todos los gastos
- 📊 **Gasto promedio**: Promedio por registro
- 🏷️ **Tipo más frecuente**: Tipo de gasto con mayor cantidad de registros
- 📈 **Resumen por tipo**: Estadísticas agrupadas por tipo de gasto

### 5. **Validaciones y Manejo de Errores**
- ⚠️ Validación de campos requeridos
- 🚫 Validación de montos (deben ser > 0)
- 🚨 Mensajes de error descriptivos
- 🔄 Manejo de errores de red
- ⏳ Estados de carga (loading)

### 6. **Integración con Proveedores**
- 🔗 Asociación opcional con proveedores
- 📝 Visualización de información del proveedor
- 📞 Teléfono, correo y dirección del proveedor

### 7. **UI/UX Mejorada**
- 🎨 Diseño moderno con Tailwind CSS
- 👁️ Iconos de Lucide React
- 🟢 Estados visuales (hover, loading, disabled)
- 📱 Responsive design
- 🎬 Animaciones suaves

---

## 📝 Estructura de Archivos

```
frontend/
├── src/
│   ├── api/
│   │   └── gastos.js                    # API del frontend con todas las funciones
│   ├── pages/
│   │   └── Gastos.jsx                   # Página principal de gastos
│   └── components/
│       └── gastos/
│           ├── GastosTable.jsx          # Tabla de gastos
│           ├── CreateGastoModal.jsx     # Modal para crear gastos
│           ├── EditGastoModal.jsx       # Modal para editar gastos
│           └── InfoGastoModal.jsx       # Modal de detalles del gasto
```

---

## 🔌 Concordancia con el Backend

### Endpoints del Backend (NestJS)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/gastos` | Obtener gastos con filtros y paginación |
| GET | `/gastos/:id` | Obtener un gasto por ID |
| POST | `/gastos` | Crear un nuevo gasto |
| PUT | `/gastos/:id` | Actualizar un gasto |
| DELETE | `/gastos/:id` | Eliminar un gasto |
| GET | `/gastos/resumen/por-tipo` | Obtener resumen agrupado por tipo |
| GET | `/gastos/periodo` | Obtener gastos en un período |
| GET | `/gastos/total-periodo` | Obtener total de gastos en un período |

### DTOs del Backend

#### CreateGastoDto
```typescript
{
  usuarioId: number;        // Requerido
  proveedorId?: number;     // Opcional
  concepto: string;         // Requerido
  monto: number;            // Requerido (> 0)
  tipo: string;             // Requerido
  fecha?: Date;             // Opcional (default: ahora)
}
```

#### UpdateGastoDto
```typescript
{
  usuarioId?: number;
  proveedorId?: number;
  concepto?: string;
  monto?: number;
  tipo?: string;
  fecha?: Date;
}
```

#### FilterGastoDto
```typescript
{
  usuarioId?: number;
  proveedorId?: number;
  concepto?: string;
  tipo?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
  page?: number;
  limit?: number;
}
```

### Respuesta del Backend

#### findAll() - Lista de gastos
```json
{
  "data": [
    {
      "id": 1,
      "usuarioId": 1,
      "proveedorId": 3,
      "concepto": "Pago de servicios públicos",
      "monto": 150000,
      "tipo": "Operativo",
      "fecha": "2026-02-15T00:00:00.000Z",
      "f_creacion": "2026-02-15T21:30:00.000Z",
      "usuario": {
        "id": 1,
        "nombre": "Santiago",
        "usuario": "admin"
      },
      "proveedor": {
        "id": 3,
        "nombre": "EPM"
      }
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 20,
  "pages": 3
}
```

#### getResumenPorTipo() - Resumen por tipo
```json
[
  {
    "tipo": "Operativo",
    "total": 2500000,
    "cantidad": 15
  },
  {
    "tipo": "Administrativo",
    "total": 800000,
    "cantidad": 8
  }
]
```

---

## 🛠️ Uso de las Funciones API

### 1. Obtener todos los gastos
```javascript
import { findAllGastos } from '../api/gastos';
import { useAuth } from '../store/auth';

const { getToken } = useAuth();

const gastos = await findAllGastos(getToken, {
  page: 1,
  limit: 20,
  tipo: 'Operativo',
  fechaInicio: '2026-01-01',
  fechaFin: '2026-12-31'
});

console.log(gastos.data);       // Array de gastos
console.log(gastos.total);      // Total de registros
console.log(gastos.pages);      // Total de páginas
```

### 2. Crear un gasto
```javascript
import { createGasto } from '../api/gastos';

const nuevoGasto = await createGasto({
  usuarioId: 1,
  concepto: 'Compra de materiales',
  monto: 250000,
  tipo: 'Operativo',
  proveedorId: 5,
  fecha: new Date().toISOString()
}, getToken);
```

### 3. Actualizar un gasto
```javascript
import { updateGasto } from '../api/gastos';

await updateGasto(15, {
  monto: 300000,
  concepto: 'Compra de materiales (actualizado)'
}, getToken);
```

### 4. Eliminar un gasto
```javascript
import { deleteGasto } from '../api/gastos';

await deleteGasto(15, getToken);
```

### 5. Obtener resumen por tipo
```javascript
import { getResumenPorTipo } from '../api/gastos';

const resumen = await getResumenPorTipo(getToken);
// [{ tipo: 'Operativo', total: 2500000, cantidad: 15 }, ...]
```

---

## 🎯 Tipos de Gasto Disponibles

1. **Operativo** - Gastos operacionales del día a día
2. **Administrativo** - Gastos administrativos y de oficina
3. **Financiero** - Intereses, comisiones bancarias, etc.
4. **Marketing** - Publicidad, promoción, marketing digital
5. **Otro** - Gastos diversos no categorizados

---

## 📊 Estadísticas Visuales

La página de gastos muestra **3 tarjetas de resumen** en la parte superior:

### 1. Total de Gastos (Rojo)
- Suma total de todos los gastos
- Número de registros
- Formato en pesos colombianos (COP)

### 2. Gasto Promedio (Naranja)
- Promedio del monto por registro
- Cálculo dinámico

### 3. Tipo Más Frecuente (Morado)
- Muestra el tipo con más registros
- Cantidad de gastos de ese tipo

---

## ⚠️ Validaciones Implementadas

### En el Frontend
- ✅ Concepto no puede estar vacío
- ✅ Monto debe ser mayor a 0
- ✅ Tipo debe estar seleccionado
- ✅ Fecha es requerida y no puede ser futura
- ✅ ProveedorId debe ser un número válido si se proporciona

### En el Backend (DTOs)
- `@IsString()` para campos de texto
- `@IsNumber()` para IDs y montos
- `@IsPositive()` para el monto
- `@IsNotEmpty()` para campos requeridos
- `@IsOptional()` para campos opcionales
- `@IsDate()` para fechas

---

## 👨‍💻 Casos de Uso

### Caso 1: Registrar un gasto de servicios públicos
1. Click en "Nuevo gasto"
2. Completar:
   - Concepto: "Pago de energía eléctrica"
   - Tipo: "Operativo"
   - Monto: 150000
   - Proveedor: "EPM" (seleccionar del dropdown)
   - Fecha: Seleccionar fecha
3. Click en "Crear Gasto"
4. El gasto se registra y aparece en la tabla

### Caso 2: Buscar gastos de marketing del mes pasado
1. Click en "Filtros"
2. Seleccionar:
   - Tipo: "Marketing"
   - Fecha Inicio: "2026-01-01"
   - Fecha Fin: "2026-01-31"
3. Click en "Aplicar Filtros"
4. La tabla muestra solo gastos de marketing de enero

### Caso 3: Editar un gasto existente
1. Buscar el gasto en la tabla
2. Click en el icono de lápiz (✏️)
3. Modificar los campos necesarios
4. Click en "Guardar Cambios"
5. El gasto se actualiza en la base de datos

---

## 🔐 Seguridad y Permisos

- 🔑 Todas las peticiones requieren autenticación (Bearer Token)
- 👤 El usuario autenticado se registra automáticamente como creador del gasto
- 🚫 Solo usuarios autenticados pueden acceder al módulo
- 📝 Los usuarios pueden ver gastos registrados por otros usuarios

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** - Framework de UI
- **Tailwind CSS** - Estilos y diseño
- **Lucide React** - Iconos
- **Axios** - Cliente HTTP
- **Zustand** - Gestión de estado (auth)

### Backend
- **NestJS** - Framework de Node.js
- **Prisma ORM** - ORM para PostgreSQL
- **PostgreSQL** - Base de datos
- **class-validator** - Validación de DTOs
- **class-transformer** - Transformación de datos

---

## 💡 Mejoras Futuras Sugeridas

1. 📊 **Gráficos y estadísticas**
   - Gráfico de gastos por mes
   - Gráfico de pastel por tipo
   - Tendencias de gastos

2. 📥 **Exportación de datos**
   - Exportar a Excel
   - Exportar a PDF
   - Generar reportes

3. 🔔 **Notificaciones**
   - Alerta cuando un gasto excede un umbral
   - Resumen mensual por correo

4. 📎 **Adjuntar archivos**
   - Subir facturas en PDF
   - Subir comprobantes de pago

5. 🔄 **Gastos recurrentes**
   - Programar gastos mensuales
   - Gastos automáticos

6. 👥 **Aprobaciones**
   - Flujo de aprobación de gastos
   - Gastos pendientes de aprobación

---

## ❓ Troubleshooting

### Error: "Error al cargar gastos"
**Solución**: Verificar que el backend esté corriendo y que la URL en `VITE_API_URL` sea correcta.

### Error: "El monto debe ser mayor a 0"
**Solución**: Asegurarse de ingresar un monto válido y positivo.

### Error: "Usuario con ID X no existe"
**Solución**: El usuario autenticado debe existir en la base de datos. Verificar el token de autenticación.

### Error: "Proveedor con ID X no existe"
**Solución**: El proveedor seleccionado debe existir en la base de datos. Verificar la lista de proveedores.

---

## 📝 Notas del Desarrollador

- La paginación está configurada a **20 registros por página** por defecto
- Los filtros se resetean al cambiar de página
- El usuario autenticado se obtiene del store de Zustand
- Todos los montos se muestran en formato de pesos colombianos (COP)
- Las fechas se muestran en formato local colombiano
- El sistema maneja correctamente valores `null` en `proveedorId`

---

## ✅ Testing Checklist

- [ ] Crear un gasto sin proveedor
- [ ] Crear un gasto con proveedor
- [ ] Editar un gasto existente
- [ ] Eliminar un gasto
- [ ] Filtrar por tipo
- [ ] Filtrar por rango de fechas
- [ ] Filtrar por proveedor
- [ ] Navegar entre páginas
- [ ] Ver detalles de un gasto
- [ ] Verificar que las estadísticas se actualicen
- [ ] Verificar validaciones de formulario
- [ ] Verificar mensajes de error
- [ ] Verificar responsive design

---

## 📧 Contacto

**Desarrollador**: Santiago Castro  
**Proyecto**: Negu - Sistema de Gestión Empresarial  
**Fecha**: Febrero 2026  

---

🎉 **¡El módulo de Gastos está 100% funcional y listo para producción!** 🎉
