import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://maschandigital.id';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/api/',
          '/login',
          '/register',
        ],
      },
      {
        userAgent: [
          'Google-Extended',
          'GPTBot',
          'ClaudeBot',
          'PerplexityBot',
          'OAI-SearchBot',
        ],
        allow: '/',
        disallow: [
          '/dashboard/',
          '/api/',
          '/login',
          '/register',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
