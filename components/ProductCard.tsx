'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/context/CartContext';
import { FiShoppingBag, FiEye, FiImage, FiStar } from 'react-icons/fi';
import { FaTshirt, FaMugHot, FaTags, FaKey, FaCoffee, FaMobileAlt, FaFire } from 'react-icons/fa';
import type { Product } from '@/lib/data/products';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
  };

  return (
    <div
      className={styles.card}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Image */}
      <div className={styles.imageWrapper}>
        {product.image && product.image.trim() !== '' ? (
          <Image 
            src={product.image} 
            alt={product.name} 
            className={styles.productImage} 
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <span className={styles.placeholderIcon}>
              {product.category === 'T-Shirts' ? <FaTshirt /> :
               product.category === 'Mugs' ? <FaMugHot /> :
               product.category === 'Stickers' ? <FaTags /> :
               product.category === 'Keychains' ? <FaKey /> :
               product.category === 'Cups' ? <FaCoffee /> :
               product.category === 'Phone Cases' ? <FaMobileAlt /> : <FiImage />}
            </span>
            <span className={styles.placeholderText}>{product.name}</span>
          </div>
        )}
        
        {/* Badges */}
        {(product.discount && product.discount > 0) ? (
          <span className={`${styles.badge} ${styles.badge_discount}`}>
            {product.discount}% OFF
          </span>
        ) : product.badge ? (
          <span className={`${styles.badge} ${styles[`badge_${product.badge}`]}`}>
            {product.badge === 'bestseller' ? <><FaFire size={12} style={{marginRight: '4px', display: 'inline-block'}} /> Bestseller</> :
             product.badge === 'new' ? <><FiStar size={12} style={{marginRight: '4px', display: 'inline-block'}} /> New</> : ''}
          </span>
        ) : null}

        {/* Hover Overlay */}
        <div className={styles.overlay}>
          <button className={styles.overlayBtn} onClick={handleAddToCart}>
            <FiShoppingBag size={18} />
            <span>Add to Cart</span>
          </button>
          <Link href={`/product/${product.id}`} className={styles.overlayBtn}>
            <FiEye size={18} />
            <span>Quick View</span>
          </Link>
        </div>
      </div>

      {/* Info */}
      <Link href={`/product/${product.id}`} className={styles.info}>
        <span className={styles.category}>{product.category}</span>
        <h3 className={styles.name}>{product.name}</h3>
        <div className={styles.pricing}>
          <span className={styles.price}>₹{product.price}</span>
          {product.originalPrice && product.originalPrice > 0 && (
            <span className={styles.originalPrice}>₹{product.originalPrice}</span>
          )}
        </div>
      </Link>
    </div>
  );
}
