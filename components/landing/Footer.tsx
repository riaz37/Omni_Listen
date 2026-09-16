'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLocalePath } from '@/lib/i18n/use-locale-path';
import { useTranslation } from '@/lib/i18n/use-translation';
import SocialLinks from '@/components/SocialLinks';

const productLinks = [
  { labelKey: 'marketing.nav.features', href: '/#features' },
  { labelKey: 'marketing.nav.pricing', href: '/pricing' },
  { labelKey: 'marketing.nav.listen', href: '/listen' },
];

const companyLinks = [
  { labelKey: 'marketing.nav.about', href: '/about' },
  { labelKey: 'marketing.nav.contact', href: '/contact' },
];

const legalLinks = [
  { labelKey: 'common.privacy_policy', href: '/privacy' },
  { labelKey: 'marketing.footer.terms_of_service', href: '/terms' },
  { labelKey: 'marketing.footer.cookie_policy', href: '/cookies' },
  { labelKey: 'marketing.footer.security', href: '/security' },
];


export default function Footer() {
  const lp = useLocalePath();
  const { t } = useTranslation();
  return (
    <footer className="py-12 border-t border-border bg-muted/30 text-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image src="/logo-black.png" alt="" width={107} height={28} className="h-7 w-auto block dark:hidden" />
              <Image src="/logo.png" alt="" width={107} height={28} className="h-7 w-auto hidden dark:block" />
              <span className="font-bold text-foreground">OmniListen</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {t('marketing.footer.tagline')}
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-bold text-foreground mb-4">{t('marketing.footer.product')}</h4>
            <ul className="space-y-1">
              {productLinks.map((link) => (
                <li key={link.labelKey}>
                  <Link
                    href={link.href.startsWith('/') ? lp(link.href) : link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors inline-block py-2.5"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-foreground mb-4">{t('marketing.footer.company')}</h4>
            <ul className="space-y-1">
              {companyLinks.map((link) => (
                <li key={link.labelKey}>
                  <Link
                    href={lp(link.href)}
                    className="text-muted-foreground hover:text-foreground transition-colors inline-block py-2.5"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-foreground mb-4">{t('marketing.footer.legal')}</h4>
            <ul className="space-y-1">
              {legalLinks.map((link) => (
                <li key={link.labelKey}>
                  <Link
                    href={lp(link.href)}
                    className="text-muted-foreground hover:text-foreground transition-colors inline-block py-2.5"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} OmniListen. {t('marketing.footer.copyright')}</p>
          <SocialLinks />
        </div>
      </div>
    </footer>
  );
}
