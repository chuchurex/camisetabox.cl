import type { APIRoute } from 'astro';
import { stripe } from '../../lib/stripe';
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

    // Crear sesión de Checkout en Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'clp',
            product_data: {
              name: product.name,
              description: `${product.description} - Talla: ${size}`,
            },
            unit_amount: product.price_clp,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${request.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/checkout/${productId}`,
      customer_email: customerEmail,
      metadata: {
        productId,
        size,
        excludedTeams: excludedTeams ? JSON.stringify(excludedTeams) : '[]',
        customerName,
        customerPhone: customerPhone || '',
      },
    });

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error al crear sesión de pago' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
