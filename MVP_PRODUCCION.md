# 🚀 Checklist MVP Producción - CamisetaBox

## Estado actual: ✅ Funcional en desarrollo

**Lo que YA funciona:**
- ✅ Frontend completo (landing + checkout)
- ✅ Integración Stripe (test mode)
- ✅ Webhooks funcionando
- ✅ Base de datos Supabase
- ✅ Panel admin completo
- ✅ Órdenes guardándose correctamente

---

## 📋 Para pasar a producción

### 1. 🏦 Pagos - Stripe (CRÍTICO)

#### A. Activar cuenta de Stripe
**Estado:** ⚠️ Pendiente

**Pasos:**
1. Ve a: https://dashboard.stripe.com/settings/account
2. Completa el formulario:
   - Tipo de negocio: Individual o Empresa
   - Información de la empresa
   - Representante legal
   - RUT de la empresa
   - Datos bancarios para recibir pagos

**Documentos necesarios:**
- ✅ RUT empresa o RUT personal
- ✅ Datos bancarios (cuenta corriente o cuenta vista)
- ✅ Dirección comercial
- ✅ Identificación del representante (cédula)

**Tiempo estimado:** 1-3 días hábiles para aprobación

#### B. Obtener claves LIVE de Stripe
**Estado:** ⚠️ Pendiente

Una vez activada la cuenta:
1. Ve a: https://dashboard.stripe.com/apikeys
2. Copia las claves LIVE:
   - `sk_live_...` (Secret key)
   - `pk_live_...` (Publishable key)

3. Actualiza tu `.env` de producción:
```env
STRIPE_SECRET_KEY=sk_live_TU_CLAVE_AQUI
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_TU_CLAVE_AQUI
```

#### C. Configurar webhook de producción
**Estado:** ⚠️ Pendiente

1. Ve a: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. URL: `https://camisetabox.cl/api/webhook`
4. Eventos a escuchar:
   - `checkout.session.completed` ✅ (crítico)
   - `payment_intent.succeeded` (opcional)
   - `charge.succeeded` (opcional)
5. Copia el "Signing secret" (whsec_...)
6. Actualiza `.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_TU_SECRET_DE_PRODUCCION
```

**Comisiones de Stripe en Chile:**
- 3.6% + $150 CLP por transacción exitosa
- Sin costo mensual
- Pagos llegan a tu banco en 2-7 días

---

### 2. 📦 Envíos (CRÍTICO)

Necesitas decidir e implementar cómo vas a enviar las cajas.

#### Opción A: Chilexpress (Recomendado)
**Pros:**
- ✅ Cobertura nacional
- ✅ API para generar órdenes
- ✅ Tracking automático
- ✅ Retiro en domicilio

**Implementación:**
1. Crear cuenta empresa: https://www.chilexpress.cl/empresas
2. Solicitar credenciales API
3. Integrar API en tu backend

**Costo aproximado:**
- Santiago: $3.500 - $5.000
- Regiones: $6.000 - $9.000
- Seguro incluido hasta $50.000

**Código a agregar:**
```typescript
// src/lib/chilexpress.ts
export async function createShipment(order: Order) {
  // API de Chilexpress para crear envío
  // Retorna número de tracking
}
```

#### Opción B: Correos de Chile
**Pros:**
- ✅ Más económico
- ✅ Cobertura nacional

**Contras:**
- ⚠️ Más lento
- ⚠️ Sin API robusta
- ⚠️ Tracking limitado

**Costo aproximado:**
- Santiago: $2.500 - $3.500
- Regiones: $4.000 - $6.000

#### Opción C: Manual (más simple para empezar)
**Para MVP inicial:**
1. Cliente completa compra
2. Tú recibes notificación
3. Coordinas envío manualmente
4. Actualizas tracking en el admin

**Pros:**
- ✅ Sin integración técnica
- ✅ Empiezas rápido
- ✅ Flexible

**Contras:**
- ⚠️ Trabajo manual
- ⚠️ No escala

#### 🎯 Recomendación para MVP:
**Empezar con envío manual** y migrar a Chilexpress cuando tengas >10 órdenes/semana.

---

### 3. 🏠 Hosting (CRÍTICO)

Tienes dos opciones:

#### Opción A: Vercel (Recomendado) ⭐
**Pros:**
- ✅ Deploy automático desde GitHub
- ✅ SSL gratis
- ✅ CDN global
- ✅ Astro soportado nativamente
- ✅ 100% compatible con tu código actual

**Pasos:**
1. Conecta tu repo a Vercel: https://vercel.com/new
2. Configura variables de entorno
3. Deploy automático

**Costo:** GRATIS (hasta 100GB bandwidth/mes)

#### Opción B: Hostinger (Ya tienes cuenta)
**Pros:**
- ✅ Ya tienes cuenta
- ✅ Dominio configurado

**Contras:**
- ⚠️ Necesitas compilar y subir archivos estáticos
- ⚠️ API routes necesitan workaround

