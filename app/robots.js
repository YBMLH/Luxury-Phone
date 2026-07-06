// Robots rules for search engines, served at /robots.txt.
const BASE_URL = 'https://luxury-phone.vercel.app';

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
