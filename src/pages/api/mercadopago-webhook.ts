import type { APIRoute } from 'astro';
import { getMercadoPagoPayment, getMercadoPagoStatusName } from '../../lib/mercadopago';
import { supabase } from '../../lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    console.log('Mercado Pago webhook received:', body);

    // Mercado Pago envía diferentes tipos de notificaciones
    // Solo procesamos pagos
    if (body.type !== 'payment') {
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const paymentId = body.data?.id;
    if (!paymentId) {
      return new Response(JSON.stringify({ error: 'No payment ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Obtener información del pago
    const payment = await getMercadoPagoPayment(paymentId);

    console.log('Payment info:', payment);

    // Extraer metadata del pedido
    const metadata = payment.metadata || {};
    const externalReference = payment.external_reference;

    // Mapear estado de MP a nuestro estado
    const orderStatus = getMercadoPagoStatusName(payment.status);

    // Buscar si ya existe una orden con este payment_id
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id')
      .eq('payment_id', paymentId)
      .single();

    if (existingOrder) {
      // Actualizar orden existente
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: orderStatus,
        })
        .eq('payment_id', paymentId);

      if (updateError) {
        console.error('Error updating order:', updateError);
      }
    } else {
      // Crear nueva orden
      const { error: insertError } = await supabase
        .from('orders')
        .insert({
          customer_email: metadata.customer_email || payment.payer.email,
          customer_name: metadata.customer_name || `${payment.payer.first_name} ${payment.payer.last_name}`,
          customer_phone: metadata.customer_phone || payment.payer.phone?.number || '',
          product_id: metadata.product_id,
          size: metadata.size,
          excluded_teams: metadata.excluded_teams || [],
          status: orderStatus,
          payment_method: 'mercadopago',
          payment_id: paymentId,
          total_clp: payment.transaction_amount,
          notes: externalReference || '',
        });

      if (insertError) {
        console.error('Error creating order:', insertError);
        throw insertError;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Mercado Pago webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
