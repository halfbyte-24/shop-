-- ==========================================
-- SHOE STORE DIGITAL CATALOGUE SCHEMA
-- ==========================================

-- Enable the pgcrypto extension for UUID generation if not exists
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. UTILITY FUNCTIONS
-- ==========================================

-- Reusable function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 2. TABLES
-- ==========================================

-- shops Table
CREATE TABLE IF NOT EXISTS shops (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    business_type text,
    logo_url text,
    favicon_url text,
    tagline text,
    description text,
    phone text,
    whatsapp text,
    email text,
    address text,
    opening_hours jsonb,
    maps_url text,
    theme_config jsonb,
    homepage_config jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- admin_users Table
CREATE TABLE IF NOT EXISTS admin_users (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    shop_id uuid NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    role text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
    created_at timestamptz DEFAULT now()
);

-- categories Table
CREATE TABLE IF NOT EXISTS categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id uuid NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    image_url text,
    parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
    display_order integer NOT NULL DEFAULT 0,
    is_visible boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(shop_id, slug)
);

-- products Table
CREATE TABLE IF NOT EXISTS products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id uuid NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    sku text,
    brand text,
    price numeric(12,2),
    currency text NOT NULL DEFAULT 'INR',
    availability text NOT NULL DEFAULT 'available' CHECK (availability IN ('available', 'out_of_stock', 'hidden')),
    attributes_json jsonb NOT NULL DEFAULT '{}'::jsonb,
    is_featured boolean NOT NULL DEFAULT false,
    is_published boolean NOT NULL DEFAULT false,
    display_order integer NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(shop_id, slug),
    UNIQUE(shop_id, sku)
);

-- product_images Table
CREATE TABLE IF NOT EXISTS product_images (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url text NOT NULL,
    storage_path text,
    alt_text text,
    display_order integer NOT NULL DEFAULT 0,
    is_primary boolean NOT NULL DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- ==========================================
-- 3. TRIGGERS
-- ==========================================

-- Drop existing triggers to maintain idempotency
DROP TRIGGER IF EXISTS update_shops_updated_at ON shops;
CREATE TRIGGER update_shops_updated_at
    BEFORE UPDATE ON shops
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 4. INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_categories_shop_id ON categories(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_shop_id ON products(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_products_published_visible ON products(shop_id, is_published, availability) WHERE is_published = true AND availability != 'hidden';
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(shop_id, is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_product_images_display_order ON product_images(product_id, display_order);

-- ==========================================
-- 5. RLS AND SECURITY
-- ==========================================

-- Enable RLS
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Helper Function: Check if user is an admin for a specific shop
CREATE OR REPLACE FUNCTION is_admin(check_shop_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM admin_users
        WHERE user_id = auth.uid()
        AND shop_id = check_shop_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop existing policies if needed (for idempotency)
DROP POLICY IF EXISTS "Public can view shops" ON shops;
DROP POLICY IF EXISTS "Admins can update their shop" ON shops;
DROP POLICY IF EXISTS "Admins can view their own record" ON admin_users;
DROP POLICY IF EXISTS "Public can view visible categories" ON categories;
DROP POLICY IF EXISTS "Admins can manage their shop categories" ON categories;
DROP POLICY IF EXISTS "Public can view published non-hidden products" ON products;
DROP POLICY IF EXISTS "Admins can manage their shop products" ON products;
DROP POLICY IF EXISTS "Public can view images of published products" ON product_images;
DROP POLICY IF EXISTS "Admins can manage their shop product images" ON product_images;

-- Policies for 'shops'
CREATE POLICY "Public can view shops"
ON shops FOR SELECT
USING (true);

CREATE POLICY "Admins can update their shop"
ON shops FOR UPDATE
USING (is_admin(id))
WITH CHECK (is_admin(id));

-- Policies for 'admin_users'
CREATE POLICY "Admins can view their own record"
ON admin_users FOR SELECT
USING (user_id = auth.uid());

-- Policies for 'categories'
CREATE POLICY "Public can view visible categories"
ON categories FOR SELECT
USING (is_visible = true);

CREATE POLICY "Admins can manage their shop categories"
ON categories FOR ALL
USING (is_admin(shop_id))
WITH CHECK (is_admin(shop_id));

-- Policies for 'products'
CREATE POLICY "Public can view published non-hidden products"
ON products FOR SELECT
USING (is_published = true AND availability != 'hidden');

CREATE POLICY "Admins can manage their shop products"
ON products FOR ALL
USING (is_admin(shop_id))
WITH CHECK (is_admin(shop_id));

-- Policies for 'product_images'
CREATE POLICY "Public can view images of published products"
ON product_images FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM products 
        WHERE products.id = product_images.product_id 
        AND products.is_published = true 
        AND products.availability != 'hidden'
    )
);

CREATE POLICY "Admins can manage their shop product images"
ON product_images FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM products 
        WHERE products.id = product_images.product_id 
        AND is_admin(products.shop_id)
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM products 
        WHERE products.id = product_images.product_id 
        AND is_admin(products.shop_id)
    )
);

-- ==========================================
-- 6. STORAGE SETUP
-- ==========================================
-- Note: Supabase Storage operates in a separate schema "storage"

-- Helper Function for Storage Ownership
CREATE OR REPLACE FUNCTION public.can_admin_upload_product_image(p_shop_id uuid, p_product_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid() AND shop_id = p_shop_id
        )
        AND 
        EXISTS (
            SELECT 1 FROM products 
            WHERE id = p_product_id AND shop_id = p_shop_id
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Insert bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies for idempotency
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;

-- Storage Policies
-- 1. Public Read
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- 2. Admin Insert
CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'product-images' 
    AND (string_to_array(name, '/'))[1] = 'shop'
    AND (string_to_array(name, '/'))[3] = 'products'
    AND public.can_admin_upload_product_image(
        (string_to_array(name, '/'))[2]::uuid,
        (string_to_array(name, '/'))[4]::uuid
    )
);

-- 3. Admin Update
CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'product-images' 
    AND (string_to_array(name, '/'))[1] = 'shop'
    AND (string_to_array(name, '/'))[3] = 'products'
    AND public.can_admin_upload_product_image(
        (string_to_array(name, '/'))[2]::uuid,
        (string_to_array(name, '/'))[4]::uuid
    )
);

