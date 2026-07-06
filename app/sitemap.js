// Sitemap for search engines, served at /sitemap.xml.
const BASE_URL = 'https://luxury-phone.vercel.app';

export default function sitemap() {
  return [
    { url: `${BASE_URL}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/products`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/contact`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/track-order`, changeFrequency: 'monthly', priority: 0.6 },
  ];
}
