-- ═══════════════════════════════════════════════════════════════════════════════
-- Staesh_Scoops — Order & Tracking System Database Schema
-- Run this in your Supabase SQL Editor or as a migration
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── 1. Orders Table ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number  TEXT NOT NULL UNIQUE,
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address JSONB NOT NULL DEFAULT '{}',
  billing_address  JSONB DEFAULT '{}',
  subtotal       NUMERIC(12,2) NOT NULL DEFAULT 0,
  shipping_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_amount      NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount    NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency        TEXT NOT NULL DEFAULT 'INR',
  payment_method  TEXT NOT NULL DEFAULT 'cod',
  payment_status  TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  order_status    TEXT NOT NULL DEFAULT 'pending'
    CHECK (order_status IN (
      'pending', 'payment_pending', 'confirmed', 'processing',
      'packed', 'shipped', 'out_for_delivery', 'delivered',
      'cancelled', 'refund_initiated', 'refunded', 'returned', 'delivery_failed'
    )),
  tracking_number  TEXT,
  courier_name     TEXT,
  estimated_delivery DATE,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- ─── 2. Order Items Table ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id   TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  quantity     INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price   NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_price  NUMERIC(12,2) NOT NULL DEFAULT 0,
  selected_color TEXT,
  selected_size  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);


-- ─── 3. Order Status History Table ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_status_history (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id       UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status         TEXT NOT NULL,
  title          TEXT NOT NULL,
  description    TEXT,
  location       TEXT,
  tracking_number TEXT,
  created_by     UUID REFERENCES auth.users(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_created_at ON order_status_history(created_at);


-- ─── 4. WhatsApp Messages Table ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            UUID REFERENCES orders(id) ON DELETE SET NULL,
  customer_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  phone_number        TEXT NOT NULL,
  template_name       TEXT NOT NULL,
  message_type        TEXT NOT NULL DEFAULT 'transactional',
  message_status      TEXT NOT NULL DEFAULT 'queued'
    CHECK (message_status IN ('queued', 'sent', 'delivered', 'read', 'failed')),
  provider_message_id TEXT,
  error_message       TEXT,
  sent_at             TIMESTAMPTZ,
  delivered_at        TIMESTAMPTZ,
  read_at             TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_order_id ON whatsapp_messages(order_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_status ON whatsapp_messages(message_status);


-- ─── 5. Order Number Generator ──────────────────────────────────────────────
-- Generates: SS-20260813-0001, SS-20260813-0002, etc.
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  today_str TEXT;
  seq_num INTEGER;
  new_order_number TEXT;
BEGIN
  today_str := TO_CHAR(NOW() AT TIME ZONE 'Asia/Kolkata', 'YYYYMMDD');
  
  SELECT COALESCE(MAX(
    CAST(SPLIT_PART(order_number, '-', 3) AS INTEGER)
  ), 0) + 1
  INTO seq_num
  FROM orders
  WHERE order_number LIKE 'SS-' || today_str || '-%';
  
  new_order_number := 'SS-' || today_str || '-' || LPAD(seq_num::TEXT, 4, '0');
  
  RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;


-- ─── 6. User Roles Table (for Admin access) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS user_roles (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role      TEXT NOT NULL DEFAULT 'customer'
    CHECK (role IN ('customer', 'admin', 'super_admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);

-- Helper function to check admin status
CREATE OR REPLACE FUNCTION is_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = check_user_id AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─── 7. Row Level Security ──────────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Orders: customers see their own, admins see all
CREATE POLICY "Customers view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Service role manages orders"
  ON orders FOR ALL
  USING (auth.role() = 'service_role');

-- Allow order creation by authenticated users
CREATE POLICY "Authenticated users create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can update orders
CREATE POLICY "Admins update orders"
  ON orders FOR UPDATE
  USING (is_admin(auth.uid()));

-- Order Items: follow parent order access
CREATE POLICY "View own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR is_admin(auth.uid()))
    )
  );

CREATE POLICY "Service role manages order items"
  ON order_items FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Insert order items with own order"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Order Status History: follow parent order access
CREATE POLICY "View own order history"
  ON order_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_status_history.order_id
      AND (orders.user_id = auth.uid() OR is_admin(auth.uid()))
    )
  );

CREATE POLICY "Service role manages status history"
  ON order_status_history FOR ALL
  USING (auth.role() = 'service_role');

-- WhatsApp Messages: admins only (customers don't need to see raw message records)
CREATE POLICY "Admins view whatsapp messages"
  ON whatsapp_messages FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Service role manages whatsapp messages"
  ON whatsapp_messages FOR ALL
  USING (auth.role() = 'service_role');

-- User Roles: users can see their own role
CREATE POLICY "Users view own role"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages roles"
  ON user_roles FOR ALL
  USING (auth.role() = 'service_role');


-- ─── 8. Realtime ────────────────────────────────────────────────────────────
-- Enable realtime for order status changes
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_status_history;


-- ─── 9. Public Tracking Function ────────────────────────────────────────────
-- Allows tracking by order number without authentication (limited fields)
CREATE OR REPLACE FUNCTION track_order_public(p_order_number TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'order_number', o.order_number,
    'order_status', o.order_status,
    'courier_name', o.courier_name,
    'tracking_number', o.tracking_number,
    'estimated_delivery', o.estimated_delivery,
    'created_at', o.created_at,
    'status_history', (
      SELECT json_agg(
        json_build_object(
          'status', h.status,
          'title', h.title,
          'description', h.description,
          'location', h.location,
          'created_at', h.created_at
        ) ORDER BY h.created_at ASC
      )
      FROM order_status_history h
      WHERE h.order_id = o.id
    )
  )
  INTO result
  FROM orders o
  WHERE o.order_number = p_order_number;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
