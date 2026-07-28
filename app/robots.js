// Robots rules for search engines, served at /robots.txt.
import { SITE_URL as BASE_URL } from '@/lib/constants';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin',
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
