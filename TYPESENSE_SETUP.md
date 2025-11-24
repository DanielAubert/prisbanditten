# Typesense Setup Guide 🔍

Følg denne guiden for å sette opp Typesense Cloud for PrisBanditt.

---

## Steg 1: Opprett Typesense Cloud-konto

### 1.1 Gå til Typesense Cloud
Besøk: **https://cloud.typesense.org/**

### 1.2 Registrer deg
- Klikk på "Sign Up" eller "Get Started"
- Bruk Google/GitHub eller e-post for å registrere deg
- Bekreft e-posten din

---

## Steg 2: Opprett en Cluster

### 2.1 Klikk på "Create Cluster"

### 2.2 Velg plan
**For utvikling/testing:**
- Velg **"Development"** (gratis tier)
- 0.5 CPU, 2 GB RAM, 10 GB disk
- 100% gratis for alltid

**For produksjon (senere):**
- Velg en større plan basert på behov
- Start med "Production Starter" ($19/mnd)

### 2.3 Velg region
- Velg **"Europe"** (nærmest Norge)
- Frankfurt eller Amsterdam anbefales

### 2.4 Gi clusteret et navn
- Eksempel: `prisbanditt-dev` eller `prisbanditt-prod`

### 2.5 Klikk "Launch Cluster"
- Vent 2-3 minutter mens clusteret provisioneres
- Du vil se status "Provisioning..." → "Running"

---

## Steg 3: Hent API-nøkler

### 3.1 Klikk på clusteret ditt
I dashboardet, klikk på clusteret du nettopp opprettet

### 3.2 Gå til "Generate API Keys"
Du vil se flere nøkler:

**Admin API Key** (rød bakgrunn)
- Full tilgang (les, skriv, slett)
- Bruk kun på server-side (aldri i frontend)

**Search-only API Key** (grønn bakgrunn)
- Kun søketilgang (read-only)
- Trygt å bruke i frontend

### 3.3 Kopier informasjonen
Du trenger:
- **Host:** Noe som `xxx.a1.typesense.net`
- **Port:** `443`
- **Protocol:** `https`
- **Admin API Key:** Lang streng med tall og bokstaver

---

## Steg 4: Legg til i .env.local

### 4.1 Åpne eller opprett `.env.local`
I prosjektets rot-mappe: `/Users/danielaubert/Code/prisbanditt/.env.local`

### 4.2 Legg til Typesense-variabler
Kopier disse linjene og erstatt med dine verdier:

```bash
# Typesense Configuration
NEXT_PUBLIC_TYPESENSE_HOST=xxx.a1.typesense.net
NEXT_PUBLIC_TYPESENSE_PORT=443
NEXT_PUBLIC_TYPESENSE_PROTOCOL=https
NEXT_PUBLIC_TYPESENSE_API_KEY=your_admin_api_key_here
```

**Eksempel:**
```bash
NEXT_PUBLIC_TYPESENSE_HOST=abc123xyz.a1.typesense.net
NEXT_PUBLIC_TYPESENSE_PORT=443
NEXT_PUBLIC_TYPESENSE_PROTOCOL=https
NEXT_PUBLIC_TYPESENSE_API_KEY=xyz123abcDEF456...
```

### 4.3 Lagre filen

---

## Steg 5: Kjør setup-skriptet

### 5.1 Restart Next.js-serveren
Stopp serveren (Ctrl+C) og start på nytt:
```bash
npm run dev
```

Dette laster inn de nye environment variables.

### 5.2 Kjør Typesense setup
```bash
npx tsx scripts/setup-typesense.ts
```

**Forventet output:**
```
🚀 Starting Typesense setup...

1️⃣  Testing connection...
✅ Connected to Typesense successfully!
   Status: OK

2️⃣  Checking for existing collections...
✅ No existing collection found. Creating new one...

3️⃣  Creating "products" collection...
✅ Collection created successfully!

4️⃣  Verifying collection...
✅ Collection verified!
   Name: products
   Fields: 0 documents
   Schema fields: 18 fields

🎉 Typesense setup complete!
```

### 5.3 Hvis du får feil
**Error: Missing environment variables**
- Sjekk at du har lagt til alle variabler i `.env.local`
- Restart Next.js-serveren

**Error: Connection timeout**
- Sjekk at clusteret er "Running" i Typesense Cloud
- Sjekk at host-URL er riktig (ingen `https://` foran)

