'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/context/CartContext';
import { FiX, FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiShoppingCart, FiGift } from 'react-icons/fi';
import styles from './CartDrawer.module.css';

export default function CartDrawer() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    totalItems,
    totalPrice,
    totalSavings,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  return (
    <>
      {/* Overlay */}
      <div
        className={`${styles.overlay} ${isCartOpen ? styles.overlayOpen : ''}`}
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className={`${styles.drawer} ${isCartOpen ? styles.drawerOpen : ''}`}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <FiShoppingBag size={20} />
            <h3>Your Cart</h3>
            <span className={styles.itemCount}>{totalItems} items</span>
          </div>
          <button
            className={styles.closeBtn}
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart"
          >
            <FiX size={22} />
          </button>
        </div>

        {/* Cart Items */}
        <div className={styles.itemsList}>
          {items.length === 0 ? (
            <div className={styles.emptyCart}>
              <div className={styles.emptyIcon}><FiShoppingCart /></div>
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
                  <div className={styles.imagePlaceholder}>
                    {(item.category || item.name || 'P').charAt(0)}
                  </div>
                </div>
                <div className={styles.itemDetails}>
                  <h4 className={styles.itemName}>{item.name}</h4>
                  {item.category && <p className={styles.itemCategory}>{item.category}</p>}
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
            <Link
              href="/cart"
              className={`btn btn-primary ${styles.checkoutBtn}`}
              onClick={() => setIsCartOpen(false)}
            >
              View Cart & Checkout
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
