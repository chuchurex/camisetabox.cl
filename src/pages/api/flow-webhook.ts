import type { APIRoute } from 'astro';
import { getFlowPaymentStatus, verifyFlowWebhook, FLOW_STATUS, getFlowStatusName } from '../../lib/flow';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

const supabaseAdmin = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY
);

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.text();
    const params = new URLSearchParams(body);

    const token = params.get('token');
    const signature = params.get('s');

    if (!token || !signature) {
      return new Response('Missing token or signature', { status: 400 });
    }

    // Verificar firma del webhook
    const paramsObj: Record<string, any> = {};
    params.forEach((value, key) => {
      if (key !== 's') {
        paramsObj[key] = value;
      }
    });

    const isValid = verifyFlowWebhook(paramsObj, signature);

    if (!isValid) {
      console.error('Invalid Flow webhook signature');
      return new Response('Invalid signature', { status: 400 });
    }

    // Obtener estado del pago
    const paymentStatus = await getFlowPaymentStatus(token);

    // Solo procesar si el pago fue exitoso
    if (paymentStatus.status === FLOW_STATUS.PAID) {
      // Extraer metadata del optional
      let metadata: any = {};
      try {
        metadata = JSON.parse(paymentStatus.optional || '{}');
      } catch (e) {
        console.warn('Could not parse optional metadata');
      }

      const { productId, size, excludedTeams, customerName, customerPhone } = metadata;

      // Verificar si la orden ya existe (evitar duplicados)
      const { data: existingOrder } = await supabaseAdmin
        .from('orders')
        .select('id')
        .eq('payment_id', token)
        .single();

      if (existingOrder) {
        console.log('Order already exists, skipping creation');
        return new Response('OK', { status: 200 });
      }

      // Crear orden en Supabase
      const { data, error } = await supabaseAdmin
        .from('orders')
        .insert({
          customer_email: paymentStatus.payer?.email || paymentStatus.email,
          customer_name: customerName || paymentStatus.payer?.name || 'Cliente',
          customer_phone: customerPhone || '',
          product_id: productId || 'box-basica',
          size: size || 'M',
          excluded_teams: excludedTeams || [],
          status: getFlowStatusName(paymentStatus.status),
          payment_method: 'flow',
          payment_id: token,
          total_clp: paymentStatus.amount,
          shipping_address: {},
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating order in Supabase:', error);
        return new Response('Database error', { status: 500 });
      }

      console.log('Order created successfully:', data);

      // TODO: Enviar email de confirmación
    }

    return new Response('OK', { status: 200 });
  } catch (error: any) {
    console.error('Flow webhook error:', error.message);
    return new Response(`Webhook Error: ${error.message}`, { status: 400 });
  }
};
