'use client';

// The form used both to add and to edit a product.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { addProduct, updateProduct, uploadProductImage } from '@/lib/db';
import { CATEGORIES } from '@/lib/constants';
import { sanitizeText } from '@/lib/utils';
import { useSettings } from '@/context/SettingsContext';

const EMPTY = {
  name: '',
  brand: '',
  category: 'smartphones',
  description: '',
  price: '',
  oldPrice: '',
  stock: '',
  featured: false,
  bestseller: false,
  newArrival: false,
};

// Editable list of free-text values (colors, storage options, RAM options).
function TagListInput({ label, placeholder, values, onChange }) {
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
          Add
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
  const editing = Boolean(product);

  const [form, setForm] = useState(
    editing
      ? {
          name: product.name || '',
          brand: product.brand || '',
          category: product.category || 'smartphones',
          description: product.description || '',
          price: product.price ?? '',
          oldPrice: product.oldPrice ?? '',
          stock: product.stock ?? '',
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
      return toast.error('Please paste a valid image link (it starts with https://).');
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
    if (!form.name.trim()) return toast.error('Product name is required.');
    if (!form.brand.trim()) return toast.error('Brand is required.');
    const price = Number(form.price);
    if (!price || price <= 0) return toast.error('Please enter a valid price.');
    if (form.oldPrice && Number(form.oldPrice) <= price) {
      return toast.error('Old price must be higher than the current price.');
    }
    if (images.length === 0) return toast.error('Please upload at least one image.');

    const data = {
      name: sanitizeText(form.name, 150),
      brand: sanitizeText(form.brand, 50),
      category: form.category,
      description: sanitizeText(form.description, 3000),
      price,
      oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
      stock: Number(form.stock) || 0,
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
        toast.success('Product updated!');
      } else {
        await addProduct(data);
        toast.success('Product added!');
      }
      router.push('/admin/products');
    } catch (err) {
      console.error(err);
      toast.error('Could not save the product. Please try again.');
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      {/* Basic info */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-card">
        <h2 className="mb-4 font-display text-lg font-semibold">Basic Information</h2>
        <div className="space-y-4">
          <div>
            <label className="label">Product Name *</label>
            <input className="input" value={form.name} onChange={set('name')}
              placeholder="e.g. iPhone 16 Pro Max" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Brand *</label>
              <input className="input" value={form.brand} onChange={set('brand')}
                placeholder="e.g. Apple" />
            </div>
            <div>
              <label className="label">Category *</label>
              <select className="input" value={form.category} onChange={set('category')}>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Price (DA) *</label>
              <input className="input" type="number" min="0" value={form.price}
                onChange={set('price')} placeholder="150000" />
            </div>
            <div>
              <label className="label">Old Price (optional)</label>
              <input className="input" type="number" min="0" value={form.oldPrice}
                onChange={set('oldPrice')} placeholder="Shows a discount badge" />
            </div>
            <div>
              <label className="label">Stock Quantity *</label>
              <input className="input" type="number" min="0" value={form.stock}
                onChange={set('stock')} placeholder="10" />
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={5} value={form.description}
              onChange={set('description')} placeholder="Describe the product…" />
          </div>
          <div className="flex flex-wrap gap-6 pt-2">
            {[
              ['featured', '⭐ Featured'],
              ['bestseller', '🏆 Best Seller'],
              ['newArrival', '🆕 New Arrival'],
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
        <h2 className="mb-1 font-display text-lg font-semibold">Product Images *</h2>
        <p className="mb-4 text-xs text-neutral-500">
          Upload photos (they’re shrunk automatically for fast loading) or paste
          image links. The first image is the main image.
          {settings.imageHost === 'cloudinary' &&
            !settings.cloudinary?.cloudName && (
              <span className="mt-1 block text-amber-600">
                Cloudinary isn’t set up yet — fill it in under “Images &amp; Categories”,
                or switch storage to “In my database”.
              </span>
            )}
          {settings.imageHost === 'imgbb' && !settings.imgbbApiKey && (
            <span className="mt-1 block text-amber-600">
              No ImgBB key yet — add it under “Images &amp; Categories”, or switch
              storage to “In my database”.
            </span>
          )}
        </p>

        {/* Option 1: paste an image link (works with any free image host) */}
        <div className="mb-4 flex gap-2">
          <input
            className="input"
            type="url"
            placeholder="https://i.ibb.co/…  (paste image link, then click Add)"
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
            Add
          </button>
        </div>

        {/* Option 2: direct file upload (ImgBB key or Firebase Storage) */}
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 py-8 text-center transition hover:border-gold hover:bg-gold/5">
          <span className="text-3xl">🖼️</span>
          <span className="mt-2 text-sm font-medium text-neutral-600">
            {uploading ? 'Uploading…' : 'Or click to upload images'}
          </span>
          <span className="mt-1 text-xs text-neutral-400">
            JPG, PNG or WebP — max 5 MB each
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
                    MAIN
                  </span>
                )}
                <div className="absolute inset-0 hidden items-center justify-center gap-1 rounded-lg bg-black/60 group-hover:flex">
                  {i !== 0 && (
                    <button type="button" onClick={() => makeMain(i)}
                      className="rounded bg-gold px-2 py-1 text-[10px] font-bold text-black">
                      Main
                    </button>
                  )}
                  <button type="button"
                    onClick={() => setImages(images.filter((_, x) => x !== i))}
                    className="rounded bg-red-600 px-2 py-1 text-[10px] font-bold text-white">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Variants */}
      <section className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-card">
        <h2 className="font-display text-lg font-semibold">Variants (optional)</h2>
        <TagListInput label="Available Colors" placeholder="e.g. Titanium Black"
          values={colors} onChange={setColors} />
        <TagListInput label="Storage Options" placeholder="e.g. 256 GB"
          values={storageOptions} onChange={setStorageOptions} />
        <TagListInput label="RAM Options" placeholder="e.g. 12 GB"
          values={ramOptions} onChange={setRamOptions} />
      </section>

      {/* Specifications */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Specifications</h2>
          <button type="button" onClick={() => setSpecs([...specs, { key: '', value: '' }])}
            className="btn-outline !px-4 !py-1.5 !text-xs">
            + Add Row
          </button>
        </div>
        {specs.length === 0 && (
          <p className="text-sm text-neutral-500">
            Add rows like “Screen — 6.7&quot; OLED 120Hz”, “Battery — 5000 mAh”…
          </p>
        )}
        <div className="space-y-3">
          {specs.map((spec, i) => (
            <div key={i} className="flex gap-2">
              <input className="input !w-1/3" placeholder="Name (e.g. Screen)"
                value={spec.key}
                onChange={(e) => {
                  const next = [...specs];
                  next[i] = { ...next[i], key: e.target.value };
                  setSpecs(next);
                }} />
              <input className="input flex-1" placeholder="Value (e.g. 6.7″ OLED)"
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
          {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Product'}
        </button>
        <button type="button" onClick={() => router.push('/admin/products')}
          className="btn-outline">
          Cancel
        </button>
      </div>
    </form>
  );
}
