'use client';

import ProductForm from '@/components/admin/ProductForm';

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Add New Product</h1>
      <ProductForm />
    </div>
  );
}
