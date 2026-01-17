import type { APIRoute } from 'astro';
import { createMercadoPagoPreference } from '../../lib/mercadopago';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { customerEmail, customerName, customerPhone, amount } = body;

    // Validar datos mínimos
    if (!customerEmail || !customerName) {
      return new Response(
        JSON.stringify({ error: 'Faltan datos requeridos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Usar 1 peso como monto de prueba por defecto
    const testAmount = amount || 1;

    // Crear metadata del pedido de prueba
    const orderMetadata = {
      is_test: true,
      product_name: 'Caja de Prueba',
      size: 'M',
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone || '',
    };

    // Crear preferencia en Mercado Pago
    const preference = await createMercadoPagoPreference({
      title: `🧪 Test CamisetaBox - ${customerName}`,
      quantity: 1,
      unit_price: testAmount,
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
      external_reference: `test-${Date.now()}`,
      notification_url: `${import.meta.env.PUBLIC_SITE_URL}/api/mercadopago-webhook`,
      metadata: orderMetadata,
    });

    return new Response(
      JSON.stringify({
        id: preference.id,
        init_point: preference.init_point,
        sandbox_init_point: preference.sandbox_init_point,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error creating test payment:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error al crear el pago de prueba' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
