export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      retailers: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          website_url: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          website_url: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          website_url?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          parent_id: string | null
          icon: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          parent_id?: string | null
          icon?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          parent_id?: string | null
          icon?: string | null
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          ean: string | null
          brand: string | null
          category_id: string | null
          image_url: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          ean?: string | null
          brand?: string | null
          category_id?: string | null
          image_url?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          ean?: string | null
          brand?: string | null
          category_id?: string | null
          image_url?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      product_retailers: {
        Row: {
          id: string
          product_id: string
          retailer_id: string
          product_url: string
          stock_status: string
          last_checked_at: string
          is_available: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          retailer_id: string
          product_url: string
          stock_status?: string
          last_checked_at?: string
          is_available?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          retailer_id?: string
          product_url?: string
          stock_status?: string
          last_checked_at?: string
          is_available?: boolean
          created_at?: string
        }
      }
      prices: {
        Row: {
          id: string
          product_retailer_id: string
          price: number
          shipping_cost: number | null
          total_price: number
          currency: string
          scraped_at: string
          previous_price: number | null
          price_change: number | null
          price_change_percent: number | null
        }
        Insert: {
          id?: string
          product_retailer_id: string
          price: number
          shipping_cost?: number | null
          currency?: string
          scraped_at?: string
          previous_price?: number | null
          price_change?: number | null
          price_change_percent?: number | null
        }
        Update: {
          id?: string
          product_retailer_id?: string
          price?: number
          shipping_cost?: number | null
          currency?: string
          scraped_at?: string
          previous_price?: number | null
          price?: number | null
          price_change_percent?: number | null
        }
      }
      price_statistics: {
        Row: {
          product_retailer_id: string
          current_price: number | null
          lowest_price_30d: number | null
          highest_price_30d: number | null
          average_price_30d: number | null
          lowest_price_90d: number | null
          highest_price_90d: number | null
          average_price_90d: number | null
          price_trend: string | null
          last_price_drop_date: string | null
          last_price_drop_percent: number | null
          updated_at: string
        }
        Insert: {
          product_retailer_id: string
          current_price?: number | null
          lowest_price_30d?: number | null
          highest_price_30d?: number | null
          average_price_30d?: number | null
          lowest_price_90d?: number | null
          highest_price_90d?: number | null
          average_price_90d?: number | null
          price_trend?: string | null
          last_price_drop_date?: string | null
          last_price_drop_percent?: number | null
          updated_at?: string
        }
        Update: {
          product_retailer_id?: string
          current_price?: number | null
          lowest_price_30d?: number | null
          highest_price_30d?: number | null
          average_price_30d?: number | null
          lowest_price_90d?: number | null
          highest_price_90d?: number | null
          average_price_90d?: number | null
          price_trend?: string | null
          last_price_drop_date?: string | null
          last_price_drop_percent?: number | null
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          email_notifications: boolean
          push_notifications: boolean
          price_tolerance_percent: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          email_notifications?: boolean
          push_notifications?: boolean
          price_tolerance_percent?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          email_notifications?: boolean
          push_notifications?: boolean
          price_tolerance_percent?: number
          created_at?: string
          updated_at?: string
        }
      }
      price_alerts: {
        Row: {
          id: string
          user_id: string
          product_id: string
          target_price: number
          is_active: boolean
          notification_sent: boolean
          triggered_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          target_price: number
          is_active?: boolean
          notification_sent?: boolean
          triggered_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          target_price?: number
          is_active?: boolean
          notification_sent?: boolean
          triggered_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_favorites: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          created_at?: string
        }
      }
      user_searches: {
        Row: {
          id: string
          user_id: string | null
          search_query: string
          results_count: number | null
          clicked_product_id: string | null
          session_id: string | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          search_query: string
          results_count?: number | null
          clicked_product_id?: string | null
          session_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          search_query?: string
          results_count?: number | null
          clicked_product_id?: string | null
          session_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      product_reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string
          retailer_id: string | null
          rating: number
          title: string | null
          content: string | null
          verified_purchase: boolean
          helpful_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          retailer_id?: string | null
          rating: number
          title?: string | null
          content?: string | null
          verified_purchase?: boolean
          helpful_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string
          retailer_id?: string | null
          rating?: number
          title?: string | null
          content?: string | null
          verified_purchase?: boolean
          helpful_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      scraper_logs: {
        Row: {
          id: string
          retailer_id: string | null
          scraper_type: string
          status: string
          products_scraped: number
          products_updated: number
          errors_count: number
          error_message: string | null
          duration_ms: number | null
          started_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          retailer_id?: string | null
          scraper_type: string
          status: string
          products_scraped?: number
          products_updated?: number
          errors_count?: number
          error_message?: string | null
          duration_ms?: number | null
          started_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          retailer_id?: string | null
          scraper_type?: string
          status?: string
          products_scraped?: number
          products_updated?: number
          errors_count?: number
          error_message?: string | null
          duration_ms?: number | null
          started_at?: string
          completed_at?: string | null
        }
      }
    }
    Views: {
      product_best_prices: {
        Row: {
          product_id: string
          retailer_id: string
          retailer_name: string
          retailer_slug: string
          price: number | null
          shipping_cost: number | null
          total_price: number | null
          scraped_at: string | null
          product_url: string
          stock_status: string
          is_available: boolean
        }
      }
      products_with_prices: {
        Row: {
          id: string
          name: string
          slug: string
          ean: string | null
          brand: string | null
          category_id: string | null
          category_name: string | null
          category_slug: string | null
          image_url: string | null
          description: string | null
          prices: Json | null
          lowest_price: number | null
          created_at: string
          updated_at: string
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
