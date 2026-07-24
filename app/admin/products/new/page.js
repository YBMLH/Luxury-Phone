'use client';

import ProductForm from '@/components/admin/ProductForm';
import { useLanguage } from '@/context/LanguageContext';

export default function NewProductPage() {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">{t('admin.products.addNewTitle')}</h1>
      <ProductForm />
    </div>
  );
}
