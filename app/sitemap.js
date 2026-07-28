// Sitemap for search engines, served at /sitemap.xml.
import { getProductsServer } from '@/lib/serverData';
import { SITE_URL as BASE_URL } from '@/lib/constants';

export const revalidate = 3600;

export default async function sitemap() {
  const products = await getProductsServer();

  const productUrls = products.map((p) => {
    const updated = p.updatedAt?.toDate ? p.updatedAt.toDate() : p.createdAt?.toDate?.();
    return {
      url: `${BASE_URL}/products/${p.slug || p.id}`,
      lastModified: updated || new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    };
  });

  return [
    { url: `${BASE_URL}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/products`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/contact`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/track-order`, changeFrequency: 'monthly', priority: 0.6 },
    ...productUrls,
  ];
}
