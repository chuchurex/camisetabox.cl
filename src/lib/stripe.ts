import Stripe from 'stripe';

// Server-side Stripe client (use in API routes only)
export const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Client-side publishable key
export const stripePublishableKey = import.meta.env.PUBLIC_STRIPE_PUBLISHABLE_KEY;

// Convert CLP to Stripe amount (already in cents equivalent)
export function formatAmountForStripe(amount: number): number {
  return amount; // CLP doesn't use decimals
}
