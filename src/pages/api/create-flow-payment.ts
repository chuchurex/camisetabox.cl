import type { APIRoute } from 'astro';
import { createFlowPayment } from '../../lib/flow';
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

    // Generar orden única
    const commerceOrder = `CB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Crear metadata como JSON string
    const metadata = JSON.stringify({
      productId,
      size,
      excludedTeams: excludedTeams || [],
      customerName,
      customerPhone: customerPhone || '',
    });

    // Crear pago en Flow
    const flowPayment = await createFlowPayment({
      commerceOrder,
      subject: `${product.name} - Talla ${size}`,
      amount: product.price_clp,
      email: customerEmail,
      urlConfirmation: `${request.headers.get('origin')}/api/flow-webhook`,
      urlReturn: `${request.headers.get('origin')}/api/flow-return`,
      optional: metadata,
    });

    if (flowPayment.url && flowPayment.token) {
      return new Response(
        JSON.stringify({
          url: `${flowPayment.url}?token=${flowPayment.token}`,
          token: flowPayment.token,
          flowOrder: flowPayment.flowOrder,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      throw new Error('Error al crear pago en Flow');
    }
  } catch (error: any) {
    console.error('Error creating Flow payment:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error al crear pago' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
