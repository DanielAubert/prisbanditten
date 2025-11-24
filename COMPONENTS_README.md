# PrisBanditt UI Components

## 🎨 Oversikt

Vi har bygget moderne, responsive UI-komponenter for PrisBanditt. Alle komponenter er bygget med:
- **Next.js 15** (App Router)
- **TypeScript** (fullt typesikret)
- **Tailwind CSS** (styling)
- **Shadcn/UI** (base components)
- **Recharts** (prisgrafer)
- **Lucide React** (ikoner)

---

## 📦 Komponenter

### 1. SearchBar
**Lokasjon:** `src/components/search/SearchBar.tsx`

Instant search med Typesense-integrasjon og autocomplete.

**Features:**
- ⚡ Sub-50ms søk (Typesense)
- 🔍 Autocomplete mens du skriver
- 🖼️ Produktbilder i suggestions
- ⌨️ Keyboard navigation
- 📱 Responsiv design

**Bruk:**
```tsx
import { SearchBar } from '@/components/search/SearchBar';

<SearchBar
  onSearch={(query) => console.log(query)}
  placeholder="Søk etter produkter..."
  showAutocomplete={true}
/>
```

---

### 2. ProductCard
**Lokasjon:** `src/components/products/ProductCard.tsx`

Produktkort med bilde, pris, og favoritt-knapp.

**Features:**
- 🖼️ Produktbilde med hover-effekt
- ❤️ Favoritt-knapp
- 📉 Prisendring-badge (opp/ned %)
- 🏷️ Brand og kategori
- 💰 Laveste pris + butikk
- 🔗 Link til produktside

**Bruk:**
```tsx
import { ProductCard } from '@/components/products/ProductCard';

<ProductCard
  product={product}
  onFavoriteToggle={(id) => console.log(id)}
  isFavorite={false}
  showPriceChange={true}
/>
```

---

### 3. PriceHistoryChart
**Lokasjon:** `src/components/products/PriceHistoryChart.tsx`

Interaktiv graf for prishistorikk.

**Features:**
- 📊 Multi-line chart (flere butikker samtidig)
- 📅 Time range selector (7d, 30d, 90d, all)
- 📈 Prisstatistikk (laveste, gjennomsnitt, høyeste)
- 🎨 Forskjellige farger per butikk
- 📱 Responsiv (ResponsiveContainer)

**Bruk:**
```tsx
import { PriceHistoryChart } from '@/components/products/PriceHistoryChart';

<PriceHistoryChart
  data={priceHistory}
  productName="iPhone 15 Pro"
/>
```

---

### 4. SearchFilters
**Lokasjon:** `src/components/search/SearchFilters.tsx`

Sidebar med avanserte filtre.

**Features:**
- 💰 Pris-range (min/max)
- 📦 Tilgjengelighet (på lager)
- 🏷️ Merke (brand)
- 📂 Kategori
- 🏪 Butikk (retailer)
- ✅ Checkbox selections
- 🗑️ "Nullstill alle" knapp
- 📊 Count badges

**Bruk:**
```tsx
import { SearchFilters } from '@/components/search/SearchFilters';

<SearchFilters
  brands={[{ name: 'Apple', count: 42 }]}
  categories={[{ name: 'Telefoner', slug: 'telefoner', count: 120 }]}
  retailers={[{ name: 'Elkjøp', slug: 'elkjop', count: 89 }]}

  selectedBrands={['Apple']}
  onBrandsChange={(brands) => console.log(brands)}

  inStockOnly={false}
  onInStockChange={(inStock) => console.log(inStock)}

  onClearAll={() => console.log('clear')}
/>
```

---

## 🛠️ Base UI Components (Shadcn)

Disse er grunnleggende komponenter som brukes av de andre:

### Button
**Lokasjon:** `src/components/ui/button.tsx`

```tsx
<Button variant="default|destructive|outline|secondary|ghost|link" size="default|sm|lg|icon">
  Klikk meg
</Button>
```

### Card
**Lokasjon:** `src/components/ui/card.tsx`

```tsx
<Card>
  <CardHeader>
    <CardTitle>Tittel</CardTitle>
    <CardDescription>Beskrivelse</CardDescription>
  </CardHeader>
  <CardContent>Innhold</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

### Input
**Lokasjon:** `src/components/ui/input.tsx`

```tsx
<Input
  type="text"
  placeholder="Skriv noe..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

---

## 🎯 Utility Functions

**Lokasjon:** `src/lib/utils.ts`

Hjelpefunksjoner for hele appen:

```typescript
// Styling
cn(...classes) // Merge Tailwind classes

// Formatering
formatPrice(5000) // "5 000 kr"
formatDate(new Date()) // "24. nov. 2025"
formatDateTime(new Date()) // "24. nov. 2025, 14:30"

// Prisberegning
calculatePriceChange(current, previous) // { percentage: 15, direction: 'down' }

// Debounce
debounce(fn, 300) // Debounced function

// Tid
getRelativeTime(date) // "2 timer siden"
```

---

## 📁 Filstruktur

```
src/
├── components/
│   ├── ui/              # Base Shadcn components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── input.tsx
│   ├── search/          # Søk-relaterte komponenter
│   │   ├── SearchBar.tsx
│   │   └── SearchFilters.tsx
│   └── products/        # Produkt-komponenter
│       ├── ProductCard.tsx
│       └── PriceHistoryChart.tsx
└── lib/
    ├── utils.ts         # Utility functions
    ├── supabase.ts      # Supabase client
    └── typesense.ts     # Typesense client
```

---

## 🎨 Design System

### Farger
Bruker Tailwind's default color palette + Shadcn's theme system:
- Primary: Blue (`bg-primary`)
- Success: Green (`text-green-600`)
- Destructive: Red (`bg-destructive`)
- Muted: Gray (`text-muted-foreground`)

### Spacing
- Små gaps: `gap-2` (8px)
- Medium gaps: `gap-4` (16px)
- Store gaps: `gap-6` (24px)

### Typography
- Heading: `text-2xl font-semibold`
- Body: `text-base`
- Small: `text-sm`
- Tiny: `text-xs`

---

## 🚀 Neste Steg

1. **Lag sider** som bruker komponentene:
   - `/` - Homepage med SearchBar
   - `/sok` - Søkeresultater med SearchFilters + ProductCard grid
   - `/produkt/[slug]` - Produktside med PriceHistoryChart

2. **Integrer Typesense** for instant search

3. **Legg til state management** (Zustand/React Query)

4. **Implementer favoritter** (supabase + localStorage)

5. **Legg til loading states** og error handling

---

## 📚 Eksempel: Full søkeside

```tsx
'use client';

import { SearchBar } from '@/components/search/SearchBar';
import { SearchFilters } from '@/components/search/SearchFilters';
import { ProductCard } from '@/components/products/ProductCard';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [products, setProducts] = useState([]);

  return (
    <div className="container mx-auto px-4 py-8">
      <SearchBar onSearch={setQuery} />

      <div className="grid grid-cols-12 gap-6 mt-8">
        <aside className="col-span-3">
          <SearchFilters
            brands={brands}
            onBrandsChange={(brands) => setFilters({ ...filters, brands })}
          />
        </aside>

        <main className="col-span-9">
          <div className="grid grid-cols-3 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
```

---

**🎉 Alle komponenter er klare! Start å bygge sidene dine!**