-- 4. Admin Delete
CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'product-images' 
    AND (string_to_array(name, '/'))[1] = 'shop'
    AND (string_to_array(name, '/'))[3] = 'products'
    AND public.can_admin_upload_product_image(
        (string_to_array(name, '/'))[2]::uuid,
        (string_to_array(name, '/'))[4]::uuid
    )
);

-- ==========================================
-- 7. SEED DATA (OPTIONAL)
-- ==========================================
-- Uncomment the block below to insert a demo shop when initializing the database.

/*
INSERT INTO shops (name, business_type, tagline, description)
VALUES (
    'JANATA Shoe Store', 
    'Footwear Retail', 
    'Premium Shoes for Everyone', 
    'Welcome to our digital catalogue.'
);
*/

-- ==========================================
-- 8. ORDERS (WHATSAPP ORDERING)
-- ==========================================

-- orders Table
CREATE TABLE IF NOT EXISTS orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id text NOT NULL UNIQUE,
    shop_id uuid NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    customer_name text NOT NULL,
    customer_phone text NOT NULL,
    customer_address text NOT NULL,
    customer_latitude numeric(10, 8),
    customer_longitude numeric(11, 8),
    subtotal numeric(12,2) NOT NULL,
    total numeric(12,2) NOT NULL,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- order_items Table
CREATE TABLE IF NOT EXISTS order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id uuid REFERENCES products(id) ON DELETE SET NULL,
    product_name text NOT NULL,
    sku text,
    quantity integer NOT NULL DEFAULT 1,
    size text NOT NULL,
    unit_price numeric(12,2) NOT NULL,
    total numeric(12,2) NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_shop_id ON orders(shop_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policies for orders
-- Public can INSERT orders (to place an order)
CREATE POLICY "Public can insert orders"
ON orders FOR INSERT
WITH CHECK (true);

-- Public can SELECT orders they created (via order_id for receipt)
CREATE POLICY "Public can view receipt"
ON orders FOR SELECT
USING (true);

-- Admins can manage their shop orders
CREATE POLICY "Admins can manage their shop orders"
ON orders FOR ALL
USING (is_admin(shop_id))
WITH CHECK (is_admin(shop_id));

-- Policies for order_items
-- Public can INSERT order items
CREATE POLICY "Public can insert order items"
ON order_items FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM orders
        WHERE orders.id = order_items.order_id
    )
);

-- Public can SELECT order items for receipt
CREATE POLICY "Public can view order items for receipt"
ON order_items FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM orders
        WHERE orders.id = order_items.order_id
    )
);

-- Admins can manage their shop order items
CREATE POLICY "Admins can manage their shop order items"
ON order_items FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM orders
        WHERE orders.id = order_items.order_id
        AND is_admin(orders.shop_id)
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM orders
        WHERE orders.id = order_items.order_id
        AND is_admin(orders.shop_id)
    )
);
