import type { APIRoute } from 'astro';
import { capturePayPalOrder, getPayPalOrderDetails } from '../../lib/paypal';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

const supabaseAdmin = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY
);

export const GET: APIRoute = async ({ url, redirect }) => {
  try {
    const token = url.searchParams.get('token'); // PayPal order ID

    if (!token) {
      return redirect('/checkout?error=no_token');
    }

    // Capturar el pago
    const captureData = await capturePayPalOrder(token);

    if (captureData.status === 'COMPLETED') {
      // Obtener detalles de la orden
      const orderDetails = await getPayPalOrderDetails(token);

      // Extraer metadata del custom_id
      const customData = orderDetails.purchase_units[0].custom_id
        ? JSON.parse(orderDetails.purchase_units[0].custom_id)
        : {};

      const { productId, size, excludedTeams, customerName, customerEmail, customerPhone, originalAmountCLP } = customData;

      // Crear orden en Supabase
      const { data, error } = await supabaseAdmin
        .from('orders')
        .insert({
          customer_email: customerEmail || orderDetails.payer?.email_address,
          customer_name: customerName || `${orderDetails.payer?.name?.given_name} ${orderDetails.payer?.name?.surname}`,
          customer_phone: customerPhone || '',
          product_id: productId,
          size: size || 'M',
          excluded_teams: excludedTeams || [],
          status: 'paid',
          payment_method: 'paypal',
          payment_id: token,
          total_clp: originalAmountCLP || 0,
          shipping_address: {},
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating order in Supabase:', error);
        return redirect('/checkout?error=database_error');
      }

      console.log('Order created successfully:', data);

      // Redirigir a página de éxito
      return redirect(`/success?session_id=${token}`);
    } else {
      return redirect('/checkout?error=payment_failed');
    }
  } catch (error: any) {
    console.error('PayPal return error:', error.message);
    return redirect('/checkout?error=payment_error');
  }
};
