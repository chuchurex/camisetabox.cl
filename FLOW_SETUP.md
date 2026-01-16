# Configuración de Flow para CamisetaBox

Flow es el procesador de pagos preferido para clientes chilenos. Este documento explica cómo configurar Flow para tu proyecto.

## ¿Por qué Flow?

- **Comisión competitiva**: 3.49% + IVA
- **Mejor experiencia para chilenos**: Acepta WebPay, Servipag, Multicaja, OnePay, etc.
- **Sin conversión de moneda**: Trabaja directo en CLP
- **Pagos recurrentes**: Soporte para suscripciones futuras

## Crear cuenta en Flow

1. **Registro**: Ve a https://www.flow.cl y crea una cuenta
2. **Completar información de empresa**:
   - RUT de la empresa
   - Datos bancarios para recibir pagos
   - Información de contacto
3. **Verificación**: Flow verificará tu información (puede tomar 1-2 días)

## Obtener credenciales API

### Modo Sandbox (Desarrollo)

1. Inicia sesión en https://sandbox.flow.cl/app/web/panel.php
2. Ve a **"Mis datos" → "API"**
3. Copia:
   - **API Key** (apiKey)
   - **Secret Key** (secretKey)

### Modo Producción

1. Inicia sesión en https://www.flow.cl/app/web/panel.php
2. Ve a **"Mis datos" → "API"**
3. Copia las mismas credenciales

## Configurar variables de entorno

Edita tu archivo `.env`:

```env
# Flow - Pagos Chile
FLOW_API_KEY=tu_api_key_aqui
FLOW_SECRET_KEY=tu_secret_key_aqui
PUBLIC_FLOW_MODE=sandbox  # Cambiar a "live" en producción
```

## Configurar webhooks en Flow

Los webhooks permiten que Flow notifique a tu servidor cuando un pago se completa.

### URL del Webhook

Tu webhook debe ser accesible públicamente. Opciones:

**Desarrollo local (con ngrok):**
```bash
ngrok http 4321
# Usar URL generada: https://xxxxx.ngrok.io/api/flow-webhook
```

**Producción:**
```
https://camisetabox.cl/api/flow-webhook
```

### Configurar en Flow Panel

1. Ve a **"Integraciones" → "Configuración de URLs"**
2. **URL de Confirmación**: `https://camisetabox.cl/api/flow-webhook`
3. **URL de Retorno**: `https://camisetabox.cl/api/flow-return`
4. Guarda los cambios

## Flujo de pago con Flow

```
1. Usuario completa formulario de checkout
   ↓
2. Frontend envía solicitud a /api/create-flow-payment
   ↓
3. Backend crea orden en Flow con metadata
   ↓
4. Flow retorna URL de pago con token
   ↓
5. Usuario es redirigido a Flow para pagar
   ↓
6. Flow procesa el pago
   ↓
7. Flow notifica webhook (/api/flow-webhook)
   ↓
8. Webhook verifica firma HMAC
   ↓
9. Si pago exitoso, crear orden en Supabase
   ↓
10. Usuario es redirigido a /success
```

## Seguridad: Verificación de firma HMAC

Flow usa HMAC SHA256 para firmar todos los webhooks. Nuestra implementación:

1. Extrae todos los parámetros excepto `s` (firma)
2. Ordena parámetros alfabéticamente
3. Concatena: `key1value1key2value2...`
4. Genera HMAC SHA256 con `FLOW_SECRET_KEY`
5. Compara con firma recibida

**Importante**: NUNCA procesar un webhook si la firma no coincide.

## Metadata en Flow

Flow permite enviar metadata en el campo `optional` (JSON string):

```javascript
{
  productId: 'box-premium',
  size: 'L',
  excludedTeams: ['colo-colo', 'u-chile'],
  customerName: 'Juan Pérez',
  customerPhone: '+56912345678',
  customerEmail: 'juan@example.com'
}
```

