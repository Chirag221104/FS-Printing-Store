'use client';

import React, { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc, query, orderBy, addDoc, serverTimestamp, limit, startAfter, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { Order, OrderStatus } from '@/lib/types/schema';
import { FiCheckCircle, FiClock, FiPackage, FiTruck, FiXCircle } from 'react-icons/fi';

const STATUS_WORKFLOW: Record<OrderStatus, OrderStatus[]> = {
  placed: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: []
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const ORDERS_PER_PAGE = 20;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(ORDERS_PER_PAGE));
      const snapshot = await getDocs(q);
      
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      
      setOrders(ordersData);
      
      if (snapshot.docs.length < ORDERS_PER_PAGE) {
        setHasMore(false);
      } else {
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(true);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    }
    setLoading(false);
  };

  const loadMoreOrders = async () => {
    if (!lastVisible || !hasMore) return;
    
    setLoadingMore(true);
    try {
      const q = query(
        collection(db, 'orders'), 
        orderBy('createdAt', 'desc'), 
        startAfter(lastVisible),
        limit(ORDERS_PER_PAGE)
      );
      const snapshot = await getDocs(q);
      
      const newOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      
      setOrders([...orders, ...newOrders]);
      
      if (snapshot.docs.length < ORDERS_PER_PAGE) {
        setHasMore(false);
      } else {
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      }
    } catch (error) {
      console.error('Error fetching more orders:', error);
      toast.error('Failed to load more orders');
    }
    setLoadingMore(false);
  };

  const isValidTransition = (currentStatus: OrderStatus, newStatus: OrderStatus) => {
    const allowedNext = STATUS_WORKFLOW[currentStatus as keyof typeof STATUS_WORKFLOW] || [];
    return allowedNext.includes(newStatus);
  };

  const updateOrderStatus = async (orderId: string, currentStatus: OrderStatus, newStatus: OrderStatus) => {
    if (currentStatus === newStatus) return;
    
    if (!isValidTransition(currentStatus, newStatus)) {
      toast.error(`Invalid transition from ${currentStatus} to ${newStatus}`);
      return;
    }

    if (!window.confirm(`Are you sure you want to change the status to ${newStatus.toUpperCase()}?`)) {
      return;
    }

    try {
      await updateDoc(doc(db, 'orders', orderId), { 
        status: newStatus,
        updatedAt: serverTimestamp() 
      });
      
      let message = `Order status updated to ${newStatus}`;
      if (newStatus === 'shipped') message = 'Your order has been shipped and is on the way.';
      if (newStatus === 'delivered') message = 'Your order has been delivered successfully.';
      if (newStatus === 'cancelled') message = 'Your order has been cancelled.';

      await addDoc(collection(db, `orders/${orderId}/timeline`), {
        status: newStatus.charAt(0).toUpperCase() + newStatus.slice(1),
        message,
        createdAt: serverTimestamp(),
        updatedBy: 'Admin',
      });

      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      toast.success(`Order status updated to ${newStatus}`);
      
      if (viewingOrder && viewingOrder.id === orderId) {
        setViewingOrder({ ...viewingOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update status');
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // Note: Client-side filtering only applies to currently loaded pages
  const filteredOrders = orders.filter(o => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      o.id.toLowerCase().includes(searchLower) ||
      o.customerName?.toLowerCase().includes(searchLower) ||
      o.customerEmail?.toLowerCase().includes(searchLower) ||
      o.customerPhone?.includes(searchLower);
    
    return matchesStatus && matchesSearch;
  });

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1>Orders</h1>
        <p>Manage and track customer orders</p>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="Search loaded orders (ID, Name, Phone)..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', flexGrow: 1, maxWidth: '400px' }}
        />
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
        >
          <option value="all">All Statuses</option>
          <option value="placed">Placed</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      
      <div className={styles.tableContainer} style={{ marginBottom: '24px' }}>
        <table className={styles.adminTable}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>Loading orders...</td></tr>
            ) : filteredOrders.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>No orders found matching criteria.</td></tr>
            ) : (
              filteredOrders.map(order => (
                <tr key={order.id}>
                  <td style={{ fontFamily: 'monospace' }}>{order.id.slice(0, 8).toUpperCase()}</td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>
                    <div>{order.customerName || 'N/A'}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{order.customerPhone || 'N/A'}</div>
                  </td>
                  <td style={{ fontWeight: 600 }}>₹{order.grandTotal?.toLocaleString()}</td>
                  <td>
                    <div style={{ fontSize: '0.9rem', color: '#333' }}>
                      {order.paymentMethod === 'Cash on Delivery' ? 'COD' : 'Online'}
                    </div>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 700, 
                      textTransform: 'uppercase',
                      color: order.paymentStatus === 'paid' ? '#10b981' : order.paymentStatus === 'failed' ? '#ef4444' : '#f59e0b'
                    }}>
                      {order.paymentStatus || 'pending'}
                    </span>
                  </td>
                  <td>
                    <select 
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, order.status, e.target.value as OrderStatus)}
                      style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', textTransform: 'capitalize' }}
                    >
                      <option value="placed">Placed</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td><button className={styles.actionBtn} onClick={() => setViewingOrder(order)}>Details</button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {hasMore && !loading && statusFilter === 'all' && searchQuery === '' && (
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <button 
            onClick={loadMoreOrders} 
            disabled={loadingMore}
            className={styles.secondaryBtn}
            style={{ padding: '10px 24px', cursor: loadingMore ? 'not-allowed' : 'pointer' }}
          >
            {loadingMore ? 'Loading...' : 'Load More Orders'}
          </button>
        </div>
      )}

      {viewingOrder && (
        <div className={styles.modalOverlay} onClick={() => setViewingOrder(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%' }}>
            <div className={styles.modalHeader}>
              <h2>Order #{viewingOrder.id.slice(0,8).toUpperCase()}</h2>
              <button className={styles.closeBtn} onClick={() => setViewingOrder(null)}>×</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>Customer Info</h3>
                <p><strong>Name:</strong> {viewingOrder.customerName}</p>
                <p><strong>Phone:</strong> {viewingOrder.customerPhone}</p>
                <p><strong>Email:</strong> {viewingOrder.customerEmail || 'N/A'}</p>
                
                <h3 style={{ fontSize: '1rem', margin: '16px 0 8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>Delivery Address</h3>
                <p>{viewingOrder.shippingAddress?.name}</p>
                <p>{viewingOrder.shippingAddress?.line1}</p>
                {viewingOrder.shippingAddress?.line2 && <p>{viewingOrder.shippingAddress.line2}</p>}
                <p>{viewingOrder.shippingAddress?.city} - {viewingOrder.shippingAddress?.pincode}</p>
                <p>{viewingOrder.shippingAddress?.state}</p>
              </div>

              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>Order Info</h3>
                <p><strong>Date:</strong> {formatDate(viewingOrder.createdAt)}</p>
                {viewingOrder.estimatedDeliveryDate && (
                  <p><strong>Est. Delivery:</strong> {formatDate(viewingOrder.estimatedDeliveryDate)}</p>
                )}
                
                <h3 style={{ fontSize: '1rem', margin: '16px 0 8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>Payment Info</h3>
                <p><strong>Method:</strong> {viewingOrder.paymentMethod}</p>
                <p>
                  <strong>Status:</strong> 
                  <span style={{ 
                    marginLeft: '8px',
                    textTransform: 'uppercase', 
                    fontWeight: 700, 
                    color: viewingOrder.paymentStatus === 'paid' ? '#10b981' : viewingOrder.paymentStatus === 'failed' ? '#ef4444' : '#f59e0b' 
                  }}>
                    {viewingOrder.paymentStatus || 'pending'}
                  </span>
                </p>
                {viewingOrder.paymentId && <p><strong>Payment ID:</strong> {viewingOrder.paymentId}</p>}
                
                <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <strong>Update Workflow:</strong> 
                  <select 
                    value={viewingOrder.status}
                    onChange={(e) => updateOrderStatus(viewingOrder.id, viewingOrder.status, e.target.value as OrderStatus)}
                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', textTransform: 'capitalize', fontWeight: 600 }}
                  >
                    <option value="placed">Placed</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {viewingOrder.notes && (
                  <div style={{ marginTop: '12px', padding: '12px', background: '#fef3c7', borderRadius: '4px', borderLeft: '4px solid #f59e0b' }}>
                    <strong>Customer Notes:</strong><br/>
                    {viewingOrder.notes}
                  </div>
                )}
              </div>
            </div>

            <h3 style={{ fontSize: '1rem', marginBottom: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>Items ({viewingOrder.items?.length || 0})</h3>
            <div style={{ background: '#f8fafc', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '12px' }}>Item</th>
                    <th style={{ padding: '12px' }}>Price</th>
                    <th style={{ padding: '12px' }}>Qty</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingOrder.items?.map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                          {item.image && <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e5e7eb' }} />}
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 500 }}>{item.name}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.sku}</div>
                            
                            {/* Legacy single customization */}
                            {item.customization?.artworkUrl && (
                              <a href={item.customization.artworkUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: '#2563eb', textDecoration: 'underline' }}>View Artwork</a>
                            )}
                            {item.customization?.customText && !item.customizations && (
                              <div style={{ marginTop: '4px', padding: '6px 8px', background: '#eff6ff', borderRadius: '4px', fontSize: '0.8rem' }}>
                                <strong>Text:</strong> "{item.customization.customText}"
                                {item.customization.textFont && <span> • Font: {item.customization.textFont}</span>}
                                {item.customization.textColor && <span> • Color: <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: item.customization.textColor, verticalAlign: 'middle', marginLeft: 2 }} /></span>}
                                {item.customization.placement && <span> • Placement: {item.customization.placement}</span>}
                              </div>
                            )}

                            {/* Multi-location customizations */}
                            {item.customizations && Object.keys(item.customizations).length > 0 && (
                              <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {Object.entries(item.customizations).map(([locId, cust]) => (
                                  <div key={locId} style={{ padding: '6px 8px', background: '#f0fdf4', borderRadius: '4px', fontSize: '0.8rem', borderLeft: '3px solid #22c55e' }}>
                                    <div style={{ fontWeight: 600, textTransform: 'capitalize', marginBottom: '2px', color: '#166534' }}>
                                      📍 {locId.replace(/_/g, ' ')} — {cust.type === 'text' ? '✏️ Text' : cust.type === 'artwork' ? '🖼️ Artwork' : cust.type || 'Custom'}
                                    </div>
                                    {cust.customText && (
                                      <div>
                                        <strong>Text:</strong> "{cust.customText}"
                                        {cust.textFont && <span> • Font: {cust.textFont}</span>}
                                        {cust.textColor && (
                                          <span> • Color: <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: cust.textColor, verticalAlign: 'middle', marginLeft: 2, border: '1px solid #ccc' }} /></span>
                                        )}
                                        {cust.isBold && <span> • <strong>Bold</strong></span>}
                                        {cust.isItalic && <span> • <em>Italic</em></span>}
                                      </div>
                                    )}
                                    {cust.placement && <div><strong>Placement:</strong> {cust.placement}</div>}
                                    {cust.artworkUrl && (
                                      <div>
                                        <a href={cust.artworkUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>
                                          📥 Download Artwork
                                        </a>
                                      </div>
                                    )}
                                    {cust.artworkStoragePath && !cust.artworkUrl && (
                                      <div style={{ color: '#64748b' }}>Artwork: {cust.artworkStoragePath}</div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>₹{item.unitPrice?.toLocaleString()}</td>
                      <td style={{ padding: '12px', fontWeight: 600 }}>x{item.quantity}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>₹{(item.unitPrice * item.quantity).toLocaleString()}</td>
                    </tr>
                  ))}
                  
                  {/* Pricing Breakdown inside table footer */}
                  <tr style={{ background: '#ffffff' }}>
                    <td colSpan={3} style={{ padding: '8px 12px', textAlign: 'right', color: '#64748b' }}>Subtotal:</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>₹{viewingOrder.subtotal?.toLocaleString()}</td>
                  </tr>
                  {viewingOrder.discountAmount > 0 && (
                    <tr style={{ background: '#ffffff' }}>
                      <td colSpan={3} style={{ padding: '8px 12px', textAlign: 'right', color: '#10b981' }}>Discount:</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', color: '#10b981' }}>-₹{viewingOrder.discountAmount?.toLocaleString()}</td>
                    </tr>
                  )}
                  <tr style={{ background: '#ffffff' }}>
                    <td colSpan={3} style={{ padding: '8px 12px', textAlign: 'right', color: '#64748b' }}>Shipping:</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>{viewingOrder.shippingFee === 0 ? 'FREE' : `₹${viewingOrder.shippingFee}`}</td>
                  </tr>
                  <tr style={{ background: '#ffffff' }}>
                    <td colSpan={3} style={{ padding: '8px 12px', textAlign: 'right', color: '#64748b' }}>GST (18%):</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>₹{viewingOrder.gstAmount?.toLocaleString()}</td>
                  </tr>
                  <tr style={{ background: '#f1f5f9' }}>
                    <td colSpan={3} style={{ padding: '16px 12px', textAlign: 'right', fontWeight: 700 }}>Grand Total:</td>
                    <td style={{ padding: '16px 12px', textAlign: 'right', fontWeight: 700, fontSize: '1.2rem', color: '#c5a55a' }}>
                      ₹{viewingOrder.grandTotal?.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className={styles.modalFooter} style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className={styles.primaryBtn} onClick={() => setViewingOrder(null)}>Close Window</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
