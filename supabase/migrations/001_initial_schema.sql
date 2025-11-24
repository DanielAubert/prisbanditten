-- PrisBanditt Database Schema
-- Initial migration for MVP

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- RETAILERS TABLE
-- ============================================================================
CREATE TABLE retailers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  logo_url TEXT,
  website_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_retailers_slug ON retailers(slug);
CREATE INDEX idx_retailers_active ON retailers(is_active);

-- ============================================================================
-- CATEGORIES TABLE
-- ============================================================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  icon VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- ============================================================================
-- PRODUCTS TABLE
-- ============================================================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(500) NOT NULL,
  slug VARCHAR(500) NOT NULL,
  ean VARCHAR(13),
  brand VARCHAR(100),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url TEXT,
  description TEXT,

  -- Search optimization
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('norwegian', coalesce(name, '') || ' ' || coalesce(brand, '') || ' ' || coalesce(description, ''))
  ) STORED,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_products_ean ON products(ean) WHERE ean IS NOT NULL;
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_search ON products USING GIN(search_vector);
CREATE INDEX idx_products_name_trgm ON products USING gin(name gin_trgm_ops);

-- ============================================================================
-- PRODUCT_RETAILERS TABLE (Junction for products sold by retailers)
-- ============================================================================
CREATE TABLE product_retailers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
  product_url TEXT NOT NULL,
  stock_status VARCHAR(50) DEFAULT 'unknown',
  last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(product_id, retailer_id)
);

CREATE INDEX idx_product_retailers_product ON product_retailers(product_id);
CREATE INDEX idx_product_retailers_retailer ON product_retailers(retailer_id);
CREATE INDEX idx_product_retailers_url ON product_retailers(product_url);

-- ============================================================================
-- PRICES TABLE
-- ============================================================================
CREATE TABLE prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_retailer_id UUID NOT NULL REFERENCES product_retailers(id) ON DELETE CASCADE,
  price DECIMAL(10, 2) NOT NULL,
  shipping_cost DECIMAL(10, 2),
  total_price DECIMAL(10, 2) GENERATED ALWAYS AS (price + COALESCE(shipping_cost, 0)) STORED,
  currency VARCHAR(3) DEFAULT 'NOK',
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Price change tracking
  previous_price DECIMAL(10, 2),
  price_change DECIMAL(10, 2),
  price_change_percent DECIMAL(5, 2)
);

CREATE INDEX idx_prices_product_retailer ON prices(product_retailer_id);
CREATE INDEX idx_prices_scraped_at ON prices(scraped_at DESC);
CREATE INDEX idx_prices_price ON prices(price);
CREATE INDEX idx_prices_total ON prices(total_price);

-- Composite index for price history queries
CREATE INDEX idx_prices_history ON prices(product_retailer_id, scraped_at DESC);

-- ============================================================================
-- PRICE_STATISTICS TABLE (Pre-calculated stats for performance)
-- ============================================================================
CREATE TABLE price_statistics (
  product_retailer_id UUID PRIMARY KEY REFERENCES product_retailers(id) ON DELETE CASCADE,
  current_price DECIMAL(10, 2),
  lowest_price_30d DECIMAL(10, 2),
  highest_price_30d DECIMAL(10, 2),
  average_price_30d DECIMAL(10, 2),
  lowest_price_90d DECIMAL(10, 2),
  highest_price_90d DECIMAL(10, 2),
  average_price_90d DECIMAL(10, 2),
  price_trend VARCHAR(20), -- 'up', 'down', 'stable'
  last_price_drop_date TIMESTAMP WITH TIME ZONE,
  last_price_drop_percent DECIMAL(5, 2),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_price_stats_trend ON price_statistics(price_trend);
CREATE INDEX idx_price_stats_current ON price_statistics(current_price);

-- ============================================================================
-- USERS TABLE (Extends Supabase auth.users)
-- ============================================================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name VARCHAR(100),
  avatar_url TEXT,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  price_tolerance_percent DECIMAL(5, 2) DEFAULT 10.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PRICE_ALERTS TABLE
-- ============================================================================
CREATE TABLE price_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  target_price DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  notification_sent BOOLEAN DEFAULT false,
  triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_price_alerts_user ON price_alerts(user_id);
CREATE INDEX idx_price_alerts_product ON price_alerts(product_id);
CREATE INDEX idx_price_alerts_active ON price_alerts(is_active) WHERE is_active = true;

-- ============================================================================
-- USER_FAVORITES TABLE
-- ============================================================================
CREATE TABLE user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_product ON user_favorites(product_id);

-- ============================================================================
-- USER_SEARCHES TABLE (Analytics)
-- ============================================================================
CREATE TABLE user_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  search_query VARCHAR(500) NOT NULL,
  results_count INTEGER,
  clicked_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  session_id VARCHAR(100),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_searches_user ON user_searches(user_id);
CREATE INDEX idx_user_searches_query ON user_searches(search_query);
CREATE INDEX idx_user_searches_created ON user_searches(created_at DESC);

-- ============================================================================
-- PRODUCT_REVIEWS TABLE
-- ============================================================================
CREATE TABLE product_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  retailer_id UUID REFERENCES retailers(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200),
  content TEXT,
  verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(product_id, user_id)
);

