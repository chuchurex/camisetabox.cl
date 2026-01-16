# ⚡ PayPal - Inicio Rápido (15 minutos)

## 🎯 Objetivo: Vender HOY MISMO con PayPal

---

## ✅ Paso 1: Crear cuenta PayPal Business (5 min)

1. Ve a: **https://www.paypal.com/cl/business**
2. Click "Registrarse gratis"
3. Completa el formulario:
   - Email
   - Contraseña
   - Nombre: CamisetaBox
   - RUT
   - Dirección
4. Verifica email

---

## ✅ Paso 2: Obtener credenciales API (3 min)

1. Ve a: **https://developer.paypal.com/dashboard**
2. Login con tu cuenta
3. Ve a **"Apps & Credentials"**
4. Asegúrate de estar en **"Sandbox"** (arriba a la derecha)
5. Click **"Create App"** → Nombre: `CamisetaBox`
6. Copia estas 2 claves:
   - **Client ID:** `AXxxx...`
   - **Secret:** Click "Show" → `EXxxx...`

---

## ✅ Paso 3: Configurar en tu .env (1 min)

Edita `/Users/chuchurex/Sites/prod/camisetabox.cl/.env`:

```env
# PAYPAL - International Payments
PUBLIC_PAYPAL_CLIENT_ID=AXxxx_TU_CLIENT_ID_AQUI
PAYPAL_CLIENT_SECRET=EXxxx_TU_SECRET_AQUI
PUBLIC_PAYPAL_MODE=sandbox
```

---

## ✅ Paso 4: Probar (5 min)

### A. Reiniciar servidor

```bash
# En tu terminal donde corre npm run dev:
# Presiona Ctrl+C para detener
npm run dev
```

### B. Hacer compra de prueba

1. Abre: **http://localhost:4321**
2. Click en "Comprar"
3. Llena el formulario
4. Selecciona **"PayPal"**
5. Click "Pagar"

### C. Pagar en PayPal Sandbox

Serás redirigido a PayPal. Usa una de estas opciones:

**Opción A: Cuenta de prueba**
- Ve a: https://developer.paypal.com/dashboard/accounts
- Copia email y password de la cuenta "Personal"
- Úsalos para login en PayPal

**Opción B: Pagar como invitado con tarjeta**
- Número: `4111 1111 1111 1111`
- Fecha: `12/30`
- CVV: `123`

### D. Verificar

¿Viste la página de "¡Compra exitosa!"? ✅

Revisa el admin: **http://localhost:4321/admin/dashboard**

---

## 🎉 ¡LISTO! Ya puedes vender

Ahora solo necesitas:

### Para producción (cuando estés listo):

1. **Obtener claves LIVE:**
   - En PayPal Dashboard, cambia de "Sandbox" a "Live"
   - Copia las nuevas credenciales
   - Actualiza tu `.env` con las claves live

2. **Verificar cuenta:**
   - PayPal puede pedir foto de cédula
   - Verificar cuenta bancaria
   - Toma 1-3 días

---

## 💰 Comisiones

**PayPal:** 5.4% + $0.30 USD por venta

Ejemplo de venta de $30.000 CLP:
- PayPal cobra: ~$1.900 CLP
- Recibes: ~$28.100 CLP

---

## 📚 Documentación completa

Ver: `docs/SETUP_PAYPAL.md` para más detalles

---

## 🚀 Próximos pasos

1. ✅ PayPal funcionando
2. ⏳ Agregar dirección de envío al checkout
3. ⏳ Configurar Flow (pagos chilenos, comisión más baja)
4. ⏳ Deploy a producción

---

**¿Todo funcionó?** ¡Perfecto! Ya tienes pagos configurados. 🎊
