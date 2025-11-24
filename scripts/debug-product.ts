import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugProduct() {
  const slug = 'iphone-15-pro-128gb';

  console.log('🔍 Debugging product:', slug, '\n');

  // 1. Check product exists
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single();

  console.log('1️⃣ Product:', product ? '✅ Found' : '❌ Not found');
  if (productError) console.log('   Error:', productError.message);
  if (product) console.log('   ID:', product.id);

  // 2. Check product_retailers
  if (product) {
    const { data: junctions, error: jError } = await supabase
      .from('product_retailers')
      .select('*, retailers(*)')
      .eq('product_id', product.id);

    console.log('\n2️⃣ Product-Retailer junctions:', junctions?.length || 0);
    if (jError) console.log('   Error:', jError.message);

    // 3. Check prices for each junction
    if (junctions && junctions.length > 0) {
      console.log('\n3️⃣ Prices per retailer:');
      for (const junction of junctions) {
        const { data: prices, count } = await supabase
          .from('prices')
          .select('*', { count: 'exact' })
          .eq('product_retailer_id', junction.id);

        console.log(`   ${junction.retailers.name}: ${count} prices`);
        if (prices && prices.length > 0) {
          const latest = prices[prices.length - 1];
          console.log(`     Latest: ${latest.price} kr (+ ${latest.shipping_cost || 0} kr frakt)`);
        }
      }
    }
  }

  // 4. Check view
  console.log('\n4️⃣ View check:');
  const { data: viewData, error: viewError } = await supabase
    .from('products_with_prices')
    .select('*')
    .eq('slug', slug)
    .single();

  console.log('   View data:', viewData ? '✅ Found' : '❌ Not found');
  if (viewError) console.log('   Error:', viewError.message);
  if (viewData) {
    console.log('   Lowest price:', viewData.lowest_price);
    console.log('   Highest price:', viewData.highest_price);
    console.log('   Average price:', viewData.average_price);
  }

  // 5. Direct price fetch
  console.log('\n5️⃣ Direct price fetch (like product page):');
  const { data: directPrices, error: directError } = await supabase
    .from('prices')
    .select(`
      *,
      retailers:product_retailers!inner(
        id,
        retailers(
          id,
          name,
          slug,
          website_url,
          logo_url
        )
      )
    `)
    .eq('product_retailers.product_id', product?.id)
    .eq('is_available', true)
    .order('total_price', { ascending: true });

  console.log('   Direct fetch:', directPrices?.length || 0, 'prices');
  if (directError) console.log('   Error:', directError.message);
}

debugProduct();
