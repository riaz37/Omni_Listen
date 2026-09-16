import { Linkedin, Facebook, Instagram, Youtube } from 'lucide-react';
import { SITE, type SocialLink } from '@/lib/site';

// No 'use client' on purpose: this renders the same in the client-side Footer
// and in the server-rendered contact page, which previously each carried their
// own hardcoded copy of the list and had drifted apart.
//
// lucide ships Linkedin, Facebook, Instagram and Youtube. The other four
// brands it does not, so those are inline paths (from simple-icons, CC0).

const BRAND_PATHS: Partial<Record<SocialLink['icon'], string>> = {
  x: 'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z',
  threads:
    'M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.968-3.898-5.994-8.304-6.026-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.026 3.086.717 5.496 2.056 7.176 1.43 1.78 3.631 2.695 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221z',
  tiktok:
    'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
  snapchat:
    'M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.58-.029.179-.074.36-.134.553-.076.27-.271.405-.555.405h-.03c-.135 0-.313-.031-.538-.074a6.727 6.727 0 00-1.394-.135c-.3 0-.61.015-.912.045-.6.073-1.153.405-1.736.766-.827.507-1.65.953-2.88.953h-.09c-1.229 0-2.052-.446-2.88-.953-.583-.36-1.135-.693-1.735-.766-.302-.03-.61-.045-.912-.045-.526 0-.945.074-1.394.135-.225.044-.403.075-.538.075h-.03c-.284 0-.479-.135-.555-.405-.06-.193-.105-.374-.134-.553-.045-.205-.105-.489-.164-.58-1.873-.283-2.906-.702-3.146-1.271a.593.593 0 01-.045-.225c-.015-.239.165-.465.42-.509 3.265-.539 4.731-3.878 4.791-4.014l.015-.015c.181-.344.21-.644.12-.868-.194-.45-.883-.675-1.333-.81-.135-.044-.255-.09-.344-.119-.823-.329-1.228-.719-1.213-1.168 0-.359.284-.689.734-.838.15-.061.327-.09.509-.09.12 0 .299.016.464.104.374.181.733.285 1.033.301.198 0 .326-.045.401-.09-.008-.165-.018-.33-.03-.51l-.003-.06c-.104-1.628-.23-3.654.299-4.847C7.859 1.069 11.216.793 12.206.793z',
};

function Icon({ icon, className }: { icon: SocialLink['icon']; className: string }) {
  switch (icon) {
    case 'linkedin':
      return <Linkedin className={className} />;
    case 'facebook':
      return <Facebook className={className} />;
    case 'instagram':
      return <Instagram className={className} />;
    case 'youtube':
      return <Youtube className={className} />;
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={`${className} fill-current`}>
          <path d={BRAND_PATHS[icon]} />
        </svg>
      );
  }
}

/**
 * The social row, driven by SITE.socialLinks. `variant` picks the two existing
 * treatments: 'inline' is the footer's bare icons, 'button' is the contact
 * page's circular chips. Renders nothing when the list is empty, which is what
 * lets SITE.socialLinks stay the single switch for the whole feature.
 */
export default function SocialLinks({ variant = 'inline' }: { variant?: 'inline' | 'button' }) {
  if (SITE.socialLinks.length === 0) return null;

  const isButton = variant === 'button';
  const wrapper = isButton
    ? 'flex justify-center flex-wrap gap-4'
    : 'flex items-center gap-4 flex-wrap';
  const anchor = isButton
    ? 'bg-card-2 p-4 rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all'
    : 'hover:text-foreground transition-colors p-2';

  return (
    <div className={wrapper}>
      {SITE.socialLinks.map((social) => (
        <a
          key={social.label}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${SITE.name} on ${social.label}`}
          className={anchor}
        >
          <Icon icon={social.icon} className={isButton ? 'w-6 h-6' : 'w-5 h-5'} />
        </a>
      ))}
    </div>
  );
}
