import Link from 'next/link';
import { Github, Twitter, Mail } from 'lucide-react';

export function Footer() {
  const footerLinks = {
    product: [
      { name: 'Søk produkter', href: '/sok' },
      { name: 'Kategorier', href: '/kategorier' },
      { name: 'Populære produkter', href: '/populaere' },
      { name: 'Prisvarsler', href: '/varsler' },
    ],
    company: [
      { name: 'Om oss', href: '/om' },
      { name: 'Kontakt', href: '/kontakt' },
      { name: 'Personvern', href: '/personvern' },
      { name: 'Vilkår', href: '/vilkar' },
    ],
    resources: [
      { name: 'Blogg', href: '/blogg' },
      { name: 'Hjelp', href: '/hjelp' },
      { name: 'API', href: '/api-docs' },
      { name: 'Status', href: '/status' },
    ],
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">P</span>
              </div>
              <span className="font-bold text-xl">PrisBanditt</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Finn beste pris på elektronikk fra norske butikker. Spar penger med smartere shopping.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="mailto:daniel@studenthjelp.no"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h3 className="font-semibold mb-4">Produkt</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h3 className="font-semibold mb-4">Selskap</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources links */}
          <div>
            <h3 className="font-semibold mb-4">Ressurser</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} PrisBanditt. Alle rettigheter reservert.
            </p>
            <p className="text-sm text-muted-foreground">
              Laget med ❤️ i Norge
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
