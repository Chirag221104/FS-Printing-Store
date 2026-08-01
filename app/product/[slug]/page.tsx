'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Product, Variant } from '@/lib/types/schema';
import styles from '@/components/storefront/product/product-storefront.module.css';
import { toast } from 'react-hot-toast';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

import ImageGallery from '@/components/storefront/product/ImageGallery';
import VariantSelector from '@/components/storefront/product/VariantSelector';
import CustomizationEngine from '@/components/storefront/product/CustomizationEngine';

export default function ProductStorefrontPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  
  // Selection State
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [activeVariant, setActiveVariant] = useState<Variant | null>(null);
  
  // Customization State
  const [customization, setCustomization] = useState({});

  useEffect(() => {
    if (slug) fetchProductAndVariants();
  }, [slug]);

  const fetchProductAndVariants = async () => {
    setLoading(true);
    try {
      // Find product by slug
      const q = query(collection(db, 'products'), where('slug', '==', slug), where('isActive', '==', true));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setProduct(null);
        setLoading(false);
        return;
      }

      const productDoc = querySnapshot.docs[0];
      const prodData = { ...productDoc.data(), id: productDoc.id } as Product;
      setProduct(prodData);

      // Fetch variants
      const variantsRef = collection(db, `products/${productDoc.id}/variants`);
      const vSnap = await getDocs(query(variantsRef, where('isActive', '==', true)));
      
      const fetchedVariants = vSnap.docs.map(d => ({ ...d.data(), id: d.id } as Variant));
      setVariants(fetchedVariants);

      // Set initial defaults (pick the first available variant)
      const firstAvailable = fetchedVariants.find(v => v.stock > 0);
      if (firstAvailable && firstAvailable.attributes) {
        setSelectedAttributes(firstAvailable.attributes);
        setActiveVariant(firstAvailable);
      } else if (fetchedVariants.length > 0) {
        setSelectedAttributes(fetchedVariants[0].attributes || {});
        setActiveVariant(fetchedVariants[0]);
      }

    } catch (err) {
      console.error(err);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAttribute = (key: string, value: string) => {
    const newSelection = { ...selectedAttributes, [key]: value };
    setSelectedAttributes(newSelection);
    
    // Find the exact variant matching this new selection
    const match = variants.find(v => {
      return Object.keys(newSelection).every(k => v.attributes?.[k] === newSelection[k]);
    });
    
    if (match) {
      setActiveVariant(match);
    } else {
      setActiveVariant(null);
    }
  };

  const handleAddToCart = () => {
    if (!activeVariant) {
      toast.error('Please select valid options.');
      return;
    }
    if (activeVariant.stock <= 0) {
      toast.error('This option is out of stock.');
      return;
    }

    // Advanced Cloud Cart logic goes here in the future
    // For now we'll simulate success
    toast.success('Added to Cart!');
    console.log('Cart Payload:', {
      productId: product?.id,
      variantId: activeVariant.id,
      sku: activeVariant.sku,
      customization,
      price: activeVariant.price
    });
  };

  if (loading) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading...</div>;
  if (!product) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Product not found</div>;

  // Filter gallery images to only show images belonging to the active variant
  // Fallback to all variant images if none found (or base product images if we had them)
  const displayImages = activeVariant?.images?.length ? activeVariant.images : (variants[0]?.images || []);

  return (
    <div className="container">
      <div className={styles.productPage}>
        
        <div className={styles.productContainer}>
          {/* Left Column: Image Gallery */}
          <div>
            <ImageGallery images={displayImages} />
          </div>

          {/* Right Column: Details & Customizer */}
          <div className={styles.productInfo}>
            
            <div>
              {product.brand && <div className={styles.brand}>{product.brand}</div>}
              <h1 className={styles.title}>{product.name}</h1>
            </div>

            <div className={styles.priceBlock}>
              <span className={styles.price}>₹{activeVariant ? activeVariant.price : product.basePrice}</span>
              {activeVariant?.compareAtPrice && (
                <span className={styles.comparePrice}>₹{activeVariant.compareAtPrice}</span>
              )}
            </div>

            <div className={styles.description}>
              {product.shortDescription || product.description}
            </div>

            {/* Dynamic Variant Selector (Size, Color, etc) */}
            <VariantSelector 
              variants={variants}
              selectedAttributes={selectedAttributes}
              onSelectAttribute={handleSelectAttribute}
            />

            {/* Stock Status Indicator */}
            {activeVariant && (
              <div className={`${styles.stockStatus} ${activeVariant.stock === 0 ? styles.out : activeVariant.stock < 10 ? styles.low : ''}`}>
                {activeVariant.stock > 0 ? (
                  <><FiCheckCircle /> In Stock ({activeVariant.stock} available)</>
                ) : (
                  <><FiAlertCircle /> Out of Stock</>
                )}
              </div>
            )}

            {/* Web-to-Print Engine */}
            <CustomizationEngine 
              product={product} 
              customization={customization} 
              setCustomization={setCustomization} 
            />

            <button 
              className="btn btn-primary" 
              style={{ padding: '1rem', fontSize: '1.1rem' }}
              onClick={handleAddToCart}
              disabled={!activeVariant || activeVariant.stock <= 0}
            >
              Add to Cart
            </button>

            {/* Specifications Tab */}
            {product.specifications && product.specifications.length > 0 && (
              <div style={{ marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Specifications</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
                  {product.specifications.map((spec, idx) => (
                    <React.Fragment key={idx}>
                      <div style={{ color: 'var(--text-muted)' }}>{spec.key}</div>
                      <div>{spec.value}</div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