**Recomendación:** Usar Vercel para el sitio dinámico

---

### 4. 🌐 Dominio y DNS

**Estado:** ✅ Dominio comprado (camisetabox.cl)
**Estado:** ✅ Cloudflare configurado

**Pasos finales:**
1. En Cloudflare, apuntar dominio a Vercel:
   - Tipo: `CNAME`
   - Nombre: `@`
   - Contenido: `cname.vercel-dns.com`

2. En Vercel, agregar dominio:
   - Settings → Domains
   - Agregar: `camisetabox.cl`
   - Agregar: `www.camisetabox.cl`

---

### 5. 📧 Emails de confirmación (IMPORTANTE)

Los clientes DEBEN recibir confirmación por email.

#### Opción A: Resend (Recomendado)
**Pros:**
- ✅ Simple de implementar
- ✅ 3.000 emails gratis/mes
- ✅ Templates bonitos

**Pasos:**
1. Crear cuenta: https://resend.com
2. Verificar dominio (camisetabox.cl)
3. Obtener API key
4. Agregar a `.env`:
```env
RESEND_API_KEY=re_tu_api_key
```

5. Implementar en webhook:
```typescript
// En src/pages/api/webhook.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Después de crear la orden:
await resend.emails.send({
  from: 'pedidos@camisetabox.cl',
  to: order.customer_email,
  subject: '¡Pedido confirmado! #' + order.id.slice(0, 8),
  html: `<h1>Gracias por tu compra</h1>...`
});
```

#### Opción B: SendGrid
Similar a Resend, también tiene plan gratis.

---

### 6. 🔐 Seguridad y Cumplimiento Legal (OBLIGATORIO)

#### A. Términos y Condiciones
**Estado:** ⚠️ Falta crear

**Debe incluir:**
- Política de devoluciones (30 días recomendado)
- Garantía de producto original
- Tiempo de envío (3-5 días hábiles)
- Responsabilidad sobre equipos excluidos
- Política de cambios (solo por producto defectuoso)

**Plantilla base:** Buscar en internet "términos y condiciones e-commerce Chile SERNAC"

Crear archivo: `/src/pages/terminos.astro`

#### B. Política de Privacidad
**Estado:** ⚠️ Falta crear

**Debe incluir:**
- Qué datos recopilas (email, nombre, dirección)
- Para qué los usas (procesar pedidos, envíos)
- Con quién los compartes (Stripe, courier)
- Cómo los proteges (encriptación, Supabase)
- Derechos del usuario (acceso, corrección, eliminación)

Crear archivo: `/src/pages/privacidad.astro`

#### C. SSL (Certificado HTTPS)
**Estado:** ✅ Automático con Vercel/Cloudflare

#### D. Formulario de contacto
**Estado:** ⚠️ Falta crear

Necesitas un email de contacto para SERNAC:
- `contacto@camisetabox.cl`
- Configurar en Resend o Gmail Workspace

---

### 7. 🎨 Detalles finales del sitio

#### A. Agregar dirección de envío en checkout
**Estado:** ⚠️ Falta implementar

Actualmente el formulario NO pide dirección. Necesitas:
1. Agregar campos al `CheckoutForm.tsx`:
   - Calle y número
   - Comuna
   - Ciudad
   - Región
   - Código postal

2. Enviar en metadata de Stripe

3. Guardar en Supabase

#### B. Imágenes de productos
**Estado:** ⚠️ Falta agregar

Necesitas fotos atractivas de:
- Cajas cerradas
- Camisetas de ejemplo (sin mostrar cuál específicamente)
- Proceso de unboxing

#### C. Favicon y metadata SEO
**Estado:** ⚠️ Falta optimizar

```astro
// En Layout.astro
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<meta name="description" content="Mystery box de camisetas de fútbol originales en Chile. Elige tu talla y recibe una sorpresa." />
<meta property="og:image" content="/og-image.jpg" />
```

---

### 8. 🔔 Notificaciones (IMPORTANTE)

#### A. Notificación a TI cuando llega orden
**Estado:** ⚠️ Falta implementar

Opciones:
1. **Email:** Enviar copia a `admin@camisetabox.cl`
2. **WhatsApp:** Usar API de WhatsApp Business
3. **Telegram:** Bot de notificaciones (más simple)

**Recomendación:** Email + Telegram

```typescript
// En webhook, después de crear orden:
await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chat_id: TU_CHAT_ID,
    text: `🎉 Nueva orden: ${order.customer_name} - ${order.product_id} - $${order.total_clp}`
  })
});
```

---

### 9. 📊 Analytics (Opcional pero recomendado)

#### Google Analytics 4
1. Crear propiedad: https://analytics.google.com
2. Obtener Measurement ID (G-XXXXXXXXXX)
3. Agregar a `.env`:
```env
PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```
4. Agregar script en `Layout.astro`

---

### 10. 🧪 Testing final antes de lanzar

