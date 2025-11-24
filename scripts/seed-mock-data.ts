/**
 * Seed Mock Data Script
 *
 * Populates Supabase and Typesense with realistic test products
 */

import { createClient } from '@supabase/supabase-js';
import Typesense from 'typesense';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const typesenseHost = process.env.NEXT_PUBLIC_TYPESENSE_HOST!;
const typesensePort = process.env.NEXT_PUBLIC_TYPESENSE_PORT!;
const typesenseProtocol = process.env.NEXT_PUBLIC_TYPESENSE_PROTOCOL!;
const typesenseApiKey = process.env.NEXT_PUBLIC_TYPESENSE_API_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const typesense = new Typesense.Client({
  nodes: [{
    host: typesenseHost,
    port: parseInt(typesensePort),
    protocol: typesenseProtocol,
  }],
  apiKey: typesenseApiKey,
  connectionTimeoutSeconds: 10,
});

// Mock product data
const mockProducts = [
  {
    name: 'iPhone 15 Pro 128GB',
    slug: 'iphone-15-pro-128gb',
    ean: '195949038345',
    brand: 'Apple',
    category: 'telefoner',
    description: 'Apples nyeste flaggskip med A17 Pro-chip, titanium-design og ProMotion-skjerm. Perfekt for foto, video og gaming.',
    image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400',
    prices: [
      { retailer: 'elkjop', base_price: 14990, shipping: 0, in_stock: true },
      { retailer: 'komplett', base_price: 14790, shipping: 0, in_stock: true },
      { retailer: 'power', base_price: 14990, shipping: 0, in_stock: false },
    ]
  },
  {
    name: 'Samsung Galaxy S24 Ultra 256GB',
    slug: 'samsung-galaxy-s24-ultra-256gb',
    ean: '8806095258904',
    brand: 'Samsung',
    category: 'telefoner',
    description: 'Samsungs mest kraftige telefon med S Pen, 200MP kamera og AI-funksjoner. Perfekt for produktivitet og kreativitet.',
    image_url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400',
    prices: [
      { retailer: 'elkjop', base_price: 13490, shipping: 0, in_stock: true },
      { retailer: 'komplett', base_price: 13290, shipping: 0, in_stock: true },
      { retailer: 'power', base_price: 13590, shipping: 0, in_stock: true },
    ]
  },
  {
    name: 'MacBook Air M3 15" 16GB 512GB',
    slug: 'macbook-air-m3-15-16gb-512gb',
    ean: '195949112233',
    brand: 'Apple',
    category: 'datamaskiner',
    description: 'Lett og kraftig laptop med M3-chip. Perfekt for studier, jobb og kreativt arbeid. Opptil 18 timers batteritid.',
    image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
    prices: [
      { retailer: 'elkjop', base_price: 18990, shipping: 0, in_stock: true },
      { retailer: 'komplett', base_price: 18490, shipping: 0, in_stock: true },
      { retailer: 'power', base_price: 18990, shipping: 0, in_stock: true },
    ]
  },
  {
    name: 'Sony WH-1000XM5 Hodetelefoner',
    slug: 'sony-wh-1000xm5-hodetelefoner',
    ean: '4548736134300',
    brand: 'Sony',
    category: 'tv-lyd',
    description: 'Markedsledende støydemping, fantastisk lydkvalitet og 30 timers batteritid. Perfekt for reise og kontor.',
    image_url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400',
    prices: [
      { retailer: 'elkjop', base_price: 3990, shipping: 0, in_stock: true },
      { retailer: 'komplett', base_price: 3790, shipping: 49, in_stock: true },
      { retailer: 'power', base_price: 3890, shipping: 0, in_stock: true },
    ]
  },
  {
    name: 'PlayStation 5 Digital Edition',
    slug: 'playstation-5-digital-edition',
    ean: '0711719827047',
    brand: 'Sony',
    category: 'gaming',
    description: 'Neste generasjons gaming-konsoll med lynrask SSD og fantastisk grafikk. Støtter 4K gaming ved 120fps.',
    image_url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400',
    prices: [
      { retailer: 'elkjop', base_price: 4690, shipping: 0, in_stock: false },
      { retailer: 'komplett', base_price: 4590, shipping: 0, in_stock: true },
      { retailer: 'power', base_price: 4690, shipping: 0, in_stock: true },
    ]
  },
  {
    name: 'Apple AirPods Pro 2 (USB-C)',
    slug: 'apple-airpods-pro-2-usb-c',
    ean: '195949112244',
    brand: 'Apple',
    category: 'tv-lyd',
    description: 'Aktiv støydemping, adaptiv lyd og personlig romlig lyd. Perfekt passform og opptil 6 timers batteritid.',
    image_url: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400',
    prices: [
      { retailer: 'elkjop', base_price: 2990, shipping: 0, in_stock: true },
      { retailer: 'komplett', base_price: 2890, shipping: 0, in_stock: true },
      { retailer: 'power', base_price: 2990, shipping: 0, in_stock: false },
    ]
  },
  {
    name: 'LG C4 65" OLED 4K Smart TV',
    slug: 'lg-c4-65-oled-4k-smart-tv',
    ean: '8806091234567',
    brand: 'LG',
    category: 'tv-lyd',
    description: 'Perfekt bildeklaritet med OLED-teknologi. Støtter Dolby Vision, 120Hz og er perfekt for gaming og film.',
    image_url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400',
    prices: [
      { retailer: 'elkjop', base_price: 16990, shipping: 0, in_stock: true },
      { retailer: 'komplett', base_price: 16490, shipping: 0, in_stock: true },
      { retailer: 'power', base_price: 16990, shipping: 0, in_stock: true },
    ]
  },
  {
    name: 'iPad Pro 13" M4 256GB WiFi',
    slug: 'ipad-pro-13-m4-256gb-wifi',
    ean: '195949112255',
    brand: 'Apple',
    category: 'datamaskiner',
    description: 'Kraftigste iPad noensinne med M4-chip. ProMotion 120Hz skjerm og støtte for Apple Pencil Pro.',
    image_url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
    prices: [
      { retailer: 'elkjop', base_price: 16490, shipping: 0, in_stock: true },
      { retailer: 'komplett', base_price: 15990, shipping: 0, in_stock: true },
      { retailer: 'power', base_price: 16490, shipping: 0, in_stock: true },
    ]
  },
  {
    name: 'Samsung 990 Pro 2TB NVMe SSD',
    slug: 'samsung-990-pro-2tb-nvme-ssd',
    ean: '8806094234567',
    brand: 'Samsung',
    category: 'datamaskiner',
    description: 'Lynrask PCIe 4.0 SSD med opptil 7450 MB/s lesehastighet. Perfekt for gaming og kreativt arbeid.',
    image_url: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400',
    prices: [
      { retailer: 'elkjop', base_price: 1890, shipping: 0, in_stock: true },
      { retailer: 'komplett', base_price: 1790, shipping: 49, in_stock: true },
      { retailer: 'power', base_price: 1890, shipping: 0, in_stock: true },
    ]
  },
  {
    name: 'Nintendo Switch OLED',
    slug: 'nintendo-switch-oled',
    ean: '045496882754',
    brand: 'Nintendo',
    category: 'gaming',
    description: 'Forbedret 7" OLED-skjerm, større lagringsplass og bedre lyd. Perfekt for både hjemme og på farten.',
    image_url: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400',
    prices: [
      { retailer: 'elkjop', base_price: 3790, shipping: 0, in_stock: true },
      { retailer: 'komplett', base_price: 3690, shipping: 0, in_stock: true },
      { retailer: 'power', base_price: 3790, shipping: 0, in_stock: false },
    ]
  },
];

