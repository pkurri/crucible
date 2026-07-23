import type {MetadataRoute} from 'next'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://forge-agents.space'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/pricing', '/foundry', '/blueprint']

  return routes.map(route => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.8,
  }))
}
