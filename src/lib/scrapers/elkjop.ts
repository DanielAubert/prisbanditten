/**
 * Elkjøp.no Ethical Web Scraper
 *
 * Dette er en etisk og lovlig web scraper som:
 * - Respekterer robots.txt regler
 * - Identifiserer seg tydelig som bot (ikke maskerer seg som vanlig bruker)
 * - Bruker rate limiting (min. 3 sek mellom requests)
 * - Kun scraper offentlig tilgjengelig produktinformasjon
 * - Overbelaster ikke servere med for mange requests
 *
 * VIKTIG: Før produksjonssetting, vurder å:
 * 1. Kontakte Elkjøp for tillatelse eller API-tilgang
 * 2. Sjekke deres Terms of Service
 * 3. Implementere en "opt-out" mekanisme for butikker
 * 4. Sette opp kontaktside hvor butikker kan be om å bli fjernet
 *
 * Environment variables:
 * - NEXT_PUBLIC_SUPABASE_URL: Supabase URL
 * - SUPABASE_SERVICE_ROLE_KEY: Supabase service role key
 * - CONTACT_EMAIL: Din kontakt e-post (standard: contact@prisbanditt.no)
 */

import { chromium, Browser, Page } from 'playwright';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

interface ProductData {
  name: string;
  ean: string | null;
  brand: string | null;
  image_url: string | null;
  price: number;
  shipping_cost: number | null;
  stock_status: string;
  product_url: string;
  scraped_at: Date;
  retailer: string;
}

interface ScraperConfig {
  maxRetries: number;
  retryDelay: number;
  timeout: number;
  headless: boolean;
  requestDelay: number;
  respectRobotsTxt: boolean;
  contactEmail: string;
  botName: string;
}

interface RobotsTxtRules {
  allowed: boolean;
  crawlDelay?: number;
}

interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
  action: string;
  details?: any;
}

class ActivityLogger {
  private logFile: string;
  private logDir: string;

  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');

    // Create logs directory if it doesn't exist
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }

    // Create log file with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.logFile = path.join(this.logDir, `scraper-${timestamp}.log`);

    // Write header
    this.writeHeader();
  }

  private writeHeader(): void {
    const header = `
${'='.repeat(80)}
PRISBANDITT SCRAPER ACTIVITY LOG
Started: ${new Date().toISOString()}
Bot: PrisBanditt-Bot/1.0
Contact: daniel@studenthjelp.no
${'='.repeat(80)}

`;
    fs.writeFileSync(this.logFile, header, 'utf8');
  }

  private formatEntry(entry: LogEntry): string {
    const icon = {
      INFO: 'ℹ️',
      WARN: '⚠️',
      ERROR: '❌',
      SUCCESS: '✅',
    }[entry.level];

    let log = `[${entry.timestamp}] ${icon} ${entry.level}: ${entry.action}`;

    if (entry.details) {
      log += `\n  Details: ${JSON.stringify(entry.details, null, 2)}`;
    }

    return log + '\n';
  }

  log(level: LogEntry['level'], action: string, details?: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      action,
      details,
    };

    const formattedEntry = this.formatEntry(entry);

    // Write to file
    fs.appendFileSync(this.logFile, formattedEntry, 'utf8');

    // Also log to console
    console.log(formattedEntry.trim());
  }

  info(action: string, details?: any): void {
    this.log('INFO', action, details);
  }

  warn(action: string, details?: any): void {
    this.log('WARN', action, details);
  }

  error(action: string, details?: any): void {
    this.log('ERROR', action, details);
  }

  success(action: string, details?: any): void {
    this.log('SUCCESS', action, details);
  }

  getLogPath(): string {
    return this.logFile;
  }
}

class ElkjopScraper {
  private browser: Browser | null = null;
  private supabase: SupabaseClient;
  private config: ScraperConfig;
  private robotsTxtCache: Map<string, RobotsTxtRules> = new Map();
  private lastRequestTime: number = 0;
  private logger: ActivityLogger;

  constructor() {
    this.logger = new ActivityLogger();
    this.logger.info('Initializing ElkjopScraper');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.config = {
      maxRetries: 3,
      retryDelay: 2000,
      timeout: 30000,
      headless: true,
      requestDelay: 3000, // 3 sekunder mellom requests
      respectRobotsTxt: true,
      contactEmail: process.env.CONTACT_EMAIL || 'daniel@studenthjelp.no',
      botName: 'PrisBanditt-Bot/1.0',
    };

    this.logger.info('Configuration loaded', {
      requestDelay: this.config.requestDelay,
      respectRobotsTxt: this.config.respectRobotsTxt,
      botName: this.config.botName,
      contactEmail: this.config.contactEmail,
    });
  }

