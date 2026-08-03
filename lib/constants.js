// The canonical production URL, used for metadata, canonicals, sitemaps
// and JSON-LD. Set NEXT_PUBLIC_SITE_URL in Vercel once a custom domain
// (e.g. luxuryphone24.com) is connected — every reference below picks it
// up automatically, no other file needs to change.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://luxury-phone.vercel.app').replace(/\/$/, '');

// Product categories shown in the store and the admin dashboard.
// `subtitle` appears on the large homepage category cards.
// Used only when Settings → Social links is empty, so the cards on the
// contact section are never blank. Anything typed in the dashboard wins.
export const SOCIAL_FALLBACK = {
  instagram: 'https://www.instagram.com/luxury.phone24',
  facebook: 'https://www.facebook.com/share/18xDkBnktQ/',
};

export const CATEGORIES = [
  { id: 'smartphones', label: 'Smartphones', icon: '📱', subtitle: 'The latest smartphones' },
  { id: 'laptops', label: 'Laptops', icon: '💻', subtitle: 'Powerful laptops & ultrabooks' },
  { id: 'tablets', label: 'Tablets', icon: '📲', subtitle: 'Tablets for work & play' },
  { id: 'smart-watches', label: 'Smart Watches', icon: '⌚', subtitle: 'Wearables & fitness' },
  { id: 'headphones', label: 'Headphones', icon: '🎧', subtitle: 'Premium sound & audio' },
  { id: 'chargers', label: 'Chargers', icon: '🔌', subtitle: 'Fast chargers & cables' },
  { id: 'phone-cases', label: 'Phone Cases', icon: '📳', subtitle: 'Protect your device' },
  { id: 'gaming-accessories', label: 'Gaming Accessories', icon: '🎮', subtitle: 'Level up your setup' },
  { id: 'computer-accessories', label: 'Computer Accessories', icon: '🖱️', subtitle: 'Mice, keyboards & more' },
  { id: 'other-electronics', label: 'Other Electronics', icon: '⚡', subtitle: 'Everything else tech' },
];

// One accent color per category — muted, jewel-toned hues (not neon) so
// each homepage category card gets its own colored glass/glow identity
// without clashing with the gold brand color. Used by Categories.js.
export const CATEGORY_ACCENTS = {
  smartphones: '#C9A227',
  laptops: '#4A6FA5',
  tablets: '#8B6DB8',
  'smart-watches': '#3F9C7A',
  headphones: '#B8556F',
  chargers: '#C77B3D',
  'phone-cases': '#3D9AA6',
  'gaming-accessories': '#B84A4A',
  'computer-accessories': '#5A8A96',
  'other-electronics': '#A67B4D',
};

export function categoryLabel(id) {
  return CATEGORIES.find((c) => c.id === id)?.label || id;
}

// Order lifecycle statuses.
export const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
];

export const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  Processing: 'bg-purple-100 text-purple-800',
  Shipped: 'bg-indigo-100 text-indigo-800',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
};

// All 58 Algerian wilayas, in official order. This exact list of names is
// what gets stored on every order (regardless of site language), so admin
// data stays consistent no matter which language the customer used.
export const WILAYAS = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra',
  'Béchar', 'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret',
  'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda',
  'Sidi Bel Abbès', 'Annaba', 'Guelma', 'Constantine', 'Médéa', 'Mostaganem',
  "M'Sila", 'Mascara', 'Ouargla', 'Oran', 'El Bayadh', 'Illizi',
  'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt',
  'El Oued', 'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla',
  'Naâma', 'Aïn Témouchent', 'Ghardaïa', 'Relizane', 'Timimoun',
  'Bordj Badji Mokhtar', 'Ouled Djellal', 'Béni Abbès', 'In Salah',
  'In Guezzam', 'Touggourt', 'Djanet', "El M'Ghair", 'El Meniaa',
];

// Same order as WILAYAS — used only as the DISPLAY label when the site is
// in Arabic. The value saved on the order always stays the French name
// above, so the admin dashboard is unaffected by the customer's language.
const WILAYAS_AR = [
  'أدرار', 'الشلف', 'الأغواط', 'أم البواقي', 'باتنة', 'بجاية', 'بسكرة',
  'بشار', 'البليدة', 'البويرة', 'تمنراست', 'تبسة', 'تلمسان', 'تيارت',
  'تيزي وزو', 'الجزائر', 'الجلفة', 'جيجل', 'سطيف', 'سعيدة', 'سكيكدة',
  'سيدي بلعباس', 'عنابة', 'قالمة', 'قسنطينة', 'المدية', 'مستغانم',
  'المسيلة', 'معسكر', 'ورقلة', 'وهران', 'البيض', 'إليزي',
  'برج بوعريريج', 'بومرداس', 'الطارف', 'تندوف', 'تيسمسيلت',
  'الوادي', 'خنشلة', 'سوق أهراس', 'تيبازة', 'ميلة', 'عين الدفلى',
  'النعامة', 'عين تموشنت', 'غرداية', 'غليزان', 'تيميمون',
  'برج باجي مختار', 'أولاد جلال', 'بني عباس', 'إن صالح',
  'إن قزام', 'تقرت', 'جانت', 'المغير', 'المنيعة',
];

export function wilayaLabel(name, locale) {
  if (locale !== 'ar') return name;
  const index = WILAYAS.indexOf(name);
  return index === -1 ? name : WILAYAS_AR[index];
}
