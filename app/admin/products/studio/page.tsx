'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { db, storage } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, writeBatch, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ProductStudioState, Product, Variant } from '@/lib/types/schema';
import { getTemplateById, categoryTemplates } from '@/lib/data/categoryTemplates';
import { saveStudioDraft, loadStudioDraft, clearStudioDraft } from '@/lib/utils/autosave';

import styles from '@/components/admin/studio/studio.module.css';
import WizardStepper, { StepDef } from '@/components/admin/studio/WizardStepper';
import Step1BasicInfo from '@/components/admin/studio/steps/Step1BasicInfo';
import Step2Attributes from '@/components/admin/studio/steps/Step2Attributes';
import Step3BulkEditor from '@/components/admin/studio/steps/Step3BulkEditor';
import Step4Images from '@/components/admin/studio/steps/Step4Images';
import Step5Customization from '@/components/admin/studio/steps/Step5Customization';
import Step6SEO from '@/components/admin/studio/steps/Step6SEO';
import Step7Review from '@/components/admin/studio/steps/Step7Review';

import { FiArrowLeft, FiArrowRight, FiSave, FiCheckCircle } from 'react-icons/fi';

const WIZARD_STEPS: StepDef[] = [
  { id: 1, label: 'Basic Info' },
  { id: 2, label: 'Attributes & Variants' },
  { id: 3, label: 'Bulk Editor' },
  { id: 4, label: 'Images' },
  { id: 5, label: 'Customization Areas' },
  { id: 6, label: 'SEO' },
  { id: 7, label: 'Review & Publish' },
];

export default function ProductStudioPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading Product Studio...</div>}>
      <StudioContent />
    </Suspense>
  );
}

function StudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const isNew = searchParams.get('new') === 'true';
  const [publishing, setPublishing] = useState(false);

  // Master Studio State
  const [studioState, setStudioState] = useState<Partial<ProductStudioState>>({
    step: 1,
    selectedTemplate: 'tshirt',
    product: {
      name: '',
      slug: '',
      basePrice: 499,
      compareAtPrice: 799,
      brand: 'F.S Print Works',
      shortDescription: '',
      description: '',
      isCustomizable: true,
      allowImageUpload: true,
      allowTextPrinting: true,
      printingLocations: ['Front', 'Back'],
      printAreas: [],
      maxUploadSizeBytes: 10485760,
      acceptedFileTypes: ['image/png', 'image/jpeg', 'image/svg+xml'],
      tags: [],
      seoMeta: { title: '', description: '' },
      featured: false,
      isActive: true,
      trackInventory: true,
      images: [],
    },
    variants: [],
    attributeDefinitions: [
      { name: 'Size', values: ['S', 'M', 'L', 'XL', 'XXL'] },
      { name: 'Color', values: ['White', 'Black', 'Navy'] },
    ],
    lastSaved: null,
  });

  // Load product for editing OR load draft on mount
  useEffect(() => {
    if (editId) {
      loadExistingProduct(editId);
    } else {
      if (isNew) {
        clearStudioDraft();
        applyTemplate('tshirt');
        // Clean URL to remove new=true so a refresh won't clear draft again
        window.history.replaceState({}, '', '/admin/products/studio');
      } else {
        const draft = loadStudioDraft();
        if (draft && draft.product) {
          setStudioState(prev => ({ ...prev, ...draft }));
          toast.success('Restored your unfinished Product Studio draft!', { id: 'draft-restore' });
        } else {
          applyTemplate('tshirt');
        }
      }
    }
  }, [editId, isNew]);

  const loadExistingProduct = async (productId: string) => {
    try {
      const pDoc = await getDoc(doc(db, 'products', productId));
      if (!pDoc.exists()) {
        toast.error('Product not found.');
        return;
      }
      const fetchedProd = { ...pDoc.data(), id: pDoc.id } as Product;

      // Fetch variants
      const vSnap = await getDocs(collection(db, 'products', productId, 'variants'));
      const fetchedVars = vSnap.docs.map(d => ({ ...d.data(), id: d.id } as Variant));

      // Extract unique attribute definitions from variants
      const attrMap: Record<string, Set<string>> = {};
      fetchedVars.forEach(v => {
        if (v.attributes) {
          Object.entries(v.attributes).forEach(([k, val]) => {
            if (!attrMap[k]) attrMap[k] = new Set();
            attrMap[k].add(val);
          });
        }
      });

      const extractedDefs = Object.entries(attrMap).map(([k, set]) => ({
        name: k,
        values: Array.from(set),
        allValues: Array.from(set)
      }));

      setStudioState({
        step: 1,
        selectedTemplate: fetchedProd.categoryId || 'tshirt',
        product: fetchedProd,
        variants: fetchedVars,
        mockupSets: fetchedProd.mockupSets || [],
        attributeDefinitions: extractedDefs.length > 0 ? extractedDefs : [
          { name: 'Size', values: ['S', 'M', 'L', 'XL'], allValues: ['S', 'M', 'L', 'XL'] },
          { name: 'Color', values: ['White', 'Black'], allValues: ['White', 'Black'] }
        ],
        lastSaved: new Date().toISOString()
      });
      toast.success(`Loaded product "${fetchedProd.name}" into Product Studio!`, { id: 'load-existing' });
    } catch (err) {
      console.error('Error loading product into studio:', err);
      toast.error('Failed to load product for editing.');
    }
  };

  // Autosave draft on state change
  useEffect(() => {
    saveStudioDraft(studioState);
  }, [studioState]);

  // Apply Category Template Presets
  const applyTemplate = (templateId: string) => {
    const t = getTemplateById(templateId);
    if (!t) return;

    // Build the default MockupSet based on template's PrintAreas
    // Group by location (e.g., Front, Back, Left Sleeve)
    const locations: any[] = [];
    t.printAreas.forEach(pa => {
      // Check if we already have a location with this name
      let loc = locations.find(l => l.name === pa.label);
      if (!loc) {
        loc = {
          id: `loc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          name: pa.label,
          baseImage: { id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, storagePath: '', type: 'mockup' },
          printAreas: []
        };
        locations.push(loc);
      }
      // We push the area into this location
      loc.printAreas.push({
        ...pa,
        id: `area_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: pa.label,
        shape: 'rectangle',
        isLocked: false,
        isVisible: true,
        productionMethods: ['DTF'],
        allowImages: pa.allowImages !== undefined ? pa.allowImages : true,
        allowText: pa.allowText !== undefined ? pa.allowText : true,
        lockAspectRatio: pa.lockAspectRatio !== undefined ? pa.lockAspectRatio : false,
      });
    });

    setStudioState(prev => ({
      ...prev,
      selectedTemplate: templateId,
      attributeDefinitions: t.attributes.map(a => ({
        ...a,
        allValues: [...a.values]
      })),
      mockupSets: [{
        id: `mset_${Date.now()}`,
        name: 'Default Mockup Set',
        attributeMatch: {},
        locations: locations,
        lifestyleImages: []
      }],
      product: {
        ...prev.product,
        categoryId: templateId,
        printingLocations: t.printAreas.map(p => p.label), // legacy
        printAreas: t.printAreas.map(p => ({
          ...p,
          mockupUrl: 'https://via.placeholder.com/600',
        })), // legacy
        maxUploadSizeBytes: t.supportedCustomization.maxUploadSizeBytes,
        acceptedFileTypes: t.supportedCustomization.acceptedFileTypes,
        seoMeta: {
          title: t.seoTemplate.title.replace('{name}', prev.product?.name || 'Custom Product'),
          description: t.seoTemplate.description.replace('{name}', prev.product?.name || 'Custom Product'),
        },
      }
    }));
  };

  const updateProduct = (fields: Partial<Product>) => {
    setStudioState(prev => ({
      ...prev,
      product: { ...prev.product, ...fields }
    }));
  };

  const handleNextStep = () => {
    if (studioState.step === 1 && (!studioState.product?.name || !studioState.product?.slug)) {
      toast.error('Product Name and Slug are required.');
      return;
    }
    setStudioState(prev => ({ ...prev, step: Math.min((prev.step || 1) + 1, 7) }));
  };

  const handlePrevStep = () => {
    setStudioState(prev => ({ ...prev, step: Math.max((prev.step || 1) - 1, 1) }));
  };

  // Publish Product to Firestore
  const handlePublish = async () => {
    const prod = studioState.product || {};
    const vars = studioState.variants || [];

    if (!prod.name || !prod.slug) {
      toast.error('Product Name and Slug are required.');
      return;
    }

    if (vars.length === 0) {
      toast.error('Please generate at least 1 variant before publishing.');
      return;
    }

    setPublishing(true);
    const toastId = toast.loading('Uploading images and publishing product...');

    try {
      console.log('Publish step 0: Starting Image Upload Pipeline');
      // 0. Image Upload Pipeline
      const uploadProductImage = async (img: any): Promise<any> => {
        if (img.file) {
          if (!(img.file instanceof File) && !(img.file instanceof Blob)) {
            throw new Error(`The image file "${img.file.name || img.id}" was corrupted or lost during a page reload. Please re-upload this image before publishing.`);
          }
          console.log(`Uploading file for image ID: ${img.id}`);
          const fileRef = ref(storage, `products/${Date.now()}_${img.id}_${img.file.name || 'image.png'}`);
          
          // Wrap upload in a timeout to prevent infinite hangs (often caused by corrupted Firebase Auth IndexedDB)
          const uploadTask = async () => {
            await uploadBytes(fileRef, img.file);
            return await getDownloadURL(fileRef);
          };
          
          const timeoutTask = new Promise<string>((_, reject) => 
            setTimeout(() => reject(new Error(`Upload timed out for image ${img.id}. Your browser's Firebase IndexedDB might be corrupted (Database is closing/hidden). Please try opening this page in an Incognito window, or clear your browser's Site Data.`)), 15000)
          );
          
          const url = await Promise.race([uploadTask(), timeoutTask]);
          
          console.log(`Uploaded ${img.id} successfully to ${url}`);
          const { file, previewUrl, ...rest } = img;
          return { ...rest, storagePath: url };
        }
        const { file, previewUrl, ...rest } = img;
        return rest;
      };

      // Upload base product images
      let processedProductImages = [...(prod.images || [])];
      if (processedProductImages.length > 0) {
        console.log(`Processing ${processedProductImages.length} product images...`);
        processedProductImages = await Promise.all(processedProductImages.map(uploadProductImage));
      }

      // Upload variant images
      console.log(`Processing ${vars.length} variants...`);
      const processedVars = await Promise.all(vars.map(async (v) => {
        if (v.images && v.images.length > 0) {
          const uploadedImgs = await Promise.all(v.images.map(uploadProductImage));
          return { ...v, images: uploadedImgs };
        }
        return v;
      }));

      // Upload MockupSets images
      console.log(`Processing ${(studioState.mockupSets || []).length} mockup sets...`);
      const processedMockupSets = await Promise.all((studioState.mockupSets || []).map(async (set) => {
        const processedLocations = await Promise.all(set.locations.map(async (loc) => {
          if (loc.baseImage) {
            const uploadedImg = await uploadProductImage(loc.baseImage);
            return { ...loc, baseImage: uploadedImg };
          }
          return loc;
        }));
        const processedLifestyle = await Promise.all((set.lifestyleImages || []).map(async (img) => {
          return await uploadProductImage(img);
        }));
        return { ...set, locations: processedLocations, lifestyleImages: processedLifestyle };
      }));
      console.log('All image uploads finished successfully. Building batch...');

      const batch = writeBatch(db);

      // 1. Create or Update Base Product Document
      const productRef = prod.id ? doc(db, 'products', prod.id) : doc(collection(db, 'products'));
      const productData = {
        ...prod,
        images: processedProductImages,
        mockupSets: processedMockupSets,
        id: productRef.id,
        price: prod.basePrice || 0,
        category: prod.categoryId || 'General',
        image: typeof processedProductImages?.[0] === 'string' ? processedProductImages[0] : (processedProductImages?.[0]?.storagePath || ''),
        variantCount: processedVars.length,
        updatedAt: serverTimestamp(),
        ...(prod.id ? {} : { createdAt: serverTimestamp() })
      };
      batch.set(productRef, productData, { merge: true });

      // 2. Write Variant Subcollection Documents
      processedVars.forEach(v => {
        const variantRef = v.id ? doc(db, `products/${productRef.id}/variants`, v.id) : doc(collection(productRef, 'variants'));
        const variantData = {
          ...v,
          id: variantRef.id,
          isActive: v.isActive ?? true,
        };
        batch.set(variantRef, variantData, { merge: true });
      });

      await batch.commit();

      // Clear draft on successful publish
      clearStudioDraft();

      toast.success('Product successfully published!', { id: toastId });
      router.push('/admin/products');
    } catch (err: any) {
      console.error('Error publishing product:', err);
      toast.error(err.message || 'Failed to publish product', { id: toastId });
    } finally {
      setPublishing(false);
    }
  };

  const currentStep = studioState.step || 1;

  return (
    <div className={styles.studioContainer}>
      {/* Studio Header Bar */}
      <div className={styles.studioHeader}>
        <div className={styles.studioTitle}>
          Product Studio
          {studioState.lastSaved && (
            <span className={styles.savedBadge}>
              <FiCheckCircle size={14} /> Autosaved
            </span>
          )}
        </div>

        <button
          className={styles.btnSecondary}
          onClick={() => {
            saveStudioDraft(studioState);
            toast.success('Draft manually saved');
          }}
        >
          <FiSave /> Save Draft
        </button>
      </div>

      {/* Stepper Bar */}
      <WizardStepper
        steps={WIZARD_STEPS}
        currentStep={currentStep}
        onStepClick={(stepId) => setStudioState(prev => ({ ...prev, step: stepId }))}
      />

      {/* Step Body Container */}
      <div className={styles.wizardBody}>
        {currentStep === 1 && (
          <Step1BasicInfo
            state={studioState}
            updateProduct={updateProduct}
            selectTemplate={applyTemplate}
          />
        )}
        {currentStep === 2 && (
          <Step2Attributes
            state={studioState}
            setState={setStudioState}
          />
        )}
        {currentStep === 3 && (
          <Step3BulkEditor
            state={studioState}
            setState={setStudioState}
          />
        )}
        {currentStep === 4 && (
          <Step4Images
            state={studioState}
            setState={setStudioState}
          />
        )}
        {currentStep === 5 && (
          <Step5Customization
            state={studioState}
            setState={setStudioState}
          />
        )}
        {currentStep === 6 && (
          <Step6SEO
            state={studioState}
            setState={setStudioState}
          />
        )}
        {currentStep === 7 && (
          <Step7Review
            state={studioState}
            onPublish={handlePublish}
            publishing={publishing}
          />
        )}

        {/* Navigation Footer */}
        <div className={styles.wizardFooter}>
          <button
            className={styles.btnSecondary}
            onClick={handlePrevStep}
            disabled={currentStep === 1}
            style={{ opacity: currentStep === 1 ? 0.5 : 1 }}
          >
            <FiArrowLeft /> Previous Step
          </button>

          {currentStep < 7 ? (
            <button className={styles.btnPrimary} onClick={handleNextStep}>
              Next Step <FiArrowRight />
            </button>
          ) : (
            <button className={styles.btnSuccess} onClick={handlePublish} disabled={publishing}>
              <FiCheckCircle /> Publish Product
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
