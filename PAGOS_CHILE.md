# 💳 Soluciones de Pago para CamisetaBox en Chile

## ⚠️ Problema: Stripe no está disponible en Chile

Stripe solo opera en 46 países, y Chile **NO** está incluido. En Sudamérica solo está disponible en **Brasil**.

---

## ✅ Opciones REALES para Chile (2026)

### Opción 1: Flow (Recomendado para Chile) ⭐

**La solución MÁS USADA en Chile para e-commerce.**

#### Ventajas:
- ✅ 100% chileno, pensado para Chile
- ✅ Acepta todas las tarjetas chilenas
- ✅ Integración con Webpay Plus
- ✅ Acepta pagos con tarjetas internacionales
- ✅ Transferencia bancaria
- ✅ Cuotas sin interés disponibles
- ✅ API bien documentada
- ✅ Pago en CLP directo

#### Comisiones:
- **3.49% + IVA** por transacción con tarjeta
- **1.49% + IVA** por transferencia bancaria
- Sin costo mensual
- Pagos llegan en 2-7 días hábiles

#### Cómo empezar:
1. Registrarse: https://www.flow.cl/
2. Completar datos de la empresa
3. Verificación bancaria (1-3 días)
4. Obtener credenciales API

**Requisitos:**
- RUT (persona o empresa)
- Cuenta bancaria chilena
- Email y teléfono

---

### Opción 2: Transbank Webpay Plus

**La solución "oficial" de los bancos chilenos.**

#### Ventajas:
- ✅ Máxima confianza (logo de Transbank)
- ✅ Acepta todas las tarjetas chilenas
- ✅ Cuotas con y sin interés
- ✅ Redcompra (débito)

#### Desventajas:
- ⚠️ Proceso más burocrático
- ⚠️ Requiere ser empresa formal
- ⚠️ Integración más compleja

#### Comisiones:
- Variable según banco y volumen
- Aprox 3-4% + IVA
- Puede tener costo mensual ($10.000 - $30.000)

#### Cómo empezar:
1. Contactar tu banco
2. Solicitar Webpay Plus
3. Proceso de aprobación (1-2 semanas)

---

### Opción 3: MercadoPago

**La solución de MercadoLibre.**

#### Ventajas:
- ✅ Fácil de implementar
- ✅ Acepta tarjetas chilenas e internacionales
- ✅ Link de pago rápido
- ✅ Checkout embebido

#### Comisiones:
- **4.99% + $100** por transacción
- Más caro que Flow, pero más simple

#### Cómo empezar:
1. Crear cuenta: https://www.mercadopago.cl/
2. Verificar identidad
3. Obtener credenciales API

---

### Opción 4: Stripe + LLC USA (Avanzado)

**Solo si planeas escalar internacionalmente.**

#### Ventajas:
- ✅ Acepta pagos internacionales
- ✅ Mejor para ventas globales
- ✅ Tecnología superior

#### Desventajas:
- ⚠️ Costo de crear LLC: ~$500 USD
- ⚠️ Impuestos en USA
- ⚠️ Cuenta bancaria USA necesaria
- ⚠️ Más complejo

#### Proceso:
1. Crear LLC en USA (Stripe Atlas: $500)
2. Obtener EIN
3. Cuenta bancaria USA (Mercury, Wise)
4. Registrar Stripe
5. Transferir fondos a Chile

**Solo vale la pena si:**
- Vendes principalmente al extranjero
- Facturas >$10M CLP/mes
- Quieres aceptar múltiples monedas

---

## 🎯 Mi Recomendación para CamisetaBox

### Para empezar (MVP):

**Opción ideal: FLOW**

**Por qué:**
1. ✅ Activación rápida (1-3 días)
2. ✅ Comisiones competitivas
3. ✅ API fácil de integrar
4. ✅ Acepta tarjetas chilenas e internacionales
5. ✅ Perfecto para tu volumen inicial
6. ✅ Sin costos fijos

