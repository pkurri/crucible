/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // data/pricing.json etc. are read via a dynamic path.join(process.cwd(), 'data', ...)
  // at runtime, which Next's file-tracing can't statically detect - without this,
  // the files silently don't ship in the serverless bundle and routes fall back to
  // hardcoded placeholder data.
  outputFileTracingIncludes: {
    '/pricing': ['./data/**/*'],
    '/api/checkout': ['./data/**/*'],
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
