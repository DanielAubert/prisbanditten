import Link from 'next/link';
import { SearchBar } from '@/components/search/SearchBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingDown, Bell, LineChart, Zap } from 'lucide-react';

export default function HomePage() {
  const categories = [
    { name: 'Datamaskiner', slug: 'datamaskiner', icon: '💻', count: 0 },
    { name: 'Telefoner', slug: 'telefoner', icon: '📱', count: 0 },
    { name: 'TV & Lyd', slug: 'tv-lyd', icon: '📺', count: 0 },
    { name: 'Gaming', slug: 'gaming', icon: '🎮', count: 0 },
    { name: 'Smart Home', slug: 'smart-home', icon: '🏠', count: 0 },
    { name: 'Foto & Video', slug: 'foto-video', icon: '📷', count: 0 },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center space-y-6">
            <h1 className="text-5xl font-bold tracking-tight">
              Finn beste pris på elektronikk
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Sammenlign priser fra Elkjøp, Komplett, Power og andre norske
              elektronikkbutikker. Spar penger med smartere shopping.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto pt-4">
              <SearchBar
                placeholder="Søk etter produkter..."
                showAutocomplete={true}
              />
            </div>

            {/* Quick stats */}
            <div className="flex gap-6 justify-center text-sm text-muted-foreground pt-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span>Instant søk</span>
              </div>
              <div className="flex items-center gap-2">
                <LineChart className="h-4 w-4 text-primary" />
                <span>Prishistorikk</span>
              </div>
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <span>Prisvarsler</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Hvorfor PrisBanditt?
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TrendingDown className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Smart prissammenligning</h3>
                  <p className="text-muted-foreground">
                    Vi sjekker priser fra alle store norske elektronikkbutikker
                    i sanntid, så du alltid får best pris.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <LineChart className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Prishistorikk & trender</h3>
                  <p className="text-muted-foreground">
                    Se prisutvikling over tid og få AI-drevne anbefalinger om
                    når du bør kjøpe.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Bell className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Prisvarsler</h3>
                  <p className="text-muted-foreground">
                    Sett ønsket pris og få varsel når produktet blir billigere.
                    Ingen spam, kun ekte tilbud.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Populære kategorier
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/kategori/${category.slug}`}
                className="group"
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center space-y-2">
                    <div className="text-4xl">{category.icon}</div>
                    <h3 className="font-medium group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <h2 className="text-4xl font-bold">
            Klar til å spare penger?
          </h2>
          <p className="text-xl text-muted-foreground">
            Søk etter ditt neste kjøp og finn beste pris i dag.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/sok">Start søk</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/om">Les mer</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
