-- ============================================================================
-- CamisetaBox - Supabase Database Schema
-- ============================================================================
-- Este archivo contiene todo el schema necesario para CamisetaBox
-- Ejecutar en: https://supabase.com/dashboard → SQL Editor
-- ============================================================================

-- ----------------------------------------------------------------------------
-- TABLA: orders (Pedidos)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Información del cliente
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,

  -- Dirección de envío (JSONB para flexibilidad)
  shipping_address JSONB DEFAULT '{}'::jsonb,

  -- Producto y configuración
  product_id TEXT NOT NULL,
  size TEXT NOT NULL CHECK (size IN ('S', 'M', 'L', 'XL', 'XXL')),
  excluded_teams TEXT[] DEFAULT '{}',

  -- Estado del pedido
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled')),

  -- Información de pago
  payment_method TEXT NOT NULL CHECK (payment_method IN ('stripe', 'flow')),
  payment_id TEXT,
  total_clp INTEGER NOT NULL CHECK (total_clp > 0),

  -- Envío y tracking
  tracking_number TEXT,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,

  -- Notas adicionales
  notes TEXT,
  admin_notes TEXT
);

-- Comentarios de tabla
COMMENT ON TABLE orders IS 'Pedidos de mystery boxes';
COMMENT ON COLUMN orders.shipping_address IS 'JSON: {street, city, region, postal_code, country}';
COMMENT ON COLUMN orders.excluded_teams IS 'Array de equipos que el cliente no quiere recibir (máx 3)';
COMMENT ON COLUMN orders.status IS 'pending: creado, paid: pagado, processing: preparando, shipped: enviado, delivered: entregado, cancelled: cancelado';

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON orders(payment_id);
CREATE INDEX IF NOT EXISTS idx_orders_tracking ON orders(tracking_number);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) - Políticas de seguridad
-- ----------------------------------------------------------------------------
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Permitir al service role (backend) hacer todo
CREATE POLICY "Service role can do everything on orders" ON orders
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Permitir a usuarios autenticados leer todas las órdenes (para panel admin)
CREATE POLICY "Authenticated users can read all orders" ON orders
  FOR SELECT
  TO authenticated
  USING (true);

-- Permitir a usuarios autenticados actualizar órdenes (para panel admin)
CREATE POLICY "Authenticated users can update orders" ON orders
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- TABLA: customers (Clientes) - Para fase futura
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Información básica
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,

  -- Direcciones guardadas (array de JSONB)
  addresses JSONB[] DEFAULT '{}',

  -- Estadísticas
  orders_count INTEGER DEFAULT 0,
  total_spent_clp INTEGER DEFAULT 0,

  -- Preferencias
  favorite_size TEXT CHECK (favorite_size IN ('S', 'M', 'L', 'XL', 'XXL')),
  default_excluded_teams TEXT[] DEFAULT '{}',

  -- Marketing
  accepts_marketing BOOLEAN DEFAULT true,
  referral_code TEXT UNIQUE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_referral ON customers(referral_code);

-- RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can do everything on customers" ON customers
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read customers" ON customers
  FOR SELECT
  TO authenticated
  USING (true);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- TABLA: inventory (Inventario) - Para cuando tengas stock físico
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Información de la camiseta
  team TEXT NOT NULL,
  league TEXT NOT NULL,
  season TEXT NOT NULL, -- ej: "2023-24", "2024-25"
  size TEXT NOT NULL CHECK (size IN ('S', 'M', 'L', 'XL', 'XXL')),
  condition TEXT DEFAULT 'new' CHECK (condition IN ('new', 'excellent', 'good')),

  -- Precio y costo
  cost_clp INTEGER NOT NULL CHECK (cost_clp > 0),

  -- Estado
  status TEXT NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'reserved', 'sold', 'damaged')),

  -- Relación con orden
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  sold_at TIMESTAMP WITH TIME ZONE,

  -- Información adicional
  supplier TEXT,
  purchase_date DATE,
  notes TEXT,

  -- Imágenes (URLs de Supabase Storage)
  image_urls TEXT[] DEFAULT '{}'
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);
CREATE INDEX IF NOT EXISTS idx_inventory_team ON inventory(team);
CREATE INDEX IF NOT EXISTS idx_inventory_size ON inventory(size);
CREATE INDEX IF NOT EXISTS idx_inventory_order ON inventory(order_id);

