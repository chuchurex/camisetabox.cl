# CamisetaBox - Configuración del proyecto

## Descripción del proyecto

CamisetaBox (camisetabox.cl) es una plataforma de e-commerce para venta de mystery boxes con camisetas de fútbol originales en Chile.

## Stack tecnológico

- **Frontend:** Astro + React
- **Backend:** Supabase (auth, database, storage)
- **Pagos:** Stripe (internacional) + Flow (Chile)
- **Hosting:** Vercel
- **Estilos:** Tailwind CSS

## Estructura del proyecto

```
camisetabox/
├── src/
│   ├── components/     # Componentes React reutilizables
│   ├── layouts/        # Layouts de Astro
│   ├── pages/          # Páginas del sitio
│   ├── lib/            # Utilidades y configuración
│   │   ├── supabase.ts
│   │   ├── stripe.ts
│   │   └── flow.ts
│   └── styles/         # Estilos globales
├── public/             # Assets estáticos
├── supabase/           # Migraciones y configuración de Supabase
└── docs/               # Documentación del proyecto
```

## Productos

| ID | Nombre | Precio CLP | Descripción |
|----|--------|------------|-------------|
| box-basica | Caja Básica | 29990 | Camiseta liga variable |
| box-estandar | Caja Estándar | 39990 | Camiseta ligas principales |
| box-chilena | Caja Chilena | 44990 | Camiseta Campeonato Nacional |
| box-premium | Caja Premium | 59990 | Camiseta equipos top europeos |
| box-elite | Caja Élite | 89990 | Edición especial o retro |

## Base de datos (Supabase)

### Tablas principales

```sql
-- Pedidos
orders (
  id uuid primary key,
  created_at timestamp,
  customer_email text,
  customer_name text,
  customer_phone text,
  shipping_address jsonb,
  product_id text,
  size text, -- S, M, L, XL, XXL
  excluded_teams text[], -- equipos a excluir
  status text, -- pending, paid, processing, shipped, delivered
  payment_method text, -- stripe, flow
  payment_id text,
  total_clp integer,
  tracking_number text,
  notes text
)

-- Inventario (para fase con stock)
inventory (
  id uuid primary key,
  team text,
  league text,
  season text,
  size text,
  cost_clp integer,
  status text, -- available, reserved, sold
  order_id uuid references orders(id),
  created_at timestamp
)

-- Clientes
customers (
  id uuid primary key,
  email text unique,
  name text,
  phone text,
  addresses jsonb[],
  orders_count integer default 0,
  created_at timestamp
)
```

## Variables de entorno

```env
# Supabase
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Flow (Chile)
FLOW_API_KEY=
FLOW_SECRET_KEY=

# General
PUBLIC_SITE_URL=https://camisetabox.cl
```

## Funcionalidades MVP

### Fase 1 - Landing + Checkout
- [ ] Landing page con productos
- [ ] Selector de talla
- [ ] Selector de equipos a excluir (máx 3)
- [ ] Checkout con Stripe
- [ ] Confirmación por email
- [ ] Panel admin básico para ver pedidos

### Fase 2 - Operación
- [ ] Integración Flow para pagos chilenos
- [ ] Sistema de tracking de envíos
- [ ] Notificaciones por WhatsApp
- [ ] Gestión de inventario

### Fase 3 - Crecimiento
- [ ] Cuentas de usuario
- [ ] Historial de pedidos
- [ ] Programa de referidos
- [ ] Suscripción mensual

## Comandos útiles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Preview
npm run preview

# Supabase local
supabase start
supabase db reset
```

## Diseño

### Colores
- Primary: #1a1a2e (azul oscuro)
- Accent: #e94560 (rojo vibrante)
- Background: #0f0f1a
- Text: #ffffff

### Tipografía
- Headings: Inter (bold)
- Body: Inter (regular)

## Contacto

- **Desarrollo:** carlos@chuchurex.cl
- **Dominio:** camisetabox.cl
- **Marca INAPI:** En trámite (desde 16/01/2026)

## Notas importantes

1. No publicar en redes sociales hasta tener marca registrada o en trámite
2. Todas las camisetas deben ser 100% originales con documentación
3. Cumplir normativa SERNAC en términos y condiciones
4. Mantener margen mínimo de 20% por producto
