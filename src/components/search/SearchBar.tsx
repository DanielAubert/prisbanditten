'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn, debounce } from '@/lib/utils';
import { searchProducts, autocompleteProducts, TypesenseProduct } from '@/lib/typesense';
import Link from 'next/link';
import Image from 'next/image';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  className?: string;
  placeholder?: string;
  showAutocomplete?: boolean;
  initialQuery?: string;
}

export function SearchBar({
  onSearch,
  className,
  placeholder = 'Søk etter produkter...',
  showAutocomplete = true,
  initialQuery = '',
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<TypesenseProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Update query when initialQuery changes
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced autocomplete function
  const debouncedAutocomplete = debounce(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const result = await autocompleteProducts(searchQuery, 5);
      setSuggestions(
        result.hits?.map((hit) => hit.document as TypesenseProduct) || []
      );
      setShowSuggestions(true);
    } catch (error) {
      console.error('Autocomplete error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (showAutocomplete) {
      debouncedAutocomplete(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearch) {
        onSearch(query);
      } else {
        // Navigate to search page if no callback provided
        router.push(`/sok?q=${encodeURIComponent(query)}`);
      }
      setShowSuggestions(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div ref={searchRef} className={cn('relative w-full', className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="pl-10 pr-10 h-12 text-base"
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            {query && !isLoading && (
              <button
                type="button"
                onClick={clearSearch}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Autocomplete suggestions */}
      {showAutocomplete && showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-background border rounded-lg shadow-lg overflow-hidden z-50">
          <div className="p-2">
            {suggestions.map((product) => (
              <Link
                key={product.id}
                href={`/produkt/${product.slug}`}
                onClick={() => {
                  setShowSuggestions(false);
                  setQuery('');
                }}
                className="flex items-center gap-3 p-3 rounded-md hover:bg-accent transition-colors"
              >
                {product.image_url && (
                  <div className="relative w-12 h-12 flex-shrink-0 bg-muted rounded">
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{product.name}</p>
                  {product.brand && (
                    <p className="text-sm text-muted-foreground">{product.brand}</p>
                  )}
                </div>
                {product.lowest_price && (
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold">
                      {new Intl.NumberFormat('nb-NO', {
                        style: 'currency',
                        currency: 'NOK',
                        minimumFractionDigits: 0,
                      }).format(product.lowest_price)}
                    </p>
                  </div>
                )}
              </Link>
            ))}
          </div>
          <div className="border-t p-2 bg-muted/50">
            <button
              onClick={handleSubmit}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors text-left px-3 py-2"
            >
              Trykk Enter for å se alle resultater →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
