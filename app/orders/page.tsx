'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { Order } from '@/lib/types/schema';
import { FiPackage, FiChevronRight, FiClock, FiCheckCircle, FiTruck, FiXCircle } from 'react-icons/fi';
import Link from 'next/link';
import styles from './page.module.css';

export default function OrdersPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    
    const fetchOrders = async () => {
      setFetching(true);
      try {
        const q = query(
          collection(db, 'orders'),
          where('customerId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        setOrders(ordersData);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
      setFetching(false);
    };

    fetchOrders();
  }, [user]);

  if (isLoading || fetching) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

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

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>My Orders</h1>
          <p className={styles.pageSubtitle}>View and track your recent orders</p>
        </div>

        {orders.length === 0 ? (
          <div className={styles.emptyState}>
            <FiPackage size={48} />
            <h2>No orders yet</h2>
            <p>When you place an order, it will appear here.</p>
            <Link href="/shop" className={styles.shopBtn}>
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className={styles.orderList}>
            {orders.map(order => {
              const statusConfig = getStatusConfig(order.status);
              
              return (
                <Link href={`/orders/${order.id}`} key={order.id} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <div>
                      <span className={styles.orderId}>Order #{order.id.slice(0, 8).toUpperCase()}</span>
                      <span className={styles.orderDate}>{formatDate(order.createdAt)}</span>
                    </div>
                    <div 
                      className={styles.statusBadge} 
                      style={{ color: statusConfig.color, backgroundColor: statusConfig.bg }}
                    >
                      {statusConfig.icon}
                      {statusConfig.label}
                    </div>
                  </div>
                  
                  <div className={styles.orderItems}>
                    {/* Show up to 3 item images */}
                    <div className={styles.itemImages}>
                      {order.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className={styles.itemImageWrapper}>
                          <img src={item.image || '/placeholder.png'} alt={item.name} />
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className={styles.moreItemsBadge}>
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                    
                    <div className={styles.orderSummary}>
                      <div className={styles.itemCount}>
                        {order.items.length} {order.items.length === 1 ? 'Item' : 'Items'}
                      </div>
                      <div className={styles.orderTotal}>
                        ₹{order.grandTotal.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.orderFooter}>
                    <span className={styles.viewDetailsText}>View Order Details</span>
                    <FiChevronRight size={18} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
