# 🏦 Guía Rápida: Activar Stripe para Producción

## 📋 Checklist de activación

### Paso 1: Activar cuenta (HOY)
⏱️ Tiempo: 15-20 minutos
🕐 Espera: 1-3 días hábiles para aprobación

**Link:** https://dashboard.stripe.com/settings/account

**Información que necesitas tener a mano:**
- ✅ RUT (personal o empresa)
- ✅ Dirección completa
- ✅ Teléfono
- ✅ Datos bancarios:
  - Nombre del banco
  - Tipo de cuenta (corriente o vista)
  - Número de cuenta
  - RUT del titular
- ✅ Descripción del negocio
- ✅ Sitio web: camisetabox.cl

**Documentos que pueden pedir:**
- Foto de cédula de identidad
- Iniciación de actividades (si tienes)
- Comprobante de domicilio

---

### Paso 2: Obtener claves LIVE (Cuando te aprueben)
⏱️ Tiempo: 2 minutos

**Link:** https://dashboard.stripe.com/apikeys

**Verás dos claves:**

1. **Publishable key** (pública)
   - Empieza con: `pk_live_...`
   - Ya está visible

2. **Secret key** (secreta)
   - Empieza con: `sk_live_...`
   - Click en "Reveal live key token"
   - ⚠️ **IMPORTANTE:** Cópiala inmediatamente, solo se muestra una vez

**Guarda estas claves en un lugar seguro.**

---

### Paso 3: Configurar webhook de producción
⏱️ Tiempo: 3 minutos

**Link:** https://dashboard.stripe.com/webhooks

1. Click en **"Add endpoint"** (o "+ Añadir endpoint")

2. **Endpoint URL:** `https://camisetabox.cl/api/webhook`

3. **Events to send:** Selecciona estos eventos:
   - ✅ `checkout.session.completed` ← **CRÍTICO**
   - ✅ `payment_intent.succeeded` (opcional)
   - ✅ `charge.succeeded` (opcional)

4. Click en **"Add endpoint"**

5. **Copia el "Signing secret":**
   - Verás algo como: `whsec_abc123...`
   - Este es tu `STRIPE_WEBHOOK_SECRET` de producción

---

### Paso 4: Actualizar variables de entorno
⏱️ Tiempo: 2 minutos

Edita tu archivo `.env` y reemplaza las claves de test con las de producción:

```env
# ANTES (test):
STRIPE_SECRET_KEY=sk_test_51Sq2jK...
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51Sq2jK...
STRIPE_WEBHOOK_SECRET=whsec_2e09350e...

# DESPUÉS (live):
STRIPE_SECRET_KEY=sk_live_TU_CLAVE_SECRETA_AQUI
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_TU_CLAVE_PUBLICA_AQUI
STRIPE_WEBHOOK_SECRET=whsec_TU_WEBHOOK_SECRET_PRODUCCION
```

---

### Paso 5: Verificar configuración
⏱️ Tiempo: 30 segundos

Ejecuta el script de verificación:

```bash
./scripts/verify-production-keys.sh
```

Deberías ver:
```
✅ Secret Key: LIVE MODE
✅ Publishable Key: LIVE MODE
✅ Webhook Secret: CONFIGURADO
🎉 TODO LISTO PARA PRODUCCIÓN
```

---

## 🎯 Resumen visual

```
┌─────────────────────────────────────┐
│ 1. Activar cuenta Stripe           │
│    ↓ (esperar 1-3 días)            │
│ 2. Obtener claves LIVE              │
│    ↓                                │
│ 3. Crear webhook producción         │
│    ↓                                │
│ 4. Actualizar .env                  │
│    ↓                                │
│ 5. Verificar con script             │
│    ↓                                │
│ ✅ Listo para deploy                │
└─────────────────────────────────────┘
```

---

## ⚠️ Importante: Diferencias TEST vs LIVE

| Aspecto | Test Mode | Live Mode |
|---------|-----------|-----------|
| Claves | `sk_test_...` / `pk_test_...` | `sk_live_...` / `pk_live_...` |
| Dinero | Falso, no hay movimiento real | Real, se cobra a la tarjeta |
| Tarjetas | Solo tarjetas test (4242...) | Tarjetas reales |
| Webhooks | URL local (localhost) | URL producción (https://tu-sitio.com) |
| Dashboard | https://dashboard.stripe.com/test | https://dashboard.stripe.com |

---

## 🧪 Probar en producción (cuando todo esté listo)

**⚠️ CUIDADO:** En live mode se hacen cargos REALES.

Para probar sin cobrar de verdad, puedes:

1. **Hacer una compra tú mismo** con tu tarjeta
2. **Inmediatamente hacer refund** desde el dashboard de Stripe
3. El dinero vuelve a tu tarjeta en 5-10 días

O mejor aún:

1. Mantén test mode hasta estar 100% seguro
2. Haz todas las pruebas en test
3. Solo cambia a live cuando estés listo para vender

---

## 💰 Comisiones de Stripe (Chile)

- **Por transacción exitosa:** 3.6% + $150 CLP
- **Sin costos fijos mensuales**
- **Sin costos de instalación**
- **Pagos llegan a tu banco en:** 2-7 días hábiles

**Ejemplo:**
- Venta de $30.000
- Comisión Stripe: $1.230 (3.6% + $150)
- Recibes en tu banco: $28.770

---

## 🆘 Problemas comunes

### "Mi cuenta no se activa"
- Verifica que todos los datos estén completos
- Asegúrate que la cuenta bancaria esté a tu nombre
- Revisa tu email, Stripe puede pedir documentos adicionales

### "No veo las claves live"
- Primero debes activar tu cuenta
- Las claves live solo aparecen después de la aprobación

### "El webhook no funciona"
- Asegúrate que la URL sea HTTPS (no HTTP)
- Verifica que el endpoint sea exactamente: `/api/webhook`
- URL completa: `https://camisetabox.cl/api/webhook`

### "Las comisiones son muy altas"
- Es el estándar en Chile para pagos online
- No hay alternativas más baratas con la misma facilidad
- Flow (chileno) tiene comisiones similares: 3.49% + IVA

---

## 📞 Soporte

- **Stripe Chile:** Desde el dashboard → Help
- **Documentación:** https://stripe.com/docs
- **Estado de Stripe:** https://status.stripe.com

---

## ✅ Cuando termines esta guía

Deberías tener:
- ✅ Cuenta Stripe activada
- ✅ Claves LIVE copiadas y guardadas
- ✅ Webhook de producción creado
- ✅ Variables de entorno actualizadas
- ✅ Script de verificación pasando

**Siguiente paso:**
→ Configurar emails con Resend
→ Agregar campos de dirección al checkout
→ Deploy a Vercel

Ver: `MVP_PRODUCCION.md` para el plan completo
