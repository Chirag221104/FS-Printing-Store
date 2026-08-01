'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FiPlus, FiEdit2, FiTrash2, FiImage } from 'react-icons/fi';
import { products as initialProducts, Product } from '@/lib/data/products';
import { toast } from 'react-hot-toast';
import styles from '../admin.module.css';
import { db, storage } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function AdminProducts() {
  const [productList, setProductList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'T-Shirts',
    price: 0,
    originalPrice: 0,
    discount: 0,
    image: '',
    inStock: true
  });

  const fetched = useRef(false);

  useEffect(() => {
    if (!fetched.current) {
      fetched.current = true;
      fetchProducts();
    }
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      if (querySnapshot.empty) {
        // Auto-seed with mock data if database is completely empty
        const batch = writeBatch(db);
        initialProducts.forEach(prod => {
          const docRef = doc(collection(db, 'products'));
          batch.set(docRef, { ...prod, id: docRef.id });
        });
        await batch.commit();
        const newSnapshot = await getDocs(collection(db, 'products'));
        setProductList(newSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product)));
        toast.success('Database seeded with sample products!');
      } else {
        setProductList(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product)));
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products. Check Firebase rules.');
    }
    setLoading(false);
  };

  const confirmDelete = (id: string) => {
    setProductToDelete(id);
  };

  const executeDelete = async () => {
    if (productToDelete) {
      try {
        await deleteDoc(doc(db, 'products', productToDelete));
        setProductList(prev => prev.filter(p => p.id !== productToDelete));
        toast.success('Product deleted successfully');
      } catch (error) {
        console.error('Error deleting:', error);
        toast.error('Failed to delete product');
      }
      setProductToDelete(null);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      originalPrice: product.originalPrice || 0,
      discount: product.discount || 0,
      image: product.image,
      inStock: product.inStock
    });
    setImageFile(null);
    setImagePreview(product.image || '');
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({
      name: '',
      category: 'T-Shirts',
      price: 0,
      originalPrice: 0,
      discount: 0,
      image: '',
      inStock: true
    });
    setImageFile(null);
    setImagePreview('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      let imageUrl = formData.image;

      // Upload image to Firebase Storage if a new file was selected
      if (imageFile) {
        const fileName = `products/${Date.now()}_${imageFile.name}`;
        const storageRef = ref(storage, fileName);
        const snapshot = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      const productData = { ...formData, image: imageUrl };

      if (editingId) {
        const productRef = doc(db, 'products', editingId);
        await updateDoc(productRef, productData);
        setProductList(prev => prev.map(p => p.id === editingId ? { ...p, ...productData } : p));
        toast.success('Product updated successfully');
      } else {
        const newProductData = {
          ...productData,
          description: 'New product description',
          categorySlug: formData.category.toLowerCase().replace(/ /g, '-'),
          featured: false
        };
        const docRef = await addDoc(collection(db, 'products'), newProductData);
        setProductList([{ ...newProductData, id: docRef.id } as Product, ...productList]);
        toast.success('Product added successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    }
    setUploading(false);
  };

  return (
    <div>
      <div className={styles.pageHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Products</h1>
          <p>Manage your store's catalog</p>
        </div>
        <Link 
          href="/admin/products/new"
          style={{ display: 'inline-block', padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, textDecoration: 'none' }}
        >
          + Add Product
        </Link>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.adminTable}>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '32px' }}>
                  Loading products from Firebase...
                </td>
              </tr>
            ) : productList.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '32px' }}>
                  No products found. Add one to get started!
                </td>
              </tr>
            ) : (
              productList.map((product) => (
                <tr key={product.id}>
                  <td>
                    <img src={product.image || 'https://via.placeholder.com/40'} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                  </td>
                  <td style={{ fontWeight: 500 }}>{product.name}</td>
                  <td>{product.category}</td>
                  <td>₹{product.price}</td>
                  <td>
                    {product.inStock ? (
                      <span className={`${styles.badge} ${styles.active}`}>In Stock</span>
                    ) : (
                      <span className={styles.badge}>Out of Stock</span>
                    )}
                  </td>
                  <td>
                    <div className={styles.cardActions}>
                      <Link href={`/admin/products/new?id=${product.id}`} className={styles.actionBtn}>
                        <FiEdit2 /> Edit
                      </Link>
                      <button 
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        onClick={() => confirmDelete(product.id)}
                      >
                        <FiTrash2 /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
              <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            
            <form onSubmit={handleSave}>
              <div className={styles.formGroup}>
                <label>Product Name</label>
                <input 
                  type="text" 
                  className={styles.inputField} 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Category</label>
                <select 
                  className={styles.inputField}
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option value="T-Shirts">T-Shirts</option>
                  <option value="Mugs">Mugs</option>
                  <option value="Stickers">Stickers</option>
                </select>
              </div>

              <div className={styles.formGroup} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label>Price (₹)</label>
                  <input 
                    type="number" 
                    className={styles.inputField} 
                    required
                    min="0"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label>Original Price (₹)</label>
                  <input 
                    type="number" 
                    className={styles.inputField} 
                    min="0"
                    value={formData.originalPrice}
                    onChange={e => setFormData({...formData, originalPrice: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label>Discount (%)</label>
                  <input 
                    type="number" 
                    className={styles.inputField} 
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={e => setFormData({...formData, discount: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Product Image</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Drag & Drop Zone */}
                  <div 
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOver(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file && file.type.startsWith('image/')) {
                        setImageFile(file);
                        setImagePreview(URL.createObjectURL(file));
                        setFormData({...formData, image: ''}); // clear url if file dropped
                      }
                    }}
                    style={{
                      border: `2px dashed ${isDragOver ? '#3b82f6' : '#cbd5e1'}`,
                      borderRadius: '12px',
                      padding: '32px 20px',
                      textAlign: 'center',
                      background: isDragOver ? '#eff6ff' : '#f8fafc',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <input 
                      id="file-upload"
                      type="file" 
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setImageFile(file);
                          setImagePreview(URL.createObjectURL(file));
                          setFormData({...formData, image: ''});
                        }
                      }}
                      style={{ display: 'none' }}
                    />
                    
                    {imagePreview ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '120px', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                          <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <span style={{ fontSize: '0.85rem', color: '#64748b', background: '#e2e8f0', padding: '4px 12px', borderRadius: '16px' }}>
                          Click or drag to change image
                        </span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                        </div>
                        <p style={{ margin: 0, fontWeight: 500, color: '#334155' }}>Click to upload or drag and drop</p>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>SVG, PNG, JPG or GIF (max. 5MB)</p>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ height: '1px', flex: 1, background: '#e2e8f0' }}></div>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>or paste url</span>
                    <div style={{ height: '1px', flex: 1, background: '#e2e8f0' }}></div>
                  </div>
                  
                  <input 
                    type="url" 
                    className={styles.inputField} 
                    placeholder="https://example.com/image.jpg"
                    value={formData.image}
                    onChange={e => {
                      setFormData({...formData, image: e.target.value});
                      setImagePreview(e.target.value);
                      setImageFile(null); // clear file if url pasted
                    }}
                  />
                </div>
              </div>

              <div className={styles.formGroup} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox" 
                  id="inStock"
                  checked={formData.inStock}
                  onChange={e => setFormData({...formData, inStock: e.target.checked})}
                />
                <label htmlFor="inStock" style={{ margin: 0 }}>In Stock</label>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.secondaryBtn} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.primaryBtn} disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className={styles.modalOverlay} onClick={() => setProductToDelete(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className={styles.modalHeader}>
              <h2>Confirm Deletion</h2>
              <button className={styles.closeBtn} onClick={() => setProductToDelete(null)}>×</button>
            </div>
            <p style={{ color: '#475569', marginBottom: '24px' }}>
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className={styles.modalFooter}>
              <button type="button" className={styles.secondaryBtn} onClick={() => setProductToDelete(null)}>Cancel</button>
              <button type="button" className={`${styles.primaryBtn}`} style={{ background: '#ef4444', color: 'white', border: 'none' }} onClick={executeDelete}>Delete Product</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
