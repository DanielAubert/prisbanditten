# PrisBanditt 🏷️

En moderne norsk prissammenligningsplattform bygget for å gi deg de beste tilbudene på elektronikk. PrisBanditt samler priser fra flere norske nettbutikker og gir deg full oversikt over prishistorikk, trender og besparelser.

## ✨ Funksjoner

- **⚡ Instant Søk**: Lynrask søkefunksjon med Typesense (<50ms responstid)
- **📊 Prishistorikk**: Interaktive grafer som viser prisutviklingen over tid
- **🔍 Sammenlign Priser**: Få oversikt over priser fra flere butikker på ett sted
- **💰 Spar Penger**: Se hvor mye du kan spare ved å velge riktig butikk
- **📱 Responsivt Design**: Fungerer perfekt på både desktop og mobil
- **🎯 Kategoribasert Browsing**: Enkelt å finne produkter innen ulike kategorier
- **🔄 Automatisk Prissporing**: Regelmessig oppdatering av produktpriser

## 🛠️ Teknologi Stack

- **Framework**: [Next.js 16](https://nextjs.org/) med App Router
- **Språk**: TypeScript
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Søk**: [Typesense Cloud](https://cloud.typesense.org/)
- **Styling**: Tailwind CSS + Shadcn/UI
- **Grafer**: Recharts
- **Web Scraping**: Playwright + Crawlee
- **Deployment**: Vercel (anbefalt)

## 📋 Forutsetninger

- Node.js 16+ og npm
- Supabase-konto (gratis tier tilgjengelig)
- Typesense Cloud-konto (gratis tier tilgjengelig)

## 🚀 Kom i gang

### 1. Klon repositoriet

```bash
git clone https://github.com/DanielAubert/prisbanditten.git
cd prisbanditten
```

### 2. Installer avhengigheter

```bash
npm install
```

### 3. Sett opp miljøvariabler

Opprett en `.env.local` fil i rotmappen:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=din-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=din-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=din-service-role-key

# Typesense Cloud
NEXT_PUBLIC_TYPESENSE_HOST=din-typesense-host
NEXT_PUBLIC_TYPESENSE_PORT=443
NEXT_PUBLIC_TYPESENSE_PROTOCOL=https
NEXT_PUBLIC_TYPESENSE_API_KEY=din-typesense-api-key
TYPESENSE_ADMIN_API_KEY=din-typesense-admin-key

# Contact Email (for web scraping user-agent)
CONTACT_EMAIL=din@epost.no
```

### 4. Sett opp databasen

Kjør SQL-migreringen i Supabase SQL Editor:
1. Gå til din Supabase dashboard
2. Åpne SQL Editor
3. Kopier innholdet fra `supabase/migrations/001_initial_schema.sql`
4. Kjør migreringen

### 5. Sett opp Typesense

```bash
# Opprett søkeindeks
npx dotenv-cli -e .env.local -- npx tsx scripts/setup-typesense.ts

# Seed med testdata (valgfritt)
npx dotenv-cli -e .env.local -- npx tsx scripts/seed-mock-data.ts
```

### 6. Start utviklingsserveren

```bash
npm run dev
```

Åpne [http://localhost:3000](http://localhost:3000) i nettleseren.

## 📁 Prosjektstruktur

```
prisbanditt/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── page.tsx           # Forside
│   │   ├── sok/               # Søkeside
│   │   └── produkt/[slug]/    # Produktdetaljer
│   ├── components/            # React-komponenter
│   │   ├── layout/           # Header, Footer
│   │   ├── products/         # ProductCard, PriceHistoryChart
│   │   ├── search/           # SearchBar, SearchFilters
│   │   └── ui/               # Shadcn UI komponenter
│   └── lib/                  # Utilities og integrasjoner
│       ├── supabase.ts       # Supabase client
│       ├── typesense.ts      # Typesense client
│       ├── utils.ts          # Hjelpefunksjoner
│       └── scrapers/         # Web scraping scripts
├── scripts/                  # Setup og seeding scripts
├── supabase/                # Database migreringer
└── package.json
```

## 🔧 Tilgjengelige Scripts

```bash
# Utvikling
npm run dev              # Start utviklingsserver
npm run build           # Bygg for produksjon
npm run start           # Start produksjonsserver

# Database & Søk
npx dotenv-cli -e .env.local -- npx tsx scripts/setup-typesense.ts
npx dotenv-cli -e .env.local -- npx tsx scripts/seed-mock-data.ts
npx dotenv-cli -e .env.local -- npx tsx scripts/debug-product.ts
```

## 🎯 Datamodell

### Hovedtabeller

- **products**: Produktinformasjon (navn, EAN, beskrivelse, bilder)
- **retailers**: Butikkinformasjon (Elkjøp, Komplett, Power, etc.)
- **product_retailers**: Kobling mellom produkter og butikker
- **prices**: Prishistorikk med tidsstempler
- **categories**: Produktkategorier

### View

- **products_with_prices**: Aggregert view med laveste/høyeste/gjennomsnittspris

## 🌐 API Integrasjoner

### Supabase
Brukes for å lagre all produktdata, butikkinformasjon og prishistorikk. Row Level Security (RLS) sikrer at data kun kan leses, ikke skrives, fra klientsiden.

### Typesense
Gir lynrask instant-søk med fuzzy matching, typo-toleranse og facetert filtrering.

## 🤝 Bidra

Bidrag er velkomne! Vennligst:

1. Fork repositoriet
2. Opprett en feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit endringene dine (`git commit -m 'Add some AmazingFeature'`)
4. Push til branchen (`git push origin feature/AmazingFeature`)
5. Åpne en Pull Request

## ⚖️ Juridisk & Web Scraping

Dette prosjektet bruker etisk web scraping i tråd med robots.txt og terms of service. Vi:

- Respekterer robots.txt direktiver
- Bruker rate limiting for å ikke overbelaste servere
- Identifiserer oss med kontakt-informasjon i user-agent
- Lagrer kun offentlig tilgjengelig prisinformasjon
- Lenker alltid tilbake til originalkilde

## 📝 Lisens

Dette prosjektet er lisensiert under MIT License.

## 🙏 Takk til

- [Prisjakt](https://prisjakt.no) for inspirasjon
- [Next.js](https://nextjs.org/) teamet
- [Supabase](https://supabase.com/) og [Typesense](https://typesense.org/)
- Alle open source contributors

## 📞 Kontakt

Daniel Aubert - [@DanielAubert](https://github.com/DanielAubert)

Prosjekt Link: [https://github.com/DanielAubert/prisbanditten](https://github.com/DanielAubert/prisbanditten)

---

Bygget med ❤️ og ☕ i Norge
