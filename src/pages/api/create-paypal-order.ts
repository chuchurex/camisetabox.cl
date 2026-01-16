import type { APIRoute } from 'astro';
import { createPayPalOrder, convertCLPtoUSD } from '../../lib/paypal';
import { products } from '../../lib/supabase';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { productId, size, excludedTeams, customerEmail, customerName, customerPhone } = body;

    // Validar datos requeridos
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

    // Convertir CLP a USD para PayPal
    const amountUSD = convertCLPtoUSD(product.price_clp);

    // Crear orden en PayPal
    const paypalOrder = await createPayPalOrder({
      amount: product.price_clp,
      currency: 'USD',
      description: `${product.name} - Talla ${size}`,
      metadata: {
        productId,
        size,
        excludedTeams: excludedTeams || [],
        customerName,
        customerEmail,
        customerPhone: customerPhone || '',
        originalAmountCLP: product.price_clp,
      },
    });

    if (paypalOrder.id) {
      return new Response(
        JSON.stringify({
          orderId: paypalOrder.id,
          approvalUrl: paypalOrder.links?.find((link: any) => link.rel === 'approve')?.href,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      throw new Error('Error al crear orden de PayPal');
    }
  } catch (error: any) {
    console.error('Error creating PayPal order:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error al crear orden de pago' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
