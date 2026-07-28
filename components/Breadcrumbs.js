// Server-renderable breadcrumb trail: a visual nav plus matching
// BreadcrumbList JSON-LD so search engines can show the trail in results.
// `items` is an array of { name, href } with the current page last
// (its href is used for the schema `item` but it isn't rendered as a link).
import Link from 'next/link';

const BASE_URL = 'https://luxury-phone.vercel.app';

export default function Breadcrumbs({ items }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${BASE_URL}${item.href}`,
    })),
  };

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-neutral-500">
        <ol className="flex flex-wrap items-center">
          {items.map((item, i) => (
            <li key={item.href} className="flex items-center">
              {i > 0 && <span className="mx-2">/</span>}
              {i === items.length - 1 ? (
                <span className="text-neutral-800" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link href={item.href} className="hover:text-gold-700">
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
