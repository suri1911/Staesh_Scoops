// ═══════════════════════════════════════════════════════════════════════════════
// Staesh_Scoops — Order Service
// Frontend API layer for order operations
// ═══════════════════════════════════════════════════════════════════════════════

import { supabase } from '../lib/supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

/**
 * Create a new order via Edge Function (server-side)
 */
export async function createOrder(cartItems, customer, paymentMethod, totals) {
  const session = await supabase.auth.getSession();
  const accessToken = session?.data?.session?.access_token;

  const items = cartItems.map((item) => ({
    product_id: item.product.id,
    product_name: item.product.name,
    product_image: item.product.image,
    quantity: item.quantity,
    unit_price: item.product.price,
    selectedColor: item.selectedColor,
    selectedSize: item.selectedSize,
  }));

  const response = await fetch(`${SUPABASE_URL}/functions/v1/create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      items,
      customer,
      payment_method: paymentMethod,
      subtotal: totals.subtotal,
      shipping_amount: totals.shipping,
      discount_amount: totals.discount || 0,
      total_amount: totals.total,
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to create order');
  }

  return data.order;
}

/**
 * Fetch an order by its UUID (authenticated user only sees their own via RLS)
 */
export async function getOrderById(orderId) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*),
      order_status_history (*)
    `)
    .eq('id', orderId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetch an order by order number (authenticated user only sees their own via RLS)
 */
export async function getOrderByNumber(orderNumber) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*),
      order_status_history (*)
    `)
    .eq('order_number', orderNumber)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Public tracking — uses the secure database function that returns limited fields
 */
export async function trackOrderPublic(orderNumber) {
  const { data, error } = await supabase.rpc('track_order_public', {
    p_order_number: orderNumber,
  });

  if (error) throw error;
  if (!data) throw new Error('Order not found');
  return data;
}

/**
 * Get all orders for the currently authenticated user
 */
export async function getMyOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      order_status,
      payment_status,
      total_amount,
      created_at,
      estimated_delivery,
      courier_name,
      tracking_number,
      order_items (
        id,
        product_name,
        product_image,
        quantity,
        unit_price,
        total_price
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get all orders (admin only — RLS handles authorization)
 */
export async function getAllOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*),
      order_status_history (*)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Update order status (admin only — via Edge Function)
 */
export async function updateOrderStatus(orderId, newStatus, extras = {}) {
  const session = await supabase.auth.getSession();
  const accessToken = session?.data?.session?.access_token;

  if (!accessToken) {
    throw new Error('Authentication required');
  }

  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/update-order-status`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        order_id: orderId,
        new_status: newStatus,
        courier_name: extras.courier_name || null,
        tracking_number: extras.tracking_number || null,
        estimated_delivery: extras.estimated_delivery || null,
        description: extras.description || null,
        location: extras.location || null,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to update order status');
  }

  return data;
}

/**
 * Get WhatsApp message history for an order (admin only)
 */
export async function getWhatsAppMessages(orderId) {
  const { data, error } = await supabase
    .from('whatsapp_messages')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Check current user's admin status
 */
export async function checkIsAdmin() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  return data && ['admin', 'super_admin'].includes(data.role);
}

/**
 * Subscribe to real-time order updates
 */
export function subscribeToOrderUpdates(orderNumber, callback) {
  const channel = supabase
    .channel(`order-${orderNumber}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `order_number=eq.${orderNumber}`,
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
