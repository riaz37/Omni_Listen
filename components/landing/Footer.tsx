import Link from 'next/link';
import Image from 'next/image';
import { Linkedin, Facebook, Instagram, Youtube } from 'lucide-react';

const productLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Dashboard', href: '/dashboard' },
];

const companyLinks = [
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Careers', href: '/careers' },
];

const legalLinks = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Security', href: '/security' },
];

const socialLinks = [
  {
    label: 'X',
    href: 'https://x.com/ESAP2030',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current">
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/esapai/?viewAsMember=true',
    icon: <Linkedin className="w-5 h-5" />,
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/esapai.official',
    icon: <Facebook className="w-5 h-5" />,
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/esapai.official/',
    icon: <Instagram className="w-5 h-5" />,
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/channel/UC7LyRbfXwb7at1gCQpUMzGg',
    icon: <Youtube className="w-5 h-5" />,
  },
];

export default function Footer() {
  return (
    <footer className="py-12 border-t border-border bg-muted/30 text-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image src="/esapai_logo.png" alt="ESAPAIListen" width={28} height={28} className="rounded-md" />
              <span className="font-bold text-foreground">ESAPAIListen</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Your intelligent meeting companion. Capture, analyze, and sync every conversation.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-bold text-foreground mb-4">Product</h4>
            <ul className="space-y-1">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors inline-block py-2.5"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-foreground mb-4">Company</h4>
            <ul className="space-y-1">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors inline-block py-2.5"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-foreground mb-4">Legal</h4>
            <ul className="space-y-1">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors inline-block py-2.5"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ESAPAIListen. All rights reserved.</p>
          <div className="flex gap-5">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors p-2"
                aria-label={social.label}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
