import { CartItem, Coupon, ShippingRule, OrderItem } from '../types/schema';

// This function processes a raw CartItem (which only has references and quantity) 
// and maps it to a frozen OrderItem with accurate pricing based on bulk rules.
export const calculateLineItemPrice = (
  cartItem: CartItem, 
  variantData: any, // Raw Variant document from Firestore
  productData: any  // Raw Product document from Firestore
): OrderItem => {
  
  const basePrice = variantData.price || productData.basePrice || 0;
  let unitPrice = basePrice;

  // Apply Bulk Pricing if applicable
  if (variantData.bulkPricing && variantData.bulkPricing.length > 0) {
    // Sort bulk tiers by minQty descending so we hit the highest applicable tier first
    const sortedTiers = [...variantData.bulkPricing].sort((a, b) => b.minQty - a.minQty);
    for (const tier of sortedTiers) {
      if (cartItem.quantity >= tier.minQty) {
        unitPrice = tier.price;
        break; // Stop at the highest applicable tier
      }
    }
  }

  // Find the primary image for the Order snapshot
  let primaryImage = '';
  if (variantData.images && variantData.images.length > 0) {
    // Prefer 'front' image, otherwise take first
    const frontImg = variantData.images.find((i: any) => i.type === 'front');
    primaryImage = frontImg ? frontImg.storagePath : variantData.images[0].storagePath;
  }

  return {
    productId: productData.id,
    variantId: variantData.id,
    sku: variantData.sku,
    name: productData.name,
    image: primaryImage,
    quantity: cartItem.quantity,
    unitPrice: unitPrice,
    totalPrice: unitPrice * cartItem.quantity,
    customization: cartItem.customization
  };
};

export interface PricingSummary {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  gstAmount: number;
  shippingFee: number;
  grandTotal: number;
}

export const calculateOrderTotals = (
  orderItems: OrderItem[],
  coupon: Coupon | null,
  shippingRule: ShippingRule | null,
  gstPercentage: number = 18 // Default 18% GST for clothing/printing in India
): PricingSummary => {
  
  let subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
  let discountAmount = 0;

  // Apply Coupon Logic
  if (coupon && coupon.isActive) {
    // Check minimum order value
    if (!coupon.minOrderValue || subtotal >= coupon.minOrderValue) {
      
      // Calculate raw discount
      if (coupon.type === 'percentage') {
        discountAmount = subtotal * (coupon.value / 100);
        // Apply max cap if percentage
        if (coupon.maxDiscountCap && discountAmount > coupon.maxDiscountCap) {
          discountAmount = coupon.maxDiscountCap;
        }
      } else if (coupon.type === 'flat') {
        discountAmount = coupon.value;
      }

      // Ensure discount doesn't exceed subtotal
      if (discountAmount > subtotal) {
        discountAmount = subtotal;
      }
    }
  }

  const taxableAmount = subtotal - discountAmount;
  const gstAmount = taxableAmount * (gstPercentage / 100);

  // Apply Shipping Logic
  let shippingFee = 0;
  if (shippingRule && shippingRule.isActive) {
    if (shippingRule.type === 'flat_rate') {
      shippingFee = shippingRule.cost;
      // Check if they hit the free shipping threshold
      if (shippingRule.freeShippingThreshold && (taxableAmount + gstAmount) >= shippingRule.freeShippingThreshold) {
        shippingFee = 0;
      }
    } else if (shippingRule.type === 'free_shipping') {
      shippingFee = 0;
    }
    // weight_based and pincode_based can be implemented here later
  }

  const grandTotal = taxableAmount + gstAmount + shippingFee;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    taxableAmount: Math.round(taxableAmount * 100) / 100,
    gstAmount: Math.round(gstAmount * 100) / 100,
    shippingFee: Math.round(shippingFee * 100) / 100,
    grandTotal: Math.round(grandTotal * 100) / 100
  };
};