Esta metadata se recupera en el webhook para crear la orden en Supabase.

## Probar integración

### Datos de prueba (Sandbox)

Flow proporciona tarjetas de prueba:

- **Éxito**: 4051 8856 0000 0002
- **Rechazo**: 4051 8842 3343 7535
- **CVV**: cualquier 3 dígitos
- **Fecha**: cualquier fecha futura

### Proceso de prueba

1. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

2. Si usas ngrok, inícialo en otra terminal:
   ```bash
   ngrok http 4321
   ```

3. Actualiza las URLs en Flow con la URL de ngrok

4. Realiza una compra de prueba en tu sitio

5. Verifica en Flow Dashboard que la transacción aparece

6. Verifica en Supabase que la orden se creó

## Diferencias Sandbox vs Producción

| Aspecto | Sandbox | Producción |
|---------|---------|------------|
| URL API | sandbox.flow.cl/api | www.flow.cl/api |
| Panel | sandbox.flow.cl/app/web/panel.php | www.flow.cl/app/web/panel.php |
| Credenciales | Diferentes | Diferentes |
| Pagos | Solo prueba | Reales |
| Dinero | Falso | Real |

## Pasar a producción

1. **Cambiar credenciales**:
   ```env
   FLOW_API_KEY=credencial_produccion
   FLOW_SECRET_KEY=credencial_produccion
   PUBLIC_FLOW_MODE=live
   ```

2. **Actualizar webhooks** en el panel de Flow producción:
   - URL Confirmación: `https://camisetabox.cl/api/flow-webhook`
   - URL Retorno: `https://camisetabox.cl/api/flow-return`

3. **Probar con tarjeta real** (monto pequeño)

4. **Verificar** que orden se crea en Supabase

5. **Solicitar reembolso** de la prueba en Flow Panel

## Monitoreo y logs

### Ver transacciones en Flow

Panel Flow → **"Transacciones"** → Ver lista completa

### Logs del servidor

Los webhooks registran eventos importantes:

```javascript
console.log('Order created successfully:', data);
console.error('Invalid Flow webhook signature');
console.error('Error creating order in Supabase:', error);
```

Revisa logs en:
- **Vercel**: Dashboard → Project → Logs
- **Local**: Terminal donde corre `npm run dev`

## Troubleshooting

### Webhook no llega

1. Verifica que URL webhook sea accesible públicamente
2. Confirma configuración en Flow Panel
3. Revisa logs de Flow para ver intentos de webhook

### Firma inválida

1. Verifica que `FLOW_SECRET_KEY` sea correcta
2. Confirma que todos los parámetros se incluyen en firma
3. Revisa orden alfabético de parámetros

### Orden duplicada

El código ya previene duplicados verificando `payment_id` antes de crear orden.

### Pago exitoso pero orden no se crea

1. Revisa logs del servidor
2. Verifica credenciales de Supabase
3. Confirma permisos en tabla `orders`

## Recursos adicionales

- **Documentación Flow**: https://www.flow.cl/docs/api.html
- **Panel Sandbox**: https://sandbox.flow.cl/app/web/panel.php
- **Panel Producción**: https://www.flow.cl/app/web/panel.php
- **Soporte Flow**: soporte@flow.cl

## Checklist de integración

- [ ] Cuenta Flow creada y verificada
- [ ] Credenciales API obtenidas
- [ ] Variables de entorno configuradas
- [ ] URLs webhook configuradas en Flow
- [ ] Prueba exitosa en sandbox
- [ ] Orden creada en Supabase tras pago
- [ ] Email de confirmación enviado
- [ ] Credenciales producción configuradas
- [ ] Prueba en producción exitosa
- [ ] Monitoreo activo de transacciones

## Próximos pasos

Una vez Flow esté funcionando:

1. Configurar emails de confirmación con Resend
2. Agregar tracking de envíos
3. Implementar programa de referidos
4. Considerar suscripciones mensuales con Flow
