import type { APIRoute } from 'astro';
import { getFlowPaymentStatus, FLOW_STATUS, getFlowStatusName } from '../../lib/flow';

export const prerender = false;

export const GET: APIRoute = async ({ url, redirect }) => {
  try {
    const token = url.searchParams.get('token');

    if (!token) {
      return redirect('/checkout?error=no_token');
    }

    // Obtener estado del pago desde Flow
    const paymentStatus = await getFlowPaymentStatus(token);

    // Si el pago fue exitoso, redirigir a success
    if (paymentStatus.status === FLOW_STATUS.PAID) {
      return redirect(`/success?session_id=${token}`);
    }

    // Si fue rechazado o cancelado
    if (paymentStatus.status === FLOW_STATUS.REJECTED || paymentStatus.status === FLOW_STATUS.CANCELLED) {
      return redirect('/checkout?error=payment_rejected');
    }

    // Si está pendiente, esperar
    return redirect('/checkout?error=payment_pending');
  } catch (error: any) {
    console.error('Flow return error:', error.message);
    return redirect('/checkout?error=payment_error');
  }
};
