'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/context/CartContext';
import { FiMinus, FiPlus, FiTrash2, FiArrowLeft, FiShoppingBag, FiArrowRight, FiShoppingCart, FiImage } from 'react-icons/fi';
import { FaTshirt, FaMugHot, FaTags, FaKey, FaCoffee, FaMobileAlt } from 'react-icons/fa';
import { FaWhatsapp } from 'react-icons/fa';
import styles from './page.module.css';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice, totalSavings } = useCart();

  const generateWhatsAppOrder = () => {
    let message = '🛒 *New Order from F.S Print Works Website*\n\n';
    items.forEach((item, index) => {
      message += `${index + 1}. *${item.name}*\n`;
      message += `   Qty: ${item.quantity} × ₹${item.price} = ₹${item.price * item.quantity}\n\n`;
    });
    message += `\n💰 *Total: ₹${totalPrice.toLocaleString()}*`;
    if (totalSavings > 0) {
      message += `\n🎉 *Savings: ₹${totalSavings.toLocaleString()}*`;
    }
    message += '\n\nPlease confirm my order!';
    return encodeURIComponent(message);
  };

  if (items.length === 0) {
    return (
      <div className={styles.emptyPage}>
        <div className={styles.emptyContent}>
          <div className={styles.emptyIcon}><FiShoppingCart /></div>
          <h2>Your Cart is Empty</h2>
          <p>Looks like you haven&apos;t added anything to your cart yet.</p>
          <Link href="/shop" className="btn btn-primary">
            <FiShoppingBag size={18} />
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.cartPage}>
      {/* Header */}
      <section className={styles.pageHeader}>
        <div className={`container ${styles.headerContent}`}>
          <h1>Shopping <span className="gold-text">Cart</span></h1>
          <p>{totalItems} items in your cart</p>
        </div>
      </section>

      <div className={`container ${styles.cartLayout}`}>
        {/* Cart Items */}
        <div className={styles.cartItems}>
          <div className={styles.cartHeader}>
            <h3>Cart Items</h3>
            <button className={styles.clearBtn} onClick={clearCart}>
              <FiTrash2 size={14} />
              Clear All
            </button>
          </div>

          {items.map(item => (
            <div key={item.id} className={styles.cartItem}>
              <div className={styles.itemImage}>
                <div className={styles.imagePlaceholder}>
                  {item.category === 'T-Shirts' ? <FaTshirt /> :
                   item.category === 'Mugs' ? <FaMugHot /> :
                   item.category === 'Stickers' ? <FaTags /> :
                   item.category === 'Keychains' ? <FaKey /> :
                   item.category === 'Cups' ? <FaCoffee /> :
                   item.category === 'Phone Cases' ? <FaMobileAlt /> : <FiImage />}
                </div>
              </div>
              <div className={styles.itemInfo}>
                <Link href={`/product/${item.id}`} className={styles.itemName}>
                  {item.name}
                </Link>
                <span className={styles.itemCategory}>{item.category}</span>
                <div className={styles.itemPricing}>
                  <span className={styles.itemPrice}>₹{item.price}</span>
                  {item.originalPrice && (
                    <span className={styles.itemOriginal}>₹{item.originalPrice}</span>
                  )}
                </div>
              </div>
              <div className={styles.itemControls}>
                <div className={styles.quantityControl}>
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className={styles.qtyBtn}>
                    <FiMinus size={14} />
                  </button>
                  <span className={styles.qtyValue}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className={styles.qtyBtn}>
                    <FiPlus size={14} />
                  </button>
                </div>
                <span className={styles.itemTotal}>₹{(item.price * item.quantity).toLocaleString()}</span>
                <button className={styles.removeBtn} onClick={() => removeFromCart(item.id)}>
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          <Link href="/shop" className={styles.continueShopping}>
            <FiArrowLeft size={16} />
            Continue Shopping
          </Link>
        </div>

        {/* Order Summary */}
        <div className={styles.orderSummary}>
          <div className={styles.summaryCard}>
            <h3>Order Summary</h3>
            
            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}>
                <span>Subtotal ({totalItems} items)</span>
                <span>₹{totalPrice.toLocaleString()}</span>
              </div>
              {totalSavings > 0 && (
                <div className={`${styles.summaryRow} ${styles.savingsRow}`}>
                  <span>You Save</span>
                  <span>-₹{totalSavings.toLocaleString()}</span>
                </div>
              )}
              <div className={styles.summaryRow}>
                <span>Delivery</span>
                <span className={styles.freeDelivery}>Free</span>
              </div>
              <div className={styles.summaryDivider} />
              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>Total</span>
                <span>₹{totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <div className={styles.summaryActions}>
              <Link href="/checkout" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Proceed to Checkout
                <FiArrowRight size={18} />
              </Link>
              <a
                href={`https://wa.me/917776003843?text=${generateWhatsAppOrder()}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn ${styles.whatsappOrderBtn}`}
              >
                <FaWhatsapp size={20} />
                Order via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
