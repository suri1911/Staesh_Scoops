// ═══════════════════════════════════════════════════════════════════════════════
// Staesh_Scoops — Send WhatsApp Notification (Edge Function)
// Called internally by other Edge Functions — never directly from frontend
// ═══════════════════════════════════════════════════════════════════════════════

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const WHATSAPP_ACCESS_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
const WHATSAPP_API_VERSION = Deno.env.get('WHATSAPP_API_VERSION') || 'v17.0';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// WhatsApp template message configurations
const TEMPLATE_CONFIGS = {
  order_confirmation: {
    name: 'order_confirmation',
    language: 'en',
    buildParams: (data) => [
      data.customer_name,
      data.store_name || 'Staesh_Scoops',
      data.order_number,
      `₹${data.total_amount}`,
      data.payment_status,
      data.estimated_delivery || 'In 3-5 Business Days',
      data.tracking_url,
    ],
  },
  order_shipped: {
    name: 'order_shipped',
    language: 'en',
    buildParams: (data) => [
      data.customer_name,
      data.order_number,
      data.courier_name || 'Our Courier Partner',
      data.tracking_number || 'Pending',
      data.tracking_url,
      data.estimated_delivery || 'In 2-3 Business Days',
      data.store_name || 'Staesh_Scoops',
    ],
  },
  out_for_delivery: {
    name: 'out_for_delivery',
    language: 'en',
    buildParams: (data) => [
      data.customer_name,
      data.order_number,
      data.tracking_url,
    ],
  },
  order_delivered: {
    name: 'order_delivered',
    language: 'en',
    buildParams: (data) => [
      data.customer_name,
      data.order_number,
      data.store_name || 'Staesh_Scoops',
    ],
  },
  order_cancelled: {
    name: 'order_cancelled',
    language: 'en',
    buildParams: (data) => [
      data.customer_name,
      data.order_number,
      data.store_name || 'Staesh_Scoops',
    ],
  },
  order_processing: {
    name: 'order_processing',
    language: 'en',
    buildParams: (data) => [
      data.customer_name,
      data.order_number,
      data.store_name || 'Staesh_Scoops',
    ],
  },
  order_packed: {
    name: 'order_packed',
    language: 'en',
    buildParams: (data) => [
      data.customer_name,
      data.order_number,
      data.store_name || 'Staesh_Scoops',
    ],
  },
};

// Map order status to WhatsApp template
const STATUS_TO_TEMPLATE = {
  confirmed: 'order_confirmation',
  processing: 'order_processing',
  packed: 'order_packed',
  shipped: 'order_shipped',
  out_for_delivery: 'out_for_delivery',
  delivered: 'order_delivered',
  cancelled: 'order_cancelled',
};

/**
 * Send a WhatsApp message via Meta Cloud API
 */
async function sendWhatsAppMessage(phoneNumber, templateName, templateData) {
  const config = TEMPLATE_CONFIGS[templateName];
  if (!config) {
    throw new Error(`Unknown template: ${templateName}`);
  }

  // Normalize phone number (ensure country code, remove spaces)
  const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '').replace(/^\+/, '');

  const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const params = config.buildParams(templateData);

  const body = {
    messaging_product: 'whatsapp',
    to: cleanPhone,
    type: 'template',
    template: {
      name: config.name,
      language: { code: config.language },
      components: [
        {
          type: 'body',
          parameters: params.map((p) => ({
            type: 'text',
            text: String(p),
          })),
        },
      ],
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || JSON.stringify(result));
  }

  return {
    provider_message_id: result.messages?.[0]?.id || null,
    status: 'sent',
  };
}

/**
 * Record WhatsApp message attempt in database
 */
async function recordMessage(orderId, customerId, phoneNumber, templateName, status, providerMessageId, errorMessage) {
  const { error } = await supabaseAdmin.from('whatsapp_messages').insert({
    order_id: orderId,
    customer_id: customerId,
    phone_number: phoneNumber,
    template_name: templateName,
    message_type: 'transactional',
    message_status: status,
    provider_message_id: providerMessageId,
    error_message: errorMessage,
    sent_at: status === 'sent' ? new Date().toISOString() : null,
  });

  if (error) {
    console.error('Failed to record WhatsApp message:', error);
  }
}

Deno.serve(async (req) => {
  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const {
      order_id,
      customer_id,
      phone_number,
      template_name,
      template_data,
    } = await req.json();

    // Validate required fields
    if (!phone_number || !template_name) {
      return new Response(
        JSON.stringify({ error: 'phone_number and template_name are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if WhatsApp credentials are configured
    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
      console.warn('WhatsApp API not configured — skipping notification');
      await recordMessage(order_id, customer_id, phone_number, template_name, 'failed', null, 'WhatsApp API not configured');
      return new Response(
        JSON.stringify({ success: false, message: 'WhatsApp API not configured', status: 'skipped' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Attempt to send
    try {
      const result = await sendWhatsAppMessage(phone_number, template_name, template_data || {});
      await recordMessage(order_id, customer_id, phone_number, template_name, 'sent', result.provider_message_id, null);

      return new Response(
        JSON.stringify({ success: true, provider_message_id: result.provider_message_id }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (sendError) {
      // WhatsApp failed — log it but don't throw
      console.error('WhatsApp send failed:', sendError.message);
      await recordMessage(order_id, customer_id, phone_number, template_name, 'failed', null, sendError.message);

      return new Response(
        JSON.stringify({ success: false, error: sendError.message, status: 'failed' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (err) {
    console.error('send-whatsapp error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
