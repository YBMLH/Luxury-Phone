// Clean line icons for the category cards (look more premium than emoji
// at large size). Falls back to the category emoji if an id has no icon.
import { CATEGORIES } from '@/lib/constants';

const PATHS = {
  smartphones: (
    <>
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <line x1="11" y1="18" x2="13" y2="18" />
    </>
  ),
  laptops: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="1.5" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </>
  ),
  tablets: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <line x1="11" y1="17" x2="13" y2="17" />
    </>
  ),
  'smart-watches': (
    <>
      <rect x="7" y="7" width="10" height="10" rx="2.5" />
      <path d="M9 7l.5-3h5l.5 3M9 17l.5 3h5l.5-3" />
    </>
  ),
  headphones: (
    <>
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <rect x="3" y="14" width="4" height="6" rx="1.5" />
      <rect x="17" y="14" width="4" height="6" rx="1.5" />
    </>
  ),
  chargers: (
    <>
      <path d="M9 2v6M15 2v6" />
      <path d="M6 8h12v3a6 6 0 0 1-12 0z" />
      <line x1="12" y1="17" x2="12" y2="22" />
    </>
  ),
  'phone-cases': (
    <>
      <rect x="6" y="2" width="12" height="20" rx="3" />
      <circle cx="15" cy="7" r="1" />
      <circle cx="15" cy="10" r="1" />
    </>
  ),
  'gaming-accessories': (
    <>
      <path d="M7 8h10a4 4 0 0 1 4 4v3a3 3 0 0 1-5.5 1.7L14 15h-4l-1.5 1.7A3 3 0 0 1 3 15v-3a4 4 0 0 1 4-4z" />
      <line x1="7" y1="12" x2="7" y2="12.5" />
      <line x1="17" y1="12" x2="17" y2="12.5" />
    </>
  ),
  'computer-accessories': (
    <>
      <rect x="8" y="3" width="8" height="18" rx="4" />
      <line x1="12" y1="7" x2="12" y2="11" />
    </>
  ),
  'other-electronics': <path d="M13 2 4 14h7l-1 8 9-12h-7z" />,
};

export default function CategoryIcon({ id, className = 'h-7 w-7' }) {
  const path = PATHS[id];
  if (!path) {
    const emoji = CATEGORIES.find((c) => c.id === id)?.icon || '⚡';
    return <span className="text-2xl">{emoji}</span>;
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {path}
    </svg>
  );
}
