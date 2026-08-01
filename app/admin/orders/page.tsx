'use client';

import React, { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingOrder, setViewingOrder] = useState<any>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Fetch orders sorted by newest first
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    }
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { orderStatus: newStatus });
      setOrders(orders.map(o => o.id === orderId ? { ...o, orderStatus: newStatus } : o));
      toast.success(`Order status updated to ${newStatus}`);
      if (viewingOrder && viewingOrder.id === orderId) {
        setViewingOrder({ ...viewingOrder, orderStatus: newStatus });
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update status');
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    // Handle Firestore Timestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1>Orders</h1>
        <p>Manage and track customer orders</p>
      </div>
      
      <div className={styles.tableContainer}>
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
            ) : orders.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>No orders found.</td></tr>
            ) : (
              orders.map(order => (
                <tr key={order.id}>
                  <td style={{ fontFamily: 'monospace' }}>{order.id.slice(0, 8).toUpperCase()}</td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>
                    <div>{order.customer?.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{order.customer?.phone}</div>
                  </td>
                  <td style={{ fontWeight: 600 }}>₹{order.totalPrice?.toLocaleString()}</td>
                  <td>
                    <span className={styles.badge} style={{ 
                      background: order.paymentStatus === 'Paid' ? '#dcfce7' : '#fef9c3', 
                      color: order.paymentStatus === 'Paid' ? '#166534' : '#854d0e' 
                    }}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <select 
                      value={order.orderStatus}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td><button className={styles.actionBtn} onClick={() => setViewingOrder(order)}>View Details</button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {viewingOrder && (
        <div className={styles.modalOverlay} onClick={() => setViewingOrder(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className={styles.modalHeader}>
              <h2>Order Details: {viewingOrder.id.toUpperCase()}</h2>
              <button className={styles.closeBtn} onClick={() => setViewingOrder(null)}>×</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>Customer Info</h3>
                <p><strong>Name:</strong> {viewingOrder.customer?.name}</p>
                <p><strong>Phone:</strong> {viewingOrder.customer?.phone}</p>
                <p><strong>Email:</strong> {viewingOrder.customer?.email || 'N/A'}</p>
                
                <h3 style={{ fontSize: '1rem', margin: '16px 0 8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>Delivery Address</h3>
                <p>{viewingOrder.address?.line1}</p>
                {viewingOrder.address?.line2 && <p>{viewingOrder.address.line2}</p>}
                {viewingOrder.address?.landmark && <p>Landmark: {viewingOrder.address.landmark}</p>}
                <p>{viewingOrder.address?.city} - {viewingOrder.address?.pincode}</p>
              </div>

              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>Order Info</h3>
                <p><strong>Date:</strong> {formatDate(viewingOrder.createdAt)}</p>
                <p><strong>Payment Method:</strong> {viewingOrder.paymentMethod}</p>
                <p><strong>Payment Status:</strong> {viewingOrder.paymentStatus}</p>
                {viewingOrder.paymentId && <p><strong>Payment ID:</strong> {viewingOrder.paymentId}</p>}
                <p>
                  <strong>Order Status:</strong> 
                  <select 
                    value={viewingOrder.orderStatus}
                    onChange={(e) => updateOrderStatus(viewingOrder.id, e.target.value)}
                    style={{ marginLeft: '8px', padding: '4px', borderRadius: '4px' }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </p>
                {viewingOrder.notes && (
                  <div style={{ marginTop: '12px', padding: '12px', background: '#f8fafc', borderRadius: '4px' }}>
                    <strong>Customer Notes:</strong><br/>
                    {viewingOrder.notes}
                  </div>
                )}
              </div>
            </div>

            <h3 style={{ fontSize: '1rem', marginBottom: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>Order Items</h3>
            <div style={{ background: '#f8fafc', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
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
                  {viewingOrder.items?.map((item: any, i: number) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {item.image && <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />}
                        {item.name}
                      </td>
                      <td style={{ padding: '12px' }}>₹{item.price}</td>
                      <td style={{ padding: '12px' }}>{item.quantity}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 500 }}>₹{item.price * item.quantity}</td>
                    </tr>
                  ))}
                  <tr style={{ background: '#f1f5f9' }}>
                    <td colSpan={3} style={{ padding: '16px 12px', textAlign: 'right', fontWeight: 600 }}>Total Paid:</td>
                    <td style={{ padding: '16px 12px', textAlign: 'right', fontWeight: 700, fontSize: '1.1rem', color: '#c5a55a' }}>
                      ₹{viewingOrder.totalPrice?.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className={styles.modalFooter} style={{ marginTop: '24px' }}>
              <button className={styles.primaryBtn} onClick={() => setViewingOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
