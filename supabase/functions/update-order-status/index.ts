// ═══════════════════════════════════════════════════════════════════════════════
// Staesh_Scoops — Update Order Status (Edge Function)
// Admin-only: updates status, records history, triggers WhatsApp
// ═══════════════════════════════════════════════════════════════════════════════

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const STORE_URL = Deno.env.get('STORE_URL') || 'http://localhost:3000';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const VALID_STATUSES = [
  'pending', 'payment_pending', 'confirmed', 'processing',
  'packed', 'shipped', 'out_for_delivery', 'delivered',
  'cancelled', 'refund_initiated', 'refunded', 'returned', 'delivery_failed',
];

const STATUS_TITLES = {
  pending: 'Order Pending',
  payment_pending: 'Awaiting Payment',
  confirmed: 'Order Confirmed',
  processing: 'Order Processing',
  packed: 'Order Packed',
  shipped: 'Order Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Order Delivered',
  cancelled: 'Order Cancelled',
  refund_initiated: 'Refund Initiated',
  refunded: 'Refund Completed',
  returned: 'Order Returned',
  delivery_failed: 'Delivery Failed',
};

const STATUS_DESCRIPTIONS = {
  processing: 'Your order is being prepared for shipment.',
  packed: 'Your order has been packed and is ready for dispatch.',
  shipped: 'Your package has been handed over to the courier.',
  out_for_delivery: 'Your order is out for delivery. Please keep your phone available.',
  delivered: 'Your order has been delivered successfully. Enjoy your purchase!',
  cancelled: 'Your order has been cancelled.',
  refund_initiated: 'A refund has been initiated for your order.',
  refunded: 'Your refund has been processed successfully.',
};

// Map status to WhatsApp template
const STATUS_TO_TEMPLATE = {
  confirmed: 'order_confirmation',
  processing: 'order_processing',
  packed: 'order_packed',
  shipped: 'order_shipped',
  out_for_delivery: 'out_for_delivery',
  delivered: 'order_delivered',
  cancelled: 'order_cancelled',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // ─── Authenticate and check admin role ───────────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY') || '', {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check admin role
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!roleData || !['admin', 'super_admin'].includes(roleData.role)) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ─── Parse request body ──────────────────────────────────────────
    const {
      order_id,
      new_status,
      courier_name,
      tracking_number,
      estimated_delivery,
      description,
      location,
    } = await req.json();

    if (!order_id || !new_status) {
      return new Response(
        JSON.stringify({ error: 'order_id and new_status are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!VALID_STATUSES.includes(new_status)) {
      return new Response(
        JSON.stringify({ error: `Invalid status: ${new_status}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ─── Get current order ───────────────────────────────────────────
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ─── Build update object ─────────────────────────────────────────
    const updateData = { order_status: new_status };

    if (courier_name) updateData.courier_name = courier_name;
    if (tracking_number) updateData.tracking_number = tracking_number;
    if (estimated_delivery) updateData.estimated_delivery = estimated_delivery;

    // If delivered and COD, mark payment as paid
    if (new_status === 'delivered' && order.payment_method === 'cod') {
      updateData.payment_status = 'paid';
    }

    // If cancelled/refunded, update payment status
    if (['refunded'].includes(new_status)) {
      updateData.payment_status = 'refunded';
    }

    // ─── Update order ────────────────────────────────────────────────
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', order_id);

    if (updateError) {
      console.error('Order update failed:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update order' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ─── Insert status history ───────────────────────────────────────
    const { error: historyError } = await supabaseAdmin
      .from('order_status_history')
      .insert({
        order_id: order_id,
        status: new_status,
        title: STATUS_TITLES[new_status] || new_status,
        description: description || STATUS_DESCRIPTIONS[new_status] || `Order status changed to ${new_status}`,
        location: location || null,
        tracking_number: tracking_number || order.tracking_number || null,
        created_by: user.id,
      });

    if (historyError) {
      console.error('Status history insert failed:', historyError);
    }

    // ─── Fire WhatsApp notification (non-blocking) ───────────────────
    const templateName = STATUS_TO_TEMPLATE[new_status];
    if (templateName) {
      const trackingUrl = `${STORE_URL}/track-order?order=${order.order_number}`;
      try {
        await fetch(`${SUPABASE_URL}/functions/v1/send-whatsapp`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            order_id: order.id,
            customer_id: order.user_id,
            phone_number: order.customer_phone,
            template_name: templateName,
            template_data: {
              customer_name: order.customer_name,
              order_number: order.order_number,
              courier_name: courier_name || order.courier_name,
              tracking_number: tracking_number || order.tracking_number,
              tracking_url: trackingUrl,
              estimated_delivery: (estimated_delivery || order.estimated_delivery)
                ? new Date(estimated_delivery || order.estimated_delivery).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : 'To be updated',
            },
          }),
        });
      } catch (whatsappError) {
        console.error('WhatsApp notification failed (non-blocking):', whatsappError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        order_id: order_id,
        new_status: new_status,
        message: `Order status updated to ${STATUS_TITLES[new_status] || new_status}`,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('update-order-status error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
