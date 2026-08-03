'use client';

// Site content editor. Everything the customer sees — hero text, contact
// details, social links, store locations, reviews, about text — is edited
// here and saved to the settings/site document in Firestore.
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getSettings, saveSettings, getCategoryImages, setCategoryImage } from '@/lib/db';
import { mergeSettings } from '@/lib/defaults';
import { WILAYAS, CATEGORIES, wilayaLabel } from '@/lib/constants';
import { TableSkeleton } from '@/components/Skeletons';
import { sanitizeText } from '@/lib/utils';
import ImageInput from '@/components/admin/ImageInput';
import { useLanguage } from '@/context/LanguageContext';

const EMPTY_LOCATION = {
  name: '', city: '', address: '', phone: '', workingHours: '', mapEmbedUrl: '',
  photo: '', mapLink: '',
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
  const { t, locale } = useLanguage();
  const [settings, setSettings] = useState(null);
  const [tab, setTab] = useState('hero');
  const [saving, setSaving] = useState(false);

  const TABS = [
    { id: 'hero', label: t('admin.settings.tabs.hero') },
    { id: 'contact', label: t('admin.settings.tabs.contact') },
    { id: 'social', label: t('admin.settings.tabs.social') },
    { id: 'delivery', label: t('admin.settings.tabs.delivery') },
    { id: 'images', label: t('admin.settings.tabs.images') },
    { id: 'locations', label: t('admin.settings.tabs.locations') },
    { id: 'reviews', label: t('admin.settings.tabs.reviews') },
    { id: 'about', label: t('admin.settings.tabs.about') },
  ];
  const f = (key) => t(`admin.settings.fields.${key}`);

  useEffect(() => {
    Promise.all([getSettings(), getCategoryImages().catch(() => ({}))])
      .then(([saved, categoryImages]) => {
        const merged = mergeSettings(saved);
        setSettings({
          ...merged,
          categoryImages: { ...merged.categoryImages, ...categoryImages },
        });
      })
      .catch(() => toast.error(t('admin.settings.loadError')));
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
      // categoryImages now lives in its own Firestore collection (each
      // ImageInput above saves itself immediately) — excluded here so it's
      // never duplicated back into the settings document.
      const { categoryImages, ...toSave } = settings;
      // Light sanitization of every text field before saving. Image
      // sources (data: URLs or https:// links) must never be truncated —
      // cutting a data: URL at 2000 chars corrupts the image entirely, so
      // those are only stripped of unsafe characters, not shortened.
      const clean = JSON.parse(JSON.stringify(toSave), (key, value) => {
        if (typeof value !== 'string') return value;
        if (value.startsWith('data:image') || /^https?:\/\//i.test(value)) {
          return value.replace(/[<>]/g, '');
        }
        return sanitizeText(value, 2000);
      });
      await saveSettings(clean);
      toast.success(t('admin.settings.saveSuccess'));
    } catch {
      toast.error(t('admin.settings.saveError'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold">{t('admin.settings.title')}</h1>
        <button onClick={handleSave} disabled={saving} className="btn-gold !px-8 !py-2.5">
          {saving ? t('admin.settings.saving') : t('admin.settings.saveAll')}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((tabItem) => (
          <button key={tabItem.id} onClick={() => setTab(tabItem.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              tab === tabItem.id
                ? 'bg-marble text-gold-300'
                : 'border border-neutral-300 bg-white text-neutral-600 hover:border-gold'
            }`}>
            {tabItem.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-card">
        {tab === 'hero' && (
          <div className="space-y-4">
            <Field label={f('tagline')}
              value={settings.heroContent.tagline}
              onChange={(e) => update('heroContent', 'tagline', e.target.value)} />
            <Field label={f('mainTitle')}
              value={settings.heroContent.title}
              onChange={(e) => update('heroContent', 'title', e.target.value)} />
            <Field label={f('titleAccent')}
              value={settings.heroContent.titleAccent || ''}
              onChange={(e) => update('heroContent', 'titleAccent', e.target.value)} />
            <Field label={f('subtitle')} rows={3}
              value={settings.heroContent.subtitle}
              onChange={(e) => update('heroContent', 'subtitle', e.target.value)} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={f('primaryButton')}
                value={settings.heroContent.primaryButton}
                onChange={(e) => update('heroContent', 'primaryButton', e.target.value)} />
              <Field label={f('secondaryButton')}
                value={settings.heroContent.secondaryButton}
                onChange={(e) => update('heroContent', 'secondaryButton', e.target.value)} />
            </div>
          </div>
        )}

        {tab === 'contact' && (
          <div className="space-y-4">
            <Field label={f('phoneNumber')} placeholder="05XX XX XX XX"
              value={settings.contactInfo.phone}
              onChange={(e) => update('contactInfo', 'phone', e.target.value)} />
            <Field label={f('whatsappNumber')} placeholder="e.g. 213550123456 (with country code)"
              hint={f('whatsappHint')}
              value={settings.contactInfo.whatsapp}
              onChange={(e) => update('contactInfo', 'whatsapp', e.target.value)} />
            <Field label={f('email')} type="email"
              value={settings.contactInfo.email}
              onChange={(e) => update('contactInfo', 'email', e.target.value)} />
            <Field label={f('workingHours')} placeholder="Every day: 9:00 — 20:00"
              value={settings.contactInfo.workingHours}
              onChange={(e) => update('contactInfo', 'workingHours', e.target.value)} />
          </div>
        )}

        {tab === 'social' && (
          <div className="space-y-4">
            <Field label={f('facebookUrl')} placeholder="https://facebook.com/…"
              value={settings.socialLinks.facebook}
              onChange={(e) => update('socialLinks', 'facebook', e.target.value)} />
            <Field label={f('instagramUrl')} placeholder="https://instagram.com/…"
              value={settings.socialLinks.instagram}
              onChange={(e) => update('socialLinks', 'instagram', e.target.value)} />
            <Field label={f('tiktokUrl')} placeholder="https://tiktok.com/@…"
              value={settings.socialLinks.tiktok}
              onChange={(e) => update('socialLinks', 'tiktok', e.target.value)} />
          </div>
        )}

        {tab === 'delivery' && (
          <div className="space-y-5">
            <div className="max-w-xs">
              <Field label={f('defaultDeliveryFee')} type="number" min="0"
                hint={f('defaultDeliveryFeeHint')}
                value={settings.delivery.defaultFee}
                onChange={(e) =>
                  update('delivery', 'defaultFee', Number(e.target.value) || 0)
                } />
            </div>
            <div>
              <p className="label">{f('perWilayaPrices')}</p>
              <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                {WILAYAS.map((wilaya, i) => (
                  <div key={wilaya} className="flex items-center gap-3">
                    <span className="w-40 shrink-0 truncate text-sm text-neutral-600">
                      {String(i + 1).padStart(2, '0')} — {wilayaLabel(wilaya, locale)}
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
                {f('imageStorageTitle')}
              </h3>
              <p className="mb-3 text-sm text-neutral-500">
                {f('imageStorageSubtitle')}
              </p>
              <div className="space-y-2">
                {[
                  ['database', f('imageHostDatabase'), f('imageHostDatabaseDesc')],
                  ['cloudinary', f('imageHostCloudinary'), f('imageHostCloudinaryDesc')],
                  ['imgbb', f('imageHostImgbb'), f('imageHostImgbbDesc')],
                ].map(([value, title, desc]) => (
                  <label key={value}
                    className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition ${
                      (settings.imageHost || 'database') === value
                        ? 'border-gold bg-gold/5'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}>
                    <input type="radio" name="imageHost" value={value}
                      checked={(settings.imageHost || 'database') === value}
                      onChange={() => setSettings({ ...settings, imageHost: value })}
                      className="mt-1 h-4 w-4 accent-gold" />
                    <span>
                      <span className="block text-sm font-semibold">{title}</span>
                      <span className="block text-xs text-neutral-500">{desc}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className={(settings.imageHost || 'database') === 'database' ? 'opacity-50' : ''}>
              <h3 className="mb-1 font-display text-base font-semibold">
                {f('cloudinaryUploadsTitle')}
              </h3>
              <p className="mb-3 text-sm text-neutral-500">
                {f('cloudinaryUploadsDesc')} {' '}
                <a href="https://cloudinary.com/users/register_free" target="_blank" rel="noopener noreferrer"
                  className="text-gold-700 underline">cloudinary.com</a>
              </p>
              <div className="grid max-w-lg gap-4 sm:grid-cols-2">
                <Field label={f('cloudName')} placeholder="e.g. dxy123abc"
                  value={settings.cloudinary?.cloudName || ''}
                  onChange={(e) => update('cloudinary', 'cloudName', e.target.value.trim())} />
                <Field label={f('uploadPreset')} placeholder="e.g. luxury_phone"
                  value={settings.cloudinary?.uploadPreset || ''}
                  onChange={(e) => update('cloudinary', 'uploadPreset', e.target.value.trim())} />
              </div>
              <p className="mt-2 text-xs text-neutral-400">
                {settings.cloudinary?.cloudName && settings.cloudinary?.uploadPreset
                  ? f('cloudinaryReady')
                  : f('cloudinaryNotReady')}
              </p>

              <details className="mt-3 text-xs text-neutral-500">
                <summary className="cursor-pointer font-medium text-neutral-600">
                  {f('preferImgbb')}
                </summary>
                <div className="mt-2 max-w-md">
                  <Field label={f('imgbbKey')}
                    placeholder="Paste your ImgBB key"
                    value={settings.imgbbApiKey || ''}
                    onChange={(e) => setSettings({ ...settings, imgbbApiKey: e.target.value })} />
                </div>
              </details>
            </div>

            <div>
              <h3 className="mb-1 font-display text-base font-semibold">
                {f('categoryBackgroundsTitle')}
              </h3>
              <p className="mb-4 text-sm text-neutral-500">
                {f('categoryBackgroundsDesc')}
              </p>
              <div className="grid gap-5 sm:grid-cols-2">
                {CATEGORIES.map((cat) => (
                  <div key={cat.id} className="rounded-xl border border-neutral-200 p-4">
                    <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
                      <span>{cat.icon}</span> {t(`categories.${cat.id}.label`)}
                    </p>
                    <ImageInput
                      value={settings.categoryImages?.[cat.id] || ''}
                      onChange={async (url) => {
                        // Saved immediately to its own document — not part
                        // of the big "Save" button below, and never at
                        // risk of the shared settings document's 1 MiB cap.
                        setSettings({
                          ...settings,
                          categoryImages: { ...settings.categoryImages, [cat.id]: url },
                        });
                        try {
                          await setCategoryImage(cat.id, url);
                        } catch {
                          toast.error(t('admin.settings.saveError'));
                        }
                      }}
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
                  <h3 className="font-semibold">{f('branch')} {i + 1}</h3>
                  {settings.locations.length > 1 && (
                    <button onClick={() => removeItem('locations', i)}
                      className="text-xs text-red-600 hover:underline">
                      {f('removeBranch')}
                    </button>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={f('branchName')} value={loc.name}
                    onChange={(e) => updateItem('locations', i, 'name', e.target.value)} />
                  <Field label={f('city')} value={loc.city}
                    onChange={(e) => updateItem('locations', i, 'city', e.target.value)} />
                </div>
                <Field label={f('address')} value={loc.address}
                  onChange={(e) => updateItem('locations', i, 'address', e.target.value)} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={f('phone')} value={loc.phone}
                    onChange={(e) => updateItem('locations', i, 'phone', e.target.value)} />
                  <Field label={f('workingHours')} value={loc.workingHours}
                    onChange={(e) => updateItem('locations', i, 'workingHours', e.target.value)} />
                </div>
                <Field label={f('mapEmbedUrl')} value={loc.mapEmbedUrl}
                  hint={f('mapEmbedHint')}
                  onChange={(e) => updateItem('locations', i, 'mapEmbedUrl', e.target.value)} />
                <Field label={f('mapLink')} value={loc.mapLink}
                  hint={f('mapLinkHint')}
                  onChange={(e) => updateItem('locations', i, 'mapLink', e.target.value)} />
                <div>
                  <ImageInput
                    label={f('branchPhoto')}
                    value={loc.photo}
                    onChange={(url) => updateItem('locations', i, 'photo', url)}
                  />
                  <p className="mt-1 text-xs text-neutral-400">{f('branchPhotoHint')}</p>
                </div>
              </div>
            ))}
            <button onClick={() => addItem('locations', EMPTY_LOCATION)} className="btn-outline">
              {f('addBranch')}
            </button>
          </div>
        )}

        {tab === 'reviews' && (
          <div className="space-y-6">
            {settings.reviews.map((review, i) => (
              <div key={i} className="space-y-4 rounded-xl border border-neutral-200 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{f('review')} {i + 1}</h3>
                  <button onClick={() => removeItem('reviews', i)}
                    className="text-xs text-red-600 hover:underline">
                    {f('removeReview')}
                  </button>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label={f('customerName')} value={review.name}
                    onChange={(e) => updateItem('reviews', i, 'name', e.target.value)} />
                  <Field label={f('city')} value={review.city}
                    onChange={(e) => updateItem('reviews', i, 'city', e.target.value)} />
                  <div>
                    <label className="label">{f('rating')}</label>
                    <select className="input" value={review.rating}
                      onChange={(e) => updateItem('reviews', i, 'rating', Number(e.target.value))}>
                      {[5, 4, 3, 2, 1].map((r) => (
                        <option key={r} value={r}>{'★'.repeat(r)} ({r})</option>
                      ))}
                    </select>
                  </div>
                </div>
                <Field label={f('reviewText')} rows={2} value={review.text}
                  onChange={(e) => updateItem('reviews', i, 'text', e.target.value)} />
              </div>
            ))}
            <button onClick={() => addItem('reviews', EMPTY_REVIEW)} className="btn-outline">
              {f('addReview')}
            </button>
          </div>
        )}

        {tab === 'about' && (
          <div className="space-y-4">
            <Field label={f('aboutTitle')}
              value={settings.aboutContent.title}
              onChange={(e) => update('aboutContent', 'title', e.target.value)} />
            <Field label={f('aboutText')} rows={6}
              value={settings.aboutContent.text}
              onChange={(e) => update('aboutContent', 'text', e.target.value)} />
            <Field label={f('aboutFounded')} hint={f('aboutFoundedHint')}
              value={settings.aboutContent.founded}
              onChange={(e) => update('aboutContent', 'founded', e.target.value)} />
            <Field label={f('aboutStory')} rows={8} hint={f('aboutStoryHint')}
              value={settings.aboutContent.story}
              onChange={(e) => update('aboutContent', 'story', e.target.value)} />
          </div>
        )}
      </div>

      <button onClick={handleSave} disabled={saving} className="btn-gold w-full sm:w-auto sm:!px-12">
        {saving ? t('admin.settings.saving') : t('admin.settings.saveAll')}
      </button>
    </div>
  );
}
