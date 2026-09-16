import { seoMetadata } from '@/lib/seo/metadata';

// This page is a client component, so it cannot export metadata itself. A
// sibling server layout can, and metadata merges down the tree, so this shim
// gives the route its title, canonical and hreflang without touching the page.
export const generateMetadata = seoMetadata('signin');

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return children;
}
