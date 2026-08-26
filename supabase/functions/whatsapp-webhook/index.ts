// ═══════════════════════════════════════════════════════════════════════════════
// Staesh_Scoops — WhatsApp Webhook Handler (Edge Function)
// Receives delivery status updates from WhatsApp Business API
// ═══════════════════════════════════════════════════════════════════════════════

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const WEBHOOK_VERIFY_TOKEN = Deno.env.get('WHATSAPP_WEBHOOK_VERIFY_TOKEN');

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async (req) => {
  // ─── GET: Webhook verification (Meta sends this on setup) ──────────
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
      console.log('Webhook verified successfully');
      return new Response(challenge, { status: 200 });
    }

    return new Response('Forbidden', { status: 403 });
  }

  // ─── POST: Incoming webhook events ─────────────────────────────────
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.json();

    // Process each entry from Meta webhook
    const entries = body.entry || [];

    for (const entry of entries) {
      const changes = entry.changes || [];

      for (const change of changes) {
        if (change.field !== 'messages') continue;

        const value = change.value || {};
        const statuses = value.statuses || [];

        for (const status of statuses) {
          const providerMessageId = status.id;
          const messageStatus = status.status; // sent, delivered, read, failed
          const timestamp = status.timestamp
            ? new Date(parseInt(status.timestamp) * 1000).toISOString()
            : new Date().toISOString();

          // Map WhatsApp status to our status
          const statusMap = {
            sent: 'sent',
            delivered: 'delivered',
            read: 'read',
            failed: 'failed',
          };

          const mappedStatus = statusMap[messageStatus];
          if (!mappedStatus || !providerMessageId) continue;

          // Build update object
          const updateData = {
            message_status: mappedStatus,
          };

          if (mappedStatus === 'sent') updateData.sent_at = timestamp;
          if (mappedStatus === 'delivered') updateData.delivered_at = timestamp;
          if (mappedStatus === 'read') updateData.read_at = timestamp;
          if (mappedStatus === 'failed') {
            updateData.error_message =
              status.errors?.[0]?.message || 'Delivery failed';
          }

          // Update the message record
          const { error } = await supabaseAdmin
            .from('whatsapp_messages')
            .update(updateData)
            .eq('provider_message_id', providerMessageId);

          if (error) {
            console.error('Failed to update message status:', error);
          } else {
            console.log(`Message ${providerMessageId} status → ${mappedStatus}`);
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('whatsapp-webhook error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
