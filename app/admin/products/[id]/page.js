'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ProductForm from '@/components/admin/ProductForm';
import EmptyState from '@/components/EmptyState';
import { TableSkeleton } from '@/components/Skeletons';
import { getProduct } from '@/lib/db';

export default function EditProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getProduct(id)
      .then(setProduct)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <TableSkeleton rows={5} />;

  if (!product) {
    return (
      <EmptyState
        icon="😕"
        title="Product not found"
        action={<Link href="/admin/products" className="btn-gold">Back to Products</Link>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Edit Product</h1>
      <ProductForm product={product} />
    </div>
  );
}
