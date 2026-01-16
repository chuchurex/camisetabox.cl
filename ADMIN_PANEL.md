# 📊 Panel de Administración - CamisetaBox

## 🎯 Acceso al panel

### Desarrollo (local)
Simplemente ve a: **http://localhost:4321/admin/dashboard**

No requiere login en desarrollo - acceso directo.

### Producción (cuando esté listo)
URL: **https://camisetabox.cl/admin/dashboard**

Necesitarás implementar autenticación. Por ahora está abierto para desarrollo.

---

## ✨ Funcionalidades del panel

### 1. Dashboard principal
- **Estadísticas en tiempo real:**
  - Total de órdenes
  - Órdenes pagadas
  - Órdenes en procesamiento
  - Órdenes enviadas
  - Ingresos totales

### 2. Filtros de órdenes
Puedes filtrar las órdenes por estado:
- ✅ **Todas** - Todas las órdenes
- 💰 **Pagadas** - Órdenes confirmadas
- 🔄 **Procesando** - Estás preparando la caja
- 📦 **Enviadas** - En camino al cliente
- ✔️ **Entregadas** - Recibidas por el cliente

### 3. Lista de órdenes
Tabla con información clave:
- Fecha de la orden
- Datos del cliente (nombre, email)
- Producto comprado
- Monto total
- Estado actual
- Botón de acciones

### 4. Detalle de orden
Al hacer click en "Ver detalles" de cualquier orden:

**Información del cliente:**
- Nombre completo
- Email
- Teléfono (si lo proporcionó)

**Información del pedido:**
- Producto y talla
- Equipos excluidos
- Total pagado
- Método de pago (Stripe/Flow)
- ID de pago de Stripe

**Gestión:**
- ✏️ **Cambiar estado:** Dropdown para actualizar el estado
- 📦 **Agregar tracking:** Input para número de seguimiento
- 🆔 **ID de orden:** Para referencia

---

## 🔄 Flujo de trabajo sugerido

### Cuando llega una orden nueva:

1. **Orden creada automáticamente** con estado `paid` (gracias al webhook)

2. **Revisar la orden en el panel:**
   - Ve a `/admin/dashboard`
   - Revisa los datos del cliente
   - Nota la talla y equipos excluidos

3. **Cambiar a "Procesando":**
   - Abre el detalle de la orden
   - Cambia el estado a "Procesando"
   - Prepara la camiseta según las preferencias

4. **Enviar la orden:**
   - Empaqueta y envía con Chilexpress/Correos
   - Obtén el número de tracking
   - En el panel: agrega el tracking number
   - Cambia el estado a "Enviado"

5. **Confirmar entrega:**
   - Cuando el cliente confirme recepción
   - Cambia el estado a "Entregado"

---

## 📋 Estados de una orden

| Estado | Descripción | Color | Cuándo usarlo |
|--------|-------------|-------|---------------|
| `pending` | Pendiente de pago | 🟡 Amarillo | Rara vez (solo si falla el webhook) |
| `paid` | Pago confirmado | 🟢 Verde | Automático tras pago exitoso |
| `processing` | Preparando envío | 🔵 Azul | Cuando estás buscando/empaquetando la camiseta |
| `shipped` | En camino | 🟣 Púrpura | Cuando entregaste al courier |
| `delivered` | Entregado | 🟢 Verde oscuro | Cuando cliente confirma recepción |
| `cancelled` | Cancelado | 🔴 Rojo | Si hay problema y devuelves el dinero |

---

## 🛠️ Funcionalidades técnicas

### API Endpoints creados:

**GET /api/orders**
- Lista todas las órdenes
- Parámetros query:
  - `status`: Filtrar por estado (opcional)
  - `limit`: Cantidad de resultados (default: 50)
  - `offset`: Para paginación (default: 0)

Ejemplo:
```bash
curl http://localhost:4321/api/orders?status=paid&limit=10
```

**PATCH /api/orders**
- Actualiza una orden
- Body JSON:
  ```json
  {
    "orderId": "uuid-aqui",
    "status": "shipped",
    "tracking_number": "CH12345678",
    "notes": "Notas internas"
  }
  ```

Ejemplo:
```bash
curl -X PATCH http://localhost:4321/api/orders \
  -H "Content-Type: application/json" \
  -d '{"orderId":"c83395ab...","status":"shipped","tracking_number":"CH12345"}'
```

---

## 🎨 Componentes creados

### 1. `/admin/login.astro`
Página de login (preparada para Supabase Auth)

### 2. `/admin/dashboard.astro`
Página principal del dashboard

### 3. `/components/AdminDashboard.tsx`
Componente React con toda la lógica:
- Estados y filtros
- Carga de datos
- Actualización de órdenes
- Modal de detalles

### 4. `/api/orders.ts`
API endpoint para CRUD de órdenes

---

## 🔒 Seguridad (para producción)

**IMPORTANTE:** Antes de pasar a producción, debes:

1. **Implementar autenticación:**
   - Usar Supabase Auth
   - Validar sesión en cada request
   - Proteger las rutas del admin

2. **Crear usuario admin en Supabase:**
   ```sql
   -- Ejecutar en Supabase SQL Editor
   INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
   VALUES ('admin@camisetabox.cl', crypt('tu-password-seguro', gen_salt('bf')), now());
   ```

3. **Agregar middleware de autenticación:**
   Validar que el usuario esté autenticado antes de mostrar el dashboard

4. **Variables de entorno:**
   - Nunca commitear credenciales
   - Usar secrets en producción

---

## 📱 Responsive

El panel es completamente responsive:
- ✅ Desktop: Vista completa en tabla
- ✅ Tablet: Layout adaptado
- ✅ Mobile: Scroll horizontal en tabla + filtros deslizables

---

## 🚀 Acceso rápido

Desde cualquier página del sitio:
- Scroll al footer
- Click en **"Admin"**
- Te lleva directamente al dashboard

---

## 📊 Scripts útiles

**Ver órdenes desde terminal:**
```bash
node scripts/check-orders.js
```

**Consultar API directamente:**
```bash
# Todas las órdenes
curl http://localhost:4321/api/orders | jq

# Solo pagadas
curl "http://localhost:4321/api/orders?status=paid" | jq

# Actualizar orden
curl -X PATCH http://localhost:4321/api/orders \
  -H "Content-Type: application/json" \
  -d '{"orderId":"ID_AQUI","status":"shipped"}'
```

---

## 🎯 Próximas mejoras sugeridas

1. **Notificaciones por email:**
   - Email al cliente cuando cambias el estado
   - Email con tracking number

2. **WhatsApp automático:**
   - Notificar al cliente vía WhatsApp

3. **Exportar a Excel:**
   - Botón para descargar reporte de órdenes

4. **Búsqueda:**
   - Buscar por email, nombre o ID de orden

5. **Filtros avanzados:**
   - Por fecha
   - Por producto
   - Por monto

6. **Gráficos:**
   - Ventas por día/semana/mes
   - Productos más vendidos
   - Tallas más populares

---

¡Todo listo para gestionar tus órdenes! 🎉