### Plan de implementación:

**Semana 1:**
- ✅ Registrarse en Flow
- ✅ Integrar API de Flow (reemplaza código de Stripe)
- ✅ Agregar dirección al checkout
- ✅ Emails de confirmación

**Semana 2-3:**
- ✅ Pruebas
- ✅ Deploy a producción
- ✅ Primeras ventas

---

## 💻 Cambios técnicos necesarios

Tu código actual usa Stripe. Para cambiar a Flow:

### Archivos a modificar:
1. `src/lib/stripe.ts` → Cambiar a `src/lib/flow.ts`
2. `src/pages/api/create-checkout-session.ts` → Adaptar a API de Flow
3. `src/pages/api/webhook.ts` → Webhook de Flow
4. Variables de entorno

### Código nuevo para Flow:

```typescript
// src/lib/flow.ts
export async function createPayment(order: {
  amount: number;
  email: string;
  subject: string;
}) {
  const response = await fetch('https://www.flow.cl/api/payment/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      apiKey: process.env.FLOW_API_KEY,
      commerceOrder: order.commerceOrder,
      subject: order.subject,
      amount: order.amount,
      email: order.email,
      urlConfirmation: 'https://camisetabox.cl/api/flow-webhook',
      urlReturn: 'https://camisetabox.cl/success',
    }),
  });

  return response.json();
}
```

**Buenas noticias:** La arquitectura que ya creamos funciona igual, solo cambiamos el proveedor de pagos.

---

## 📊 Comparación rápida

| Proveedor | Comisión | Activación | Tarjetas | Internacional | Recomendado |
|-----------|----------|------------|----------|---------------|-------------|
| **Flow** | 3.49% + IVA | 1-3 días | ✅ Todas | ✅ Sí | ⭐⭐⭐⭐⭐ |
| Webpay | 3-4% + IVA | 1-2 semanas | ✅ Todas | ❌ Solo Chile | ⭐⭐⭐⭐ |
| MercadoPago | 4.99% + $100 | Inmediato | ✅ Todas | ✅ Sí | ⭐⭐⭐ |
| Stripe + LLC | 3.6% + $150 | 2-4 semanas | ✅ Todas | ✅ Sí | ⭐⭐ |

---

## 🚀 Próximos pasos INMEDIATOS

### Opción A: Ir con Flow (Recomendado)

1. **HOY:** Registrarse en Flow (15 minutos)
   → https://www.flow.cl/

2. **Mañana:** Mientras esperas aprobación, adapto el código para Flow (2-3 horas)

3. **Día 3-4:** Flow aprobado, configurar API

4. **Día 5:** Pruebas y lanzamiento

### Opción B: Webpay Plus (Más tradicional)

1. **HOY:** Contactar tu banco
2. **Esperar:** 1-2 semanas de trámites
3. **Luego:** Integrar API de Webpay

---

## 🎯 ¿Qué hacemos?

Te recomiendo **FLOW** porque:
- ✅ Es el estándar en Chile para startups
- ✅ Activación rápida
- ✅ Comisiones justas
- ✅ API moderna (similar a Stripe)
- ✅ Todos tus competidores lo usan

**¿Quieres que adapte el código de Stripe a Flow?**

Puedo:
1. Crear la integración con Flow
2. Mantener la misma experiencia de usuario
3. Mismo panel admin
4. Misma base de datos
5. Solo cambia el procesador de pagos

**Tiempo estimado:** 2-3 horas de trabajo

---

## 📞 Contactos útiles

- **Flow:** contacto@flow.cl / https://www.flow.cl/
- **Webpay:** Tu banco / https://www.transbankdevelopers.cl/
- **MercadoPago:** https://www.mercadopago.cl/developers

---

**IMPORTANTE:** Todo el trabajo que ya hicimos NO se pierde. Solo cambias el proveedor de pagos, el resto sigue igual.

