import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

const supabaseAdmin = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY
);

export const GET: APIRoute = async ({ request, url }) => {
  try {
    // Obtener parámetros de query
    const status = url.searchParams.get('status');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let query = supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filtrar por estado si se proporciona
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return new Response(
      JSON.stringify({
        orders: data,
        total: count,
        limit,
        offset
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error al obtener órdenes' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const PATCH: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { orderId, status, tracking_number, notes } = body;

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: 'orderId es requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const updates: any = {};

    if (status) updates.status = status;
    if (tracking_number !== undefined) updates.tracking_number = tracking_number;
    if (notes !== undefined) updates.admin_notes = notes;

    // Agregar timestamps según el estado
    if (status === 'shipped' && !updates.shipped_at) {
      updates.shipped_at = new Date().toISOString();
    }
    if (status === 'delivered' && !updates.delivered_at) {
      updates.delivered_at = new Date().toISOString();
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ order: data }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error updating order:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error al actualizar orden' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
