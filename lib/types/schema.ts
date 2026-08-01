import { Timestamp, FieldValue } from 'firebase/firestore';

export type FirestoreTimestamp = Timestamp | FieldValue | Date | string | null;

export interface Product {
  id: string; // Firestore Document ID
  slug: string;
  name: string;
  categoryId: string;
  brand: string;
  basePrice: number;
  shortDescription: string;
  description: string;
  features: string[]; // e.g., ["100% Cotton", "Pre-shrunk"]
  specifications: { key: string; value: string }[];
  isCustomizable: boolean;
  allowImageUpload: boolean;
  allowTextPrinting: boolean;
  printingLocations: string[]; // e.g., ["Front", "Back", "Left Sleeve"]
  maxUploadSizeBytes: number;
  acceptedFileTypes: string[]; // e.g., ["image/png", "image/jpeg", "image/svg+xml"]
  tags: string[];
  seoMeta: { title: string; description: string };
  featured: boolean;
  isActive: boolean;
  trackInventory: boolean;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

export interface Variant {
  id: string; // Firestore Document ID
  sku: string; // UNIQUE identifier (e.g., TS-WHT-XL)
  attributes: Record<string, string>; // Dynamic mapping e.g., { "Color": "White", "Size": "XL", "Material": "Cotton" }
  price: number;
  compareAtPrice?: number;
  bulkPricing: { minQty: number; price: number }[];
  stock: number;
  weightGrams: number;
  dimensions?: { length: number; width: number; height: number; unit: 'cm' | 'in' };
  images: { storagePath: string; type: 'front' | 'back' | 'side' | 'lifestyle' | 'gallery' }[];
  isActive: boolean;
}

export interface Artwork {
  id: string; // Firestore Document ID
  uploaderId: string; // UID or Session ID
  storagePath: string; // e.g., private/artworks/UID/123.png
  filename: string;
  contentType: string;
  sizeBytes: number;
  status: 'pending_scan' | 'approved' | 'rejected'; // For future automated moderation
  createdAt: Timestamp | Date | string | null;
}

export interface Cart {
  id: string; // UID (if logged in) or Session ID (guest)
  userId: string | null;
  items: CartItem[];
  updatedAt: Timestamp | Date | string | null;
}

export interface CartItem {
  productId: string;
  variantId: string; // specific SKU chosen
  quantity: number;
  // Customization Data
  customization?: {
    artworkId?: string; // Reference to artworks collection
    placement?: string; // e.g., "Front Center"
    customText?: string;
    textFont?: string;
    textColor?: string;
  };
}

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

export interface OrderItem {
  productId: string;
  variantId: string;
  sku: string;
  name: string;
  image: string; // The specific variant image used
  quantity: number;
  unitPrice: number; // The price paid per unit AFTER bulk discount but BEFORE coupon/GST
  totalPrice: number;
  customization?: {
    artworkStoragePath?: string;
    artworkUrl?: string;
    placement?: string;
    customText?: string;
    textFont?: string;
    textColor?: string;
  };
}

export interface Order {
  id: string;
  customerId: string; // UID or "guest_sessionId"
  customerEmail: string;
  shippingAddress: Address; // Frozen snapshot
  billingAddress?: Address;
  items: OrderItem[]; // Immutable snapshot of products bought
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  taxableAmount: number;
  gstAmount: number; // For CGST/SGST/IGST breakdown in future
  shippingFee: number;
  grandTotal: number;
  status: 'pending_payment' | 'processing' | 'printing' | 'qc' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  paymentId?: string; // Razorpay Order ID
  transactionId?: string; // Razorpay Payment ID
  invoiceId?: string;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

export interface Coupon {
  id: string; // Document ID (usually the code itself, uppercase)
  code: string;
  type: 'percentage' | 'flat';
  value: number; // e.g., 10 (for 10%) or 500 (for ₹500)
  minOrderValue?: number;
  maxDiscountCap?: number;
  expiryDate?: FirestoreTimestamp;
  usageLimit?: number; // Total times this can be used globally
  timesUsed: number;
  perUserLimit?: number; // How many times a single UID can use this
  allowedCategories?: string[]; // If empty, applies to all
  allowedProducts?: string[]; // If empty, applies to all
  firstOrderOnly: boolean;
  isActive: boolean;
}

export interface ShippingRule {
  id: string;
  name: string;
  type: 'flat_rate' | 'free_shipping' | 'weight_based' | 'pincode_based';
  cost: number;
  freeShippingThreshold?: number; // e.g. Free shipping above ₹1000
  isActive: boolean;
}

export interface TimelineEvent {
  id: string;
  status: 'Pending' | 'Artwork Approved' | 'Printing' | 'Quality Check' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled';
  message: string; // Customer-facing note
  createdAt: FirestoreTimestamp;
  updatedBy: string; // Admin UID or "System"
}