CREATE INDEX idx_product_reviews_product ON product_reviews(product_id);
CREATE INDEX idx_product_reviews_user ON product_reviews(user_id);
CREATE INDEX idx_product_reviews_rating ON product_reviews(rating);
CREATE INDEX idx_product_reviews_created ON product_reviews(created_at DESC);

-- ============================================================================
-- SCRAPER_LOGS TABLE (For monitoring)
-- ============================================================================
CREATE TABLE scraper_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  retailer_id UUID REFERENCES retailers(id) ON DELETE SET NULL,
  scraper_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL, -- 'success', 'partial', 'failed'
  products_scraped INTEGER DEFAULT 0,
  products_updated INTEGER DEFAULT 0,
  errors_count INTEGER DEFAULT 0,
  error_message TEXT,
  duration_ms INTEGER,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_scraper_logs_retailer ON scraper_logs(retailer_id);
CREATE INDEX idx_scraper_logs_status ON scraper_logs(status);
CREATE INDEX idx_scraper_logs_started ON scraper_logs(started_at DESC);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
CREATE TRIGGER update_retailers_updated_at BEFORE UPDATE ON retailers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_price_alerts_updated_at BEFORE UPDATE ON price_alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_reviews_updated_at BEFORE UPDATE ON product_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policies for price_alerts
CREATE POLICY "Users can view own alerts" ON price_alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own alerts" ON price_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts" ON price_alerts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own alerts" ON price_alerts
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for user_favorites
CREATE POLICY "Users can view own favorites" ON user_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own favorites" ON user_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON user_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for product_reviews
CREATE POLICY "Anyone can view reviews" ON product_reviews
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews" ON product_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON product_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" ON product_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert default retailers
INSERT INTO retailers (name, slug, website_url, logo_url) VALUES
  ('Elkjøp', 'elkjop', 'https://www.elkjop.no', NULL),
  ('Komplett', 'komplett', 'https://www.komplett.no', NULL),
  ('Power', 'power', 'https://www.power.no', NULL)
ON CONFLICT (slug) DO NOTHING;

-- Insert default categories
INSERT INTO categories (name, slug, icon) VALUES
  ('Datamaskiner', 'datamaskiner', '💻'),
  ('Telefoner & Smartklokker', 'telefoner', '📱'),
  ('TV & Lyd', 'tv-lyd', '📺'),
  ('Gaming', 'gaming', '🎮'),
  ('Smart Home', 'smart-home', '🏠'),
  ('Foto & Video', 'foto-video', '📷'),
  ('Hvitevarer', 'hvitevarer', '🔌')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View for current best prices per product
CREATE OR REPLACE VIEW product_best_prices AS
SELECT DISTINCT ON (pr.product_id)
  pr.product_id,
  pr.retailer_id,
  r.name AS retailer_name,
  r.slug AS retailer_slug,
  p.price,
  p.shipping_cost,
  p.total_price,
  p.scraped_at,
  pr.product_url,
  pr.stock_status,
  pr.is_available
FROM product_retailers pr
JOIN retailers r ON r.id = pr.retailer_id
LEFT JOIN LATERAL (
  SELECT * FROM prices
  WHERE product_retailer_id = pr.id
  ORDER BY scraped_at DESC
  LIMIT 1
) p ON true
WHERE pr.is_available = true AND r.is_active = true
ORDER BY pr.product_id, p.total_price ASC NULLS LAST;

-- View for product details with pricing
CREATE OR REPLACE VIEW products_with_prices AS
SELECT
  p.*,
  c.name AS category_name,
  c.slug AS category_slug,
  (
    SELECT json_agg(
      json_build_object(
        'retailer_id', pbp.retailer_id,
        'retailer_name', pbp.retailer_name,
        'retailer_slug', pbp.retailer_slug,
        'price', pbp.price,
        'shipping_cost', pbp.shipping_cost,
        'total_price', pbp.total_price,
        'product_url', pbp.product_url,
        'stock_status', pbp.stock_status,
        'scraped_at', pbp.scraped_at
      ) ORDER BY pbp.total_price
    )
    FROM product_best_prices pbp
    WHERE pbp.product_id = p.id
  ) AS prices,
  (
    SELECT MIN(total_price)
    FROM product_best_prices pbp
    WHERE pbp.product_id = p.id
  ) AS lowest_price
FROM products p
LEFT JOIN categories c ON c.id = p.category_id;

-- Comments for documentation
COMMENT ON TABLE products IS 'Core products table with search optimization';
COMMENT ON TABLE prices IS 'Historical price data for analytics and trending';
COMMENT ON TABLE price_statistics IS 'Pre-calculated price stats for fast queries';
COMMENT ON TABLE price_alerts IS 'User price alerts for notifications';
COMMENT ON VIEW product_best_prices IS 'Current best price per product across retailers';
COMMENT ON VIEW products_with_prices IS 'Complete product info with all retailer prices';
