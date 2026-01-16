// Mercado Pago SDK configuration
export const MERCADOPAGO_ACCESS_TOKEN = import.meta.env.MERCADOPAGO_ACCESS_TOKEN;
export const MERCADOPAGO_PUBLIC_KEY = import.meta.env.PUBLIC_MERCADOPAGO_PUBLIC_KEY;

const MP_API_BASE = 'https://api.mercadopago.com';

// Create Mercado Pago preference (checkout)
export async function createMercadoPagoPreference(preferenceData: {
  title: string;
  quantity: number;
  unit_price: number;
  currency_id?: string;
  payer: {
    name: string;
    email: string;
    phone?: {
      number: string;
    };
  };
  back_urls?: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return?: 'approved' | 'all';
  notification_url?: string;
  external_reference?: string;
  metadata?: Record<string, any>;
}) {
  const response = await fetch(`${MP_API_BASE}/checkout/preferences`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      items: [
        {
          title: preferenceData.title,
          quantity: preferenceData.quantity,
          unit_price: preferenceData.unit_price,
          currency_id: preferenceData.currency_id || 'CLP',
        },
      ],
      payer: preferenceData.payer,
      back_urls: preferenceData.back_urls || {
        success: `${import.meta.env.PUBLIC_SITE_URL}/success`,
        failure: `${import.meta.env.PUBLIC_SITE_URL}/checkout`,
        pending: `${import.meta.env.PUBLIC_SITE_URL}/success`,
      },
      auto_return: preferenceData.auto_return || 'approved',
      notification_url: preferenceData.notification_url,
      external_reference: preferenceData.external_reference,
      metadata: preferenceData.metadata,
      statement_descriptor: 'CAMISETABOX',
      binary_mode: true, // Aprobado o rechazado, sin pendientes
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al crear preferencia de Mercado Pago');
  }

  return response.json();
}

// Get payment information
export async function getMercadoPagoPayment(paymentId: string) {
  const response = await fetch(`${MP_API_BASE}/v1/payments/${paymentId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al obtener información del pago');
  }

  return response.json();
}

// Payment status constants
export const MP_STATUS = {
  APPROVED: 'approved',
  PENDING: 'pending',
  IN_PROCESS: 'in_process',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  CHARGED_BACK: 'charged_back',
} as const;

export function getMercadoPagoStatusName(status: string): string {
  switch (status) {
    case MP_STATUS.APPROVED:
      return 'paid';
    case MP_STATUS.PENDING:
    case MP_STATUS.IN_PROCESS:
      return 'pending';
    case MP_STATUS.REJECTED:
    case MP_STATUS.CANCELLED:
      return 'cancelled';
    default:
      return 'pending';
  }
}
