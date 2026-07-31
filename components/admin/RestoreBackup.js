'use client';

// Reads a backup file produced by the "Backup" button and writes it back into
// Firestore.
//
// Deliberately additive: documents in the file overwrite the ones with the
// same id and everything else is left alone, so a restore can never delete
// data that isn't in the file. Orders are excluded entirely — re-writing old
// orders would resurrect ones you deliberately removed and scramble your
// figures, and the backup file is still there to read by hand if you need a
// deleted order back.
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { restoreBackup } from '@/lib/db';
import { useLanguage } from '@/context/LanguageContext';
import { IconUpload } from './Icons';

export default function RestoreBackup({ onRestored }) {
  const { t } = useLanguage();
  const inputRef = useRef(null);
  const [backup, setBackup] = useState(null);
  const [fileName, setFileName] = useState('');
  const [choices, setChoices] = useState({ products: true, settings: true, customers: false });
  const [confirmText, setConfirmText] = useState('');
  const [working, setWorking] = useState(false);

  const CONFIRM_WORD = 'RESTORE';

  async function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (!parsed || typeof parsed !== 'object') throw new Error('shape');
      setBackup(parsed);
      setFileName(file.name);
      setConfirmText('');
    } catch {
      setBackup(null);
      setFileName('');
      toast.error(t('admin.restore.badFile'));
    } finally {
      // Allows picking the same file again after a failed read.
      event.target.value = '';
    }
  }

  async function run() {
    setWorking(true);
    try {
      const written = await restoreBackup(backup, choices);
      toast.success(
        t('admin.restore.done', {
          products: written.products,
          customers: written.customers,
        })
      );
      setBackup(null);
      setFileName('');
      setConfirmText('');
      onRestored?.();
    } catch {
      toast.error(t('admin.restore.failed'));
    } finally {
      setWorking(false);
    }
  }

  const counts = {
    products: Array.isArray(backup?.products) ? backup.products.length : 0,
    customers: Array.isArray(backup?.customers) ? backup.customers.length : 0,
    settings: backup?.settings ? 1 : 0,
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        onChange={handleFile}
        className="hidden"
      />

      {!backup ? (
        <div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100"
          >
            <IconUpload className="h-4 w-4" />
            {t('admin.restore.choose')}
          </button>
          <p className="mt-2 text-xs text-neutral-500">{t('admin.restore.help')}</p>
        </div>
      ) : (
        <div className="space-y-3 rounded-xl border border-amber-300 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">
            {t('admin.restore.loaded', { file: fileName })}
          </p>
          {backup.exportedAt && (
            <p className="text-xs text-amber-800">
              {t('admin.restore.takenOn', {
                date: new Date(backup.exportedAt).toLocaleString(),
              })}
            </p>
          )}

          <div className="space-y-1.5">
            {['products', 'settings', 'customers'].map((key) => (
              <label
                key={key}
                className={`flex items-center gap-2 text-sm ${
                  counts[key] ? 'text-amber-900' : 'text-amber-900/40'
                }`}
              >
                <input
                  type="checkbox"
                  disabled={!counts[key]}
                  checked={choices[key] && !!counts[key]}
                  onChange={(e) => setChoices({ ...choices, [key]: e.target.checked })}
                  className="h-4 w-4 accent-amber-600"
                />
                {t(`admin.restore.item_${key}`, { count: counts[key] })}
              </label>
            ))}
          </div>

          <p className="text-xs text-amber-800">{t('admin.restore.warning')}</p>

          <div className="flex flex-wrap items-center gap-2">
            <input
              className="input !w-40 !py-1.5 !text-sm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={CONFIRM_WORD}
              aria-label={t('admin.restore.typeToConfirm', { word: CONFIRM_WORD })}
            />
            <button
              type="button"
              onClick={run}
              disabled={confirmText.trim().toUpperCase() !== CONFIRM_WORD || working}
              className="rounded-lg bg-amber-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-40"
            >
              {working ? t('admin.restore.working') : t('admin.restore.run')}
            </button>
            <button
              type="button"
              onClick={() => {
                setBackup(null);
                setFileName('');
              }}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-amber-900 hover:underline"
            >
              {t('common.cancel')}
            </button>
          </div>
          <p className="text-xs text-amber-800">
            {t('admin.restore.typeToConfirm', { word: CONFIRM_WORD })}
          </p>
        </div>
      )}
    </div>
  );
}