**Checklist de pruebas:**

- [ ] Compra exitosa con tarjeta test
- [ ] Webhook crea orden en Supabase
- [ ] Email de confirmación llega al cliente
- [ ] Orden aparece en admin panel
- [ ] Puedes actualizar estado de orden
- [ ] Puedes agregar tracking number
- [ ] Responsive funciona en mobile
- [ ] Todos los links funcionan
- [ ] Términos y privacidad creados
- [ ] Formulario pide dirección completa
- [ ] SSL activo (https)

---

## 📅 Plan de implementación sugerido

### Semana 1: Lo mínimo para operar
**Prioridad ALTA:**
1. ✅ Activar cuenta Stripe → Obtener claves LIVE
2. ✅ Agregar campos de dirección en checkout
3. ✅ Deploy a Vercel
4. ✅ Configurar webhook de producción
5. ✅ Email de confirmación con Resend
6. ✅ Términos y Condiciones + Privacidad
7. ✅ Probar compra end-to-end en producción

**Con esto puedes empezar a vender:**
- ✅ Clientes pueden comprar
- ✅ Recibes el pago
- ✅ Te llega notificación
- ✅ Haces envío manual
- ✅ Actualizas tracking en admin

### Semana 2-3: Optimización
**Prioridad MEDIA:**
1. Integración Chilexpress API
2. Imágenes de productos profesionales
3. Google Analytics
4. Notificaciones Telegram/WhatsApp
5. Optimización SEO
6. Testing exhaustivo

### Mes 2+: Escalamiento
**Prioridad BAJA:**
1. Integración Flow (pagos chilenos)
2. Sistema de referidos
3. Suscripción mensual
4. App móvil (futuro)

---

## 💰 Costos mensuales estimados

### Fase MVP (0-50 órdenes/mes):
- Stripe: 0% fijo + 3.6% por transacción ≈ **$0 base**
- Vercel: **GRATIS**
- Supabase: **GRATIS** (hasta 500MB)
- Resend: **GRATIS** (hasta 3000 emails)
- Dominio: **Pagado anual** (~$15.000/año)
- Cloudflare: **GRATIS**

**Total mensual fijo: ~$0 + comisiones por venta**

Por cada venta de $30.000:
- Stripe: $1.230 (3.6% + $150)
- Envío: $3.500 - $6.000
- Costo producto: Tu margen

### Fase crecimiento (50-200 órdenes/mes):
- Mismo stack, sigue siendo gratis
- Solo pagas comisiones proporcionales

---

## 🚨 Lo MÁS CRÍTICO para producción

**No puedes lanzar sin esto:**

1. ✅ **Stripe en modo LIVE** con cuenta activada
2. ✅ **Webhook de producción** configurado
3. ✅ **Términos y Condiciones** + Privacidad
4. ✅ **Email de confirmación** funcionando
5. ✅ **Dirección de envío** en el formulario
6. ✅ **Deploy en producción** (Vercel)
7. ✅ **SSL activo** (HTTPS)

**Todo lo demás puede ir mejorándose después del lanzamiento.**

---

## ✅ Checklist final antes de lanzar

```
PAGOS:
[ ] Cuenta Stripe activada (verificación completa)
[ ] Claves LIVE obtenidas y configuradas en .env
[ ] Webhook producción configurado y probado
[ ] Compra de prueba exitosa en producción

ENVÍOS:
[ ] Método de envío definido (manual/Chilexpress)
[ ] Costos de envío calculados
[ ] Dirección completa en formulario de checkout

HOSTING:
[ ] Deploy en Vercel exitoso
[ ] Dominio apuntando correctamente
[ ] SSL funcionando (https)
[ ] Variables de entorno configuradas

EMAILS:
[ ] Resend configurado con dominio verificado
[ ] Email de confirmación funcionando
[ ] Email de notificación a admin funcionando

LEGAL:
[ ] Términos y Condiciones publicados
[ ] Política de Privacidad publicada
[ ] Email de contacto funcionando

TESTING:
[ ] Compra completa end-to-end en producción
[ ] Email de confirmación llega
[ ] Orden aparece en admin
[ ] Responsive en mobile probado
[ ] Todos los links funcionan

CONTENIDO:
[ ] Imágenes de productos (mínimo placeholders)
[ ] Favicon configurado
[ ] Meta tags SEO configurados
```

---

## 📞 Siguiente paso AHORA MISMO

**Lo primero que debes hacer:**

1. **Activar cuenta Stripe:**
   → https://dashboard.stripe.com/settings/account
   → Completar formulario de activación
   → Tiempo: 15-20 minutos + 1-3 días aprobación

2. **Mientras esperas aprobación de Stripe:**
   → Crear términos y condiciones
   → Agregar campos de dirección en checkout
   → Tomar/buscar fotos de productos
   → Configurar cuenta Resend para emails

¿Quieres que te ayude con alguna de estas tareas ahora?
