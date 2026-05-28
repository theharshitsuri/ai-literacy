import type { MetadataRoute } from 'next';

const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: ['/', '/quiz', '/quiz/complete', '/upgrade'], disallow: ['/feed', '/saved', '/profile', '/admin', '/api'] },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
