'use client';

import { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, formatPrice } from '@/lib/utils';

export interface SearchFiltersProps {
  brands?: { name: string; count: number }[];
  categories?: { name: string; slug: string; count: number }[];
  retailers?: { name: string; slug: string; count: number }[];
  priceRange?: { min: number; max: number };

  selectedBrands?: string[];
  selectedCategories?: string[];
  selectedRetailers?: string[];
  selectedPriceRange?: { min?: number; max?: number };
  inStockOnly?: boolean;

  onBrandsChange?: (brands: string[]) => void;
  onCategoriesChange?: (categories: string[]) => void;
  onRetailersChange?: (retailers: string[]) => void;
  onPriceRangeChange?: (range: { min?: number; max?: number }) => void;
  onInStockChange?: (inStock: boolean) => void;
  onClearAll?: () => void;

  className?: string;
}

export function SearchFilters({
  brands = [],
  categories = [],
  retailers = [],
  priceRange,

  selectedBrands = [],
  selectedCategories = [],
  selectedRetailers = [],
  selectedPriceRange = {},
  inStockOnly = false,

  onBrandsChange,
  onCategoriesChange,
  onRetailersChange,
  onPriceRangeChange,
  onInStockChange,
  onClearAll,

  className,
}: SearchFiltersProps) {
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    brands: true,
    categories: true,
    retailers: true,
    availability: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleBrandToggle = (brand: string) => {
    const newBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter((b) => b !== brand)
      : [...selectedBrands, brand];
    onBrandsChange?.(newBrands);
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];
    onCategoriesChange?.(newCategories);
  };

  const handleRetailerToggle = (retailer: string) => {
    const newRetailers = selectedRetailers.includes(retailer)
      ? selectedRetailers.filter((r) => r !== retailer)
      : [...selectedRetailers, retailer];
    onRetailersChange?.(newRetailers);
  };

  const hasActiveFilters =
    selectedBrands.length > 0 ||
    selectedCategories.length > 0 ||
    selectedRetailers.length > 0 ||
    selectedPriceRange.min !== undefined ||
    selectedPriceRange.max !== undefined ||
    inStockOnly;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with clear all button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filtre</h2>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearAll}>
            <X className="h-4 w-4 mr-1" />
            Nullstill
          </Button>
        )}
      </div>

      {/* Price Range Filter */}
      <Card>
        <CardHeader
          className="cursor-pointer"
          onClick={() => toggleSection('price')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Pris</CardTitle>
            {expandedSections.price ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </CardHeader>
        {expandedSections.price && (
          <CardContent>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={selectedPriceRange.min || ''}
                  onChange={(e) =>
                    onPriceRangeChange?.({
                      ...selectedPriceRange,
                      min: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="Maks"
                  value={selectedPriceRange.max || ''}
                  onChange={(e) =>
                    onPriceRangeChange?.({
                      ...selectedPriceRange,
                      max: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                />
              </div>
              {priceRange && (
                <p className="text-xs text-muted-foreground">
                  {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
                </p>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Availability Filter */}
      <Card>
        <CardHeader
          className="cursor-pointer"
          onClick={() => toggleSection('availability')}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Tilgjengelighet</CardTitle>
            {expandedSections.availability ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </CardHeader>
        {expandedSections.availability && (
          <CardContent>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => onInStockChange?.(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Kun varer på lager</span>
            </label>
          </CardContent>
        )}
      </Card>

      {/* Brands Filter */}
      {brands.length > 0 && (
        <Card>
          <CardHeader
            className="cursor-pointer"
            onClick={() => toggleSection('brands')}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Merke
                {selectedBrands.length > 0 && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({selectedBrands.length})
                  </span>
                )}
              </CardTitle>
              {expandedSections.brands ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </CardHeader>
          {expandedSections.brands && (
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {brands.slice(0, 10).map((brand) => (
                  <label
                    key={brand.name}
                    className="flex items-center gap-2 cursor-pointer hover:bg-accent p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand.name)}
                      onChange={() => handleBrandToggle(brand.name)}
                      className="rounded"
                    />
                    <span className="text-sm flex-1">{brand.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({brand.count})
                    </span>
                  </label>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Categories Filter */}
      {categories.length > 0 && (
        <Card>
          <CardHeader
            className="cursor-pointer"
            onClick={() => toggleSection('categories')}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Kategori
                {selectedCategories.length > 0 && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({selectedCategories.length})
                  </span>
                )}
              </CardTitle>
              {expandedSections.categories ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </CardHeader>
          {expandedSections.categories && (
            <CardContent>
              <div className="space-y-2">
                {categories.map((category) => (
                  <label
                    key={category.slug}
                    className="flex items-center gap-2 cursor-pointer hover:bg-accent p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.slug)}
                      onChange={() => handleCategoryToggle(category.slug)}
                      className="rounded"
                    />
                    <span className="text-sm flex-1">{category.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({category.count})
                    </span>
                  </label>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Retailers Filter */}
      {retailers.length > 0 && (
        <Card>
          <CardHeader
            className="cursor-pointer"
            onClick={() => toggleSection('retailers')}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Butikk
                {selectedRetailers.length > 0 && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({selectedRetailers.length})
                  </span>
                )}
              </CardTitle>
              {expandedSections.retailers ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </CardHeader>
          {expandedSections.retailers && (
            <CardContent>
              <div className="space-y-2">
                {retailers.map((retailer) => (
                  <label
                    key={retailer.slug}
                    className="flex items-center gap-2 cursor-pointer hover:bg-accent p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRetailers.includes(retailer.slug)}
                      onChange={() => handleRetailerToggle(retailer.slug)}
                      className="rounded"
                    />
                    <span className="text-sm flex-1">{retailer.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({retailer.count})
                    </span>
                  </label>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}
