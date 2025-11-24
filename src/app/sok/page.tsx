'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchFilters } from '@/components/search/SearchFilters';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { Loader2, SlidersHorizontal } from 'lucide-react';
import { searchProducts } from '@/lib/typesense';
import { ProductWithPrices } from '@/lib/supabase';

type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'newest';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [products, setProducts] = useState<ProductWithPrices[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [showFilters, setShowFilters] = useState(true);

  // Filter states
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRetailers, setSelectedRetailers] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min?: number; max?: number }>({});
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');

  // Facet data
  const [availableBrands, setAvailableBrands] = useState<{ name: string; count: number }[]>([]);
  const [availableCategories, setAvailableCategories] = useState<{ name: string; slug: string; count: number }[]>([]);
  const [availableRetailers, setAvailableRetailers] = useState<{ name: string; slug: string; count: number }[]>([]);

  // Favorites (placeholder - would be stored in Supabase/localStorage)
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query, selectedBrands, selectedCategories, selectedRetailers, priceRange, inStockOnly, sortBy]);

  const performSearch = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Build filter string
      const filters: string[] = [];

      if (selectedBrands.length > 0) {
        filters.push(`brand:[${selectedBrands.join(',')}]`);
      }

      if (selectedCategories.length > 0) {
        filters.push(`category_slug:[${selectedCategories.join(',')}]`);
      }

      if (selectedRetailers.length > 0) {
        filters.push(`retailers:=[${selectedRetailers.join(',')}]`);
      }

      if (priceRange.min !== undefined) {
        filters.push(`lowest_price:>=${priceRange.min}`);
      }

      if (priceRange.max !== undefined) {
        filters.push(`lowest_price:<=${priceRange.max}`);
      }

      if (inStockOnly) {
        filters.push('in_stock:true');
      }

      // Determine sort order
      let sortString = '_text_match:desc';
      if (sortBy === 'price_asc') {
        sortString = 'lowest_price:asc';
      } else if (sortBy === 'price_desc') {
        sortString = 'lowest_price:desc';
      } else if (sortBy === 'newest') {
        sortString = 'created_at:desc';
      }

      const results = await searchProducts({
        query: query || '*',
        page: 1,
        perPage: 24,
        filters: filters.join(' && '),
        sortBy: sortString,
      });

      // Map Typesense results to ProductWithPrices
      const mappedProducts: ProductWithPrices[] = results.hits?.map((hit) => ({
        id: hit.document.id,
        name: hit.document.name,
        slug: hit.document.slug,
        ean: hit.document.ean,
        brand: hit.document.brand,
        category_id: hit.document.category_id,
        category_name: hit.document.category_name,
        image_url: hit.document.image_url,
        description: hit.document.description,
        lowest_price: hit.document.lowest_price,
        highest_price: hit.document.highest_price,
        average_price: hit.document.average_price,
        price_trend: hit.document.price_trend,
        created_at: new Date(hit.document.created_at * 1000).toISOString(),
        updated_at: new Date(hit.document.updated_at * 1000).toISOString(),
        prices: [], // Will be populated from database if needed
      })) || [];

      setProducts(mappedProducts);
      setTotalResults(results.found || 0);

      // Extract facet data
      if (results.facet_counts) {
        const brandFacets = results.facet_counts.find(f => f.field_name === 'brand');
        if (brandFacets) {
          setAvailableBrands(
            brandFacets.counts.map(c => ({ name: c.value as string, count: c.count }))
          );
        }

        const categoryFacets = results.facet_counts.find(f => f.field_name === 'category_name');
        if (categoryFacets) {
          setAvailableCategories(
            categoryFacets.counts.map(c => ({
              name: c.value as string,
              slug: (c.value as string).toLowerCase().replace(/\s+/g, '-'),
              count: c.count
            }))
          );
        }

        const retailerFacets = results.facet_counts.find(f => f.field_name === 'retailers');
        if (retailerFacets) {
          setAvailableRetailers(
            retailerFacets.counts.map(c => ({
              name: c.value as string,
              slug: (c.value as string).toLowerCase(),
              count: c.count
            }))
          );
        }
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Kunne ikke utføre søket. Vennligst prøv igjen.');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSelectedBrands([]);
    setSelectedCategories([]);
    setSelectedRetailers([]);
    setPriceRange({});
    setInStockOnly(false);
  };

  const handleFavoriteToggle = (productId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
    // TODO: Persist to Supabase/localStorage
  };

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'relevance', label: 'Mest relevant' },
    { value: 'price_asc', label: 'Laveste pris' },
    { value: 'price_desc', label: 'Høyeste pris' },
    { value: 'newest', label: 'Nyeste' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Search bar section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-8 px-4 border-b">
        <div className="container mx-auto max-w-6xl">
          <SearchBar
            initialQuery={query}
            onSearch={setQuery}
            placeholder="Søk etter produkter..."
            showAutocomplete={true}
          />
        </div>
      </section>

      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Results header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">
              {query ? `Søkeresultater for "${query}"` : 'Alle produkter'}
            </h1>
            {!isLoading && (
              <p className="text-muted-foreground">
                {totalResults} {totalResults === 1 ? 'produkt' : 'produkter'}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Mobile filter toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filtre
            </Button>

            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 border rounded-md text-sm bg-background"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Filters sidebar */}
          <aside
            className={`lg:col-span-3 ${showFilters ? 'block' : 'hidden lg:block'}`}
          >
            <SearchFilters
              brands={availableBrands}
              categories={availableCategories}
              retailers={availableRetailers}
              selectedBrands={selectedBrands}
              selectedCategories={selectedCategories}
              selectedRetailers={selectedRetailers}
              selectedPriceRange={priceRange}
              inStockOnly={inStockOnly}
              onBrandsChange={setSelectedBrands}
              onCategoriesChange={setSelectedCategories}
              onRetailersChange={setSelectedRetailers}
              onPriceRangeChange={setPriceRange}
              onInStockChange={setInStockOnly}
              onClearAll={handleClearFilters}
            />
          </aside>

          {/* Products grid */}
          <main className="lg:col-span-9">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Søker...</span>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={performSearch}>Prøv igjen</Button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xl font-medium mb-2">Ingen resultater funnet</p>
                <p className="text-muted-foreground mb-4">
                  Prøv å justere søket eller filtrene dine
                </p>
                <Button variant="outline" onClick={handleClearFilters}>
                  Nullstill filtre
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onFavoriteToggle={handleFavoriteToggle}
                    isFavorite={favorites.has(product.id)}
                    showPriceChange={true}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
