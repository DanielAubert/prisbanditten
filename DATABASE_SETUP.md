# Database Setup Guide

## 🚀 Quick Start

### 1. Supabase Setup

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for database to be provisioned

#### Get API Keys
```bash
# Add to .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### Run Migrations
```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

Or manually:
1. Go to Supabase Dashboard → SQL Editor
2. Copy content from `supabase/migrations/001_initial_schema.sql`
3. Run the SQL

### 2. Typesense Setup

#### Option A: Typesense Cloud (Recommended)
1. Go to [cloud.typesense.org](https://cloud.typesense.org)
2. Create a new cluster
3. Get your credentials

```bash
# Add to .env.local
NEXT_PUBLIC_TYPESENSE_HOST=xxx-1.a1.typesense.net
NEXT_PUBLIC_TYPESENSE_PORT=443
NEXT_PUBLIC_TYPESENSE_PROTOCOL=https
NEXT_PUBLIC_TYPESENSE_API_KEY=your-search-only-key
TYPESENSE_ADMIN_API_KEY=your-admin-key
```

#### Option B: Self-hosted (Docker)
```bash
# Run Typesense locally
docker run -d \
  -p 8108:8108 \
  -v$(pwd)/typesense-data:/data \
  typesense/typesense:26.0 \
  --data-dir /data \
  --api-key=xyz \
  --enable-cors
```

```bash
# Add to .env.local
NEXT_PUBLIC_TYPESENSE_HOST=localhost
NEXT_PUBLIC_TYPESENSE_PORT=8108
NEXT_PUBLIC_TYPESENSE_PROTOCOL=http
NEXT_PUBLIC_TYPESENSE_API_KEY=xyz
TYPESENSE_ADMIN_API_KEY=xyz
```

#### Initialize Typesense Collection
```bash
# Run this once to create the products collection
npm run typesense:init
```

Or create a script:
```typescript
// scripts/init-typesense.ts
import { initializeTypesenseCollection } from '@/lib/typesense';

async function main() {
  await initializeTypesenseCollection();
  console.log('✅ Typesense initialized');
}

main();
```

### 3. Database Schema Overview

#### Core Tables

**retailers**
- Stores information about online stores (Elkjøp, Komplett, etc.)

**categories**
- Product categories (hierarchical, supports subcategories)

**products**
- Main product information (name, EAN, brand, image, etc.)
- Full-text search enabled via tsvector

**product_retailers**
- Junction table linking products to retailers
- Stores product URL, stock status, availability per retailer

**prices**
- Historical price data (time-series)
- Tracks price changes and percentages
- Indexed for fast queries

**price_statistics**
- Pre-calculated price stats (30d, 90d averages, trends)
- Updated by cron jobs for performance

#### User Tables

**user_profiles**
- Extended user data beyond Supabase auth
- Notification preferences, price tolerance

**price_alerts**
- User-created price alerts
- Triggers when target price is reached

**user_favorites**
- User's favorite products watchlist

**user_searches**
- Search analytics and history

**product_reviews**
- User reviews and ratings for products

#### Monitoring

**scraper_logs**
- Track scraping jobs performance and errors

### 4. Views

**product_best_prices**
- Gets current best price per product across all retailers
- Use this for "lowest price" queries

**products_with_prices**
- Complete product info with all retailer prices
- Use this for product detail pages

### 5. Example Queries

#### Get product with all prices
```typescript
import { supabase } from '@/lib/supabase';

const { data } = await supabase
  .from('products_with_prices')
  .select('*')
  .eq('id', productId)
  .single();
```

#### Create price alert
```typescript
const { data, error } = await supabase
  .from('price_alerts')
  .insert({
    user_id: userId,
    product_id: productId,
    target_price: 5000,
  });
```

#### Get price history
```typescript
const { data } = await supabase
  .from('prices')
  .select(`
    price,
    shipping_cost,
    total_price,
    scraped_at,
    product_retailers!inner(
      retailer_id,
      retailers(name, slug)
    )
  `)
  .eq('product_retailers.product_id', productId)
  .order('scraped_at', { ascending: false })
  .limit(90);
```

### 6. Indexing Products to Typesense

```typescript
import { indexProduct } from '@/lib/typesense';
import { supabase } from '@/lib/supabase';

// Sync product to Typesense after scraping
const { data: product } = await supabase
  .from('products_with_prices')
  .select('*')
  .eq('id', productId)
  .single();

await indexProduct({
  id: product.id,
  name: product.name,
  slug: product.slug,
  brand: product.brand,
  category_name: product.category_name,
  category_slug: product.category_slug,
  image_url: product.image_url,
  description: product.description,
  lowest_price: product.lowest_price,
  retailers: product.prices?.map(p => p.retailer_slug) || [],
  in_stock: product.prices?.some(p => p.stock_status === 'in_stock'),
  created_at: Math.floor(new Date(product.created_at).getTime() / 1000),
  updated_at: Math.floor(new Date(product.updated_at).getTime() / 1000),
});
```

### 7. Search with Typesense

```typescript
import { searchProducts } from '@/lib/typesense';

const results = await searchProducts({
  query: 'macbook pro',
  page: 1,
  perPage: 20,
  sortBy: 'lowest_price:asc',
  brands: ['Apple'],
  maxPrice: 20000,
  inStockOnly: true,
});

console.log(results.hits); // Array of products
console.log(results.facet_counts); // Filters (brands, categories, etc.)
```

## 🔐 Row Level Security (RLS)

RLS is enabled for user-related tables:
- Users can only access their own profiles, alerts, favorites, and reviews
- Product data is public (no RLS)
- Scraper service uses service role key (bypasses RLS)

## 📊 Performance Tips

1. **Use views** for complex queries (`products_with_prices`, `product_best_prices`)
2. **Batch operations** when inserting/updating prices
3. **Cache** price statistics (already pre-calculated)
4. **Typesense** for all search queries (don't use SQL full-text search)
5. **Indexes** are already optimized in schema

## 🛠️ Maintenance

### Update Price Statistics (Run Daily)
```typescript
// scripts/update-price-stats.ts
// Calculate 30d/90d averages, trends, etc.
// Update price_statistics table
```

### Clean Old Data (Run Weekly)
```typescript
// Keep only 6 months of price history
await supabase
  .from('prices')
  .delete()
  .lt('scraped_at', sixMonthsAgo.toISOString());
```

## 📝 Next Steps

1. ✅ Database schema created
2. ✅ Types generated
3. ✅ Typesense configured
4. [ ] Run migrations on Supabase
5. [ ] Initialize Typesense collection
6. [ ] Update scraper to use new schema
7. [ ] Build UI components
8. [ ] Create API routes

---

**All set!** Your database is ready for PrisBanditt 🚀
