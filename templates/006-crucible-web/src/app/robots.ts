import type {MetadataRoute} from 'next'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://forge-agents.space'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard/', '/login'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