async function seedData() {
  console.log('🌱 Starting mock data seeding...\n');

  try {
    // Get retailers
    const { data: retailers, error: retailersError } = await supabase
      .from('retailers')
      .select('*');

    if (retailersError) throw retailersError;

    const retailerMap = Object.fromEntries(
      retailers!.map(r => [r.slug, r.id])
    );

    console.log('✅ Found retailers:', Object.keys(retailerMap).join(', '));

    // Get categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*');

    if (categoriesError) throw categoriesError;

    const categoryMap = Object.fromEntries(
      categories!.map(c => [c.slug, c.id])
    );

    console.log('✅ Found categories:', Object.keys(categoryMap).join(', '), '\n');

    // Insert products
    const typesenseProducts: any[] = [];

    for (const mockProduct of mockProducts) {
      console.log(`📦 Processing: ${mockProduct.name}`);

      // Check if product exists
      const { data: existingProduct } = await supabase
        .from('products')
        .select('*')
        .eq('slug', mockProduct.slug)
        .single();

      let product;
      if (existingProduct) {
        console.log(`   ⚠️  Product already exists, using existing: ${existingProduct.id}`);
        product = existingProduct;
      } else {
        // Insert new product
        const { data: newProduct, error: productError } = await supabase
          .from('products')
          .insert({
            name: mockProduct.name,
            slug: mockProduct.slug,
            ean: mockProduct.ean,
            brand: mockProduct.brand,
            category_id: categoryMap[mockProduct.category],
            description: mockProduct.description,
            image_url: mockProduct.image_url,
          })
          .select()
          .single();

        if (productError) {
          console.error(`   ❌ Error inserting product: ${productError.message}`);
          continue;
        }
        product = newProduct;
      }

      console.log(`   ✓ Product inserted: ${product.id}`);

      // Insert prices for each retailer
      const allPrices = [];
      for (const priceData of mockProduct.prices) {
        const retailerId = retailerMap[priceData.retailer];
        if (!retailerId) continue;

        const totalPrice = priceData.base_price + priceData.shipping;

        // Insert or get product_retailer junction
        const { data: productRetailer, error: junctionError } = await supabase
          .from('product_retailers')
          .select('*')
          .eq('product_id', product.id)
          .eq('retailer_id', retailerId)
          .single();

        let productRetailerId;
        if (productRetailer) {
          productRetailerId = productRetailer.id;
        } else {
          const { data: newJunction, error: createError } = await supabase
            .from('product_retailers')
            .insert({
              product_id: product.id,
              retailer_id: retailerId,
              product_url: `https://example.com/product/${mockProduct.slug}`,
              stock_status: priceData.in_stock ? 'in_stock' : 'out_of_stock',
            })
            .select()
            .single();

          if (createError) {
            console.error(`   ❌ Error creating junction: ${createError.message}`);
            continue;
          }
          productRetailerId = newJunction!.id;
        }

        // Insert current price
        const { error: priceError } = await supabase
          .from('prices')
          .insert({
            product_retailer_id: productRetailerId,
            price: priceData.base_price,
            shipping_cost: priceData.shipping,
            scraped_at: new Date().toISOString(),
          });

        if (priceError) {
          console.error(`   ❌ Error inserting price: ${priceError.message}`);
        } else {
          console.log(`   ✓ Price added for ${priceData.retailer}: ${totalPrice} kr`);
          allPrices.push(totalPrice);
        }

        // Add historical prices (last 30 days)
        const historicalPrices = [];
        for (let daysAgo = 30; daysAgo > 0; daysAgo -= 3) {
          const variance = (Math.random() - 0.5) * 0.1; // +/- 10%
          const historicalPrice = Math.round(priceData.base_price * (1 + variance));
          const date = new Date();
          date.setDate(date.getDate() - daysAgo);

          historicalPrices.push({
            product_retailer_id: productRetailerId,
            price: historicalPrice,
            shipping_cost: priceData.shipping,
            scraped_at: date.toISOString(),
          });
        }

        if (historicalPrices.length > 0) {
          await supabase.from('prices').insert(historicalPrices);
        }
      }

      // Calculate price statistics
      const lowestPrice = Math.min(...allPrices);
      const highestPrice = Math.max(...allPrices);
      const averagePrice = allPrices.reduce((a, b) => a + b, 0) / allPrices.length;

      // Prepare for Typesense
      const category = categories!.find(c => c.id === categoryMap[mockProduct.category]);
      typesenseProducts.push({
        id: product.id,
        name: mockProduct.name,
        slug: mockProduct.slug,
        ean: mockProduct.ean || '',
        brand: mockProduct.brand || '',
        category_id: categoryMap[mockProduct.category],
        category_name: category?.name || '',
        category_slug: mockProduct.category,
        description: mockProduct.description || '',
        image_url: mockProduct.image_url || '',
        lowest_price: lowestPrice,
        highest_price: highestPrice,
        average_price: averagePrice,
        retailers: mockProduct.prices.map(p => p.retailer),
        in_stock: mockProduct.prices.some(p => p.in_stock),
        created_at: Math.floor(new Date(product.created_at).getTime() / 1000),
        updated_at: Math.floor(new Date(product.updated_at || product.created_at).getTime() / 1000),
      });

      console.log(`   ✓ Completed\n`);
    }

    // Index to Typesense
    console.log('🔍 Indexing to Typesense...');

    try {
      const importResults = await typesense
        .collections('products')
        .documents()
        .import(typesenseProducts, { action: 'upsert' });

      const successCount = typesenseProducts.length;
      console.log(`✅ Indexed ${successCount} products to Typesense\n`);
    } catch (typesenseError: any) {
      console.error('❌ Error indexing to Typesense:', typesenseError.message);
    }

    console.log('🎉 Mock data seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   Products: ${mockProducts.length}`);
    console.log(`   Total prices: ${mockProducts.reduce((sum, p) => sum + p.prices.length, 0)}`);
    console.log(`   Retailers: ${Object.keys(retailerMap).length}`);
    console.log(`   Categories: ${Object.keys(categoryMap).length}`);
    console.log('\n🌐 Visit http://localhost:3001/sok to test search!');

  } catch (error: any) {
    console.error('❌ Error seeding data:', error.message);
    process.exit(1);
  }
}

seedData();
