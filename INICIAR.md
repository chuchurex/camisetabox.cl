# 🚀 Cómo iniciar CamisetaBox en modo desarrollo

## Paso 1: Terminal 1 - Webhooks de Stripe

Abre una terminal y ejecuta:

```bash
cd /Users/chuchurex/Sites/prod/camisetabox.cl
stripe listen --forward-to localhost:4321/api/webhook
```

**Dejar esta terminal abierta y corriendo**. Verás mensajes como:
```
Ready! You are using Stripe API Version [2025-12-15.clover]
Your webhook signing secret is whsec_...
```

---

## Paso 2: Terminal 2 - Servidor de desarrollo

Abre **OTRA terminal nueva** y ejecuta:

```bash
cd /Users/chuchurex/Sites/prod/camisetabox.cl
npm run dev
```

**Dejar esta terminal abierta y corriendo**. Verás:
```
astro v4.16.19 ready in XXX ms

┃ Local    http://localhost:4321/
┃ Network  use --host to expose
```

---

## Paso 3: Abrir en el navegador

Abre tu navegador en:

```
http://localhost:4321
```

---

## 🧪 Probar una compra

1. **Click en "Comprar"** en cualquier caja
2. **Llena el formulario:**
   - Nombre: Tu nombre
   - Email: tu@email.com
   - Talla: Elige una (S, M, L, XL, XXL)
   - Equipos excluidos: (opcional) máximo 3
3. **Click en "Pagar"**
4. **En Stripe usa esta tarjeta de prueba:**
   - **Número:** `4242 4242 4242 4242`
   - **Fecha:** `12/34` (cualquier fecha futura)
   - **CVC:** `123` (cualquier 3 dígitos)
   - **Código postal:** `12345`
5. **Completa el pago**
6. **Verás la página de confirmación**

---

## ✅ Verificar que funcionó

### En la Terminal 1 (Stripe webhooks):
Deberías ver:
```
--> checkout.session.completed [evt_xxx]
<-- [200] POST http://localhost:4321/api/webhook [evt_xxx]
```

### En Supabase:
1. Ve a: https://supabase.com/dashboard
2. Tu proyecto → Table Editor → tabla `orders`
3. Deberías ver tu pedido con status `paid`

### En Stripe Dashboard:
- https://dashboard.stripe.com/test/payments
- Deberías ver el pago exitoso

---

## 🛑 Detener los servidores

Cuando termines de trabajar:

1. En **Terminal 1** (webhooks): presiona `Ctrl + C`
2. En **Terminal 2** (dev server): presiona `Ctrl + C`

---

## ⚡ Comandos rápidos

```bash
# Verificar configuración
npm run test:stripe

# Limpiar puertos ocupados (si hay error de puerto)
lsof -ti:4321 | xargs kill -9
lsof -ti:4322 | xargs kill -9

# Ver logs de Stripe en tiempo real
stripe events list --limit 10

# Ver últimas sesiones de checkout
stripe checkout sessions list --limit 5
```

---

## 🐛 Problemas comunes

### "Port 4321 is already in use"
```bash
lsof -ti:4321 | xargs kill -9
```
Luego reinicia `npm run dev`

### "Webhook signature verification failed"
Verifica que el `STRIPE_WEBHOOK_SECRET` en `.env` coincida con el que muestra `stripe listen`

### "Cannot connect to localhost:4321"
Asegúrate que `npm run dev` esté corriendo y que veas el mensaje "ready in XXX ms"

---

## 📝 Notas importantes

- **Siempre** necesitas las 2 terminales corriendo simultáneamente
- **NO cierres** las terminales mientras estés probando
- Si cambias algo en `.env`, reinicia el servidor (`Ctrl+C` y `npm run dev` nuevamente)
- Las tarjetas de prueba SOLO funcionan en modo test

---

¡Listo para empezar! 🎉
