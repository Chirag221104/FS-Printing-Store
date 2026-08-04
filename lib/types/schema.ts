import { Timestamp, FieldValue } from 'firebase/firestore';

export type FirestoreTimestamp = Timestamp | FieldValue | Date | string | null;

// ============================================================
// PRINT PRODUCTION STUDIO (Milestone 3)
// ============================================================

export type ProductionMethod = 'DTF' | 'Screen Printing' | 'Embroidery' | 'Sublimation' | 'UV Printing' | 'Laser Engraving' | 'Vinyl';

export interface PrintBounds {
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  width: number; // percentage (0-100)
  height: number; // percentage (0-100)
  rotation: number; // degrees
}

export interface PrintArea {
  id: string;                    // unique ID
  name: string;                  // Internal name, e.g., 'Chest Logo'
  label: string;                 // Customer facing, e.g., 'Left Chest'
  bounds: PrintBounds;
  safeArea?: PrintBounds;
  bleedArea?: PrintBounds;
  shape?: 'rectangle' | 'circle' | 'ellipse' | 'triangle' | 'hexagon' | 'diamond';
  isLocked?: boolean;
  isVisible?: boolean;           // Editor visibility layer
  
  // Advanced Rules
  productionMethods: ProductionMethod[];
  maxUploadSizeBytes: number;
  acceptedFileTypes: string[];
  recommendedDpi: number;
  maxPhysicalWidthMm?: number;   // Physical constraints for pricing/scaling
  maxPhysicalHeightMm?: number;
  allowImages: boolean;
  allowText: boolean;
  lockAspectRatio: boolean;
  minTextSizePt?: number;
  maxColors?: number;
  
  // Professional Editor Constraints (v2)
  maxLayers?: number;
  defaultScale?: number;
  minScale?: number;
  maxScale?: number;
  allowRotation?: boolean;
  allowFlip?: boolean;
  allowOpacity?: boolean;
}

export interface PrintLocation {
  id: string;
  name: string;                  // e.g., 'Front', 'Left Sleeve'
  baseImage: ProductImage;       // Uses the robust ProductImage type
  physicalWidthMm?: number;      // How wide is the physical area represented by the image?
  printAreas: PrintArea[];
}

export interface MockupSet {
  id: string;
  name: string;                  // e.g., 'White T-Shirt', 'Black Mug'
  attributeMatch: Record<string, string>; // e.g., { Color: 'White' }
  locations: PrintLocation[];
  lifestyleImages: ProductImage[];
}

// ============================================================
// CATEGORY TEMPLATE — Presets for different product types
// ============================================================
export interface AttributeDefinition {
  name: string;                  // e.g., 'Size', 'Color', 'Capacity'
  values: string[];              // e.g., ['S', 'M', 'L', 'XL']
  allValues?: string[];          // master list of options for pill retention
}

export interface CategoryTemplate {
  id: string;                    // e.g., 'tshirt', 'mug', 'hoodie'
  name: string;                  // e.g., 'T-Shirt'
  icon: string;                  // e.g., 'FaTshirt'
  attributes: AttributeDefinition[];
  printAreas: Omit<PrintArea, 'mockupUrl'>[];
  defaultWeight: number;         // grams
  defaultDimensions?: { length: number; width: number; height: number; unit: 'cm' | 'in' };
  seoTemplate: { title: string; description: string };
  supportedCustomization: {
    allowImageUpload: boolean;
    allowTextPrinting: boolean;
    maxUploadSizeBytes: number;
    acceptedFileTypes: string[];
  };
  requiredImages: string[];      // e.g., ['front', 'back']
  // Future-ready
  pricingRules?: { baseCost: number; printCostPerArea: number };
}

// ============================================================
// PRODUCT IMAGE — Advanced media management
// ============================================================
export interface ProductImage {
  id: string;              // unique local ID for drag/drop
  storagePath: string;     // URL or GS path (empty if pending upload)
  file?: File;             // Pending upload file object (local only)
  previewUrl?: string;     // Local blob URL for preview (local only)
  type: string;            // 'front', 'back', 'detail', 'lifestyle', etc.
  altText?: string;        // SEO alt text
  isPrimary?: boolean;     // Is this the main image for the product/variant?
}