  private async initBrowser(): Promise<void> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: this.config.headless,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
  }

  private async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  private async withRetry<T>(
    fn: () => Promise<T>,
    context: string,
    retries = this.config.maxRetries
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        this.logger.error(`${context} - Attempt ${attempt}/${retries} failed`, { error: lastError.message });

        if (attempt < retries) {
          const delay = this.config.retryDelay * attempt;
          this.logger.info(`Retrying in ${delay}ms`);
          await this.sleep(delay);
        }
      }
    }

    this.logger.error(`${context} failed after all retries`, { attempts: retries, error: lastError?.message });
    throw new Error(`${context} failed after ${retries} attempts: ${lastError?.message}`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.config.requestDelay) {
      const waitTime = this.config.requestDelay - timeSinceLastRequest;
      this.logger.info(`Rate limiting: waiting ${waitTime}ms before next request`);
      await this.sleep(waitTime);
    }

    this.lastRequestTime = Date.now();
  }

  private async checkRobotsTxt(url: string): Promise<RobotsTxtRules> {
    if (!this.config.respectRobotsTxt) {
      return { allowed: true };
    }

    const urlObj = new URL(url);
    const robotsUrl = `${urlObj.protocol}//${urlObj.host}/robots.txt`;

    // Check cache first
    if (this.robotsTxtCache.has(robotsUrl)) {
      return this.robotsTxtCache.get(robotsUrl)!;
    }

    try {
      const response = await fetch(robotsUrl);
      const robotsTxt = await response.text();

      let allowed = true;
      let crawlDelay: number | undefined;
      let isRelevantSection = false;

      const lines = robotsTxt.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();

        // Check if this section applies to us
        if (trimmed.toLowerCase().startsWith('user-agent:')) {
          const agent = trimmed.substring(11).trim();
          isRelevantSection = agent === '*' || agent.toLowerCase() === this.config.botName.toLowerCase();
        }

        if (isRelevantSection) {
          if (trimmed.toLowerCase().startsWith('disallow:')) {
            const path = trimmed.substring(9).trim();
            if (path === '/' || urlObj.pathname.startsWith(path)) {
              allowed = false;
            }
          }

          if (trimmed.toLowerCase().startsWith('crawl-delay:')) {
            const delay = parseInt(trimmed.substring(12).trim(), 10);
            if (!isNaN(delay)) {
              crawlDelay = delay * 1000; // Convert to milliseconds
            }
          }
        }
      }

      const rules: RobotsTxtRules = { allowed, crawlDelay };
      this.robotsTxtCache.set(robotsUrl, rules);

      if (!allowed) {
        this.logger.warn(`robots.txt disallows scraping`, { url });
      } else {
        this.logger.info(`robots.txt check passed`, { url });
      }
      if (crawlDelay) {
        this.logger.info(`robots.txt specifies crawl-delay: ${crawlDelay}ms`);
        this.config.requestDelay = Math.max(this.config.requestDelay, crawlDelay);
      }

      return rules;
    } catch (error) {
      this.logger.warn(`Could not fetch robots.txt, allowing by default`, { robotsUrl });
      return { allowed: true };
    }
  }

  private async createPage(): Promise<Page> {
    await this.initBrowser();
    if (!this.browser) throw new Error('Browser not initialized');

    const page = await this.browser.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Etisk User-Agent som identifiserer oss som bot
    const userAgent = `${this.config.botName} (+${this.config.contactEmail})`;

    await page.setExtraHTTPHeaders({
      'User-Agent': userAgent,
      'Accept-Language': 'nb-NO,nb;q=0.9,no;q=0.8,nn;q=0.7,en-US;q=0.6,en;q=0.5',
    });

    this.logger.info(`Using ethical User-Agent`, { userAgent });

    return page;
  }

  private extractPrice(priceText: string | null): number | null {
    if (!priceText) return null;
    const cleanPrice = priceText.replace(/[^\d,.-]/g, '').replace(',', '.');
    const parsed = parseFloat(cleanPrice);
    return isNaN(parsed) ? null : parsed;
  }

  private normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url, 'https://www.elkjop.no');
      return urlObj.href;
    } catch {
      return url;
    }
  }

  async scrapeProductPage(url: string): Promise<ProductData | null> {
    // Check robots.txt
    const robotsRules = await this.checkRobotsTxt(url);
    if (!robotsRules.allowed) {
      this.logger.warn(`Skipping - disallowed by robots.txt`, { url });
      return null;
    }

    // Enforce rate limiting
    await this.enforceRateLimit();

    return this.withRetry(async () => {
      const page = await this.createPage();

      try {
        this.logger.info(`Scraping product page`, { url });
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: this.config.timeout });
        await page.waitForTimeout(1000);

        // Extract product data
        const productData = await page.evaluate(() => {
          const data: Partial<ProductData> = {};

          // Product name
          const nameEl = document.querySelector('h1[class*="product-title"], h1[data-testid="product-title"]');
          data.name = nameEl?.textContent?.trim() || '';

          // Price
          const priceEl = document.querySelector('[class*="price"], [data-testid="product-price"]');
          const priceText = priceEl?.textContent?.trim() || null;

          // Brand
          const brandEl = document.querySelector('[class*="brand"], [data-testid="product-brand"], [itemprop="brand"]');
          data.brand = brandEl?.textContent?.trim() || null;

          // Image
          const imgEl = document.querySelector('img[class*="product-image"], img[data-testid="product-image"]') as HTMLImageElement;
          data.image_url = imgEl?.src || imgEl?.dataset?.src || null;

          // Stock status
          const stockEl = document.querySelector('[class*="stock"], [data-testid="stock-status"]');
          data.stock_status = stockEl?.textContent?.trim() || 'unknown';

          // EAN from meta tags or structured data
          let ean: string | null = null;
          const metaEan = document.querySelector('meta[itemprop="gtin13"], meta[property="product:ean"]');
          if (metaEan) {
            ean = metaEan.getAttribute('content');
          }

          // Try JSON-LD structured data
          if (!ean) {
            const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
            for (const script of scripts) {
              try {
                const json = JSON.parse(script.textContent || '');
                if (json.gtin13 || json.gtin) {
                  ean = json.gtin13 || json.gtin;
                  break;
                }
              } catch {}
            }
          }

          data.ean = ean;

          return { ...data, priceText };
        });

        if (!productData.name) {
          throw new Error('Could not extract product name');
        }

        const price = this.extractPrice(productData.priceText);
        if (price === null) {
          throw new Error('Could not extract product price');
        }

        // Try to extract shipping cost
        const shippingText = await page.locator('[class*="shipping"], [class*="delivery"]').first().textContent().catch(() => null);
        const shippingCost = this.extractPrice(shippingText);

        const result: ProductData = {
          name: productData.name,
          ean: productData.ean,
          brand: productData.brand,
          image_url: productData.image_url,
          price,
          shipping_cost: shippingCost,
          stock_status: productData.stock_status || 'unknown',
          product_url: this.normalizeUrl(url),
          scraped_at: new Date(),
          retailer: 'elkjop',
        };

        this.logger.success(`Successfully scraped product`, { name: result.name, price: result.price, url });
        return result;
      } catch (error) {
        this.logger.error(`Error scraping product page`, { url, error: (error as Error).message });
        throw error;
      } finally {
        await page.close();
      }
    }, `Scraping product page ${url}`);
  }

  async scrapeCategoryPage(categoryUrl: string, maxProducts = 50): Promise<ProductData[]> {
    // Check robots.txt for category page
    const robotsRules = await this.checkRobotsTxt(categoryUrl);
    if (!robotsRules.allowed) {
      this.logger.warn(`Skipping category - disallowed by robots.txt`, { categoryUrl });
      return [];
    }

    // Enforce rate limiting
    await this.enforceRateLimit();

    return this.withRetry(async () => {
      const page = await this.createPage();
      const products: ProductData[] = [];

      try {
        this.logger.info(`Scraping category page`, { categoryUrl });
        await page.goto(categoryUrl, { waitUntil: 'domcontentloaded', timeout: this.config.timeout });
        await page.waitForTimeout(2000);

        // Scroll to load lazy images
        await page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight / 2);
        });
        await page.waitForTimeout(1000);

        // Extract product links
        const productLinks = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a[href*="/product/"]'));
          return [...new Set(links.map(a => (a as HTMLAnchorElement).href))];
        });

        this.logger.info(`Found product links on category page`, { count: productLinks.length, toScrape: maxProducts });

        const linksToScrape = productLinks.slice(0, maxProducts);

        for (const link of linksToScrape) {
          try {
            const productData = await this.scrapeProductPage(link);
            if (productData) {
              products.push(productData);
            }
          } catch (error) {
            this.logger.error(`Failed to scrape product`, { link, error: (error as Error).message });
            // Continue with next product
          }
        }

        return products;
      } catch (error) {
        this.logger.error(`Error scraping category page`, { categoryUrl, error: (error as Error).message });
        throw error;
      } finally {
        await page.close();
      }
    }, `Scraping category page ${categoryUrl}`);
  }

  async saveToSupabase(products: ProductData[]): Promise<void> {
    this.logger.info(`Saving products to Supabase`, { count: products.length });

    for (const product of products) {
      try {
        // Insert or update product
        const { data: existingProduct, error: selectError } = await this.supabase
          .from('products')
          .select('id')
          .eq('product_url', product.product_url)
          .single();

        let productId: string;

        if (existingProduct) {
          // Update existing product
          const { data, error } = await this.supabase
            .from('products')
            .update({
              name: product.name,
              ean: product.ean,
              brand: product.brand,
              image_url: product.image_url,
              stock_status: product.stock_status,
              retailer: product.retailer,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingProduct.id)
            .select('id')
            .single();

          if (error) throw error;
          productId = data.id;
          this.logger.info(`Updated product in database`, { name: product.name, id: productId });
        } else {
          // Insert new product
          const { data, error } = await this.supabase
            .from('products')
            .insert({
              name: product.name,
              ean: product.ean,
              brand: product.brand,
              image_url: product.image_url,
              product_url: product.product_url,
              stock_status: product.stock_status,
              retailer: product.retailer,
            })
            .select('id')
            .single();

          if (error) throw error;
          productId = data.id;
          this.logger.success(`Inserted new product to database`, { name: product.name, id: productId });
        }

        // Insert price record
        const { error: priceError } = await this.supabase
          .from('prices')
          .insert({
            product_id: productId,
            price: product.price,
            shipping_cost: product.shipping_cost,
            scraped_at: product.scraped_at.toISOString(),
          });

        if (priceError) throw priceError;
        this.logger.info(`Inserted price record`, { name: product.name, price: product.price });
      } catch (error) {
        this.logger.error(`Error saving product to Supabase`, { name: product.name, error: (error as Error).message });
        // Continue with next product
      }
    }

    this.logger.success(`Finished saving to Supabase`, { totalProducts: products.length });
  }

  async scrapeAndSave(url: string, isCategory = false): Promise<void> {
    try {
      let products: ProductData[];

      if (isCategory) {
        products = await this.scrapeCategoryPage(url);
      } else {
        const product = await this.scrapeProductPage(url);
        products = product ? [product] : [];
      }

      if (products.length > 0) {
        await this.saveToSupabase(products);
      } else {
        this.logger.warn('No products scraped');
      }
    } finally {
      await this.closeBrowser();
    }
  }

  getLogPath(): string {
    return this.logger.getLogPath();
  }
}

// CLI execution
async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🤖 Elkjøp.no Ethical Web Scraper');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('✓ Respekterer robots.txt');
  console.log('✓ Identifiserer seg som bot (PrisBanditt-Bot)');
  console.log('✓ Bruker rate limiting (3+ sek mellom requests)');
  console.log('✓ Kun offentlig tilgjengelig produktinfo');
  console.log('═══════════════════════════════════════════════════════════\n');

  const url = process.argv[2];
  const isCategory = process.argv.includes('--category');

  if (!url) {
    console.error('Usage: tsx elkjop.ts <url> [--category]');
    console.error('\nEksempler:');
    console.error('  tsx elkjop.ts "https://www.elkjop.no/product/..." ');
    console.error('  tsx elkjop.ts "https://www.elkjop.no/category/..." --category');
    process.exit(1);
  }

  const scraper = new ElkjopScraper();

  try {
    await scraper.scrapeAndSave(url, isCategory);
    console.log('\n✅ Scraping completed successfully');
    console.log(`📄 Activity log: ${scraper.getLogPath()}`);
  } catch (error) {
    console.error('\n❌ Scraping failed:', error);
    console.log(`📄 Activity log: ${scraper.getLogPath()}`);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { ElkjopScraper, ProductData };
