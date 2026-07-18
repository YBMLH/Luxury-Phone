'use client';

// Site content editor. Everything the customer sees — hero text, contact
// details, social links, store locations, reviews, about text — is edited
// here and saved to the settings/site document in Firestore.
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getSettings, saveSettings } from '@/lib/db';
import { mergeSettings } from '@/lib/defaults';
import { WILAYAS, CATEGORIES } from '@/lib/constants';
import { TableSkeleton } from '@/components/Skeletons';
import { sanitizeText } from '@/lib/utils';
import ImageInput from '@/components/admin/ImageInput';

const TABS = [
  { id: 'hero', label: '🏠 Hero Banner' },
  { id: 'contact', label: '📞 Contact Info' },
  { id: 'social', label: '🔗 Social Links' },
  { id: 'delivery', label: '🚚 Delivery Fees' },
  { id: 'images', label: '🖼️ Images & Categories' },
  { id: 'locations', label: '📍 Store Locations' },
  { id: 'reviews', label: '⭐ Reviews' },
  { id: 'about', label: 'ℹ️ About Page' },
];

const EMPTY_LOCATION = {
  name: '', city: '', address: '', phone: '', workingHours: '', mapEmbedUrl: '',
};
const EMPTY_REVIEW = { name: '', city: '', rating: 5, text: '' };

