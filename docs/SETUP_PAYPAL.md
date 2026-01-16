# 💳 Configuración de PayPal para CamisetaBox

## 🎯 Por qué PayPal

PayPal funciona **inmediatamente** en Chile y acepta:
- ✅ Tarjetas de crédito/débito (sin necesidad de cuenta PayPal)
- ✅ Cuentas PayPal
- ✅ Pagos internacionales
- ✅ Conversión de monedas automática

**Comisión:** 5.4% + $0.30 USD por transacción (un poco más alto que otras opciones, pero instantáneo)

---

## 📋 Paso 1: Crear cuenta PayPal Business (10 minutos)

### A. Registrarse

1. Ve a: https://www.paypal.com/cl/business
2. Click en "Registrarse gratis"
3. Selecciona **"Cuenta Business"**

### B. Completar información

- **Email:** tu email (será tu login)
- **Contraseña:** crea una segura
- **Nombre del negocio:** CamisetaBox
- **Tipo de negocio:** Individual / Pequeña empresa
- **RUT:** Tu RUT personal o de empresa
- **Dirección:** Tu dirección
- **Teléfono:** Tu número

### C. Verificar cuenta

1. PayPal enviará un email de confirmación
2. Click en el link para verificar
3. Completa información bancaria (para recibir dinero)
   - Banco
   - Tipo de cuenta
   - Número de cuenta
   - RUT del titular

---

## 📋 Paso 2: Obtener credenciales API (5 minutos)

### A. Ir al Developer Portal

1. Ve a: https://developer.paypal.com/dashboard
2. Login con tu cuenta PayPal Business
3. Verás el **Developer Dashboard**

### B. Crear App

1. En el menú, ve a **"Apps & Credentials"**
2. Asegúrate de estar en modo **"Sandbox"** (para pruebas)
3. Click en **"Create App"**
4. Nombre de la app: `CamisetaBox`
5. Click **"Create App"**

### C. Copiar credenciales SANDBOX

Verás dos claves:

1. **Client ID (Sandbox)**
   - Empieza con algo como: `AXxxx...`
   - Esta es pública

2. **Secret (Sandbox)**
   - Click en "Show" para verla
   - Empieza con: `EXxxx...`
   - Esta es secreta

**Guárdalas en un lugar seguro**

---

## 📋 Paso 3: Configurar variables de entorno (2 minutos)

Edita tu archivo `.env` y agrega las credenciales:

```env
# PAYPAL - International Payments
PUBLIC_PAYPAL_CLIENT_ID=AXxxx_TU_CLIENT_ID_SANDBOX
PAYPAL_CLIENT_SECRET=EXxxx_TU_SECRET_SANDBOX
PUBLIC_PAYPAL_MODE=sandbox
```

---

## 📋 Paso 4: Probar en modo Sandbox (5 minutos)

### A. Reiniciar el servidor

```bash
# Detener el servidor actual (Ctrl+C)
npm run dev
```

### B. Crear cuenta de prueba

1. Ve a: https://developer.paypal.com/dashboard/accounts
2. En "Sandbox accounts" verás 2 cuentas automáticas:
   - **Personal** (comprador) - para simular compras
   - **Business** (vendedor) - tu negocio

3. Click en la cuenta **Personal**
4. Copia el **email** y **password**

### C. Hacer compra de prueba

1. Ve a: http://localhost:4321
2. Click en "Comprar" en cualquier producto
3. Llena el formulario
4. Selecciona **"PayPal"** como método de pago
5. Click en "Pagar"
6. Serás redirigido a PayPal Sandbox
7. **Login con la cuenta Personal de prueba**
8. Completa el pago
9. Deberías volver a la página de éxito

### D. Verificar

1. Revisa tu panel admin: http://localhost:4321/admin/dashboard
2. Deberías ver la orden con estado `paid`
3. En Supabase, verás la orden guardada

---

## 📋 Paso 5: Pasar a producción (cuando estés listo)

### A. Obtener credenciales LIVE

1. En el Developer Dashboard: https://developer.paypal.com/dashboard
2. Cambia de **"Sandbox"** a **"Live"** (arriba a la derecha)
3. Si no tienes app live, crea una nueva
4. Copia las credenciales **LIVE**:
   - Client ID (Live)
   - Secret (Live)

### B. Actualizar `.env`

```env
# PAYPAL - International Payments (PRODUCTION)
PUBLIC_PAYPAL_CLIENT_ID=AXxxx_TU_CLIENT_ID_LIVE
PAYPAL_CLIENT_SECRET=EXxxx_TU_SECRET_LIVE
PUBLIC_PAYPAL_MODE=live
```

### C. Verificar cuenta business

Para recibir pagos reales, PayPal puede pedirte:
- ✅ Verificar identidad (foto de cédula)
- ✅ Verificar cuenta bancaria
- ✅ Completar información fiscal

Esto toma 1-3 días hábiles.

---

## 💰 Comisiones de PayPal en Chile

### Ventas nacionales (Chile):
- **5.4% + $0.30 USD** por transacción
- Ejemplo: Venta de $30.000 CLP ≈ $33 USD
  - Comisión: $2.08 USD ≈ $1.900 CLP
  - Recibes: ~$28.100 CLP

### Ventas internacionales:
- **4.4% + tarifa fija** (varía por país)
- Conversión de moneda: 3-4% adicional

### Retiros a cuenta bancaria:
- **GRATIS** en Chile
- Llega en 2-3 días hábiles

