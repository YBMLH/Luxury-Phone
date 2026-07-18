// Default site content. Shown until the owner edits everything from
// the admin dashboard (Admin → Site Content). Nothing here requires code
// changes — it is only the initial fallback.

export const DEFAULT_SETTINGS = {
  heroContent: {
    tagline: 'New · Luxury Phone Guelma',
    title: 'Tech built for',
    titleAccent: "what's next.",
    subtitle:
      'Flagship phones, laptops and pro accessories — genuine products, expertly picked, delivered across all 58 wilayas.',
    primaryButton: 'Shop the collection',
    secondaryButton: 'Track my order',
  },
  contactInfo: {
    phone: '',
    email: '',
    whatsapp: '',
    workingHours: 'Every day: 9:00 — 20:00',
  },
  socialLinks: {
    facebook: '',
    instagram: '',
    tiktok: '',
  },
  locations: [
    {
      name: 'Luxury Phone Branch 1',
      city: 'Guelma',
      address: 'Address coming soon',
      phone: '',
      workingHours: 'Every day: 9:00 — 20:00',
      mapEmbedUrl: '',
    },
    {
      name: 'Luxury Phone Branch 2',
      city: 'Guelma',
      address: 'Address coming soon',
      phone: '',
      workingHours: 'Every day: 9:00 — 20:00',
      mapEmbedUrl: '',
    },
  ],
  reviews: [
    {
      name: 'Amine B.',
      city: 'Guelma',
      rating: 5,
      text: 'Excellent service and 100% original products. My phone arrived the next day, perfectly packaged.',
    },
    {
      name: 'Sara K.',
      city: 'Annaba',
      rating: 5,
      text: 'The best electronics store in the east. Great prices and the team is very professional.',
    },
    {
      name: 'Yacine M.',
      city: 'Constantine',
      rating: 5,
      text: 'I ordered a laptop and tracked my order online. Smooth experience from start to finish.',
    },
  ],
  // Delivery pricing: one default fee, plus optional per-wilaya overrides
  // keyed by wilaya name (e.g. { "Guelma": 400 }). Editable in the dashboard.
  delivery: {
    defaultFee: 600,
    fees: {},
  },
  // Free ImgBB API key (https://api.imgbb.com) so photo uploads work without
  // a payment card. Set once from the dashboard.
  imgbbApiKey: '',
  // Optional background image per category card, keyed by category id.
  categoryImages: {},
  aboutContent: {
    title: 'About Luxury Phone',
    text:
      'Luxury Phone is a premium electronics store based in Guelma, Algeria, with two branches serving customers across the country. We specialise in genuine smartphones, laptops, tablets and accessories from the world’s leading brands — with honest prices, real warranties and fast nationwide delivery.',
  },
};

// Merge saved settings over the defaults so missing fields never break the UI.
export function mergeSettings(saved) {
  if (!saved) return DEFAULT_SETTINGS;
  return {
    ...DEFAULT_SETTINGS,
    ...saved,
    heroContent: { ...DEFAULT_SETTINGS.heroContent, ...saved.heroContent },
    contactInfo: { ...DEFAULT_SETTINGS.contactInfo, ...saved.contactInfo },
    socialLinks: { ...DEFAULT_SETTINGS.socialLinks, ...saved.socialLinks },
    delivery: {
      ...DEFAULT_SETTINGS.delivery,
      ...saved.delivery,
      fees: { ...(saved.delivery?.fees || {}) },
    },
    categoryImages: { ...(saved.categoryImages || {}) },
    aboutContent: { ...DEFAULT_SETTINGS.aboutContent, ...saved.aboutContent },
    locations:
      saved.locations && saved.locations.length
        ? saved.locations
        : DEFAULT_SETTINGS.locations,
    reviews:
      saved.reviews && saved.reviews.length
        ? saved.reviews
        : DEFAULT_SETTINGS.reviews,
  };
}
