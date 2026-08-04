'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { Product, Variant } from '@/lib/types/schema';
import CustomizationPanel, { CustomizationState } from '@/components/storefront/product/CustomizationPanel';
import LivePreview from '@/components/storefront/product/LivePreview';
import { setFile } from '@/lib/utils/idb';
import { products as mockProducts } from '@/lib/data/products';
import styles from '@/components/storefront/product/product-storefront.module.css';
import { toast } from 'react-hot-toast';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useCart } from '@/lib/context/CartContext';

import ImageGallery from '@/components/storefront/product/ImageGallery';
import VariantSelector from '@/components/storefront/product/VariantSelector';

export default function ProductStorefrontPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { addToCart } = useCart();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  
  // Selection State
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [activeVariant, setActiveVariant] = useState<Variant | null>(null);

  // Customization State
  const [customizations, setCustomizations] = useState<Record<string, CustomizationState>>({});
  
  const [activeMockupSetId, setActiveMockupSetId] = useState<string>('');
  const [activeLocationId, setActiveLocationId] = useState<string>('');
  


  useEffect(() => {
    if (slug) fetchProductAndVariants();
  }, [slug]);

  const fetchProductAndVariants = async () => {
    setLoading(true);
    try {
      let productDoc: any = null;

      // 1. First try fetching directly by document ID (since homepage links use ID)
      const docRef = doc(db, 'products', slug);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists() && docSnap.data()?.isActive !== false) {
        productDoc = docSnap;
      } else {
        // 2. If not found by ID, try searching by slug field
        const q = query(collection(db, 'products'), where('slug', '==', slug), where('isActive', '==', true));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          productDoc = querySnapshot.docs[0];
        }
      }
      
      if (!productDoc) {
        // Fallback to mock product data if Firestore is empty or not found
        const mockP = mockProducts.find(p => p.id === slug);
        if (mockP) {
          const adaptedProduct: any = {
            id: mockP.id,
            name: mockP.name,
            description: mockP.description,
            basePrice: mockP.price,
            images: [{ storagePath: mockP.image, type: 'FRONT' }],
            brand: 'F.S Print Works',
          };
          setProduct(adaptedProduct);
          
          // Create a mock variant so the UI and Add to Cart work
          const mockVariant: any = {
            id: 'mock-var-1',
            sku: mockP.id + '-var',
            price: mockP.price,
            stock: 100,
            attributes: { Option: 'Standard' },
            images: [{ storagePath: mockP.image, type: 'FRONT' }]
          };
          setVariants([mockVariant]);
          setSelectedAttributes({ Option: 'Standard' });
          setActiveVariant(mockVariant);
          setLoading(false);
          return;
        }

        setProduct(null);
        setLoading(false);
        return;
      }

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

      if (prodData.isCustomizable && prodData.printingLocations && prodData.printingLocations.length > 0) {
        // Handled by activeLocationId defaults
      }
      
      if (prodData.mockupSets && prodData.mockupSets.length > 0) {
        setActiveMockupSetId(prodData.mockupSets[0].id);
        if (prodData.mockupSets[0].locations && prodData.mockupSets[0].locations.length > 0) {
          setActiveLocationId(prodData.mockupSets[0].locations[0].id);
        }
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
      
      // Sync MockupSet with Variant (e.g. Color matches MockupSet attributeMatch)
      if (product?.mockupSets) {
        const matchingSet = product.mockupSets.find(set => {
          if (!set.attributeMatch) return false;
          // Check if every defined attribute match on the set equals the variant's attributes
          return Object.keys(set.attributeMatch).every(k => set.attributeMatch[k] === match.attributes[k]);
        });
        
        if (matchingSet) {
          setActiveMockupSetId(matchingSet.id);
          // If the location they were on doesn't exist in the new set, default to the first one
          if (!matchingSet.locations.find(l => l.id === activeLocationId) && matchingSet.locations.length > 0) {
            setActiveLocationId(matchingSet.locations[0].id);
          }
        }
      }
      
    } else {
      setActiveVariant(null);
    }
  };

  const handleAddToCart = async () => {
    if (!activeVariant) {
      toast.error('Please select valid options.');
      return;
    }
    if (activeVariant.stock <= 0) {
      toast.error('This option is out of stock.');
      return;
    }
    
    if (product?.isCustomizable) {
      // Basic validation: if any customization is in progress but invalid
      for (const cust of Object.values(customizations)) {
        if (cust.type === 'image' && !cust.artworkFile) {
          toast.error('Please upload an image or switch to Add Text for ' + cust.placement);
          return;
        }
        if (cust.type === 'text' && !cust.customText.trim()) {
          toast.error('Please enter custom text for ' + cust.placement);
          return;
        }
      }
    }

    const localFileIds: Record<string, string> = {};
    for (const [locId, cust] of Object.entries(customizations)) {
      if (cust.type === 'image' && cust.artworkFile) {
        // Save file locally in IndexedDB using a unique ID
        const fileId = `local_art_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        try {
          await setFile(fileId, cust.artworkFile);
          localFileIds[locId] = fileId;
        } catch (err) {
          toast.error('Failed to process artwork.');
          return;
        }
      }
    }

    // Build the customizations map for the cart payload (stripping out Files which can't be stringified)
    const payloadCustomizations: Record<string, any> = {};
    for (const [locId, cust] of Object.entries(customizations)) {
      if (cust.type !== 'none') {
        payloadCustomizations[locId] = {
          type: cust.type,
          placement: cust.placement,
          customText: cust.customText,
          textFont: cust.textFont,
          textColor: cust.textColor,
          isBold: cust.isBold,
          isItalic: cust.isItalic,
          transform: cust.transform,
          localFileId: localFileIds[locId],
          artworkPreviewUrl: cust.artworkPreviewUrl // temporary blob URL for cart display
        };
      }
    }

    const payload = {
      id: `${activeVariant.id}_${Date.now()}`,
      productId: product!.id,
      variantId: activeVariant.id,
      sku: activeVariant.sku,
      name: product!.name,
      price: activeVariant.price,
      originalPrice: activeVariant.compareAtPrice,
      image: activeVariant.images?.[0]?.storagePath || (typeof product!.images?.[0] === 'string' ? product!.images[0] : product!.images?.[0]?.storagePath) || '',
      quantity: 1,
      customizations: Object.keys(payloadCustomizations).length > 0 ? payloadCustomizations : undefined
    };

    try {
      await addToCart(payload);
      toast.success('Added to Cart!');
    } catch (err) {
      toast.error('Failed to add to cart.');
    }
  };

  if (loading) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading...</div>;
  if (!product) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Product not found</div>;

  // Filter gallery images to only show images belonging to the active variant
  const rawImages = activeVariant?.images?.length ? activeVariant.images : (variants[0]?.images?.length ? variants[0].images : (product.images || []));
  const displayImages: { storagePath: string; type: string }[] = rawImages.map(img => 
    typeof img === 'string' ? { storagePath: img, type: 'front' } : { storagePath: img.storagePath, type: img.type || 'front' }
  );

  return (
    <div className="container">
      <div className={styles.productPage}>
        
        <div className={styles.productContainer}>
          {/* Left Column: Image Gallery or Live Preview */}
          <div>
            {product.isCustomizable ? (
              <LivePreview 
                baseImage={displayImages[0]?.storagePath || (typeof product.images?.[0] === 'string' ? product.images[0] : product.images?.[0]?.storagePath) || ''}
                activeMockupSet={product.mockupSets?.find((s: any) => s.id === activeMockupSetId) || product.mockupSets?.[0]}
                activeLocationId={activeLocationId}
                customizations={customizations}
              />
            ) : (
              <ImageGallery images={displayImages} />
            )}
            
            {/* Show thumbnails below LivePreview if customizable */}
            {product.isCustomizable && displayImages.length > 1 && (
               <div style={{ marginTop: '20px' }}>
                 <ImageGallery images={displayImages} />
               </div>
            )}
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

            {/* Custom Print Studio Panel */}
            <CustomizationPanel 
              product={product}
              customizations={customizations}
              setCustomizations={setCustomizations}
              activeMockupSet={product.mockupSets?.find((s: any) => s.id === activeMockupSetId) || product.mockupSets?.[0]}
              activeLocationId={activeLocationId}
              setActiveLocationId={setActiveLocationId}
            />

            <div className={styles.description}>
              {product.shortDescription || product.description}
            </div>

            <div className={styles.actions}>
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

              <button 
                className="btn btn-primary" 
                style={{ padding: '1rem', fontSize: '1.1rem', marginTop: '1rem' }}
                onClick={handleAddToCart}
                disabled={!activeVariant || activeVariant.stock <= 0}
              >
                Add to Cart
              </button>
            </div>

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
