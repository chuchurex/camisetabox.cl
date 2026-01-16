import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database tables
export interface Order {
  id: string;
  created_at: string;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: {
    street: string;
    city: string;
    region: string;
    postal_code: string;
  };
  product_id: string;
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  excluded_teams: string[];
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered';
  payment_method: 'paypal' | 'flow' | 'stripe';
  payment_id: string;
  total_clp: number;
  tracking_number?: string;
  notes?: string;
}

export interface Product {
  id: string;
  name: string;
  price_clp: number;
  description: string;
  image: string; // New image property
}

// Product catalog
export const products: Product[] = [
  { id: 'box-basica', name: 'Caja Basica', price_clp: 29990, description: 'Camiseta liga variable', image: '/products/box-basica.png' },
  { id: 'box-estandar', name: 'Caja Estandar', price_clp: 39990, description: 'Camiseta ligas principales', image: '/products/box-estandar.png' },
  { id: 'box-chilena', name: 'Caja Chilena', price_clp: 44990, description: 'Camiseta Campeonato Nacional', image: '/products/box-chilena.png' },
  { id: 'box-premium', name: 'Caja Premium', price_clp: 59990, description: 'Camiseta equipos top europeos', image: '/products/box-premium.png' },
  { id: 'box-elite', name: 'Caja Elite', price_clp: 89990, description: 'Edicion especial o retro', image: '/products/box-elite.png' },
];
