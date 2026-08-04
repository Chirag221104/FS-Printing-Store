'use client';

import React from 'react';
import { Product } from '@/lib/types/schema';
import styles from './editor.module.css';
import { FiPlus, FiTrash2, FiImage } from 'react-icons/fi';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-hot-toast';

interface Props {
  product: Partial<Product>;
  setProduct: React.Dispatch<React.SetStateAction<Partial<Product>>>;
}

export default function BaseProductForm({ product, setProduct }: Props) {
  const [uploading, setUploading] = React.useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    // Auto generate slug
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setProduct(prev => ({ ...prev, name, slug }));
  };

  const handleArrayChange = (field: 'features' | 'tags', index: number, value: string) => {
    const newArr = [...(product[field] || [])];
    newArr[index] = value;
    setProduct(prev => ({ ...prev, [field]: newArr }));
  };

  const addArrayItem = (field: 'features' | 'tags') => {
    setProduct(prev => ({ ...prev, [field]: [...(prev[field] || []), ''] }));
  };

  const removeArrayItem = (field: 'features' | 'tags', index: number) => {
    const newArr = [...(product[field] || [])];
    newArr.splice(index, 1);
    setProduct(prev => ({ ...prev, [field]: newArr }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const toastId = toast.loading('Uploading image...');
    try {
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      setProduct(prev => ({ 
        ...prev, 
        images: [...(prev.images || []), url] 
      }));
      toast.success('Image uploaded!', { id: toastId });
    } catch (error) {
      console.error('Upload failed', error);
      toast.error('Upload failed', { id: toastId });
    }
    setUploading(false);
  };

  const removeImage = (index: number) => {
    const newImages = [...(product.images || [])];
    newImages.splice(index, 1);
    setProduct(prev => ({ ...prev, images: newImages }));
  };

  return (
    <div className={styles.formGrid}>
      <div className={styles.formGroup}>
        <label>Product Name *</label>
        <input 
          type="text" 
          name="name" 
          value={product.name || ''} 
          onChange={handleNameChange} 
          placeholder="e.g., Premium Cotton T-Shirt"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label>URL Slug *</label>
        <input 
          type="text" 
          name="slug" 
          value={product.slug || ''} 
          onChange={handleChange} 
          placeholder="e.g., premium-cotton-tshirt"
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label>Category *</label>
        <select 
          name="categoryId" 
          value={product.categoryId || ''} 
          onChange={handleChange}
          required
        >
          <option value="">Select a category</option>
          <option value="apparel">Apparel & T-Shirts</option>
          <option value="accessories">Accessories (Mugs, Keychains)</option>
          <option value="stationery">Stationery & Prints</option>
          <option value="stickers">Stickers</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label>Base Price (₹) *</label>
        <input 
          type="number" 
          name="basePrice" 
          value={product.basePrice || 0} 
          onChange={(e) => setProduct(prev => ({ ...prev, basePrice: Number(e.target.value) }))} 
          placeholder="e.g., 499"
          required
          min="0"
        />
      </div>

      <div className={styles.formGroup}>
        <label>Brand</label>
        <input 
          type="text" 
          name="brand" 
          value={product.brand || ''} 
          onChange={handleChange} 
          placeholder="e.g., F.S Print Works"
        />
      </div>

      <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
        <label>Product Images</label>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
          {(product.images || []).map((img, i) => (
            <div key={i} style={{ position: 'relative', width: '80px', height: '80px', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
              <img src={img} alt={`Product ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button 
                type="button" 
                onClick={() => removeImage(i)}
                style={{ position: 'absolute', top: '4px', right: '4px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}
              >
                <FiTrash2 size={12} />
              </button>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ position: 'relative', overflow: 'hidden', display: 'inline-block' }}>
            <button type="button" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer' }} disabled={uploading}>
              <FiImage /> {uploading ? 'Uploading...' : 'Upload Image'}
            </button>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload}
              disabled={uploading}
              style={{ position: 'absolute', left: 0, top: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
            />
          </div>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Upload main product images (URLs will be added automatically).
          </span>
        </div>
      </div>

      <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
        <label>Short Description</label>
        <input 
          type="text" 
          name="shortDescription" 
          value={product.shortDescription || ''} 
          onChange={handleChange} 
          placeholder="Brief 1-sentence summary"
        />
      </div>

      <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
        <label>Full Description</label>
        <textarea 
          name="description" 
          value={product.description || ''} 
          onChange={handleChange} 
          placeholder="Detailed HTML/Markdown description of the product..."
          rows={5}
        />
      </div>

      {/* Features Array */}
      <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
        <label>Bullet Features</label>
        <div className={styles.dynamicList}>
          {(product.features || []).map((feature, index) => (
            <div key={index} className={styles.dynamicItem}>
              <input 
                type="text" 
                value={feature} 
                onChange={(e) => handleArrayChange('features', index, e.target.value)}
                placeholder="e.g., 100% Biowash Cotton"
              />
              <button type="button" className={styles.removeBtn} onClick={() => removeArrayItem('features', index)}>
                <FiTrash2 />
              </button>
            </div>
          ))}
          <button type="button" className={styles.addBtn} onClick={() => addArrayItem('features')}>
            <FiPlus /> Add Feature
          </button>
        </div>
      </div>
      
      {/* Toggles */}
      <div className={styles.formGroup}>
        <label>Status</label>
        <label className={styles.toggleSwitch}>
          <input 
            type="checkbox" 
            checked={product.isActive ?? true}
            onChange={(e) => setProduct(prev => ({ ...prev, isActive: e.target.checked }))}
          />
          <span className={styles.slider}></span>
          <span>{product.isActive ? 'Active (Visible)' : 'Draft (Hidden)'}</span>
        </label>
      </div>

      <div className={styles.formGroup}>
        <label>Featured Product</label>
        <label className={styles.toggleSwitch}>
          <input 
            type="checkbox" 
            checked={product.featured || false}
            onChange={(e) => setProduct(prev => ({ ...prev, featured: e.target.checked }))}
          />
          <span className={styles.slider}></span>
          <span>Show on Homepage Carousel</span>
        </label>
      </div>

    </div>
  );
}
