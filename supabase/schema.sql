-- Petal & Ink Supabase Postgres Schema & Initial Seed Data

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 0),
  image_urls TEXT[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'delivered')),
  total_price INTEGER NOT NULL CHECK (total_price >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name_snapshot TEXT NOT NULL,
  price_at_purchase INTEGER NOT NULL CHECK (price_at_purchase >= 0),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  custom_field_values JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Site Settings Table (Single row table)
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_email TEXT NOT NULL DEFAULT 'efaisal375@gmail.com',
  brand_name TEXT NOT NULL DEFAULT 'Petal & Ink',
  tagline TEXT DEFAULT 'Custom Bespoke Digital Design Studio',
  logo_url TEXT DEFAULT ''
);

-- Ensure single row constraint on site_settings
CREATE UNIQUE INDEX IF NOT EXISTS site_settings_single_row_idx ON site_settings ((true));

-- 7. Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Categories Policies
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public write categories" ON categories FOR ALL USING (true);

-- Products Policies
CREATE POLICY "Public read active products" ON products FOR SELECT USING (true);
CREATE POLICY "Public write products" ON products FOR ALL USING (true);

-- Orders Policies
CREATE POLICY "Public insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Public update orders" ON orders FOR UPDATE USING (true);
CREATE POLICY "Public delete orders" ON orders FOR DELETE USING (true);

-- Order Items Policies
CREATE POLICY "Public insert order_items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read order_items" ON order_items FOR SELECT USING (true);
CREATE POLICY "Public write order_items" ON order_items FOR ALL USING (true);

-- Site Settings Policies
CREATE POLICY "Public read site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Public write site_settings" ON site_settings FOR ALL USING (true);

-- 8. Seed Initial Data
INSERT INTO site_settings (contact_email, brand_name, tagline, logo_url)
VALUES (
  'efaisal375@gmail.com',
  'Petal & Ink',
  'Crafted with Elegance. Delivered with Love.',
  ''
)
ON CONFLICT DO NOTHING;

-- Seed Categories
INSERT INTO categories (id, name, slug, image_url) VALUES
('c0000000-0000-0000-0000-000000000001', 'Wedding Invitations', 'wedding-invitations', 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop'),
('c0000000-0000-0000-0000-000000000002', 'Greeting Cards', 'greeting-cards', '/images/thank-you-greeting-card.png')
ON CONFLICT (slug) DO NOTHING;

-- Seed Products
INSERT INTO products (id, category_id, name, slug, description, price, image_urls, custom_fields, is_active, is_featured) VALUES
(
  'f0000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000001',
  'Ethereal Botanical Suite',
  'ethereal-botanical-suite',
  'An exquisitely styled wedding invitation suite featuring soft watercolor botanical illustrations, gold leaf text accents, and clean typography. Custom tailored with your names, venue details, and RSVP note.',
  4500,
  ARRAY[
    'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?q=80&w=800&auto=format&fit=crop'
  ],
  '[
    {"name": "Bride Name", "type": "text", "required": true},
    {"name": "Groom Name", "type": "text", "required": true},
    {"name": "Wedding Date & Time", "type": "text", "required": true},
    {"name": "Venue Location", "type": "text", "required": true},
    {"name": "Special Note / Quranic Verse", "type": "text", "required": false}
  ]'::jsonb,
  true,
  true
),
(
  'f0000000-0000-0000-0000-000000000002',
  'c0000000-0000-0000-0000-000000000001',
  'Minimalist Monogram Save The Date',
  'minimalist-monogram-save-the-date',
  'A sleek, high-contrast digital Save The Date design with modern typography and paired initials monogram. Ideal for sharing over WhatsApp, Instagram, or email.',
  2800,
  ARRAY[
    '/images/minimalist-monogram-save-the-date.png'
  ],
  '[
    {"name": "Couple Initials", "type": "text", "required": true},
    {"name": "Couple Full Names", "type": "text", "required": true},
    {"name": "Event Date", "type": "text", "required": true},
    {"name": "City", "type": "text", "required": true}
  ]'::jsonb,
  true,
  true
),
(
  'f0000000-0000-0000-0000-000000000003',
  'c0000000-0000-0000-0000-000000000002',
  'Velvet Rose Anniversary Card',
  'velvet-rose-anniversary-card',
  'A romantic digital greeting card customized with your personalized message, anniversary date, and recipient name.',
  1500,
  ARRAY[
    'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop'
  ],
  '[
    {"name": "Recipient Name", "type": "text", "required": true},
    {"name": "Sender Name", "type": "text", "required": true},
    {"name": "Personal Message", "type": "text", "required": true},
    {"name": "Anniversary Years", "type": "text", "required": false}
  ]'::jsonb,
  true,
  false
)
ON CONFLICT (slug) DO NOTHING;

-- 9. Storage Bucket Setup for Product & Category Images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Public Read Storage" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Public Insert Storage" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Public Update Storage" ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-images');

