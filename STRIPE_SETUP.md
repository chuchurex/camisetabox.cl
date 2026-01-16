# Guía de Configuración de Stripe - CamisetaBox

## ✅ Lo que ya está hecho

He configurado todo el código necesario para integrar Stripe:

1. **API Routes creadas:**
   - `/api/create-checkout-session` - Crea sesiones de pago
   - `/api/webhook` - Recibe confirmaciones de pago de Stripe

2. **Páginas creadas:**
   - `/checkout/[productId]` - Formulario de checkout
   - `/success` - Confirmación de compra exitosa

3. **Componentes:**
   - `CheckoutForm.tsx` - Formulario React interactivo

4. **Configuración:**
   - Astro configurado en modo `hybrid` para soportar API routes

---

## 🔧 Pasos para completar la configuración

### 1. Obtener credenciales de Stripe

Ve a tu dashboard de Stripe y obtén las siguientes claves:

**Modo TEST (para pruebas):**
- Dashboard: https://dashboard.stripe.com/test/apikeys
- `STRIPE_SECRET_KEY` → Clave secreta de test (sk_test_...)
- `PUBLIC_STRIPE_PUBLISHABLE_KEY` → Clave publicable de test (pk_test_...)

**Modo LIVE (producción - NO usar aún):**
- Dashboard: https://dashboard.stripe.com/apikeys
- `STRIPE_SECRET_KEY` → Clave secreta live (sk_live_...)
- `PUBLIC_STRIPE_PUBLISHABLE_KEY` → Clave publicable live (pk_live_...)

### 2. Actualizar archivo .env

Edita el archivo `.env` y agrega tus claves de Stripe TEST:

```env
# STRIPE - International Payments
STRIPE_SECRET_KEY=sk_test_TU_CLAVE_AQUI
STRIPE_WEBHOOK_SECRET=whsec_TU_WEBHOOK_SECRET_AQUI
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_TU_CLAVE_AQUI
```

### 3. Crear tabla en Supabase