function Field({ label, hint, ...props }) {
  return (
    <div>
      <label className="label">{label}</label>
      {props.rows ? <textarea className="input" {...props} /> : <input className="input" {...props} />}
      {hint && <p className="mt-1 text-xs text-neutral-400">{hint}</p>}
    </div>
  );
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [tab, setTab] = useState('hero');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings()
      .then((saved) => setSettings(mergeSettings(saved)))
      .catch(() => toast.error('Could not load settings.'));
  }, []);

  if (!settings) return <TableSkeleton rows={6} />;

  const update = (section, field, value) =>
    setSettings({ ...settings, [section]: { ...settings[section], [field]: value } });

  const updateItem = (section, index, field, value) => {
    const list = [...settings[section]];
    list[index] = { ...list[index], [field]: value };
    setSettings({ ...settings, [section]: list });
  };

  const removeItem = (section, index) =>
    setSettings({
      ...settings,
      [section]: settings[section].filter((_, i) => i !== index),
    });

  const addItem = (section, empty) =>
    setSettings({ ...settings, [section]: [...settings[section], { ...empty }] });

  async function handleSave() {
    setSaving(true);
    try {
      // Light sanitization of every text field before saving.
      const clean = JSON.parse(JSON.stringify(settings), (key, value) =>
        typeof value === 'string' ? sanitizeText(value, 2000) : value
      );
      await saveSettings(clean);
      toast.success('Site content saved!');
    } catch {
      toast.error('Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold">Site Content</h1>
        <button onClick={handleSave} disabled={saving} className="btn-gold !px-8 !py-2.5">
          {saving ? 'Saving…' : '💾 Save All Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              tab === t.id
                ? 'bg-marble text-gold-300'
                : 'border border-neutral-300 bg-white text-neutral-600 hover:border-gold'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-card">
        {tab === 'hero' && (
          <div className="space-y-4">
            <Field label="Tagline (small text above the title)"
              value={settings.heroContent.tagline}
              onChange={(e) => update('heroContent', 'tagline', e.target.value)} />
            <Field label="Main Title (black part)"
              value={settings.heroContent.title}
              onChange={(e) => update('heroContent', 'title', e.target.value)} />
            <Field label="Title Accent (gold part, second line)"
              value={settings.heroContent.titleAccent || ''}
              onChange={(e) => update('heroContent', 'titleAccent', e.target.value)} />
            <Field label="Subtitle" rows={3}
              value={settings.heroContent.subtitle}
              onChange={(e) => update('heroContent', 'subtitle', e.target.value)} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Primary Button Text"
                value={settings.heroContent.primaryButton}
                onChange={(e) => update('heroContent', 'primaryButton', e.target.value)} />
              <Field label="Secondary Button Text"
                value={settings.heroContent.secondaryButton}
                onChange={(e) => update('heroContent', 'secondaryButton', e.target.value)} />
            </div>
          </div>
        )}

        {tab === 'contact' && (
          <div className="space-y-4">
            <Field label="Phone Number" placeholder="05XX XX XX XX"
              value={settings.contactInfo.phone}
              onChange={(e) => update('contactInfo', 'phone', e.target.value)} />
            <Field label="WhatsApp Number" placeholder="e.g. 213550123456 (with country code)"
              hint="Used for the WhatsApp button — include the 213 country code."
              value={settings.contactInfo.whatsapp}
              onChange={(e) => update('contactInfo', 'whatsapp', e.target.value)} />
            <Field label="Email" type="email"
              value={settings.contactInfo.email}
              onChange={(e) => update('contactInfo', 'email', e.target.value)} />
            <Field label="Working Hours" placeholder="Every day: 9:00 — 20:00"
              value={settings.contactInfo.workingHours}
              onChange={(e) => update('contactInfo', 'workingHours', e.target.value)} />
          </div>
        )}

        {tab === 'social' && (
          <div className="space-y-4">
            <Field label="Facebook URL" placeholder="https://facebook.com/…"
              value={settings.socialLinks.facebook}
              onChange={(e) => update('socialLinks', 'facebook', e.target.value)} />
            <Field label="Instagram URL" placeholder="https://instagram.com/…"
              value={settings.socialLinks.instagram}
              onChange={(e) => update('socialLinks', 'instagram', e.target.value)} />
            <Field label="TikTok URL" placeholder="https://tiktok.com/@…"
              value={settings.socialLinks.tiktok}
              onChange={(e) => update('socialLinks', 'tiktok', e.target.value)} />
          </div>
        )}

        {tab === 'delivery' && (
          <div className="space-y-5">
            <div className="max-w-xs">
              <Field label="Default delivery fee (DA)" type="number" min="0"
                hint="Used for every wilaya that has no specific price below."
                value={settings.delivery.defaultFee}
                onChange={(e) =>
                  update('delivery', 'defaultFee', Number(e.target.value) || 0)
                } />
            </div>
            <div>
              <p className="label">Per-wilaya prices (leave empty to use the default)</p>
              <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                {WILAYAS.map((wilaya, i) => (
                  <div key={wilaya} className="flex items-center gap-3">
                    <span className="w-40 shrink-0 truncate text-sm text-neutral-600">
                      {String(i + 1).padStart(2, '0')} — {wilaya}
                    </span>
                    <input
                      className="input !py-1.5"
                      type="number"
                      min="0"
                      placeholder={`${settings.delivery.defaultFee}`}
                      value={settings.delivery.fees[wilaya] ?? ''}
                      onChange={(e) => {
                        const fees = { ...settings.delivery.fees };
                        if (e.target.value === '') {
                          delete fees[wilaya];
                        } else {
                          fees[wilaya] = Number(e.target.value) || 0;
                        }
                        update('delivery', 'fees', fees);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'images' && (
          <div className="space-y-8">
            <div>
              <h3 className="mb-1 font-display text-base font-semibold">
                Photo uploads (Cloudinary — free, no card)
              </h3>
              <p className="mb-3 text-sm text-neutral-500">
                Cloudinary hosts your product photos on a fast image network and
                shrinks them automatically. One-time setup: create a free account
                at{' '}
                <a href="https://cloudinary.com/users/register_free" target="_blank" rel="noopener noreferrer"
                  className="text-gold-700 underline">cloudinary.com</a>, then in
                Settings → Upload add an <strong>unsigned</strong> upload preset.
                Paste both values below.
              </p>
              <div className="grid max-w-lg gap-4 sm:grid-cols-2">
                <Field label="Cloud name" placeholder="e.g. dxy123abc"
                  value={settings.cloudinary?.cloudName || ''}
                  onChange={(e) => update('cloudinary', 'cloudName', e.target.value.trim())} />
                <Field label="Upload preset (unsigned)" placeholder="e.g. luxury_phone"
                  value={settings.cloudinary?.uploadPreset || ''}
                  onChange={(e) => update('cloudinary', 'uploadPreset', e.target.value.trim())} />
              </div>
              <p className="mt-2 text-xs text-neutral-400">
                {settings.cloudinary?.cloudName && settings.cloudinary?.uploadPreset
                  ? '✅ Uploads will use Cloudinary.'
                  : '⚠ Not set yet — fill both fields (or just paste image links directly on products).'}
              </p>

              <details className="mt-3 text-xs text-neutral-500">
                <summary className="cursor-pointer font-medium text-neutral-600">
                  Prefer ImgBB instead? (optional)
                </summary>
                <div className="mt-2 max-w-md">
                  <Field label="ImgBB API Key (used only if Cloudinary is empty)"
                    placeholder="Paste your ImgBB key"
                    value={settings.imgbbApiKey || ''}
                    onChange={(e) => setSettings({ ...settings, imgbbApiKey: e.target.value })} />
                </div>
              </details>
            </div>

            <div>
              <h3 className="mb-1 font-display text-base font-semibold">
                Category card backgrounds
              </h3>
              <p className="mb-4 text-sm text-neutral-500">
                Optional: give each homepage category card a background photo.
                Leave empty for the elegant black-marble look.
              </p>
              <div className="grid gap-5 sm:grid-cols-2">
                {CATEGORIES.map((cat) => (
                  <div key={cat.id} className="rounded-xl border border-neutral-200 p-4">
                    <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
                      <span>{cat.icon}</span> {cat.label}
                    </p>
                    <ImageInput
                      value={settings.categoryImages?.[cat.id] || ''}
                      onChange={(url) =>
                        setSettings({
                          ...settings,
                          categoryImages: { ...settings.categoryImages, [cat.id]: url },
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'locations' && (
          <div className="space-y-6">
            {settings.locations.map((loc, i) => (
              <div key={i} className="space-y-4 rounded-xl border border-neutral-200 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Branch {i + 1}</h3>
                  {settings.locations.length > 1 && (
                    <button onClick={() => removeItem('locations', i)}
                      className="text-xs text-red-600 hover:underline">
                      Remove branch
                    </button>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Branch Name" value={loc.name}
                    onChange={(e) => updateItem('locations', i, 'name', e.target.value)} />
                  <Field label="City" value={loc.city}
                    onChange={(e) => updateItem('locations', i, 'city', e.target.value)} />
                </div>
                <Field label="Address" value={loc.address}
                  onChange={(e) => updateItem('locations', i, 'address', e.target.value)} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Phone" value={loc.phone}
                    onChange={(e) => updateItem('locations', i, 'phone', e.target.value)} />
                  <Field label="Working Hours" value={loc.workingHours}
                    onChange={(e) => updateItem('locations', i, 'workingHours', e.target.value)} />
                </div>
                <Field label="Google Maps Embed URL" value={loc.mapEmbedUrl}
                  hint='In Google Maps: Share → Embed a map → copy ONLY the link inside src="…" of the iframe code.'
                  onChange={(e) => updateItem('locations', i, 'mapEmbedUrl', e.target.value)} />
              </div>
            ))}
            <button onClick={() => addItem('locations', EMPTY_LOCATION)} className="btn-outline">
              + Add Branch
            </button>
          </div>
        )}

        {tab === 'reviews' && (
          <div className="space-y-6">
            {settings.reviews.map((review, i) => (
              <div key={i} className="space-y-4 rounded-xl border border-neutral-200 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Review {i + 1}</h3>
                  <button onClick={() => removeItem('reviews', i)}
                    className="text-xs text-red-600 hover:underline">
                    Remove review
                  </button>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Customer Name" value={review.name}
                    onChange={(e) => updateItem('reviews', i, 'name', e.target.value)} />
                  <Field label="City" value={review.city}
                    onChange={(e) => updateItem('reviews', i, 'city', e.target.value)} />
                  <div>
                    <label className="label">Rating</label>
                    <select className="input" value={review.rating}
                      onChange={(e) => updateItem('reviews', i, 'rating', Number(e.target.value))}>
                      {[5, 4, 3, 2, 1].map((r) => (
                        <option key={r} value={r}>{'★'.repeat(r)} ({r})</option>
                      ))}
                    </select>
                  </div>
                </div>
                <Field label="Review Text" rows={2} value={review.text}
                  onChange={(e) => updateItem('reviews', i, 'text', e.target.value)} />
              </div>
            ))}
            <button onClick={() => addItem('reviews', EMPTY_REVIEW)} className="btn-outline">
              + Add Review
            </button>
          </div>
        )}

        {tab === 'about' && (
          <div className="space-y-4">
            <Field label="About Page Title"
              value={settings.aboutContent.title}
              onChange={(e) => update('aboutContent', 'title', e.target.value)} />
            <Field label="About Text" rows={8}
              value={settings.aboutContent.text}
              onChange={(e) => update('aboutContent', 'text', e.target.value)} />
          </div>
        )}
      </div>

      <button onClick={handleSave} disabled={saving} className="btn-gold w-full sm:w-auto sm:!px-12">
        {saving ? 'Saving…' : '💾 Save All Changes'}
      </button>
    </div>
  );
}
