import crypto from 'crypto';

// Flow API configuration
export const FLOW_API_KEY = import.meta.env.FLOW_API_KEY;
export const FLOW_SECRET_KEY = import.meta.env.FLOW_SECRET_KEY;
export const FLOW_MODE = import.meta.env.PUBLIC_FLOW_MODE || 'sandbox'; // 'sandbox' or 'live'

const FLOW_API_BASE = FLOW_MODE === 'live'
  ? 'https://www.flow.cl/api'
  : 'https://sandbox.flow.cl/api';

// Generate signature for Flow API
function generateSignature(params: Record<string, any>): string {
  // Sort params alphabetically
  const sortedKeys = Object.keys(params).sort();

  // Create string to sign
  const paramsString = sortedKeys
    .map(key => `${key}${params[key]}`)
    .join('');

  // Generate HMAC SHA256 signature
  const signature = crypto
    .createHmac('sha256', FLOW_SECRET_KEY)
    .update(paramsString)
    .digest('hex');

  return signature;
}

// Create Flow payment
export async function createFlowPayment(paymentData: {
  commerceOrder: string;
  subject: string;
  amount: number;
  email: string;
  urlConfirmation: string;
  urlReturn: string;
  optional?: string;
}) {
  const params = {
    apiKey: FLOW_API_KEY,
    commerceOrder: paymentData.commerceOrder,
    subject: paymentData.subject,
    currency: 'CLP',
    amount: paymentData.amount,
    email: paymentData.email,
    urlConfirmation: paymentData.urlConfirmation,
    urlReturn: paymentData.urlReturn,
    ...(paymentData.optional && { optional: paymentData.optional }),
  };

  const signature = generateSignature(params);

  const response = await fetch(`${FLOW_API_BASE}/payment/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      ...params,
      s: signature,
    } as any),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al crear pago en Flow');
  }

  return response.json();
}

// Get payment status
export async function getFlowPaymentStatus(token: string) {
  const params = {
    apiKey: FLOW_API_KEY,
    token,
  };

  const signature = generateSignature(params);

  const response = await fetch(
    `${FLOW_API_BASE}/payment/getStatus?${new URLSearchParams({
      ...params,
      s: signature,
    } as any)}`,
    {
      method: 'GET',
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al obtener estado del pago');
  }

  return response.json();
}

// Verify webhook signature
export function verifyFlowWebhook(params: Record<string, any>, receivedSignature: string): boolean {
  const calculatedSignature = generateSignature(params);
  return calculatedSignature === receivedSignature;
}

// Payment status constants
export const FLOW_STATUS = {
  PENDING: 1,      // Pendiente de pago
  PAID: 2,         // Pagado
  REJECTED: 3,     // Rechazado
  CANCELLED: 4,    // Anulado
} as const;

export function getFlowStatusName(status: number): string {
  switch (status) {
    case FLOW_STATUS.PENDING:
      return 'pending';
    case FLOW_STATUS.PAID:
      return 'paid';
    case FLOW_STATUS.REJECTED:
      return 'cancelled';
    case FLOW_STATUS.CANCELLED:
      return 'cancelled';
    default:
      return 'pending';
  }
}
