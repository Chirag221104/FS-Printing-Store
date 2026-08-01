'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { Product, categories } from '@/lib/data/products';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { FiSearch, FiFilter } from 'react-icons/fi';
import styles from './page.module.css';

type SortOption = 'default' | 'price-low' | 'price-high' | 'name' | 'discount';

export default function ShopPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: 'var(--text-muted)' }}>Loading products...</p></div>}>
      <ShopContent />
    </Suspense>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [activeCategory, setActiveCategory] = useState<string>(categoryParam || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [showFilters, setShowFilters] = useState(false);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        setProducts(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product)));
      } catch (error) {
        console.error('Error fetching products:', error);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    
    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(p => p.categorySlug === activeCategory);
    }
    
    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.category.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }
    
    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'discount':
        filtered.sort((a, b) => (b.discount || 0) - (a.discount || 0));
        break;
    }
    
    return filtered;
  }, [activeCategory, searchQuery, sortBy]);

  return (
    <div className={styles.shopPage}>
      {/* Page Header */}
      <section className={styles.pageHeader}>
        <div className={styles.headerBg}>
          <div className={styles.headerOrb1} />
          <div className={styles.headerOrb2} />
        </div>
        <div className={`container ${styles.headerContent}`}>
          <h1>Our <span className="gold-text">Products</span></h1>
          <p>Browse our complete collection of custom printed products</p>
        </div>
      </section>

      <div className={`container ${styles.shopContent}`}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          {/* Search */}
          <div className={styles.searchWrapper}>
            <FiSearch size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`input-field ${styles.searchInput}`}
            />
          </div>

          <div className={styles.toolbarRight}>
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className={`input-field ${styles.sortSelect}`}
            >
              <option value="default">Sort by: Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
              <option value="discount">Biggest Discount</option>
            </select>

            {/* Filter Toggle (mobile) */}
            <button
              className={styles.filterToggle}
              onClick={() => setShowFilters(!showFilters)}
            >
              <FiFilter size={18} />
              Filters
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className={`${styles.categoryTabs} ${showFilters ? styles.tabsVisible : ''}`}>
          <button
            className={`${styles.categoryTab} ${activeCategory === 'all' ? styles.tabActive : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            All Products
            <span className={styles.tabCount}>{products.length}</span>
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`${styles.categoryTab} ${activeCategory === cat.slug ? styles.tabActive : ''}`}
              onClick={() => setActiveCategory(cat.slug)}
            >
              {cat.name}
              <span className={styles.tabCount}>{cat.productCount}</span>
            </button>
          ))}
        </div>

        {/* Results Info */}
        <div className={styles.resultsInfo}>
          <span>Showing {filteredProducts.length} products</span>
          {activeCategory !== 'all' && (
            <button className={styles.clearFilter} onClick={() => setActiveCategory('all')}>
              Clear filter ×
            </button>
          )}
        </div>

        {/* Products Grid */}
        <div className={styles.productsGrid}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading amazing products...</div>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className={styles.noResults}>
              <h3>No products found</h3>
              <p>Try adjusting your search or filter criteria.</p>
              <button className="btn btn-primary" onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }} style={{ marginTop: '20px' }}>
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
