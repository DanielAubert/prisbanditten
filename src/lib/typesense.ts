import Typesense from 'typesense';

// Typesense client configuration
const typesenseClient = new Typesense.Client({
  nodes: [
    {
      host: process.env.NEXT_PUBLIC_TYPESENSE_HOST || 'localhost',
      port: parseInt(process.env.NEXT_PUBLIC_TYPESENSE_PORT || '8108'),
      protocol: process.env.NEXT_PUBLIC_TYPESENSE_PROTOCOL || 'http',
    },
  ],
  apiKey: process.env.NEXT_PUBLIC_TYPESENSE_API_KEY || '',
  connectionTimeoutSeconds: 2,
});

// Admin client for server-side operations (with admin API key)
export const typesenseAdminClient = new Typesense.Client({
  nodes: [
    {
      host: process.env.NEXT_PUBLIC_TYPESENSE_HOST || 'localhost',
      port: parseInt(process.env.NEXT_PUBLIC_TYPESENSE_PORT || '8108'),
      protocol: process.env.NEXT_PUBLIC_TYPESENSE_PROTOCOL || 'http',
    },
  ],
  apiKey: process.env.TYPESENSE_ADMIN_API_KEY || '',
  connectionTimeoutSeconds: 2,
});

export default typesenseClient;

// Typesense schema for products
export const productsCollectionSchema = {
  name: 'products',
  fields: [
    { name: 'id', type: 'string', facet: false },
    { name: 'name', type: 'string', facet: false },
    { name: 'slug', type: 'string', facet: false },
    { name: 'brand', type: 'string', facet: true, optional: true },
    { name: 'ean', type: 'string', facet: false, optional: true },
    { name: 'category_name', type: 'string', facet: true, optional: true },
    { name: 'category_slug', type: 'string', facet: false, optional: true },
    { name: 'image_url', type: 'string', facet: false, optional: true },
    { name: 'description', type: 'string', facet: false, optional: true },

    // Price fields
    { name: 'lowest_price', type: 'float', facet: false, optional: true },
    { name: 'highest_price', type: 'float', facet: false, optional: true },
    { name: 'average_price', type: 'float', facet: false, optional: true },

    // Retailers that sell this product
    { name: 'retailers', type: 'string[]', facet: true, optional: true },

    // Availability
    { name: 'in_stock', type: 'bool', facet: true, optional: true },

    // Timestamps
    { name: 'created_at', type: 'int64', facet: false },
    { name: 'updated_at', type: 'int64', facet: false },
  ],
  default_sorting_field: 'created_at',
} as const;

// Type for Typesense product document
export interface TypesenseProduct {
  id: string;
  name: string;
  slug: string;
  brand?: string;
  ean?: string;
  category_name?: string;
  category_slug?: string;
  image_url?: string;
  description?: string;
  lowest_price?: number;
  highest_price?: number;
  average_price?: number;
  retailers?: string[];
  in_stock?: boolean;
  created_at: number;
  updated_at: number;
}

// Initialize Typesense collection (run this once on setup)
export async function initializeTypesenseCollection() {
  try {
    // Try to retrieve existing collection
    await typesenseAdminClient.collections('products').retrieve();
    console.log('Typesense collection "products" already exists');
  } catch (error: any) {
    if (error.httpStatus === 404) {
      // Collection doesn't exist, create it
      console.log('Creating Typesense collection "products"...');
      await typesenseAdminClient.collections().create(productsCollectionSchema);
      console.log('Typesense collection "products" created successfully');
    } else {
      throw error;
    }
  }
}

// Index a single product
export async function indexProduct(product: TypesenseProduct) {
  try {
    await typesenseClient.collections('products').documents().upsert(product);
  } catch (error) {
    console.error('Error indexing product:', error);
    throw error;
  }
}

// Index multiple products in batch
export async function indexProductsBatch(products: TypesenseProduct[]) {
  try {
    const result = await typesenseClient
      .collections('products')
      .documents()
      .import(products, { action: 'upsert' });

    console.log(`Indexed ${products.length} products to Typesense`);
    return result;
  } catch (error) {
    console.error('Error batch indexing products:', error);
    throw error;
  }
}

// Delete a product from index
export async function deleteProductFromIndex(productId: string) {
  try {
    await typesenseClient.collections('products').documents(productId).delete();
  } catch (error) {
    console.error('Error deleting product from index:', error);
    throw error;
  }
}

// Search products
export interface ProductSearchParams {
  query: string;
  page?: number;
  perPage?: number;
  filters?: string; // e.g., "brand:Apple && category_slug:telefoner"
  sortBy?: string;
  maxPrice?: number;
  minPrice?: number;
  inStockOnly?: boolean;
  brands?: string[];
  categories?: string[];
  retailers?: string[];
}

export async function searchProducts(params: ProductSearchParams) {
  const {
    query,
    page = 1,
    perPage = 20,
    filters,
    sortBy = 'lowest_price:asc',
    maxPrice,
    minPrice,
    inStockOnly,
    brands,
    categories,
    retailers,
  } = params;

  // Build filter string
  let filterBy = filters || '';

  const filterParts: string[] = [];

  if (maxPrice !== undefined) {
    filterParts.push(`lowest_price:<=${maxPrice}`);
  }

  if (minPrice !== undefined) {
    filterParts.push(`lowest_price:>=${minPrice}`);
  }

  if (inStockOnly) {
    filterParts.push('in_stock:true');
  }

  if (brands && brands.length > 0) {
    filterParts.push(`brand:[${brands.join(',')}]`);
  }

  if (categories && categories.length > 0) {
    filterParts.push(`category_slug:[${categories.join(',')}]`);
  }

  if (retailers && retailers.length > 0) {
    filterParts.push(`retailers:[${retailers.join(',')}]`);
  }

  if (filterParts.length > 0) {
    filterBy = filterParts.join(' && ');
  }

  try {
    const searchParameters = {
      q: query,
      query_by: 'name,brand,description,ean',
      page,
      per_page: perPage,
      sort_by: sortBy,
      ...(filterBy && { filter_by: filterBy }),

      // Typo tolerance and fuzzy matching
      num_typos: 2,
      typo_tokens_threshold: 1,

      // Highlighting
      highlight_full_fields: 'name,brand',

      // Faceting for filters
      facet_by: 'brand,category_name,retailers,in_stock',
      max_facet_values: 50,
    };

    const result = await typesenseClient
      .collections('products')
      .documents()
      .search(searchParameters);

    return result;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
}

// Autocomplete suggestions
export async function autocompleteProducts(query: string, limit = 5) {
  try {
    const result = await typesenseClient
      .collections('products')
      .documents()
      .search({
        q: query,
        query_by: 'name,brand',
        per_page: limit,
        num_typos: 1,
        prefix: true,
      });

    return result;
  } catch (error) {
    console.error('Error getting autocomplete suggestions:', error);
    throw error;
  }
}

// Get product by ID from Typesense
export async function getProductById(productId: string) {
  try {
    const result = await typesenseClient
      .collections('products')
      .documents(productId)
      .retrieve();

    return result as TypesenseProduct;
  } catch (error) {
    console.error('Error retrieving product from Typesense:', error);
    throw error;
  }
}
