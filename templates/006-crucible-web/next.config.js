/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The repo has multiple package-lock.json files (this app + the root
  // monorepo), so Next/Turbopack was auto-inferring the workspace root as
  // the repo root instead of this app. Pin it explicitly to silence the
  // warning and avoid subtle file-resolution/tracing bugs from the
  // misdetection.
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
