import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables de Supabase en .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkOrders() {
  console.log('🔍 Verificando órdenes en Supabase...\n');

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('❌ Error al consultar órdenes:', error.message);
    return;
  }

  if (!data || data.length === 0) {
    console.log('⚠️  No hay órdenes en la base de datos');
    return;
  }

  console.log(`✅ Encontradas ${data.length} órdenes:\n`);

  data.forEach((order, index) => {
    console.log(`📦 Orden ${index + 1}:`);
    console.log(`   ID: ${order.id}`);
    console.log(`   Cliente: ${order.customer_name} (${order.customer_email})`);
    console.log(`   Producto: ${order.product_id}`);
    console.log(`   Talla: ${order.size}`);
    console.log(`   Total: $${order.total_clp.toLocaleString('es-CL')}`);
    console.log(`   Estado: ${order.status}`);
    console.log(`   Método de pago: ${order.payment_method}`);
    console.log(`   Fecha: ${new Date(order.created_at).toLocaleString('es-CL')}`);
    if (order.excluded_teams && order.excluded_teams.length > 0) {
      console.log(`   Equipos excluidos: ${order.excluded_teams.join(', ')}`);
    }
    console.log('');
  });
}

checkOrders();
