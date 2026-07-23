const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development' || process.env.ELECTRON_BUILD === 'true',
  register: true,
  skipWaiting: true,
  sw: 'sw.js',
  fallbacks: {
    document: '/offline',
  },
});

// Opt-in bundle analyzer — run with `ANALYZE=true npm run build`, writes
// static HTML reports to .next/analyze/ instead of opening a browser tab.
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    NEXT_PUBLIC_GITHUB_CLIENT_ID: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
  },
  webpack: (config) => {
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    return config;
  },
  // Turbopack (Next.js 16 default bundler) — silence the "webpack config without turbopack config" error
  turbopack: {},
  experimental: {
    // Automatic per-icon tree-shaking for lucide-react (imported icon-by-icon
    // across dozens of components) — smaller emitted chunks, no import-site
    // changes needed.
    optimizePackageImports: ['lucide-react'],
  },
};

// Disable PWA to avoid confusion - users should download the desktop .exe instead
// module.exports = withPWA(nextConfig)
module.exports = withBundleAnalyzer(nextConfig);
