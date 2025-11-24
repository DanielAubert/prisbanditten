'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn, formatPrice, calculatePriceChange } from '@/lib/utils';
import { ProductWithPrices } from '@/lib/supabase';

interface ProductCardProps {
  product: ProductWithPrices;
  onFavoriteToggle?: (productId: string) => void;
  isFavorite?: boolean;
  showPriceChange?: boolean;
  className?: string;
}

export function ProductCard({
  product,
  onFavoriteToggle,
  isFavorite = false,
  showPriceChange = true,
  className,
}: ProductCardProps) {
  const prices = product.prices as any[] || [];
  const lowestPrice = product.lowest_price;

  // Get best retailer (lowest price)
  const bestRetailer = prices?.[0];

  // Calculate price change if we have historical data
  const priceChange = bestRetailer?.previous_price
    ? calculatePriceChange(bestRetailer.price, bestRetailer.previous_price)
    : null;

  return (
    <Card className={cn('group overflow-hidden hover:shadow-lg transition-shadow', className)}>
      <Link href={`/produkt/${product.slug}`}>
        <div className="relative aspect-square bg-muted">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Ingen bilde
            </div>
          )}

          {/* Favorite button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              onFavoriteToggle?.(product.id);
            }}
            className="absolute top-2 right-2 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
          >
            <Heart
              className={cn(
                'h-5 w-5 transition-colors',
                isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
              )}
            />
          </button>

          {/* Price change badge */}
          {showPriceChange && priceChange && priceChange.direction !== 'same' && (
            <div
              className={cn(
                'absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium',
                priceChange.direction === 'down'
                  ? 'bg-green-500/90 text-white'
                  : 'bg-red-500/90 text-white'
              )}
            >
              {priceChange.direction === 'down' ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <TrendingUp className="h-3 w-3" />
              )}
              <span>{priceChange.percentage.toFixed(0)}%</span>
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <Link href={`/produkt/${product.slug}`}>
          {/* Brand */}
          {product.brand && (
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              {product.brand}
            </p>
          )}

          {/* Product name */}
          <h3 className="font-medium line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Category */}
          {product.category_name && (
            <p className="text-xs text-muted-foreground mb-3">
              {product.category_name}
            </p>
          )}

          {/* Price */}
          <div className="space-y-1">
            {lowestPrice && (
              <div>
                <p className="text-2xl font-bold">{formatPrice(lowestPrice)}</p>
                {bestRetailer?.retailer_name && (
                  <p className="text-xs text-muted-foreground">
                    hos {bestRetailer.retailer_name}
                  </p>
                )}
              </div>
            )}

            {/* Price comparison */}
            {prices && prices.length > 1 && (
              <p className="text-xs text-muted-foreground">
                + {prices.length - 1} andre {prices.length === 2 ? 'butikk' : 'butikker'}
              </p>
            )}
          </div>
        </Link>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Link href={`/produkt/${product.slug}`} className="w-full">
          <Button className="w-full" variant="outline">
            Sammenlign priser
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
