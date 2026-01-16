# ✅ Estado de Configuración - CamisetaBox

**Última actualización:** 2026-01-15

---

## 🎯 Resumen General

| Componente | Estado | Notas |
|------------|--------|-------|
| Código Stripe | ✅ Completo | APIs, componentes y páginas creadas |
| Variables .env | ✅ Configurado | Stripe keys agregadas |
| Supabase Schema | ⚠️ Pendiente | Ejecutar schema.sql en Supabase |
| Stripe CLI Login | ⚠️ Pendiente | Completar autorización |
| Webhook Local | ⏳ Siguiente paso | Después del login |

---

## ✅ Lo que YA está hecho

### 1. Código completo de Stripe
- ✅ `/src/pages/api/create-checkout-session.ts` - Crear sesiones de pago
- ✅ `/src/pages/api/webhook.ts` - Recibir confirmaciones
- ✅ `/src/pages/checkout/[productId].astro` - Página de checkout
- ✅ `/src/components/CheckoutForm.tsx` - Formulario React
- ✅ `/src/pages/success.astro` - Confirmación de compra
- ✅ `astro.config.mjs` - Configurado en modo `hybrid`

### 2. Variables de entorno
```env
✅ STRIPE_SECRET_KEY=sk_test_51Sq2jK...
✅ PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51Sq2jK...
✅ STRIPE_WEBHOOK_SECRET=whsec_local_dev_placeholder (temporal)
✅ PUBLIC_SUPABASE_URL=https://wgydjdhihcycjulnxuea.supabase.co
✅ PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
✅ SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI...
```

### 3. Scripts y documentación
- ✅ `STRIPE_SETUP.md` - Guía completa
- ✅ `supabase/schema.sql` - Schema de base de datos
- ✅ `test-stripe.sh` - Script de verificación
- ✅ `scripts/dev-with-stripe.sh` - Desarrollo con webhooks
- ✅ Stripe CLI instalado (v1.34.0)

---

## ⚠️ Pasos pendientes (en orden)

### Paso 1: Completar login de Stripe CLI

Si ya hiciste click en "Permitir acceso" en el navegador, verifica:

```bash
# Verificar si el login fue exitoso
stripe config --list
```

Si da error, vuelve a ejecutar:
```bash
stripe login
```

Y autoriza en el navegador.

---

### Paso 2: Crear tabla en Supabase

1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **SQL Editor** (menú izquierdo)
4. Click en **New query**
5. Copia TODO el contenido de `supabase/schema.sql`
6. Pégalo en el editor
7. Click en **Run** (ignorar advertencia de "destructive operation")

Esto creará:
- ✅ Tabla `orders` (pedidos)
- ✅ Tabla `customers` (clientes)
- ✅ Tabla `inventory` (inventario)
- ✅ Índices y políticas de seguridad

---

### Paso 3: Obtener webhook secret local

**En una terminal:**
```bash
stripe listen --forward-to localhost:4321/api/webhook
```

Verás algo como:
```
> Ready! Your webhook signing secret is whsec_abc123...
```

**Copia ese `whsec_...` y actualiza tu .env:**
```env
STRIPE_WEBHOOK_SECRET=whsec_el_que_copiaste
```

**Deja esa terminal corriendo** - es importante para recibir webhooks.

---

### Paso 4: Iniciar el servidor de desarrollo

**En OTRA terminal nueva:**
```bash
npm run dev
```

---

### Paso 5: Probar una compra

1. Abre: http://localhost:4321
2. Click en "Comprar" en cualquier producto
3. Llena el formulario:
   - Nombre: Tu nombre
   - Email: tu@email.com
   - Talla: Cualquiera
   - (Opcional) Excluye equipos
4. Click en "Pagar"
5. Usa tarjeta de prueba:
   - **Número:** `4242 4242 4242 4242`
   - **Fecha:** Cualquier fecha futura
   - **CVC:** Cualquier 3 dígitos
   - **Código postal:** Cualquier código
6. Completa el pago
7. Deberías ver la página de confirmación

---

## 🔍 Verificar que funcionó

### 1. Ver el webhook en la terminal
En la terminal donde corre `stripe listen` deberías ver:
```
<-- checkout.session.completed [evt_xxx]
```

### 2. Ver la orden en Supabase
1. Ve a tu proyecto Supabase
2. Table Editor → `orders`
3. Deberías ver una nueva fila con tu pedido

### 3. Ver el pago en Stripe
- Dashboard: https://dashboard.stripe.com/test/payments
- Deberías ver el pago exitoso

---

## 🚀 Comandos útiles

```bash
# Verificar configuración
npm run test:stripe

# Desarrollo normal
npm run dev

# Desarrollo con helper de Stripe webhooks
npm run dev:stripe

# Escuchar webhooks manualmente
stripe listen --forward-to localhost:4321/api/webhook

# Ver eventos recientes de Stripe
stripe events list --limit 5

# Ver últimas sesiones de checkout
stripe checkout sessions list --limit 5
```

---

## 🎨 Flujo completo

```
Usuario → Camisetabox.cl
    ↓
Selecciona producto → /checkout/[productId]
    ↓
Llena formulario (talla, equipos excluidos, datos)
    ↓
Click "Pagar" → POST /api/create-checkout-session
    ↓
Redirige a Stripe Checkout
    ↓
Usuario paga con tarjeta
    ↓
Stripe procesa pago
    ↓
Redirige a /success?session_id=...
    ↓
(En background) Stripe envía webhook → POST /api/webhook
    ↓
Se crea orden en Supabase con status "paid"
    ↓
✅ ¡Orden registrada!
```

---

## 🐛 Problemas comunes

### "Webhook signature verification failed"
- Asegúrate que `STRIPE_WEBHOOK_SECRET` en `.env` coincida con el que muestra `stripe listen`
- Reinicia el servidor después de cambiar `.env`

### "No se crea la orden en Supabase"
- Verifica que ejecutaste `schema.sql` en Supabase
- Revisa los logs en la terminal donde corre `stripe listen`
- Verifica `SUPABASE_SERVICE_ROLE_KEY` en `.env`

### "Cannot find module 'stripe'"
```bash
npm install
```

### Stripe CLI no encuentra configuración
```bash
stripe login
```
Y autoriza en el navegador

---

## 📞 Siguiente fase

Una vez que tengas todo funcionando:

1. **Panel Admin** - Ver y gestionar pedidos
2. **Emails automáticos** - Confirmación y tracking
3. **Integración Flow** - Pagos chilenos
4. **Producción** - Claves live de Stripe

---

## 📝 Checklist final

- [ ] Login en Stripe CLI completado
- [ ] Tabla `orders` creada en Supabase
- [ ] `stripe listen` corriendo en una terminal
- [ ] `npm run dev` corriendo en otra terminal
- [ ] Compra de prueba realizada exitosamente
- [ ] Orden visible en Supabase
- [ ] Pago visible en Stripe dashboard

**Cuando todos los checkboxes estén marcados, ¡estás listo para seguir! 🎉**
