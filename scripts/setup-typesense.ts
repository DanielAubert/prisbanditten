/**
 * Setup script for Typesense
 *
 * This script will:
 * 1. Connect to your Typesense instance
 * 2. Create the products collection with proper schema
 * 3. Verify the setup
 *
 * Run with: npx tsx scripts/setup-typesense.ts
 */

import Typesense from 'typesense';

// Load environment variables
const TYPESENSE_HOST = process.env.NEXT_PUBLIC_TYPESENSE_HOST;
const TYPESENSE_PORT = process.env.NEXT_PUBLIC_TYPESENSE_PORT;
const TYPESENSE_PROTOCOL = process.env.NEXT_PUBLIC_TYPESENSE_PROTOCOL;
const TYPESENSE_API_KEY = process.env.NEXT_PUBLIC_TYPESENSE_API_KEY;

if (!TYPESENSE_HOST || !TYPESENSE_PORT || !TYPESENSE_PROTOCOL || !TYPESENSE_API_KEY) {
  console.error('❌ Missing Typesense environment variables!');
  console.error('\nRequired variables in .env.local:');
  console.error('  NEXT_PUBLIC_TYPESENSE_HOST=xxx.a1.typesense.net');
  console.error('  NEXT_PUBLIC_TYPESENSE_PORT=443');
  console.error('  NEXT_PUBLIC_TYPESENSE_PROTOCOL=https');
  console.error('  NEXT_PUBLIC_TYPESENSE_API_KEY=your_admin_api_key');
  process.exit(1);
}

const client = new Typesense.Client({
  nodes: [
    {
      host: TYPESENSE_HOST,
      port: parseInt(TYPESENSE_PORT),
      protocol: TYPESENSE_PROTOCOL,
    },
  ],
  apiKey: TYPESENSE_API_KEY,
  connectionTimeoutSeconds: 10,
});

const productsSchema = {
  name: 'products',
  fields: [
    { name: 'id', type: 'string', facet: false },
    { name: 'name', type: 'string', facet: false },
    { name: 'slug', type: 'string', facet: false },
    { name: 'ean', type: 'string', facet: false, optional: true },
    { name: 'brand', type: 'string', facet: true, optional: true },
    { name: 'category_id', type: 'string', facet: false, optional: true },
    { name: 'category_name', type: 'string', facet: true, optional: true },
    { name: 'category_slug', type: 'string', facet: true, optional: true },
    { name: 'description', type: 'string', facet: false, optional: true },
    { name: 'image_url', type: 'string', facet: false, optional: true },
    { name: 'lowest_price', type: 'float', facet: false, optional: true },
    { name: 'highest_price', type: 'float', facet: false, optional: true },
    { name: 'average_price', type: 'float', facet: false, optional: true },
    { name: 'price_trend', type: 'float', facet: false, optional: true },
    { name: 'retailers', type: 'string[]', facet: true, optional: true },
    { name: 'in_stock', type: 'bool', facet: true, optional: true },
    { name: 'created_at', type: 'int64', facet: false },
    { name: 'updated_at', type: 'int64', facet: false },
  ],
  default_sorting_field: 'created_at',
};

async function setupTypesense() {
  console.log('🚀 Starting Typesense setup...\n');

  try {
    // Test connection
    console.log('1️⃣  Testing connection...');
    const health = await client.health.retrieve();
    console.log('✅ Connected to Typesense successfully!');
    console.log(`   Status: ${health.ok ? 'OK' : 'Error'}\n`);

    // Check if collection already exists
    console.log('2️⃣  Checking for existing collections...');
    try {
      const existingCollection = await client.collections('products').retrieve();
      console.log('⚠️  Collection "products" already exists!');
      console.log('   Do you want to delete and recreate it? (You will lose all data)');
      console.log('   To delete manually: client.collections("products").delete()');
      console.log('\n   Skipping collection creation...\n');

      // Show existing schema
      console.log('📋 Current schema:');
      console.log(JSON.stringify(existingCollection, null, 2));
      return;
    } catch (err: any) {
      if (err.httpStatus === 404) {
        console.log('✅ No existing collection found. Creating new one...\n');
      } else {
        throw err;
      }
    }

    // Create collection
    console.log('3️⃣  Creating "products" collection...');
    const collection = await client.collections().create(productsSchema);
    console.log('✅ Collection created successfully!\n');

    // Verify collection
    console.log('4️⃣  Verifying collection...');
    const retrievedCollection = await client.collections('products').retrieve();
    console.log('✅ Collection verified!');
    console.log(`   Name: ${retrievedCollection.name}`);
    console.log(`   Fields: ${retrievedCollection.num_documents} documents`);
    console.log(`   Schema fields: ${retrievedCollection.fields?.length} fields\n`);

    console.log('🎉 Typesense setup complete!\n');
    console.log('📝 Next steps:');
    console.log('   1. Run the scraper to populate data: npx tsx src/lib/scrapers/elkjop.ts');
    console.log('   2. Test search: Visit http://localhost:3001/sok');
    console.log('   3. Check Typesense dashboard for your cluster\n');

  } catch (error: any) {
    console.error('❌ Error setting up Typesense:', error.message);
    if (error.httpStatus) {
      console.error(`   HTTP Status: ${error.httpStatus}`);
    }
    process.exit(1);
  }
}

// Run setup
setupTypesense();
