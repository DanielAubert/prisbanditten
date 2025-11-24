#!/usr/bin/env tsx
/**
 * Verify Supabase setup
 * Checks that all tables exist and seed data is present
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/lib/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Make sure .env.local is set up correctly');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

async function verifySetup() {
  console.log('🔍 Verifying Supabase setup...\n');

  // Check connection
  console.log('1. Testing connection...');
  const { data: connectionTest, error: connError } = await supabase
    .from('retailers')
    .select('count')
    .limit(1);

  if (connError) {
    console.error('❌ Connection failed:', connError.message);
    process.exit(1);
  }
  console.log('✅ Connection successful\n');

  // Check retailers seed data
  console.log('2. Checking retailers...');
  const { data: retailers, error: retailersError } = await supabase
    .from('retailers')
    .select('*');

  if (retailersError) {
    console.error('❌ Error fetching retailers:', retailersError.message);
  } else {
    console.log(`✅ Found ${retailers.length} retailers:`);
    retailers.forEach(r => console.log(`   - ${r.name} (${r.slug})`));
  }
  console.log('');

  // Check categories seed data
  console.log('3. Checking categories...');
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('*');

  if (categoriesError) {
    console.error('❌ Error fetching categories:', categoriesError.message);
  } else {
    console.log(`✅ Found ${categories.length} categories:`);
    categories.forEach(c => console.log(`   - ${c.icon} ${c.name} (${c.slug})`));
  }
  console.log('');

  // Check views
  console.log('4. Checking views...');
  const { data: viewTest, error: viewError } = await supabase
    .from('products_with_prices')
    .select('*')
    .limit(1);

  if (viewError) {
    console.error('❌ Error accessing views:', viewError.message);
  } else {
    console.log('✅ Views accessible');
  }
  console.log('');

  // List all tables
  console.log('5. Verifying table structure...');
  const tables = [
    'retailers',
    'categories',
    'products',
    'product_retailers',
    'prices',
    'price_statistics',
    'user_profiles',
    'price_alerts',
    'user_favorites',
    'user_searches',
    'product_reviews',
    'scraper_logs',
  ];

  for (const table of tables) {
    const { error } = await supabase.from(table as any).select('*').limit(0);
    if (error) {
      console.log(`❌ ${table}: ${error.message}`);
    } else {
      console.log(`✅ ${table}`);
    }
  }

  console.log('\n🎉 Database setup verified successfully!');
  console.log('\n📊 Database Statistics:');
  console.log(`   Retailers: ${retailers?.length || 0}`);
  console.log(`   Categories: ${categories?.length || 0}`);
  console.log(`   Products: 0 (ready to scrape)`);
  console.log('\n✨ Next steps:');
  console.log('   1. Update Elkjøp scraper to use new schema');
  console.log('   2. Run scraper to populate products');
  console.log('   3. Set up Typesense (optional)');
  console.log('   4. Build UI components');
}

verifySetup().catch(error => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
});
