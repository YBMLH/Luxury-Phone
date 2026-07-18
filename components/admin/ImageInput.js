'use client';

// Reusable single-image picker: upload a file (compressed + sent to ImgBB
// or Firebase) or paste an image link. Shows a preview with a remove button.
import { useState } from 'react';
import toast from 'react-hot-toast';
import { uploadProductImage } from '@/lib/db';
import { useSettings } from '@/context/SettingsContext';

export default function ImageInput({ value, onChange, label }) {
  const { settings } = useSettings();
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState('');

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const link = await uploadProductImage(file, settings.imgbbApiKey);
      onChange(link);
      toast.success('Image uploaded.');
    } catch (err) {
      toast.error(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  function addUrl() {
    const link = url.trim();
    if (!/^https:\/\/.+\..+/i.test(link)) {
      return toast.error('Paste a valid image link (starts with https://).');
    }
    onChange(link);
    setUrl('');
  }

  return (
    <div>
      {label && <label className="label">{label}</label>}
      {value ? (
        <div className="flex items-center gap-3">
          <img src={value} alt="" className="h-16 w-16 rounded-lg border border-neutral-200 object-cover" />
          <button type="button" onClick={() => onChange('')}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50">
            Remove
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input className="input !py-2" type="url" placeholder="Paste image link…"
              value={url} onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addUrl(); } }} />
            <button type="button" onClick={addUrl} className="btn-dark !px-4 !py-2">Add</button>
          </div>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-300 py-2.5 text-sm text-neutral-600 transition hover:border-gold hover:bg-gold/5">
            {uploading ? 'Uploading…' : '📤 Upload a photo'}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
              onChange={handleFile} disabled={uploading} />
          </label>
        </div>
      )}
    </div>
  );
}
