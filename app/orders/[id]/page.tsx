'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { Order, TimelineEvent } from '@/lib/types/schema';
import { FiArrowLeft, FiPackage, FiTruck, FiCheckCircle, FiClock, FiCreditCard, FiMapPin, FiXCircle } from 'react-icons/fi';
import Link from 'next/link';
import styles from './page.module.css';

export default function OrderDetailsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user || !orderId) return;

    const fetchOrderDetails = async () => {
      setFetching(true);
      try {
        const orderRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);
        
        if (orderSnap.exists()) {
          const orderData = { id: orderSnap.id, ...orderSnap.data() } as Order;
          
          // Verify ownership
          if (orderData.customerId !== user.uid) {
            router.push('/orders');
            return;
          }
          
          setOrder(orderData);

          // Fetch Timeline
          const timelineRef = collection(db, `orders/${orderId}/timeline`);
          const timelineQuery = query(timelineRef, orderBy('createdAt', 'desc'));
          const timelineSnap = await getDocs(timelineQuery);
          const timelineData = timelineSnap.docs.map(d => ({ id: d.id, ...d.data() } as TimelineEvent));
          setTimeline(timelineData);
        } else {
          router.push('/orders');
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
      }
      setFetching(false);
    };

    fetchOrderDetails();
  }, [user, orderId, router]);

  if (isLoading || fetching) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'placed':
        return { icon: <FiClock />, color: '#3b82f6', bg: '#eff6ff', label: 'Placed' };
      case 'confirmed':
        return { icon: <FiCheckCircle />, color: '#10b981', bg: '#ecfdf5', label: 'Confirmed' };
      case 'processing':
        return { icon: <FiPackage />, color: '#f59e0b', bg: '#fffbeb', label: 'Processing' };
      case 'shipped':
        return { icon: <FiTruck />, color: '#8b5cf6', bg: '#f5f3ff', label: 'Shipped' };
      case 'delivered':
        return { icon: <FiCheckCircle />, color: '#059669', bg: '#d1fae5', label: 'Delivered' };
      case 'cancelled':
        return { icon: <FiXCircle />, color: '#ef4444', bg: '#fef2f2', label: 'Cancelled' };
      default:
        return { icon: <FiClock />, color: '#64748b', bg: '#f8fafc', label: status };
    }
  };

  const currentStatusConfig = getStatusConfig(order.status);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <Link href="/orders" className={styles.backLink}>
          <FiArrowLeft /> Back to Orders
        </Link>

        <div className={styles.headerCard}>
          <div className={styles.headerInfo}>
            <h1 className={styles.orderTitle}>Order #{order.id.slice(0, 8).toUpperCase()}</h1>
            <p className={styles.orderDate}>Placed on {formatDate(order.createdAt)}</p>
          </div>
          <div 
            className={styles.mainStatusBadge}
            style={{ color: currentStatusConfig.color, backgroundColor: currentStatusConfig.bg }}
          >
            {currentStatusConfig.icon}
            <span>{currentStatusConfig.label}</span>
          </div>
        </div>

        <div className={styles.gridContainer}>
          {/* Left Column: Timeline & Items */}
          <div className={styles.mainColumn}>
            
            {/* Timeline */}
            <div className={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
                <h2 className={styles.cardTitle} style={{ borderBottom: 'none', margin: 0, padding: 0 }}>Order Status Updates</h2>
                {order.estimatedDeliveryDate && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Est. Delivery: <strong>{formatDate(order.estimatedDeliveryDate).split(',')[0]}</strong>
                  </div>
                )}
              </div>
              <div className={styles.timeline}>
                {timeline.length === 0 ? (
                  <p className={styles.emptyText}>No status updates yet.</p>
                ) : (
                  timeline.map((event, index) => (
                    <div key={event.id} className={styles.timelineEvent}>
                      <div className={styles.timelineLine} style={{ display: index === timeline.length - 1 ? 'none' : 'block' }} />
                      <div className={styles.timelineDot} style={{ background: index === 0 ? 'var(--primary-orange)' : '#e5e7eb' }} />
                      <div className={styles.timelineContent}>
                        <h3 style={{ color: index === 0 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                          {event.status}
                        </h3>
                        <p>{event.message}</p>
                        <span className={styles.timelineDate}>{formatDate(event.createdAt)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Items */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Items Ordered</h2>
              <div className={styles.itemList}>
                {order.items.map((item, idx) => (
                  <div key={idx} className={styles.itemRow}>
                    <div className={styles.itemImage}>
                      <img src={item.image || '/placeholder.png'} alt={item.name} />
                      <span className={styles.itemQtyBadge}>{item.quantity}</span>
                    </div>
                    <div className={styles.itemDetails}>
                      <h3>{item.name}</h3>
                      <p className={styles.itemSku}>{item.sku}</p>
                      {item.customization?.artworkUrl && (
                        <p className={styles.customBadge}><FiCheckCircle size={12} /> Custom Artwork</p>
                      )}
                    </div>
                    <div className={styles.itemPrice}>
                      ₹{(item.unitPrice * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>

          {/* Right Column: Summary, Payment, Shipping */}
          <div className={styles.sideColumn}>
            
            {/* Price Summary */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Payment Summary</h2>
              <div className={styles.summaryList}>
                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span>₹{order.subtotal.toLocaleString()}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className={`${styles.summaryRow} ${styles.discountText}`}>
                    <span>Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                    <span>- ₹{order.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className={styles.summaryRow}>
                  <span>Shipping</span>
                  <span>{order.shippingFee === 0 ? <span className={styles.freeText}>FREE</span> : `₹${order.shippingFee}`}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>GST (18%)</span>
                  <span>₹{order.gstAmount.toLocaleString()}</span>
                </div>
                <div className={styles.summaryDivider} />
                <div className={styles.grandTotalRow}>
                  <span>Total Paid</span>
                  <span>₹{order.grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Payment Method</h2>
              <div className={styles.infoBlock}>
                <FiCreditCard className={styles.infoIcon} />
                <div>
                  <p className={styles.infoMain}>{order.paymentMethod}</p>
                  <p className={styles.infoSub}>
                    Status: <strong style={{ textTransform: 'capitalize', color: order.paymentStatus === 'paid' ? '#10b981' : order.paymentStatus === 'failed' ? '#ef4444' : 'var(--text-secondary)' }}>{order.paymentStatus}</strong>
                  </p>
                  {order.paymentId && <p className={styles.infoSub}>ID: {order.paymentId}</p>}
                </div>
              </div>
            </div>

            {/* Shipping Info */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Shipping Address</h2>
              <div className={styles.infoBlock}>
                <FiMapPin className={styles.infoIcon} />
                <div>
                  <p className={styles.infoMain}>{order.shippingAddress.name}</p>
                  <p className={styles.infoSub}>{order.shippingAddress.line1}</p>
                  {order.shippingAddress.line2 && <p className={styles.infoSub}>{order.shippingAddress.line2}</p>}
                  <p className={styles.infoSub}>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                  <p className={styles.infoSub} style={{ marginTop: '4px' }}>{order.shippingAddress.phone}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
