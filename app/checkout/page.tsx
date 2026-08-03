'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/context/CartContext';
import { useAuth } from '@/lib/context/AuthContext';
import { FiArrowLeft, FiCheck, FiLock, FiGift, FiCreditCard, FiTruck } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, setDoc, getDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import emailjs from '@emailjs/browser';
import styles from './page.module.css';

import { Order, OrderItem, Coupon, ShippingRule } from '@/lib/types/schema';
import { calculateLineItemPrice, calculateOrderTotals, PricingSummary } from '@/lib/utils/pricingEngine';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const { items, clearCart, isLoading: cartLoading } = useCart();
  const { user, profile } = useAuth();
  
  // Pricing State
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [pricing, setPricing] = useState<PricingSummary | null>(null);
  const [calculating, setCalculating] = useState(true);

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');

  // Shipping State (Placeholder for now, flat rate hardcoded or fetched)
  const [activeShipping, setActiveShipping] = useState<ShippingRule | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', 
    addressLine1: '', addressLine2: '', landmark: '',
    city: '', state: 'Maharashtra', pincode: '', notes: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay'>('razorpay');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Prefill form from auth profile
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || profile.displayName || '',
        email: prev.email || profile.email || '',
        phone: prev.phone || profile.phone || '',
      }));
      // Auto-fill from default address if available
      const defaultAddr = (profile.addresses || []).find(a => a.isDefault);
      if (defaultAddr) {
        setFormData(prev => {
          // Only overwrite if the fields are currently empty to not destroy user input
          return {
            ...prev,
            name: prev.name || defaultAddr.fullName || profile.displayName || '',
            phone: prev.phone || defaultAddr.phone || profile.phone || '',
            addressLine1: prev.addressLine1 || defaultAddr.addressLine1 || '',
            addressLine2: prev.addressLine2 || defaultAddr.addressLine2 || '',
            city: prev.city || defaultAddr.city || '',
            state: prev.state || defaultAddr.state || 'Maharashtra',
            pincode: prev.pincode || defaultAddr.pincode || '',
          };
        });
      }
    }
  }, [profile]);
  const [processing, setProcessing] = useState(false);

  // 1. Hydrate Cart with Firestore Data & Calculate Pricing
  useEffect(() => {
    if (cartLoading) return;
    
    if (items.length === 0) {
      setOrderItems([]);
      setPricing(null);
      setCalculating(false);
      return;
    }

    const hydrateCart = async () => {
      setCalculating(true);
      try {
        const hydratedItems: OrderItem[] = [];
        
        for (const item of items) {
          const targetProdId = item.productId || item.id;
          const targetVarId = item.variantId;

          let hydratedItem: OrderItem | null = null;

          if (targetProdId && targetVarId && targetVarId !== 'default') {
            try {
              const productRef = doc(db, 'products', targetProdId);
              const productSnap = await getDoc(productRef);
              
              const variantRef = doc(db, `products/${targetProdId}/variants`, targetVarId);
              const variantSnap = await getDoc(variantRef);

              if (productSnap.exists() && variantSnap.exists()) {
                hydratedItem = calculateLineItemPrice(
                  item, 
                  { ...variantSnap.data(), id: variantSnap.id }, 
                  { ...productSnap.data(), id: productSnap.id }
                );
              }
            } catch (err) {
              console.warn('Could not fetch variant from Firestore, using cart item data', err);
            }
          }

          // Fallback for legacy items or products without separate Firestore variant docs
          if (!hydratedItem) {
            const price = item.price || 0;
            const qty = item.quantity || 1;
            hydratedItem = {
              productId: targetProdId || 'legacy',
              variantId: targetVarId || 'default',
              sku: item.sku || 'ITEM',
              name: item.name || 'Product',
              image: item.image || '',
              quantity: qty,
              unitPrice: price,
              totalPrice: price * qty,
              customization: item.customization
            };
          }

          hydratedItems.push(hydratedItem);
        }

        setOrderItems(hydratedItems);

      } catch (err) {
        console.error('Error hydrating cart', err);
        toast.error('Failed to calculate pricing. Please try again.');
      }
    };

    hydrateCart();
  }, [items, cartLoading]);

  // 2. Re-calculate totals whenever items, coupon, or shipping changes
  useEffect(() => {
    if (orderItems.length > 0) {
      const summary = calculateOrderTotals(orderItems, activeCoupon, activeShipping);
      setPricing(summary);
      setCalculating(false);
    }
  }, [orderItems, activeCoupon, activeShipping]);

  // Handle Input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Coupon Logic
  const applyCoupon = async () => {
    if (!couponCode) return;
    setCouponError('');
    try {
      const q = query(collection(db, 'coupons'), where('code', '==', couponCode.toUpperCase()), where('isActive', '==', true));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        setCouponError('Invalid or expired coupon code.');
        setActiveCoupon(null);
        return;
      }
      
      const couponDoc = snap.docs[0];
      const coupon = { ...couponDoc.data(), id: couponDoc.id } as Coupon;
      
      // Basic validations
      if (coupon.minOrderValue && pricing && (pricing.subtotal < coupon.minOrderValue)) {
        setCouponError(`Minimum order value of ₹${coupon.minOrderValue} required.`);
        return;
      }
      
      setActiveCoupon(coupon);
      toast.success('Coupon applied successfully!');
    } catch (err) {
      setCouponError('Failed to verify coupon.');
    }
  };

  const removeCoupon = () => {
    setActiveCoupon(null);
    setCouponCode('');
  };

  // Save Order
  const saveOrder = async (paymentStatus: string, paymentId?: string, transactionId?: string) => {
    if (!pricing) throw new Error("Pricing not calculated");

    const orderData: Omit<Order, 'id'> = {
      customerId: user?.uid || 'guest',
      customerEmail: formData.email,
      customerName: formData.name,
      customerPhone: formData.phone,
      shippingAddress: {
        id: 'addr_' + Date.now(),
        isDefault: true,
        name: formData.name,
        phone: formData.phone,
        line1: formData.addressLine1,
        line2: formData.addressLine2,
        city: formData.city,
        state: formData.state || 'Maharashtra',
        pincode: formData.pincode,
      },
      items: orderItems,
      subtotal: pricing.subtotal,
      discountAmount: pricing.discountAmount,
      couponCode: activeCoupon?.code || undefined,
      taxableAmount: pricing.taxableAmount,
      gstAmount: pricing.gstAmount,
      shippingFee: pricing.shippingFee,
      grandTotal: pricing.grandTotal,
      status: 'placed',
      paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay',
      paymentStatus: 'pending',
      paymentId: paymentId || undefined,
      transactionId: transactionId || undefined,
      notes: formData.notes || undefined,
      estimatedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +7 days
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Sanitize to remove undefined values before Firestore write
    const sanitizedOrder = JSON.parse(JSON.stringify(orderData));
    sanitizedOrder.createdAt = serverTimestamp();
    sanitizedOrder.updatedAt = serverTimestamp();

    const orderRef = await addDoc(collection(db, 'orders'), sanitizedOrder);

    // Create initial timeline event
    await addDoc(collection(db, `orders/${orderRef.id}/timeline`), {
      status: 'Order Placed',
      message: `Order placed via ${paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}`,
      createdAt: serverTimestamp(),
      updatedBy: 'System',
    });
    
    // Update Customer Profile
    const customerRef = doc(db, 'customers', formData.phone);
    await setDoc(customerRef, {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      address: `${formData.addressLine1}, ${formData.city} - ${formData.pincode}`,
      lastOrderId: orderRef.id,
      lastOrderDate: new Date().toISOString(),
      updatedAt: serverTimestamp(),
    }, { merge: true });

    return orderRef.id;
  };

  const sendConfirmationEmail = async (orderIdStr: string, payMethodStr: string, total: number) => {
    try {
      const templateParams = {
        customer_name: formData.name,
        customer_email: formData.email,
        order_id: orderIdStr.slice(0, 8).toUpperCase(),
        payment_method: payMethodStr,
        total_amount: total.toLocaleString(),
        address: `${formData.addressLine1}${formData.addressLine2 ? ', ' + formData.addressLine2 : ''}`,
        city: formData.city,
        pincode: formData.pincode,
        admin_email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'f.sprinterstore91@gmail.com'
      };

      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        templateParams,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );
    } catch (err: any) {
      console.error("EmailJS Error:", err);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pricing || orderItems.length === 0) {
      toast.error('Cart is empty or still calculating.');
      return;
    }

    setProcessing(true);

    try {
      if (paymentMethod === 'cod') {
        const newOrderId = await saveOrder('Pending');
        // Update status to confirmed for COD
        await setDoc(doc(db, 'orders', newOrderId), { status: 'confirmed', updatedAt: serverTimestamp() }, { merge: true });
        
        await sendConfirmationEmail(newOrderId, 'Cash on Delivery', pricing.grandTotal);
        setOrderId(newOrderId);
        setOrderPlaced(true);
        clearCart();
        window.scrollTo(0, 0);
      } else {
        await initRazorpay();
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to place order. Please try again.');
    }
    setProcessing(false);
  };

  const initRazorpay = async () => {
    if (!pricing) return;
    
    // 1. Create order on backend (in production, use a Server Action to call Razorpay API)
    // We simulate creating a real order document first to reserve the ID
    const newOrderId = await saveOrder('Pending');

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: Math.round(pricing.grandTotal * 100), // in paise
      currency: "INR",
      name: "F.S Print Works",
      description: `Order ${newOrderId.slice(0, 8).toUpperCase()}`,
      image: "/logo.png",
      order_id: "", // Generate from your backend in production
      handler: async function (response: any) {
        // Success Handler
        try {
          await setDoc(doc(db, 'orders', newOrderId), { 
            status: 'confirmed',
            paymentStatus: 'paid',
            transactionId: response.razorpay_payment_id,
            paymentId: response.razorpay_order_id || 'manual_test_order',
            updatedAt: serverTimestamp()
          }, { merge: true });

          // Add payment confirmed timeline event
          await addDoc(collection(db, `orders/${newOrderId}/timeline`), {
            status: 'Payment Confirmed',
            message: `Payment received via Razorpay (${response.razorpay_payment_id})`,
            createdAt: serverTimestamp(),
            updatedBy: 'System',
          });

          await sendConfirmationEmail(newOrderId, 'Razorpay (Paid)', pricing.grandTotal);
          setOrderId(newOrderId);
          setOrderPlaced(true);
          clearCart();
          window.scrollTo(0, 0);
        } catch (err) {
          console.error(err);
          toast.error("Payment recorded but failed to update order in database.");
        }
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone,
      },
      notes: {
        firebase_order_id: newOrderId,
      },
      theme: {
        color: "#C5A55A",
      },
    };

    const rzp = new window.Razorpay(options);
    
    rzp.on('payment.failed', function (response: any){
      toast.error(`Payment Failed: ${response.error.description}`);
    });
    
    rzp.open();
  };

  if (cartLoading || calculating) {
    return <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>Calculating secure pricing...</div>;
  }

  if (orderPlaced) {
    return (
      <div className="container">
        <div className={styles.successContainer}>
          <div className={styles.successIcon}>
            <FiCheck size={48} />
          </div>
          <h1 className={styles.successTitle}>Order Placed Successfully!</h1>
          <p className={styles.successSubtitle}>
            Thank you, {formData.name}! Your order has been confirmed.
          </p>
          
          <div className={styles.orderDetails}>
            <div className={styles.orderRow}>
              <span>Order ID:</span>
              <strong>{orderId.slice(0, 8).toUpperCase()}</strong>
            </div>
            <div className={styles.orderRow}>
              <span>Amount Paid:</span>
              <strong>₹{pricing?.grandTotal.toLocaleString()}</strong>
            </div>
            <div className={styles.orderRow}>
              <span>Payment Method:</span>
              <strong>{paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</strong>
            </div>
            <div className={styles.orderRow}>
              <span>Expected Delivery:</span>
              <strong>5-7 Business Days</strong>
            </div>
          </div>

          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            We've sent a confirmation email to <strong>{formData.email}</strong>.
          </p>

          <div className={styles.successActions}>
            <Link href="/shop" className="btn btn-primary">
              Continue Shopping
            </Link>
            <a href="https://wa.me/918369324632" target="_blank" rel="noreferrer" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaWhatsapp /> Contact Support
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (orderItems.length === 0) {
    return (
      <div className="container">
        <div className={styles.emptyCart}>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any products to your cart yet.</p>
          <Link href="/shop" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Browse Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <Link href="/cart" className={styles.backLink}>
        <FiArrowLeft /> Back to Cart
      </Link>

      <div className={styles.checkoutLayout}>
        {/* Left Column: Form */}
        <div className={styles.formSection}>
          <div className={styles.formHeader}>
            <h1 className={styles.pageTitle}>Checkout</h1>
            <div className={styles.secureBadge}>
              <FiLock /> Secure SSL Checkout
            </div>
          </div>

          <form id="checkout-form" onSubmit={handleCheckout}>
            
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Contact Information</h2>
              <div className={styles.inputGrid}>
                <div className={styles.inputGroup}>
                  <label>Full Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className={styles.inputGroup}>
                  <label>Phone Number *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required pattern="[0-9]{10}" title="10 digit mobile number" />
                </div>
                <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                  <label>Email Address *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Shipping Address</h2>
              <div className={styles.inputGrid}>
                <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                  <label>Flat, House no., Building, Company, Apartment *</label>
                  <input type="text" name="addressLine1" value={formData.addressLine1} onChange={handleChange} required />
                </div>
                <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                  <label>Area, Street, Sector, Village</label>
                  <input type="text" name="addressLine2" value={formData.addressLine2} onChange={handleChange} />
                </div>
                <div className={styles.inputGroup}>
                  <label>Landmark</label>
                  <input type="text" name="landmark" value={formData.landmark} onChange={handleChange} />
                </div>
                <div className={styles.inputGroup}>
                  <label>Town/City *</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} required />
                </div>
                <div className={styles.inputGroup}>
                  <label>Pincode *</label>
                  <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} required pattern="[0-9]{6}" title="6 digit pincode" />
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Payment Method</h2>
              <div className={styles.paymentMethods}>
                
                <label className={`${styles.paymentOption} ${paymentMethod === 'razorpay' ? styles.active : ''}`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    checked={paymentMethod === 'razorpay'} 
                    onChange={() => setPaymentMethod('razorpay')}
                  />
                  <div className={styles.paymentOptionContent}>
                    <span className={styles.paymentOptionTitle}><FiCreditCard /> UPI / Cards / NetBanking</span>
                    <span className={styles.paymentOptionDesc}>Securely pay online via Razorpay</span>
                  </div>
                </label>

                <label className={`${styles.paymentOption} ${paymentMethod === 'cod' ? styles.active : ''}`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    checked={paymentMethod === 'cod'} 
                    onChange={() => setPaymentMethod('cod')}
                  />
                  <div className={styles.paymentOptionContent}>
                    <span className={styles.paymentOptionTitle}><FiTruck /> Cash on Delivery (COD)</span>
                    <span className={styles.paymentOptionDesc}>Pay when you receive the product</span>
                  </div>
                </label>

              </div>
            </div>

          </form>
        </div>

        {/* Right Column: Order Summary */}
        <div className={styles.summarySection}>
          <div className={styles.summaryCard}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>
            
            <div className={styles.itemList}>
              {orderItems.map((item) => (
                <div key={`${item.variantId}_${item.customization?.artworkStoragePath || ''}`} className={styles.summaryItem}>
                  <div className={styles.itemImage}>
                    <img src={item.image || '/images/placeholder.jpg'} alt={item.name} />
                    <span className={styles.itemBadge}>{item.quantity}</span>
                  </div>
                  <div className={styles.itemDetails}>
                    <div className={styles.itemName}>{item.name}</div>
                    <div className={styles.itemCategory}>{item.sku}</div>
                    
                    {item.customization?.artworkUrl && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--primary-gold)', marginTop: '0.25rem' }}>
                        <FiCheck size={10} /> Custom Artwork Attached
                      </div>
                    )}

                  </div>
                  <div className={styles.itemPrice}>
                    ₹{(item.unitPrice * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Section */}
            <div className={styles.couponSection}>
              {!activeCoupon ? (
                <div className={styles.couponInputGroup}>
                  <input 
                    type="text" 
                    placeholder="Discount code" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  />
                  <button type="button" onClick={applyCoupon} className="btn btn-secondary">Apply</button>
                </div>
              ) : (
                <div className={styles.activeCouponBox}>
                  <div>
                    <FiGift color="var(--primary-gold)" />
                    <strong>{activeCoupon.code}</strong> applied
                  </div>
                  <button type="button" onClick={removeCoupon} className={styles.removeCouponBtn}>Remove</button>
                </div>
              )}
              {couponError && <div className={styles.couponError}>{couponError}</div>}
            </div>

            <div className={styles.totalsList}>
              <div className={styles.totalRow}>
                <span>Subtotal</span>
                <span>₹{pricing?.subtotal.toLocaleString()}</span>
              </div>
              
              {pricing?.discountAmount ? (
                <div className={`${styles.totalRow} ${styles.discountRow}`}>
                  <span>Discount</span>
                  <span>- ₹{pricing.discountAmount.toLocaleString()}</span>
                </div>
              ) : null}

              <div className={styles.totalRow}>
                <span>Shipping</span>
                <span>{pricing?.shippingFee === 0 ? <span style={{ color: '#34c759' }}>FREE</span> : `₹${pricing?.shippingFee}`}</span>
              </div>

              <div className={styles.totalRow}>
                <span>GST (18%)</span>
                <span>₹{pricing?.gstAmount.toLocaleString()}</span>
              </div>
              
              <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                <span>Total</span>
                <span>₹{pricing?.grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <button 
              type="submit" 
              form="checkout-form"
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '1.5rem', padding: '1rem', fontSize: '1.1rem' }}
              disabled={processing}
            >
              {processing ? 'Processing...' : paymentMethod === 'cod' ? 'Place Order (COD)' : `Pay ₹${pricing?.grandTotal.toLocaleString()}`}
            </button>
            
            <p className={styles.termsText}>
              By placing your order, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
