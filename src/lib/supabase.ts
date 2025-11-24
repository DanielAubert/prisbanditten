import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Server-side client with service role key (for scrapers, cron jobs, etc.)
export const createServerClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// Helper types
export type Retailer = Database['public']['Tables']['retailers']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type ProductRetailer = Database['public']['Tables']['product_retailers']['Row'];
export type Price = Database['public']['Tables']['prices']['Row'];
export type PriceStatistics = Database['public']['Tables']['price_statistics']['Row'];
export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type PriceAlert = Database['public']['Tables']['price_alerts']['Row'];
export type UserFavorite = Database['public']['Tables']['user_favorites']['Row'];
export type UserSearch = Database['public']['Tables']['user_searches']['Row'];
export type ProductReview = Database['public']['Tables']['product_reviews']['Row'];
export type ScraperLog = Database['public']['Tables']['scraper_logs']['Row'];

// View types
export type ProductBestPrice = Database['public']['Views']['product_best_prices']['Row'];
export type ProductWithPrices = Database['public']['Views']['products_with_prices']['Row'];

// Insert types
export type RetailerInsert = Database['public']['Tables']['retailers']['Insert'];
export type ProductInsert = Database['public']['Tables']['products']['Insert'];
export type ProductRetailerInsert = Database['public']['Tables']['product_retailers']['Insert'];
export type PriceInsert = Database['public']['Tables']['prices']['Insert'];
export type PriceAlertInsert = Database['public']['Tables']['price_alerts']['Insert'];
export type UserFavoriteInsert = Database['public']['Tables']['user_favorites']['Insert'];
export type ProductReviewInsert = Database['public']['Tables']['product_reviews']['Insert'];
export type ScraperLogInsert = Database['public']['Tables']['scraper_logs']['Insert'];

// Update types
export type ProductUpdate = Database['public']['Tables']['products']['Update'];
export type PriceAlertUpdate = Database['public']['Tables']['price_alerts']['Update'];
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update'];