// ============================================================
// PRODUCT — Core product document
// ============================================================
export interface Product {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  brand: string;
  basePrice: number;
  compareAtPrice?: number;
  costPrice?: number;
  gstPercent?: number;
  shortDescription: string;
  description: string;
  features: string[];
  specifications: { key: string; value: string }[];
  // Customization
  isCustomizable: boolean;
  allowImageUpload: boolean;
  allowTextPrinting: boolean;
  printingLocations: string[];   // Legacy
  printAreas: PrintArea[];       // Legacy
  mockupSets: MockupSet[];       // Milestone 3
  maxUploadSizeBytes: number;
  acceptedFileTypes: string[];
  // Metadata
  tags: string[];
  seoMeta: { title: string; description: string };
  featured: boolean;
  isActive: boolean;
  trackInventory: boolean;
  images: ProductImage[];
  productionDays?: number;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

// ============================================================
// VARIANT — Individual purchasable SKU
// ============================================================
export interface Variant {
  id: string;
  sku: string;
  barcode?: string;
  attributes: Record<string, string>;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  gstPercent?: number;
  bulkPricing: { minQty: number; price: number }[];
  stock: number;
  weightGrams: number;
  dimensions?: { length: number; width: number; height: number; unit: 'cm' | 'in' };
  images: ProductImage[];
  isActive: boolean;
  isFeatured?: boolean;
  isDefault?: boolean;
  productionDays?: number;
}

// ============================================================
// ARTWORK
// ============================================================
export interface Artwork {
  id: string;
  uploaderId: string;
  storagePath: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  status: 'pending_scan' | 'approved' | 'rejected';
  createdAt: Timestamp | Date | string | null;
}

// ============================================================
// CART
// ============================================================
export interface Cart {
  id: string;
  userId: string | null;
  items: CartItem[];
  updatedAt: Timestamp | Date | string | null;
}

export interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
  customization?: {
    artworkId?: string;
    placement?: string;
    customText?: string;
    textFont?: string;
    textColor?: string;
  };
}

// ============================================================
// USER & ADDRESS
// ============================================================
export interface User {
  uid: string;
  email: string;
  displayName: string;
  phone: string;
  role: 'customer' | 'admin';
  createdAt: Timestamp | Date | string | null;
}

export interface Address {
  id: string;
  isDefault: boolean;
  name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  gstNumber?: string;
}

// ============================================================
// ORDER
// ============================================================
export interface OrderItem {
  productId: string;
  variantId: string;
  sku: string;
  name: string;
  image: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customization?: {
    artworkStoragePath?: string;
    artworkUrl?: string;
    placement?: string;
    customText?: string;
    textFont?: string;
    textColor?: string;
    localFileId?: string;
  };
  customizations?: Record<string, {
    type?: string;
    placement?: string;
    customText?: string;
    textFont?: string;
    textColor?: string;
    isBold?: boolean;
    isItalic?: boolean;
    artworkStoragePath?: string;
    artworkUrl?: string;
    localFileId?: string;
  }>;
}

export type OrderStatus = 'placed' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Order {
  id: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: Address;
  billingAddress?: Address;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  appliedCoupon?: {
    code: string;
    discountType: 'percentage' | 'flat';
    discountValue: number;
    discountAmount: number;
  };
  taxableAmount: number;
  gstAmount: number;
  shippingFee: number;
  grandTotal: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  transactionId?: string;
  invoiceId?: string;
  notes?: string;
  estimatedDeliveryDate?: FirestoreTimestamp;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

// ============================================================
// COUPON
// ============================================================
export interface Coupon {
  id: string;
  code: string;
  normalizedCode: string;
  type: 'percentage' | 'flat';
  value: number;
  minimumOrderValue?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  expiresAt?: FirestoreTimestamp;
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

// ============================================================
// SHIPPING & TIMELINE
// ============================================================
export interface ShippingRule {
  id: string;
  name: string;
  type: 'flat_rate' | 'free_shipping' | 'weight_based' | 'pincode_based';
  cost: number;
  freeShippingThreshold?: number;
  isActive: boolean;
}

export interface TimelineEvent {
  id: string;
  status: 'Pending' | 'Artwork Approved' | 'Printing' | 'Quality Check' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled';
  message: string;
  createdAt: FirestoreTimestamp;
  updatedBy: string;
}

// ============================================================
// PRODUCT STUDIO — Wizard State
// ============================================================
export interface ProductStudioState {
  step: number;
  selectedTemplate: string;
  product: Partial<Product>;
  variants: Variant[];
  attributeDefinitions: AttributeDefinition[];
  mockupSets: MockupSet[]; // Studio draft state tracking
  lastSaved: string | null;
}
