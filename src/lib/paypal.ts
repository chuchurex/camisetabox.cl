// PayPal SDK configuration
export const PAYPAL_CLIENT_ID = import.meta.env.PUBLIC_PAYPAL_CLIENT_ID;
export const PAYPAL_CLIENT_SECRET = import.meta.env.PAYPAL_CLIENT_SECRET;
export const PAYPAL_MODE = import.meta.env.PUBLIC_PAYPAL_MODE || 'sandbox'; // 'sandbox' or 'live'

const PAYPAL_API_BASE = PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

// Get PayPal access token
async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  return data.access_token;
}

// Create PayPal order
export async function createPayPalOrder(orderData: {
  amount: number;
  currency?: string;
  description: string;
  metadata?: any;
}) {
  const accessToken = await getAccessToken();

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: orderData.currency || 'USD',
          value: (orderData.amount / 1000).toFixed(2), // Convert CLP to thousands for USD equivalent
        },
        description: orderData.description,
        custom_id: JSON.stringify(orderData.metadata || {}),
      }],
      application_context: {
        brand_name: 'CamisetaBox',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: `${import.meta.env.PUBLIC_SITE_URL}/api/paypal-return`,
        cancel_url: `${import.meta.env.PUBLIC_SITE_URL}/checkout`,
      },
    }),
  });

  return response.json();
}

// Capture PayPal order (complete payment)
export async function capturePayPalOrder(orderId: string) {
  const accessToken = await getAccessToken();

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  return response.json();
}

// Get order details
export async function getPayPalOrderDetails(orderId: string) {
  const accessToken = await getAccessToken();

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  return response.json();
}

// Convert CLP to USD (approximate)
export function convertCLPtoUSD(amountCLP: number): number {
  const exchangeRate = 900; // Aprox 900 CLP = 1 USD
  return Math.ceil((amountCLP / exchangeRate) * 100) / 100;
}
