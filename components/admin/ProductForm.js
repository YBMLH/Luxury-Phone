'use client';

// The form used both to add and to edit a product.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { addProduct, updateProduct, uploadProductImage } from '@/lib/db';
import { CATEGORIES } from '@/lib/constants';
import { sanitizeText } from '@/lib/utils';
import { useSettings } from '@/context/SettingsContext';
import { useLanguage } from '@/context/LanguageContext';

const EMPTY = {
  name: '',
  brand: '',
  category: 'smartphones',
  description: '',
  price: '',
  costPrice: '',
  oldPrice: '',
  stock: '',
  branchStock: {},
  featured: false,
  bestseller: false,
  newArrival: false,
};

// Editable list of free-text values (colors, storage options, RAM options).
function TagListInput({ label, placeholder, values, onChange, addLabel }) {
  const [draft, setDraft] = useState('');

  function add() {
    const value = draft.trim();
    if (!value) return;
    if (!values.includes(value)) onChange([...values, value]);
    setDraft('');
  }

  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex gap-2">
        <input
          className="input"
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
        />
        <button type="button" onClick={add} className="btn-dark !px-4 !py-2">
          {addLabel}
        </button>
      </div>
      {values.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {values.map((value) => (
            <span
              key={value}
              className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-sm"
            >
              {value}
              <button
                type="button"
                onClick={() => onChange(values.filter((v) => v !== value))}
                className="text-neutral-400 hover:text-red-600"
                aria-label={`Remove ${value}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductForm({ product = null }) {
  const router = useRouter();
  const { settings } = useSettings();
  const branches = (settings.locations || [])
    .map((location) => location.name)
    .filter(Boolean);
  const { t } = useLanguage();
  const editing = Boolean(product);

  const [form, setForm] = useState(
    editing
      ? {
          name: product.name || '',
          brand: product.brand || '',
          category: product.category || 'smartphones',
          description: product.description || '',
          price: product.price ?? '',
          costPrice: product.costPrice ?? '',
          oldPrice: product.oldPrice ?? '',
          stock: product.stock ?? '',
          branchStock: product.branchStock || {},
          featured: Boolean(product.featured),
          bestseller: Boolean(product.bestseller),
          newArrival: Boolean(product.newArrival),
        }
      : EMPTY
  );
  const [colors, setColors] = useState(product?.colors || []);
  const [storageOptions, setStorageOptions] = useState(product?.storageOptions || []);
  const [ramOptions, setRamOptions] = useState(product?.ramOptions || []);
  const [specs, setSpecs] = useState(product?.specifications || []);
  const [images, setImages] = useState(product?.images || []);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) =>
    setForm({
      ...form,
      [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    });

  async function handleUpload(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    for (const file of files) {
      try {
        const url = await uploadProductImage(file, settings);
        setImages((prev) => [...prev, url]);
      } catch (err) {
        toast.error(`${file.name}: ${err.message}`);
      }
    }
    setUploading(false);
    e.target.value = '';
  }

  function addImageUrl() {
    const url = imageUrl.trim();
    if (!/^https:\/\/.+\..+/i.test(url)) {
      return toast.error(t('admin.productForm.errors.imageUrl'));
    }
    if (!images.includes(url)) setImages([...images, url]);
    setImageUrl('');
  }

  function makeMain(index) {
    // The first image is always the main product image.
    setImages((prev) => [prev[index], ...prev.filter((_, i) => i !== index)]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return toast.error(t('admin.productForm.errors.name'));
    if (!form.brand.trim()) return toast.error(t('admin.productForm.errors.brand'));
    const price = Number(form.price);
    if (!price || price <= 0) return toast.error(t('admin.productForm.errors.price'));
    if (form.oldPrice && Number(form.oldPrice) <= price) {
      return toast.error(t('admin.productForm.errors.oldPrice'));
    }
    if (images.length === 0) return toast.error(t('admin.productForm.errors.images'));

    const data = {
      name: sanitizeText(form.name, 150),
      brand: sanitizeText(form.brand, 50),
      category: form.category,
      description: sanitizeText(form.description, 3000),
      price,
      oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
      stock: Number(form.stock) || 0,
      costPrice: Number(form.costPrice) || 0,
      branchStock: form.branchStock || {},
      featured: form.featured,
      bestseller: form.bestseller,
      newArrival: form.newArrival,
      colors,
      storageOptions,
      ramOptions,
      specifications: specs.filter((s) => s.key.trim() && s.value.trim()),
      images,
    };

    setSaving(true);
    try {
      if (editing) {
        await updateProduct(product.id, data);
        toast.success(t('admin.productForm.updateSuccess'));
      } else {
        await addProduct(data);
        toast.success(t('admin.productForm.addSuccess'));
      }
      router.push('/admin/products');
    } catch (err) {
      console.error(err);
      toast.error(t('admin.productForm.errors.saveFailed'));
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      {/* Basic info */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-card">
        <h2 className="mb-4 font-display text-lg font-semibold">{t('admin.productForm.basicInfo')}</h2>
        <div className="space-y-4">
          <div>
            <label className="label">{t('admin.productForm.productName')} *</label>
            <input className="input" value={form.name} onChange={set('name')}
              placeholder={t('admin.productForm.productNamePlaceholder')} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">{t('admin.productForm.brand')} *</label>
              <input className="input" value={form.brand} onChange={set('brand')}
                placeholder={t('admin.productForm.brandPlaceholder')} />
            </div>
            <div>
              <label className="label">{t('admin.productForm.category')} *</label>
              <select className="input" value={form.category} onChange={set('category')}>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{t(`categories.${c.id}.label`)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label">{t('admin.productForm.price')} *</label>
              <input className="input" type="number" min="0" value={form.price}
                onChange={set('price')} placeholder="150000" />
            </div>
            <div>
              <label className="label">{t('admin.productForm.oldPrice')}</label>
              <input className="input" type="number" min="0" value={form.oldPrice}
                onChange={set('oldPrice')} placeholder={t('admin.productForm.oldPriceHint')} />
            </div>
            <div>
              <label className="label">{t('admin.productForm.stock')} *</label>
              <input className="input" type="number" min="0" value={form.stock}
                onChange={set('stock')} placeholder="10" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label">{t('admin.productForm.costPrice')}</label>
              <input className="input" type="number" min="0" value={form.costPrice}
                onChange={set('costPrice')} placeholder={t('admin.productForm.costPriceHint')} />
              <p className="mt-1 text-xs text-neutral-500">
                {t('admin.productForm.costPriceHelp')}
              </p>
            </div>
            {/* Where the units physically are. The number above stays the one
                that sells; this is the shelf breakdown so you know which shop
                to send someone to. */}
            <div className="sm:col-span-2">
              <label className="label">{t('admin.productForm.branchStock')}</label>
              <div className="grid gap-2 sm:grid-cols-2">
                {branches.map((branch) => (
                  <div key={branch} className="flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate text-sm text-neutral-600">{branch}</span>
                    <input
                      className="input !w-24 !px-2 !py-1.5"
                      type="number"
                      min="0"
                      value={form.branchStock?.[branch] ?? ''}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          branchStock: { ...prev.branchStock, [branch]: Number(e.target.value) || 0 },
                        }))
                      }
                      aria-label={branch}
                    />
                  </div>
                ))}
              </div>
              <p className="mt-1 text-xs text-neutral-500">
                {t('admin.productForm.branchStockHelp')}
              </p>
            </div>
          </div>
          <div>
            <label className="label">{t('admin.productForm.description')}</label>
            <textarea className="input" rows={5} value={form.description}
              onChange={set('description')} placeholder={t('admin.productForm.descriptionPlaceholder')} />
          </div>
          <div className="flex flex-wrap gap-6 pt-2">
            {[
              ['featured', t('admin.productForm.featured')],
              ['bestseller', t('admin.productForm.bestseller')],
              ['newArrival', t('admin.productForm.newArrival')],
            ].map(([field, label]) => (
              <label key={field} className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" checked={form[field]} onChange={set(field)}
                  className="h-4 w-4 accent-gold" />
                {label}
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* Images */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-card">
        <h2 className="mb-1 font-display text-lg font-semibold">{t('admin.productForm.productImages')} *</h2>
        <p className="mb-4 text-xs text-neutral-500">
          {t('admin.productForm.imagesHint')}
          {settings.imageHost === 'cloudinary' &&
            !settings.cloudinary?.cloudName && (
              <span className="mt-1 block text-amber-600">
                {t('admin.productForm.cloudinaryNotSetUp')}
              </span>
            )}
          {settings.imageHost === 'imgbb' && !settings.imgbbApiKey && (
            <span className="mt-1 block text-amber-600">
              {t('admin.productForm.imgbbNotSetUp')}
            </span>
          )}
        </p>

        {/* Option 1: paste an image link (works with any free image host) */}
        <div className="mb-4 flex gap-2">
          <input
            className="input"
            type="url"
            placeholder={t('admin.productForm.pasteImageLink')}
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addImageUrl();
              }
            }}
          />
          <button type="button" onClick={addImageUrl} className="btn-dark !px-5 !py-2">
            {t('admin.productForm.add')}
          </button>
        </div>

        {/* Option 2: direct file upload */}
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 py-8 text-center transition hover:border-gold hover:bg-gold/5">
          <span className="text-3xl">🖼️</span>
          <span className="mt-2 text-sm font-medium text-neutral-600">
            {uploading ? t('admin.productForm.uploading') : t('admin.productForm.orClickToUpload')}
          </span>
          <span className="mt-1 text-xs text-neutral-400">
            {t('admin.productForm.fileHint')}
          </span>
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple
            className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
        {images.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {images.map((url, i) => (
              <div key={url} className="group relative">
                <img src={url} alt="" className={`aspect-square w-full rounded-lg border-2 object-cover ${
                  i === 0 ? 'border-gold' : 'border-neutral-200'
                }`} />
                {i === 0 && (
                  <span className="absolute left-1 top-1 rounded bg-gold px-1.5 py-0.5 text-[10px] font-bold text-black">
                    {t('admin.productForm.main')}
                  </span>
                )}
                <div className="absolute inset-0 hidden items-center justify-center gap-1 rounded-lg bg-black/60 group-hover:flex">
                  {i !== 0 && (
                    <button type="button" onClick={() => makeMain(i)}
                      className="rounded bg-gold px-2 py-1 text-[10px] font-bold text-black">
                      {t('admin.productForm.setMain')}
                    </button>
                  )}
                  <button type="button"
                    onClick={() => setImages(images.filter((_, x) => x !== i))}
                    className="rounded bg-red-600 px-2 py-1 text-[10px] font-bold text-white">
                    {t('admin.productForm.delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Variants */}
      <section className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-card">
        <h2 className="font-display text-lg font-semibold">{t('admin.productForm.variants')}</h2>
        <TagListInput label={t('admin.productForm.availableColors')} placeholder={t('admin.productForm.colorPlaceholder')}
          values={colors} onChange={setColors} addLabel={t('admin.productForm.add')} />
        <TagListInput label={t('admin.productForm.storageOptions')} placeholder={t('admin.productForm.storagePlaceholder')}
          values={storageOptions} onChange={setStorageOptions} addLabel={t('admin.productForm.add')} />
        <TagListInput label={t('admin.productForm.ramOptions')} placeholder={t('admin.productForm.ramPlaceholder')}
          values={ramOptions} onChange={setRamOptions} addLabel={t('admin.productForm.add')} />
      </section>

      {/* Specifications */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">{t('admin.productForm.specifications')}</h2>
          <button type="button" onClick={() => setSpecs([...specs, { key: '', value: '' }])}
            className="btn-outline !px-4 !py-1.5 !text-xs">
            {t('admin.productForm.addRow')}
          </button>
        </div>
        {specs.length === 0 && (
          <p className="text-sm text-neutral-500">
            {t('admin.productForm.specsHint')}
          </p>
        )}
        <div className="space-y-3">
          {specs.map((spec, i) => (
            <div key={i} className="flex gap-2">
              <input className="input !w-1/3" placeholder={t('admin.productForm.specKeyPlaceholder')}
                value={spec.key}
                onChange={(e) => {
                  const next = [...specs];
                  next[i] = { ...next[i], key: e.target.value };
                  setSpecs(next);
                }} />
              <input className="input flex-1" placeholder={t('admin.productForm.specValuePlaceholder')}
                value={spec.value}
                onChange={(e) => {
                  const next = [...specs];
                  next[i] = { ...next[i], value: e.target.value };
                  setSpecs(next);
                }} />
              <button type="button" onClick={() => setSpecs(specs.filter((_, x) => x !== i))}
                className="rounded-lg px-3 text-red-500 hover:bg-red-50" aria-label="Remove row">
                ✕
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="flex gap-3">
        <button type="submit" disabled={saving || uploading} className="btn-gold flex-1 sm:flex-none sm:!px-12">
          {saving ? t('admin.productForm.saving') : editing ? t('admin.productForm.saveChanges') : t('admin.productForm.addProduct')}
        </button>
        <button type="button" onClick={() => router.push('/admin/products')}
          className="btn-outline">
          {t('admin.productForm.cancel')}
        </button>
      </div>
    </form>
  );
}
