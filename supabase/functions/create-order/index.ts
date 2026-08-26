// ═══════════════════════════════════════════════════════════════════════════════
// Staesh_Scoops — Create Order (Edge Function)
// Called from frontend after successful payment
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

Deno.serve(async (req) => {
  // Handle CORS preflight
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
    // Get the authenticated user from the request
    const authHeader = req.headers.get('Authorization');
    let userId = null;

    if (authHeader) {
      const supabaseClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY') || '', {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await supabaseClient.auth.getUser();
      userId = user?.id || null;
    }

    const body = await req.json();
    const {
      items,
      customer,
      payment_method,
      subtotal,
      shipping_amount,
      discount_amount,
      total_amount,
    } = body;

    // ─── Validate inputs ─────────────────────────────────────────────
    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Order must contain at least one item' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!customer?.fullName || !customer?.email || !customer?.phone) {
      return new Response(
        JSON.stringify({ error: 'Customer name, email, and phone are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ─── Generate order number ───────────────────────────────────────
    const { data: orderNumData, error: orderNumError } = await supabaseAdmin
      .rpc('generate_order_number');

    if (orderNumError) {
      console.error('Order number generation failed:', orderNumError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate order number' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const orderNumber = orderNumData;

    // ─── Calculate estimated delivery (3-5 business days) ────────────
    const estimatedDelivery = new Date();
    let daysToAdd = 5;
    while (daysToAdd > 0) {
      estimatedDelivery.setDate(estimatedDelivery.getDate() + 1);
      const day = estimatedDelivery.getDay();
      if (day !== 0 && day !== 6) daysToAdd--;
    }

    // ─── Build shipping address JSONB ────────────────────────────────
    const shippingAddress = {
      address: customer.address || '',
      city: customer.city || '',
      state: customer.state || '',
      pincode: customer.pincode || '',
      country: customer.country || 'India',
    };

    // ─── Determine payment status ────────────────────────────────────
    // COD = pending until delivered, others = paid (mock — in real flow, verify server-side)
    const paymentStatus = payment_method === 'cod' ? 'pending' : 'paid';

    // ─── Insert order ────────────────────────────────────────────────
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: userId,
        customer_name: customer.fullName,
        customer_email: customer.email,
        customer_phone: customer.phone,
        shipping_address: shippingAddress,
        subtotal: subtotal || 0,
        shipping_amount: shipping_amount || 0,
        discount_amount: discount_amount || 0,
        tax_amount: 0,
        total_amount: total_amount || 0,
        payment_method: payment_method || 'cod',
        payment_status: paymentStatus,
        order_status: 'confirmed',
        estimated_delivery: estimatedDelivery.toISOString().split('T')[0],
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order insert failed:', orderError);
      return new Response(
        JSON.stringify({ error: 'Failed to create order' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ─── Insert order items ──────────────────────────────────────────
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id || item.product?.id || '',
      product_name: item.product_name || item.product?.name || '',
      product_image: item.product_image || item.product?.image || '',
      quantity: item.quantity || 1,
      unit_price: item.unit_price || item.product?.price || 0,
      total_price: (item.unit_price || item.product?.price || 0) * (item.quantity || 1),
      selected_color: item.selectedColor || '',
      selected_size: item.selectedSize || '',
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Order items insert failed:', itemsError);
      // Order was created but items failed — still return success with warning
    }

    // ─── Insert initial status history ───────────────────────────────
    const { error: historyError } = await supabaseAdmin
      .from('order_status_history')
      .insert([
        {
          order_id: order.id,
          status: 'confirmed',
          title: 'Order Confirmed',
          description: `Your order #${orderNumber} has been confirmed. Thank you for shopping with Staesh_Scoops!`,
          created_by: userId,
        },
        ...(paymentStatus === 'paid'
          ? [{
              order_id: order.id,
              status: 'payment_confirmed',
              title: 'Payment Confirmed',
              description: `Payment of ₹${total_amount} received via ${payment_method.toUpperCase()}.`,
              created_by: userId,
            }]
          : []),
      ]);

    if (historyError) {
      console.error('Status history insert failed:', historyError);
    }

    // ─── Fire WhatsApp notification (fire-and-forget) ────────────────
    // This must NOT block or fail the order creation
    const trackingUrl = `${STORE_URL}/track-order?order=${orderNumber}`;

    try {
      await fetch(`${SUPABASE_URL}/functions/v1/send-whatsapp`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: order.id,
          customer_id: userId,
          phone_number: customer.phone,
          template_name: 'order_confirmation',
          template_data: {
            customer_name: customer.fullName,
            order_number: orderNumber,
            total_amount: total_amount,
            payment_status: paymentStatus === 'paid' ? 'Paid' : 'Cash on Delivery',
            estimated_delivery: estimatedDelivery.toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }),
            tracking_url: trackingUrl,
          },
        }),
      });
    } catch (whatsappError) {
      // WhatsApp failure MUST NOT affect order
      console.error('WhatsApp notification failed (non-blocking):', whatsappError);
    }

    // ─── Return success ──────────────────────────────────────────────
    return new Response(
      JSON.stringify({
        success: true,
        order: {
          id: order.id,
          order_number: orderNumber,
          order_status: order.order_status,
          payment_status: order.payment_status,
          total_amount: order.total_amount,
          estimated_delivery: order.estimated_delivery,
          created_at: order.created_at,
        },
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('create-order error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