Ve a tu proyecto en Supabase (https://supabase.com/dashboard) y ejecuta este SQL:

```sql
-- Crear tabla de órdenes
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address JSONB DEFAULT '{}',
  product_id TEXT NOT NULL,
  size TEXT NOT NULL CHECK (size IN ('S', 'M', 'L', 'XL', 'XXL')),
  excluded_teams TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('stripe', 'flow')),
  payment_id TEXT,
  total_clp INTEGER NOT NULL,
  tracking_number TEXT,
  notes TEXT
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- Políticas de seguridad (RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Permitir inserciones desde el servidor (service role)
CREATE POLICY "Service role can insert orders" ON orders
  FOR INSERT TO service_role
  WITH CHECK (true);

-- Permitir lectura a usuarios autenticados (para futuro panel admin)
CREATE POLICY "Authenticated users can read orders" ON orders
  FOR SELECT TO authenticated
  USING (true);
```

### 4. Configurar Webhook en Stripe

Para recibir confirmaciones de pago automáticamente:

#### OPCIÓN A: Webhook local (para desarrollo)

1. Instala Stripe CLI:
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. Inicia sesión:
   ```bash
   stripe login
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. En otra terminal, reenvía eventos de webhook:
   ```bash
   stripe listen --forward-to localhost:4321/api/webhook
   ```

5. Copia el webhook secret que aparece (`whsec_...`) y agrégalo a tu `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_tu_secret_de_webhook_local
   ```

#### OPCIÓN B: Webhook en producción

1. Ve a: https://dashboard.stripe.com/test/webhooks
2. Click en "Add endpoint"
3. URL del endpoint: `https://camisetabox.cl/api/webhook`
4. Selecciona evento: `checkout.session.completed`
5. Copia el "Signing secret" y actualiza `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_tu_secret_de_webhook
   ```

### 5. Probar la integración

1. Inicia el servidor:
   ```bash
   npm run dev
   ```

2. Abre: http://localhost:4321

3. Haz click en "Comprar" en cualquier producto

4. Completa el formulario

5. Usa una tarjeta de prueba de Stripe:
   - Número: `4242 4242 4242 4242`
   - Fecha: cualquier fecha futura
   - CVC: cualquier 3 dígitos
   - Código postal: cualquier código

6. Completa el pago

7. Verifica que:
   - Fuiste redirigido a `/success`
   - Se creó una orden en tu tabla de Supabase
   - Recibiste un email de confirmación de Stripe

---

## 🧪 Tarjetas de prueba de Stripe

### Tarjetas exitosas:
- `4242 4242 4242 4242` - Visa (éxito)
- `5555 5555 5555 4444` - Mastercard (éxito)

### Tarjetas que fallan:
- `4000 0000 0000 0002` - Tarjeta rechazada
- `4000 0000 0000 9995` - Fondos insuficientes

Más tarjetas de prueba: https://stripe.com/docs/testing

---

## 📊 Monitoreo

### Ver pagos en Stripe:
- Pagos test: https://dashboard.stripe.com/test/payments
- Sesiones de checkout: https://dashboard.stripe.com/test/checkout/sessions
- Eventos de webhook: https://dashboard.stripe.com/test/webhooks

### Ver órdenes en Supabase:
1. Ve a tu proyecto: https://supabase.com/dashboard
2. Table Editor → `orders`

---

## 🚀 Pasar a producción

Cuando estés listo para aceptar pagos reales:

1. Completa la activación de tu cuenta Stripe:
   - Ve a: https://dashboard.stripe.com/settings/account
   - Completa los datos de tu empresa
   - Verifica tu identidad
   - Conecta tu cuenta bancaria

2. Obtén las claves LIVE:
   - https://dashboard.stripe.com/apikeys
   - Actualiza `.env` con las claves `sk_live_...` y `pk_live_...`

3. Crea un nuevo webhook para producción:
   - URL: `https://camisetabox.cl/api/webhook`
   - Evento: `checkout.session.completed`

4. Actualiza `STRIPE_WEBHOOK_SECRET` con el nuevo secret

---

## ⚠️ Seguridad

- ✅ NUNCA commitees el archivo `.env` a git
- ✅ Las claves `sk_live_` son SECRETAS, nunca las compartas
- ✅ Solo las claves `pk_` pueden exponerse en el frontend
- ✅ Los webhooks validan la firma de Stripe para seguridad
- ✅ Supabase usa service role solo en el servidor

---

## 🆘 Solución de problemas

### Error: "Webhook signature verification failed"
- Verifica que `STRIPE_WEBHOOK_SECRET` esté correctamente configurado
- Si usas `stripe listen`, asegúrate que esté corriendo
- El secret del webhook local (`whsec_...`) es diferente al de producción

### Error: "Failed to create order in Supabase"
- Verifica que la tabla `orders` exista
- Revisa que `SUPABASE_SERVICE_ROLE_KEY` esté configurado
- Chequea los logs de Supabase para ver el error específico

### No se redirige a Stripe Checkout
- Abre la consola del navegador (F12) y busca errores
- Verifica que `PUBLIC_STRIPE_PUBLISHABLE_KEY` esté configurado
- Revisa la respuesta del endpoint `/api/create-checkout-session`

### El webhook no se ejecuta
- Verifica que `stripe listen` esté corriendo (desarrollo)
- En producción, revisa los logs de webhook en Stripe dashboard
- Asegúrate que la URL del webhook sea accesible públicamente

---

## 📝 Próximos pasos

1. **Emails de confirmación**: Configurar envío de emails con Resend o SendGrid
2. **Panel admin**: Crear dashboard para gestionar órdenes
3. **Integración Flow**: Agregar método de pago chileno
4. **Tracking de envíos**: Integrar con Chilexpress/Correos

---

## 📞 Soporte

- Documentación Stripe: https://stripe.com/docs
- Documentación Supabase: https://supabase.com/docs
- Stripe CLI: https://stripe.com/docs/stripe-cli

¡Todo listo para empezar a recibir pagos! 🎉
