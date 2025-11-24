import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Bell, ExternalLink, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PriceHistoryChart } from '@/components/products/PriceHistoryChart';
import { supabase } from '@/lib/supabase';
import { formatPrice, calculatePriceChange, getRelativeTime } from '@/lib/utils';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  // Unwrap params (Next.js 16+)
  const { slug } = await params;

  // Fetch product with all prices and retailers
  const { data: product, error } = await supabase
    .from('products_with_prices')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !product) {
    notFound();
  }

  // Fetch detailed price information with retailer details
  // Get latest price for each retailer
  const { data: productRetailers } = await supabase
    .from('product_retailers')
    .select('id, product_url, retailers(*)')
    .eq('product_id', product.id);

  const currentPrices = [];
  if (productRetailers) {
    for (const pr of productRetailers) {
      const { data: latestPrice } = await supabase
        .from('prices')
        .select('*')
        .eq('product_retailer_id', pr.id)
        .order('scraped_at', { ascending: false })
        .limit(1)
        .single();

      if (latestPrice && pr.retailers) {
        currentPrices.push({
          ...latestPrice,
          product_url: pr.product_url,
          retailers: pr.retailers,
        });
      }
    }
  }

  // Sort by total price
  currentPrices.sort((a, b) => a.total_price - b.total_price);

  // Fetch price history for chart (last 90 days)
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const formattedPriceHistory = [];
  if (productRetailers) {
    for (const pr of productRetailers) {
      const { data: history } = await supabase
        .from('prices')
        .select('*')
        .eq('product_retailer_id', pr.id)
        .gte('scraped_at', ninetyDaysAgo.toISOString())
        .order('scraped_at', { ascending: true });

      if (history && pr.retailers) {
        formattedPriceHistory.push(...history.map(price => ({
          ...price,
          retailer_name: pr.retailers.name,
          retailer_slug: pr.retailers.slug,
        })));
      }
    }
  }

  // Get lowest price and calculate savings
  const lowestPrice = currentPrices?.[0];
  const highestPrice = currentPrices?.[currentPrices.length - 1];
  const savings = highestPrice && lowestPrice
    ? highestPrice.total_price - lowestPrice.total_price
    : 0;

  // Calculate price trend
  const priceChange = product.price_trend
    ? calculatePriceChange(product.lowest_price, product.lowest_price * (1 + product.price_trend / 100))
    : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Hjem</Link>
          {' / '}
          {product.category_name && (
            <>
              <Link href={`/kategori/${product.category_name.toLowerCase()}`} className="hover:text-foreground">
                {product.category_name}
              </Link>
              {' / '}
            </>
          )}
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left column - Product info */}
          <div className="lg:col-span-7">
            {/* Product image and basic info */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Image */}
                  <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-contain p-4"
                        priority
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        Ingen bilde tilgjengelig
                      </div>
                    )}
                  </div>

                  {/* Product details */}
                  <div className="space-y-4">
                    {product.brand && (
                      <p className="text-sm text-muted-foreground uppercase tracking-wide">
                        {product.brand}
                      </p>
                    )}
                    <h1 className="text-3xl font-bold">{product.name}</h1>

                    {product.ean && (
                      <p className="text-sm text-muted-foreground">
                        EAN: {product.ean}
                      </p>
                    )}

                    {/* Price trend badge */}
                    {priceChange && priceChange.direction !== 'same' && (
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${
                            priceChange.direction === 'down'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {priceChange.direction === 'down' ? (
                            <TrendingDown className="h-4 w-4" />
                          ) : (
                            <TrendingUp className="h-4 w-4" />
                          )}
                          <span>
                            {priceChange.direction === 'down' ? 'Ned' : 'Opp'}{' '}
                            {priceChange.percentage.toFixed(1)}% siste 30 dager
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Best price */}
                    {lowestPrice && (
                      <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground mb-2">Beste pris</p>
                        <p className="text-4xl font-bold text-green-600">
                          {formatPrice(lowestPrice.total_price)}
                        </p>
                        {savings > 0 && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Spar opptil {formatPrice(savings)}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-4">
                      <Button variant="outline" className="flex-1">
                        <Heart className="h-4 w-4 mr-2" />
                        Lagre
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Bell className="h-4 w-4 mr-2" />
                        Prisvarsler
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {product.description && (
                  <div className="mt-6 pt-6 border-t">
                    <h2 className="text-lg font-semibold mb-2">Beskrivelse</h2>
                    <p className="text-muted-foreground">{product.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Price history chart */}
            {formattedPriceHistory.length > 0 && (
              <PriceHistoryChart
                data={formattedPriceHistory}
                productName={product.name}
              />
            )}
          </div>

          {/* Right column - Price comparison */}
          <div className="lg:col-span-5">
            <div className="sticky top-4">
              <Card>
                <CardHeader>
                  <CardTitle>Prissammenligning</CardTitle>
                </CardHeader>
                <CardContent>
                  {currentPrices && currentPrices.length > 0 ? (
                    <div className="space-y-3">
                      {currentPrices.map((price: any, index: number) => (
                        <div
                          key={price.id}
                          className={`p-4 rounded-lg border-2 ${
                            index === 0
                              ? 'border-green-500 bg-green-50/50'
                              : 'border-border bg-background'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              {price.retailers?.logo_url && (
                                <div className="relative w-12 h-12 bg-white rounded border">
                                  <Image
                                    src={price.retailers.logo_url}
                                    alt={price.retailers.name}
                                    fill
                                    className="object-contain p-1"
                                  />
                                </div>
                              )}
                              <div>
                                <p className="font-semibold">{price.retailers?.name || 'Unknown'}</p>
                                {index === 0 && (
                                  <span className="text-xs font-medium text-green-600">
                                    Beste pris
                                  </span>
                                )}
                              </div>
                            </div>
                            {index === 0 ? (
                              <TrendingDown className="h-5 w-5 text-green-600" />
                            ) : index === currentPrices.length - 1 ? (
                              <TrendingUp className="h-5 w-5 text-red-600" />
                            ) : (
                              <Minus className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>

                          <div className="flex items-end justify-between">
                            <div>
                              <p className="text-2xl font-bold">
                                {formatPrice(price.total_price)}
                              </p>
                              {price.base_price !== price.total_price && (
                                <p className="text-xs text-muted-foreground">
                                  {formatPrice(price.base_price)} + frakt
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">
                                Oppdatert {getRelativeTime(price.scraped_at)}
                              </p>
                            </div>
                            <Button size="sm" asChild>
                              <a
                                href={price.product_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Se tilbud
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </Button>
                          </div>

                          {price.shipping_cost > 0 && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Frakt: {formatPrice(price.shipping_cost)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Ingen priser tilgjengelig for øyeblikket</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Statistics card */}
              {product.average_price && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-base">Prisstatistikk</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Laveste</p>
                        <p className="text-lg font-bold text-green-600">
                          {formatPrice(product.lowest_price)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Gjennomsnitt</p>
                        <p className="text-lg font-bold">
                          {formatPrice(product.average_price)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Høyeste</p>
                        <p className="text-lg font-bold text-red-600">
                          {formatPrice(product.highest_price)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Butikker</p>
                        <p className="text-lg font-bold">
                          {currentPrices?.length || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