---

## 🔄 Flujo de pago completo

```
Usuario selecciona producto
    ↓
Llena formulario checkout
    ↓
Selecciona "PayPal"
    ↓
POST /api/create-paypal-order
    ↓
PayPal crea orden
    ↓
Usuario redirigido a PayPal
    ↓
Login en PayPal (o pago como invitado)
    ↓
Confirma pago
    ↓
PayPal procesa pago
    ↓
Redirige a /api/paypal-return?token=xxx
    ↓
Capturamos el pago
    ↓
Creamos orden en Supabase
    ↓
Redirigimos a /success
    ↓
✅ ¡Orden completada!
```

---

## 🧪 Cuentas de prueba Sandbox

PayPal te da cuentas de prueba automáticamente:

### Cuenta Business (vendedor):
- Email: `sb-business@example.com`
- Password: (ver en dashboard)
- Para recibir pagos de prueba

### Cuenta Personal (comprador):
- Email: `sb-personal@example.com`
- Password: (ver en dashboard)
- Para hacer compras de prueba

**También puedes usar tarjetas de prueba sin cuenta PayPal:**
- Número: `4111 1111 1111 1111`
- Fecha: cualquier fecha futura
- CVV: cualquier 3 dígitos

---

## 🎨 Lo que se modificó en el código

### Archivos nuevos:
1. **`src/lib/paypal.ts`** - Librería de PayPal
2. **`src/pages/api/create-paypal-order.ts`** - Crear orden
3. **`src/pages/api/paypal-return.ts`** - Capturar pago

### Archivos modificados:
1. **`src/components/CheckoutForm.tsx`** - Selector de método de pago
2. **`.env`** - Variables de PayPal

### Base de datos:
- **Sin cambios** - Usa la misma tabla `orders`
- El campo `payment_method` ahora puede ser `'paypal'`

---

## 🔐 Seguridad

✅ **OAuth 2.0:** Autenticación segura con PayPal
✅ **HTTPS:** Todo el flujo en conexión segura
✅ **No guardamos datos de tarjeta:** PayPal lo maneja todo
✅ **Secrets en servidor:** Las claves secretas nunca van al navegador

---

## 🆘 Problemas comunes

### "Error al crear orden de PayPal"
- Verifica que `PUBLIC_PAYPAL_CLIENT_ID` y `PAYPAL_CLIENT_SECRET` estén configurados
- Asegúrate de usar credenciales de Sandbox (no Live) en desarrollo

### "Payment failed"
- Verifica que la cuenta de prueba tenga fondos
- Usa la cuenta Personal de Sandbox para pagar

### "No se crea la orden en Supabase"
- Revisa los logs del servidor
- Verifica que `SUPABASE_SERVICE_ROLE_KEY` esté correcto
- Asegúrate que la tabla `orders` existe

### "La conversión CLP a USD está mal"
- Ajusta el exchange rate en `src/lib/paypal.ts`
- Actualmente usa: 900 CLP = 1 USD (aprox)

---

## 💡 Consejos

1. **Prueba TODO en Sandbox antes de Live**
   - Haz múltiples compras de prueba
   - Verifica que las órdenes se crean correctamente

2. **Conversión de moneda**
   - PayPal cobra en USD
   - La conversión es aproximada
   - Los clientes ven el monto en su moneda local

3. **Emails de confirmación**
   - PayPal envía email al comprador automáticamente
   - Tú deberías enviar tu propio email también (próximo paso)

4. **Disputa y devoluciones**
   - PayPal tiene protección al comprador
   - Responde rápido a cualquier disputa
   - Documenta todo (fotos de productos, tracking, etc.)

---

## 📊 Comparación: PayPal vs otras opciones

| Método | Activación | Comisión | Acepta en Chile |
|--------|-----------|----------|-----------------|
| **PayPal** | ✅ Inmediato | 5.4% + $0.30 | ✅ Sí |
| Flow | 1-3 días | 3.49% + IVA | ✅ Sí (solo Chile) |
| Stripe | ❌ No disponible | - | ❌ No |
| Webpay | 1-2 semanas | 3-4% + IVA | ✅ Sí (solo Chile) |

**PayPal es perfecto para:**
- ✅ Empezar RÁPIDO (hoy mismo)
- ✅ Ventas internacionales
- ✅ No quieres complicaciones técnicas

**Pero considera migrar a Flow cuando:**
- ⚠️ Vendes principalmente en Chile
- ⚠️ Quieres comisiones más bajas
- ⚠️ Tienes volumen constante (>50 ventas/mes)

---

## 🚀 Siguiente paso

Con PayPal configurado, ya puedes **vender HOY MISMO**.

**Tareas restantes para MVP:**
1. ✅ PayPal configurado (YA LISTO)
2. ⏳ Agregar campos de dirección al checkout
3. ⏳ Configurar emails de confirmación
4. ⏳ Términos y condiciones
5. ⏳ Deploy a producción

Ver: `MVP_PRODUCCION.md` para el plan completo

---

## 📞 Soporte PayPal

- **Centro de ayuda:** https://www.paypal.com/cl/smarthelp/home
- **Developer Docs:** https://developer.paypal.com/docs
- **Soporte técnico:** Desde tu cuenta Business
- **Teléfono:** 800 3737 99 (Chile)

---

¡PayPal está listo! Ahora puedes aceptar pagos desde cualquier parte del mundo 🌎
