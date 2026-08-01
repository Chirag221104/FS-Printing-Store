'use client';

import React from 'react';
import { Product } from '@/lib/types/schema';
import styles from './editor.module.css';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

interface Props {
  product: Partial<Product>;
  setProduct: React.Dispatch<React.SetStateAction<Partial<Product>>>;
}

export default function BaseProductForm({ product, setProduct }: Props) {
  
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
        <label>Category ID *</label>
        <select name="categoryId" value={product.categoryId || ''} onChange={handleChange} required>
          <option value="">Select Category</option>
          <option value="t-shirts">T-Shirts</option>
          <option value="mugs">Mugs</option>
          <option value="bottles">Bottles</option>
          <option value="stickers">Stickers</option>
          {/* We will load this dynamically from DB later */}
        </select>
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
