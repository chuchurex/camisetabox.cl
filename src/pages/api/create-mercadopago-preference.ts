import type { APIRoute } from 'astro';
import { createMercadoPagoPreference } from '../../lib/mercadopago';
import { products } from '../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { productId, size, excludedTeams, customerEmail, customerName, customerPhone } = body;

    // Validar datos
    if (!productId || !size || !customerEmail || !customerName) {
      return new Response(
        JSON.stringify({ error: 'Faltan datos requeridos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Buscar producto
    const product = products.find(p => p.id === productId);
    if (!product) {
      return new Response(
        JSON.stringify({ error: 'Producto no encontrado' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Crear metadata del pedido
    const orderMetadata = {
      product_id: productId,
      product_name: product.name,
      size,
      excluded_teams: excludedTeams || [],
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone || '',
    };

    // Crear preferencia en Mercado Pago
    const preference = await createMercadoPagoPreference({
      title: `${product.name} - Talla ${size}`,
      quantity: 1,
      unit_price: product.price_clp,
      currency_id: 'CLP',
      payer: {
        name: customerName,
        email: customerEmail,
        ...(customerPhone && {
          phone: {
            number: customerPhone,
          },
        }),
      },
      external_reference: `order-${Date.now()}`,
      notification_url: `${import.meta.env.PUBLIC_SITE_URL}/api/mercadopago-webhook`,
      metadata: orderMetadata,
    });

    return new Response(
      JSON.stringify({
        id: preference.id,
        init_point: preference.init_point, // URL para checkout
        sandbox_init_point: preference.sandbox_init_point,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error creating Mercado Pago preference:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error al crear preferencia de pago' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
