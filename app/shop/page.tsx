'use client';

import React, { useState, useMemo, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { Product, categories, products as mockProducts } from '@/lib/data/products';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import styles from './page.module.css';

type SortOption = 'newest' | 'price-low' | 'price-high' | 'name';

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid #f3f4f6', borderTopColor: 'var(--primary-orange)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}

function ShopContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // URL Params State
  const activeCategory = searchParams.get('category') || 'all';
  const urlSearchQuery = searchParams.get('q') || '';
  const sortBy = (searchParams.get('sort') || 'newest') as SortOption;
  const minPrice = searchParams.get('min') ? Number(searchParams.get('min')) : 0;
  const maxPrice = searchParams.get('max') ? Number(searchParams.get('max')) : 10000;

  // Local State
  const [searchInput, setSearchInput] = useState(urlSearchQuery);
  const [localMin, setLocalMin] = useState(minPrice.toString());
  const [localMax, setLocalMax] = useState(maxPrice.toString());
  const [showFilters, setShowFilters] = useState(false);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Debounce Search & Update URL
  useEffect(() => {
    const handler = setTimeout(() => {
      updateUrl({ q: searchInput });
    }, 500); // 500ms debounce
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Sync Local Price State with URL (when URL changes externally)
  useEffect(() => {
    setSearchInput(urlSearchQuery);
    setLocalMin(minPrice.toString());
    setLocalMax(maxPrice.toString());
  }, [urlSearchQuery, minPrice, maxPrice]);

  // Initial Data Fetch
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // We fetch all active products sorted by creation date.
        // For larger catalogs (10k+), you'd integrate Algolia or Typesense.
        // For < 1000 products, fetching all active and filtering client-side 
        // provides an instant, sub-millisecond search experience without needing 
        // 50+ composite indexes in Firestore.
        const q = query(
          collection(db, 'products'),
          where('isActive', '==', true)
        );
        const querySnapshot = await getDocs(q);
        let fetchedProducts = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));
        
        // Combine database products with mock data so the demo always looks full
        const combinedProducts = [...fetchedProducts, ...mockProducts.filter(m => !fetchedProducts.find(f => f.id === m.id))];
        setProducts(combinedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const updateUrl = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || (key === 'category' && value === 'all') || (key === 'sort' && value === 'newest')) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, router]);

  const applyPriceFilter = () => {
    updateUrl({ 
      min: localMin === '0' || localMin === '' ? null : localMin, 
      max: localMax === '10000' || localMax === '' ? null : localMax 
    });
  };

  const clearAllFilters = () => {
    router.replace(pathname, { scroll: false });
    setSearchInput('');
    setLocalMin('0');
    setLocalMax('10000');
  };

  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    
    // 1. Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(p => p.categorySlug === activeCategory);
    }
    
    // 2. Filter by search
    if (urlSearchQuery.trim()) {
      const queryLower = urlSearchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(queryLower) || 
        (p.description && p.description.toLowerCase().includes(queryLower))
      );
    }

    // 3. Filter by price range
    filtered = filtered.filter(p => p.price >= minPrice && p.price <= maxPrice);
    
    // 4. Sort
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
      case 'newest':
      default:
        // Use default order since mock products lack createdAt for now
        break;
    }
    
    return filtered;
  }, [products, activeCategory, urlSearchQuery, minPrice, maxPrice, sortBy]);

  const activeFilterCount = (activeCategory !== 'all' ? 1 : 0) + (urlSearchQuery ? 1 : 0) + (minPrice > 0 || maxPrice < 10000 ? 1 : 0);

  return (
    <div className={styles.shopPage}>
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

      <div className={`container ${styles.shopContainer}`}>
        {/* Left Sidebar Filters */}
        <aside className={`${styles.sidebar} ${showFilters ? styles.sidebarOpen : ''}`}>
          <div className={styles.sidebarHeader}>
            <h3>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</h3>
            <button className={styles.closeSidebarBtn} onClick={() => setShowFilters(false)}>
              <FiX size={24} />
            </button>
          </div>

          <div className={styles.filterSection}>
            <h4 className={styles.filterTitle}>Search</h4>
            <div className={styles.searchWrapper}>
              <FiSearch size={18} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>

          <div className={styles.filterSection}>
            <h4 className={styles.filterTitle}>Categories</h4>
            <div className={styles.categoryList}>
              <button
                className={`${styles.categoryFilterBtn} ${activeCategory === 'all' ? styles.activeCategory : ''}`}
                onClick={() => updateUrl({ category: 'all' })}
              >
                All Products
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`${styles.categoryFilterBtn} ${activeCategory === cat.slug ? styles.activeCategory : ''}`}
                  onClick={() => updateUrl({ category: cat.slug })}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterSection}>
            <h4 className={styles.filterTitle}>Price Range</h4>
            <div className={styles.priceInputs}>
              <div className={styles.priceInputWrapper}>
                <span>₹</span>
                <input 
                  type="number" 
                  value={localMin} 
                  onChange={(e) => setLocalMin(e.target.value)} 
                  min="0"
                />
              </div>
              <span style={{ color: '#94a3b8' }}>-</span>
              <div className={styles.priceInputWrapper}>
                <span>₹</span>
                <input 
                  type="number" 
                  value={localMax} 
                  onChange={(e) => setLocalMax(e.target.value)} 
                />
              </div>
            </div>
            <button className={styles.applyPriceBtn} onClick={applyPriceFilter}>
              Apply Range
            </button>
          </div>

          {activeFilterCount > 0 && (
            <button className={styles.clearFiltersBtn} onClick={clearAllFilters}>
              Clear All Filters
            </button>
          )}
        </aside>

        {/* Mobile Filter Overlay */}
        {showFilters && <div className={styles.overlay} onClick={() => setShowFilters(false)} />}

        {/* Main Content Area */}
        <div className={styles.mainContent}>
          <div className={styles.toolbar}>
            <div className={styles.toolbarLeft}>
              <span>Showing <strong>{filteredProducts.length}</strong> products</span>
            </div>

            <div className={styles.toolbarRight}>
              <select
                value={sortBy}
                onChange={(e) => updateUrl({ sort: e.target.value })}
                className={styles.sortSelect}
              >
                <option value="newest">Sort by: Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>

              <button
                className={styles.mobileFilterToggle}
                onClick={() => setShowFilters(true)}
              >
                <FiFilter size={18} />
                Filters {activeFilterCount > 0 && <span className={styles.filterBadge}>{activeFilterCount}</span>}
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <div className={styles.activeFilters}>
              {activeCategory !== 'all' && (
                <span className={styles.activeFilterPill}>
                  Category: {categories.find(c => c.slug === activeCategory)?.name || activeCategory}
                  <button onClick={() => updateUrl({ category: 'all' })}><FiX size={14} /></button>
                </span>
              )}
              {urlSearchQuery && (
                <span className={styles.activeFilterPill}>
                  Search: "{urlSearchQuery}"
                  <button onClick={() => { setSearchInput(''); updateUrl({ q: null }); }}><FiX size={14} /></button>
                </span>
              )}
              {(minPrice > 0 || maxPrice < 10000) && (
                <span className={styles.activeFilterPill}>
                  Price: ₹{minPrice} - ₹{maxPrice}
                  <button onClick={() => { setLocalMin('0'); setLocalMax('10000'); updateUrl({ min: null, max: null }); }}><FiX size={14} /></button>
                </span>
              )}
            </div>
          )}

          {/* Products Grid */}
          <div className={styles.productsGrid}>
            {loading ? (
              <div className={styles.loadingContainer}>
                <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid #f3f4f6', borderTopColor: 'var(--primary-orange)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <p>Loading catalog...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className={styles.noResults}>
                <div className={styles.noResultsIcon}>
                  <FiSearch size={32} />
                </div>
                <h3>No products found</h3>
                <p>We couldn't find any products matching your current filters.</p>
                <button className="btn btn-primary" onClick={clearAllFilters} style={{ marginTop: '16px' }}>
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
