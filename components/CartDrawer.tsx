'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/context/CartContext';
import CustomArtworkThumbnail from './storefront/CustomArtworkThumbnail';
import { FiX, FiShoppingCart, FiMinus, FiPlus, FiTrash2, FiGift } from 'react-icons/fi';
import styles from './CartDrawer.module.css';

export default function CartDrawer() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    totalPrice,
    totalSavings,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`${styles.overlay} ${isCartOpen ? styles.overlayOpen : ''}`}
        onClick={() => setIsCartOpen(false)} 
      />

      {/* Drawer */}
      <div className={`${styles.drawer} ${isCartOpen ? styles.drawerOpen : ''}`}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.title}>
            <FiShoppingCart size={20} />
            <span>Your Cart ({items.reduce((sum, item) => sum + item.quantity, 0)})</span>
          </div>
          <button 
            className={styles.closeBtn}
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content / Items */}
        <div className={styles.body}>
          {items.length === 0 ? (
            <div className={styles.emptyCart}>
              <div className={styles.emptyIcon}><FiShoppingCart size={48} /></div>
              <h4>Your cart is empty</h4>
              <p>Looks like you haven&apos;t added anything yet</p>
              <Link
                href="/shop"
                className="btn btn-primary"
                onClick={() => setIsCartOpen(false)}
              >
                Browse Products
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                <div className={styles.itemImage}>
                  {item.customizations && Object.values(item.customizations).find(c => c.localFileId)?.localFileId ? (
                    <CustomArtworkThumbnail 
                      localFileId={Object.values(item.customizations).find(c => c.localFileId)?.localFileId}
                      fallbackImage={item.image}
                      alt="Custom Artwork"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                    />
                  ) : item.customization?.localFileId ? (
                    <CustomArtworkThumbnail 
                      localFileId={item.customization.localFileId}
                      fallbackImage={item.image}
                      alt="Custom Artwork"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                    />
                  ) : item.image ? (
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                  ) : (
                    <div className={styles.imagePlaceholder}>
                      {(item.category || item.name || 'P').charAt(0)}
                    </div>
                  )}
                </div>
                <div className={styles.itemDetails}>
                  <h4 className={styles.itemName}>{item.name}</h4>
                  {item.category && <p className={styles.itemCategory}>{item.category}</p>}
                  
                  {item.customizations ? (
                    <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px', background: '#f8fafc', padding: '6px 8px', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontWeight: 600, display: 'block', marginBottom: '2px' }}>Customizations:</span>
                      {Object.values(item.customizations).map((cust: any, i) => (
                        <div key={i} style={{ paddingLeft: '4px', borderLeft: '2px solid #e2e8f0' }}>
                          <span style={{ fontWeight: 500 }}>{cust.placement}: </span>
                          {cust.type === 'text' ? `Text ("${cust.customText}")` : 'Logo/Image'}
                        </div>
                      ))}
                    </div>
                  ) : item.customization ? (
                    <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px', background: '#f8fafc', padding: '4px 8px', borderRadius: '4px' }}>
                      <span style={{ fontWeight: 600 }}>Customized: </span>
                      {item.customization.type === 'text' ? `Text ("${item.customization.customText}")` : 'Logo/Image'}
                      {item.customization.placement && ` on ${item.customization.placement}`}
                    </div>
                  ) : null}
                  <div className={styles.itemPricing}>
                    <span className={styles.itemPrice}>₹{item.price}</span>
                  </div>
                </div>
                <div className={styles.itemActions}>
                  <div className={styles.quantityControl}>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className={styles.qtyBtn}
                      aria-label="Decrease quantity"
                    >
                      <FiMinus size={14} />
                    </button>
                    <span className={styles.qtyValue}>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className={styles.qtyBtn}
                      aria-label="Increase quantity"
                    >
                      <FiPlus size={14} />
                    </button>
                  </div>
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeFromCart(item.id)}
                    aria-label="Remove item"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className={styles.footer}>
            {totalSavings > 0 && (
              <div className={styles.savings}>
                <FiGift style={{ display: 'inline', marginRight: '6px' }} />
                You save ₹{totalSavings.toLocaleString()} on this order!
              </div>
            )}
            <div className={styles.totalRow}>
              <span>Subtotal</span>
              <span className={styles.totalPrice}>₹{totalPrice.toLocaleString()}</span>
            </div>
            <Link href="/checkout" className={styles.checkoutBtn} onClick={() => setIsCartOpen(false)}>
              Secure Checkout
            </Link>
            <button
              className={styles.continueBtn}
              onClick={() => setIsCartOpen(false)}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