**Error: Authentication failed**
- Sjekk at API-nøkkelen er riktig kopiert
- Husk at det er Admin API Key, ikke Search-only

---

## Steg 6: Populer med data

### 6.1 Kjør scraperen
```bash
npx tsx src/lib/scrapers/elkjop.ts
```

Dette vil:
1. Scrape produkter fra Elkjøp.no
2. Lagre i Supabase-databasen
3. Synkronisere til Typesense automatisk
4. Logge aktivitet til `logs/scraper-[timestamp].log`

### 6.2 Vent til scraping er ferdig
Du vil se output som:
```
[INFO] Starting Elkjøp scraper...
[INFO] Fetching products from category: mobil-gps
[INFO] Found 24 products on page 1
[SUCCESS] Saved product: iPhone 15 Pro 128GB
...
```

---

## Steg 7: Test søket

### 7.1 Åpne nettleseren
Gå til: **http://localhost:3001/sok**

### 7.2 Søk etter produkter
Prøv å søke etter:
- "iPhone"
- "Samsung"
- "MacBook"

Du skal nå se:
- Instant autocomplete mens du skriver
- Produktkort i rutenett
- Filtre i sidebar (merke, kategori, pris, etc.)

### 7.3 Test produktsiden
Klikk på et produkt for å se:
- Prissammenligning fra butikker
- Prishistorikk-graf
- Produktdetaljer

---

## Verifisering ✅

Sjekk at alt fungerer:

- [ ] Typesense cluster er "Running" i dashboard
- [ ] Setup-skriptet kjørte uten feil
- [ ] Scraper har lagt til produkter
- [ ] Søk på `/sok` viser autocomplete
- [ ] Produktkort vises i rutenett
- [ ] Filtre fungerer (merke, pris, etc.)
- [ ] Produktsiden viser priser og graf

---

## Typesense Dashboard

### Tilgang
Logg inn på https://cloud.typesense.org/ for å:
- Overvåke cluster-helse
- Se antall dokumenter
- Kjøre test-søk
- Sjekke API-bruk og ytelse

### Nyttige kommandoer
Fra dashboard kan du:
- Se alle collections
- Kjøre test-queries
- Sjekke indekserings-status
- Overvåke søkehastighet (skal være <50ms)

---

## Feilsøking 🔧

### Søket returnerer ingen resultater
1. Sjekk at Typesense-collection har dokumenter:
   - Gå til Typesense Dashboard
   - Klikk på "products" collection
   - Se på "Documents" count

2. Hvis 0 dokumenter:
   ```bash
   # Kjør scraperen igjen
   npx tsx src/lib/scrapers/elkjop.ts
   ```

### Autocomplete fungerer ikke
1. Åpne nettleserens console (F12)
2. Sjekk for JavaScript-feil
3. Verifiser at miljøvariabler er lastet:
   ```bash
   # I terminal
   echo $NEXT_PUBLIC_TYPESENSE_HOST
   ```
4. Restart Next.js-serveren

### Søket er tregt (>100ms)
1. Sjekk cluster-region (bør være Europa)
2. Oppgrader fra Development til Production-plan
3. Optimaliser query-parametere

---

## Neste steg 🚀

Nå som Typesense fungerer:

1. **Legg til flere scrapers:**
   - Komplett
   - Power
   - Elkjøp har mange flere kategorier

2. **Sett opp cron-job:**
   - Automatisk scraping hver natt
   - Oppdater prishistorikk

3. **Implementer funksjoner:**
   - Prisvarsler (send e-post når pris faller)
   - Favoritter (lagre produkter)
   - Brukerkontoer

4. **Optimaliser:**
   - Caching av søkeresultater
   - CDN for bilder
   - Server-side rendering for SEO

---

## Kostnader 💰

**Development (gratis tier):**
- $0/måned
- 0.5 CPU, 2 GB RAM
- 10 GB disk
- Perfekt for testing

**Production Starter:**
- $19/måned
- 2 CPU, 8 GB RAM
- 40 GB disk
- Håndterer ~10-20k søk/dag

**Anbefaling:**
- Start med gratis tier
- Oppgrader når du får trafikk
- Monitor ytelse i dashboard

---

## Support

**Typesense docs:**
https://typesense.org/docs/

**Typesense Discord:**
https://discord.gg/typesense

**PrisBanditt-prosjekt:**
Kontakt: daniel@studenthjelp.no

---

**🎉 Lykke til med Typesense!**
