import type { MetadataRoute } from 'next';

const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${base}/`,        lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${base}/quiz`,    lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/upgrade`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ];
}
