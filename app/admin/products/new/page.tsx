'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FiSave, FiX, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { Product, Variant } from '@/lib/types/schema';
import styles from '@/components/admin/products/editor.module.css';

import BaseProductForm from '@/components/admin/products/BaseProductForm';
import VariantGenerator from '@/components/admin/products/VariantGenerator';
import VariantList from '@/components/admin/products/VariantList';
import ProductPreview from '@/components/admin/products/ProductPreview';
import CustomPrintConfig from '@/components/admin/products/CustomPrintConfig';

export default function NewProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Core State
  const [product, setProduct] = useState<Partial<Product>>({
    name: '',
    slug: '',
    categoryId: '',
    brand: '',
    basePrice: 0,
    shortDescription: '',
    description: '',
    features: [],
    specifications: [],
    isCustomizable: false,
    allowImageUpload: false,
    allowTextPrinting: false,
    printingLocations: [],
    maxUploadSizeBytes: 5242880, // 5MB default
    acceptedFileTypes: ['image/png', 'image/jpeg'],
    tags: [],
    seoMeta: { title: '', description: '' },
    featured: false,
    isActive: true,
    trackInventory: true,
  });

  const [variants, setVariants] = useState<Partial<Variant>[]>([]);

  const handleSave = async () => {
    if (!product.name || !product.slug || !product.categoryId) {
      toast.error('Name, Slug, and Category are required.');
      return;
    }

    if (variants.length === 0) {
      toast.error('You must generate at least one variant.');
      return;
    }

    setSaving(true);
    try {
      const batch = writeBatch(db);
      
      // 1. Create Base Product Doc
      const productRef = doc(collection(db, 'products'));
      const productData = {
        ...product,
        id: productRef.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      batch.set(productRef, productData);

      // 2. Create Variant Docs in Subcollection
      variants.forEach(variant => {
        const variantRef = doc(collection(productRef, 'variants'));
        const variantData = {
          ...variant,
          id: variantRef.id,
        };
        batch.set(variantRef, variantData);
      });

      await batch.commit();
      toast.success('Product created successfully!');
      router.push('/admin/products');
      
    } catch (err: any) {
      console.error('Error saving product:', err);
      toast.error(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 0', minHeight: '100vh' }}>
      
      <div className={styles.sectionTitle} style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/admin/products" style={{ color: 'var(--text-muted)' }}>
            <FiArrowLeft size={24} />
          </Link>
          <h2>Create New Product</h2>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="btn btn-primary" 
            onClick={handleSave} 
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <FiSave /> {saving ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </div>

      <div className={styles.editorContainer}>
        {/* Left Column: Editor Forms */}
        <div className={styles.mainForm}>
          
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Basic Information</div>
            <BaseProductForm product={product} setProduct={setProduct} />
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>Custom Printing Options</div>
            <CustomPrintConfig product={product} setProduct={setProduct} />
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>Variants</div>
            <VariantGenerator 
              baseProduct={product}
              variants={variants} 
              setVariants={setVariants} 
            />
          </div>

          {variants.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Variant Configuration</div>
              <VariantList 
                variants={variants} 
                setVariants={setVariants}
                productSlug={product.slug || 'temp-product'} 
              />
            </div>
          )}

        </div>

        {/* Right Column: Live Preview */}
        <div className={styles.previewContainer}>
          <ProductPreview product={product} variants={variants} />
        </div>
      </div>

    </div>
  );
}
