# Deploy CamisetaBox a Vercel

## Pasos para deployment

### 1. Conectar GitHub con Vercel

1. Ve a https://vercel.com/
2. Haz clic en **"Add New"** → **"Project"**
3. Selecciona **"Import Git Repository"**
4. Busca y selecciona el repositorio: **`chuchurex/camisetabox.cl`**
5. Haz clic en **"Import"**

### 2. Configurar el proyecto

En la página de configuración:

**Framework Preset**: Astro (debería detectarse automáticamente)

**Build Command**: `npm run build` (default)

**Output Directory**: `dist` (default)

**Install Command**: `npm install` (default)

### 3. Configurar variables de entorno

Haz clic en **"Environment Variables"** y agrega las siguientes:

#### Supabase
```
PUBLIC_SUPABASE_URL=[copiar de .env]
PUBLIC_SUPABASE_ANON_KEY=[copiar de .env]
SUPABASE_SERVICE_ROLE_KEY=[copiar de .env]
```

#### Stripe
```
STRIPE_SECRET_KEY=[copiar de .env]
STRIPE_WEBHOOK_SECRET=[copiar de .env]
PUBLIC_STRIPE_PUBLISHABLE_KEY=[copiar de .env]
```

**Nota**: Las credenciales reales están en tu archivo `.env` local. Cópialas de ahí.

#### Flow (cuando tengas las credenciales)
```
FLOW_API_KEY=[tu_api_key]
FLOW_SECRET_KEY=[tu_secret_key]
PUBLIC_FLOW_MODE=sandbox
```

#### PayPal (cuando tengas las credenciales)
```
PUBLIC_PAYPAL_CLIENT_ID=[tu_client_id]
PAYPAL_CLIENT_SECRET=[tu_secret]
PUBLIC_PAYPAL_MODE=sandbox
```

#### General
```
PUBLIC_SITE_URL=https://camisetabox.cl
```

### 4. Deploy

1. Haz clic en **"Deploy"**
2. Espera a que termine el build (2-3 minutos)
3. Una vez completado, Vercel te dará una URL tipo: `https://camisetabox-xxx.vercel.app`

### 5. Configurar dominio custom

1. En el dashboard del proyecto en Vercel, ve a **"Settings"** → **"Domains"**
2. Agrega el dominio: `camisetabox.cl`
3. Vercel te dará registros DNS para configurar

#### Configurar DNS en Cloudflare:

Vercel te mostrará algo como:

```
Type: CNAME
Name: camisetabox.cl (o @)
Value: cname.vercel-dns.com
```

**Agregar en Cloudflare:**

1. Ve a https://dash.cloudflare.com/
2. Selecciona el dominio `camisetabox.cl`
3. Ve a **"DNS"** → **"Records"**
4. **IMPORTANTE**: Primero elimina cualquier registro A o CNAME existente para `@` o `camisetabox.cl`
5. Agrega el registro CNAME que Vercel te indicó
6. **Proxy Status**: Desactiva el proxy (nube gris) para el CNAME principal durante la verificación
7. Guarda los cambios

#### Para www (opcional):

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 6. Verificar dominio

1. Espera 5-10 minutos para que DNS propague
2. Vercel verificará automáticamente el dominio
3. Una vez verificado, el sitio estará disponible en `https://camisetabox.cl`

### 7. Configurar webhooks de Flow

Una vez que el sitio esté en producción:

1. Ve al panel de Flow: https://sandbox.flow.cl/app/web/panel.php (o producción)
2. **Integraciones** → **"Configuración de URLs"**
3. **URL de Confirmación**: `https://camisetabox.cl/api/flow-webhook`
4. **URL de Retorno**: `https://camisetabox.cl/api/flow-return`
5. Guarda los cambios

### 8. Pruebas

1. Visita `https://camisetabox.cl`
2. Intenta hacer una compra de prueba
3. Verifica que llegues a la página de éxito
4. Revisa en Supabase que la orden se haya creado

## Troubleshooting

### Build falla

- Verifica que todas las variables de entorno estén configuradas
- Revisa los logs del build en Vercel
- Asegúrate de que `@astrojs/vercel` esté en `package.json`

### Dominio no verifica

- Espera más tiempo (puede tomar hasta 48 horas, pero normalmente 5-10 minutos)
- Verifica que el CNAME esté correcto en Cloudflare
- Asegúrate de que el proxy esté desactivado temporalmente

### Webhooks no funcionan

- Verifica que las URLs estén correctas en Flow
- Revisa los logs de funciones en Vercel: Dashboard → **"Logs"**
- Confirma que `FLOW_SECRET_KEY` esté correctamente configurada

### APIs no funcionan

- Verifica que todas las variables de entorno secretas estén configuradas
- Revisa los logs de funciones en Vercel
- Confirma que Supabase esté accesible

## Actualizar el sitio

Cualquier push a la rama `main` en GitHub hará que Vercel redeploy automáticamente:

```bash
git add .
git commit -m "Descripción de cambios"
git push origin main
```

Vercel detectará el push y comenzará un nuevo deployment automáticamente.

## Monitoreo

- **Vercel Dashboard**: https://vercel.com/dashboard
  - Ver logs en tiempo real
  - Métricas de performance
  - Errores de funciones serverless

- **Supabase Dashboard**: https://supabase.com/dashboard
  - Ver órdenes creadas
  - Logs de la base de datos

- **Flow Dashboard**: https://www.flow.cl/app/web/panel.php
  - Ver transacciones
  - Estado de pagos

## URLs importantes

- **Sitio**: https://camisetabox.cl
- **Repositorio**: https://github.com/chuchurex/camisetabox.cl
- **Vercel**: https://vercel.com/dashboard
- **Supabase**: https://supabase.com/dashboard
- **Flow Sandbox**: https://sandbox.flow.cl/app/web/panel.php
- **Flow Producción**: https://www.flow.cl/app/web/panel.php
