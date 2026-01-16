import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { stripe } from '../../lib/stripe';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

// Crear cliente de Supabase con service role para operaciones del servidor
const supabaseAdmin = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY
);

export const POST: APIRoute = async ({ request }) => {
  const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET no está configurado');
    return new Response('Webhook secret not configured', { status: 500 });
  }

  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return new Response('No signature', { status: 400 });
    }

    // Verificar firma del webhook
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    // Manejar evento de checkout completado
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      // Extraer metadata
      const metadata = session.metadata;
      if (!metadata) {
        console.error('No metadata in session');
        return new Response('No metadata', { status: 400 });
      }

      const { productId, size, excludedTeams, customerName, customerPhone } = metadata;

      // Crear orden en Supabase
      const { data, error } = await supabaseAdmin
        .from('orders')
        .insert({
          customer_email: session.customer_email || session.customer_details?.email,
          customer_name: customerName,
          customer_phone: customerPhone || '',
          product_id: productId,
          size: size,
          excluded_teams: excludedTeams ? JSON.parse(excludedTeams) : [],
          status: 'paid',
          payment_method: 'stripe',
          payment_id: session.payment_intent as string,
          total_clp: session.amount_total || 0,
          // shipping_address se completará cuando agregues el formulario de dirección
          shipping_address: {},
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating order in Supabase:', error);
        return new Response('Database error', { status: 500 });
      }

      console.log('Order created successfully:', data);

      // Aquí podrías enviar email de confirmación
      // await sendConfirmationEmail(data);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Webhook error:', error.message);
    return new Response(`Webhook Error: ${error.message}`, { status: 400 });
  }
};