-- RLS
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can do everything on inventory" ON inventory
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read inventory" ON inventory
  FOR SELECT
  TO authenticated
  USING (true);

-- Trigger
DROP TRIGGER IF EXISTS update_inventory_updated_at ON inventory;
CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- VISTAS ÚTILES
-- ----------------------------------------------------------------------------

-- Vista: Órdenes con detalles de producto
CREATE OR REPLACE VIEW orders_with_product AS
SELECT
  o.*,
  CASE o.product_id
    WHEN 'box-basica' THEN 'Caja Básica'
    WHEN 'box-estandar' THEN 'Caja Estándar'
    WHEN 'box-chilena' THEN 'Caja Chilena'
    WHEN 'box-premium' THEN 'Caja Premium'
    WHEN 'box-elite' THEN 'Caja Élite'
    ELSE 'Desconocido'
  END as product_name,
  CASE o.product_id
    WHEN 'box-basica' THEN 29990
    WHEN 'box-estandar' THEN 39990
    WHEN 'box-chilena' THEN 44990
    WHEN 'box-premium' THEN 59990
    WHEN 'box-elite' THEN 89990
    ELSE 0
  END as product_price_clp
FROM orders o;

-- Vista: Estadísticas de ventas
CREATE OR REPLACE VIEW sales_stats AS
SELECT
  COUNT(*) as total_orders,
  COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_orders,
  COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped_orders,
  COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
  SUM(CASE WHEN status IN ('paid', 'processing', 'shipped', 'delivered') THEN total_clp ELSE 0 END) as total_revenue_clp,
  AVG(CASE WHEN status IN ('paid', 'processing', 'shipped', 'delivered') THEN total_clp ELSE NULL END) as avg_order_value_clp
FROM orders;

-- ----------------------------------------------------------------------------
-- FUNCIONES ÚTILES
-- ----------------------------------------------------------------------------

-- Función: Obtener estadísticas de un período
CREATE OR REPLACE FUNCTION get_stats_by_period(
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
  total_orders BIGINT,
  total_revenue BIGINT,
  avg_order_value NUMERIC,
  top_product TEXT,
  top_size TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_orders,
    COALESCE(SUM(o.total_clp), 0)::BIGINT as total_revenue,
    COALESCE(AVG(o.total_clp), 0)::NUMERIC as avg_order_value,
    (SELECT product_id FROM orders WHERE created_at BETWEEN start_date AND end_date
     GROUP BY product_id ORDER BY COUNT(*) DESC LIMIT 1) as top_product,
    (SELECT size FROM orders WHERE created_at BETWEEN start_date AND end_date
     GROUP BY size ORDER BY COUNT(*) DESC LIMIT 1) as top_size
  FROM orders o
  WHERE o.created_at BETWEEN start_date AND end_date
    AND o.status IN ('paid', 'processing', 'shipped', 'delivered');
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- DATOS INICIALES (opcional)
-- ----------------------------------------------------------------------------

-- Puedes descomentar esto para crear una orden de ejemplo
/*
INSERT INTO orders (
  customer_email,
  customer_name,
  customer_phone,
  product_id,
  size,
  status,
  payment_method,
  payment_id,
  total_clp
) VALUES (
  'ejemplo@test.com',
  'Cliente de Prueba',
  '+56912345678',
  'box-premium',
  'L',
  'paid',
  'stripe',
  'pi_test_123456',
  59990
);
*/

-- ============================================================================
-- FIN DEL SCHEMA
-- ============================================================================

-- Para verificar que todo se creó correctamente:
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('orders', 'customers', 'inventory')
ORDER BY table_name;
