/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The repo has multiple package-lock.json files (this app + the root
  // monorepo), so Next/Turbopack was auto-inferring the workspace root as
  // the repo root instead of this app - which broke relative imports that
  // reach outside src/ (e.g. `../../../data/pricing.json`) with a false
  // "Module not found" at build time.
  turbopack: {
    root: __dirname,
  },
  outputFileTracingRoot: __dirname,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig
