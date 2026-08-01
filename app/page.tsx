'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowRight, FiStar, FiTruck, FiShield, FiHeart, FiImage } from 'react-icons/fi';
import { FaWhatsapp, FaTshirt, FaMugHot, FaTags, FaKey, FaCoffee, FaMobileAlt, FaPalette } from 'react-icons/fa';
import ProductCard from '@/components/ProductCard';
import { categories, Product } from '@/lib/data/products';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { useCart } from '@/lib/context/CartContext';
import CinematicHero from '@/components/CinematicHero';
import styles from './page.module.css';

const features = [
  {
    icon: <FiStar size={28} />,
    title: 'Premium Quality',
    description: 'High-grade inks and materials that last. Colors that stay vibrant wash after wash.',
  },
  {
    icon: <FiTruck size={28} />,
    title: 'Fast Delivery',
    description: 'Quick turnaround on all orders. Same-day processing for urgent requirements.',
  },
  {
    icon: <FiShield size={28} />,
    title: 'Best Prices',
    description: 'Competitive pricing without compromising on quality. Bulk discounts available.',
  },
  {
    icon: <FiHeart size={28} />,
    title: 'Custom Designs',
    description: 'Send us any design, photo, or idea. We\'ll make it print-perfect for you.',
  },
];

const testimonials = [
  {
    name: 'Rahul Sharma',
    text: 'Amazing quality t-shirts! The print quality is outstanding and the colors are vibrant even after multiple washes. Highly recommended!',
    rating: 5,
    product: 'Custom T-Shirts',
  },
  {
    name: 'Priya Patel',
    text: 'Ordered custom mugs for my wedding. Everyone loved them! Great quality and the team was very helpful with the design.',
    rating: 5,
    product: 'Photo Mugs',
  },
  {
    name: 'Amit Verma',
    text: 'Got stickers for my brand. The die-cut quality is professional grade. Fast delivery and excellent customer service.',
    rating: 5,
    product: 'Custom Stickers',
  },
];

export default function HomePage() {
  const { addToCart, setIsCartOpen } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(collection(db, 'products'), where('featured', '==', true), limit(8));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          const fallbackQ = query(collection(db, 'products'), limit(8));
          const fallbackSnap = await getDocs(fallbackQ);
          setFeaturedProducts(fallbackSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product)));
        } else {
          setFeaturedProducts(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product)));
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
      }
    };
    fetchFeatured();
  }, []);

  const handleQuickAdd = (product: { id: string, name: string, price: number, image: string, category: string }) => {
    addToCart(product);
    setIsCartOpen(true);
  };

  return (
    <>
      {/* ========== CINEMATIC PRODUCT ANIMATION ========== */}
      <CinematicHero />

      {/* ========== HERO SECTION (LIGHT PLAYFUL) ========== */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroContent}`}>
          {/* Left Text Block */}
          <div className={styles.heroText}>
            <div className={styles.brandName}>F.S Print Works.</div>
            <h1 className={styles.heroTitle}>We Print<br />Your Ideas</h1>
            <p className={styles.heroDesc}>
              Our prints are crafted to blend timeless style with everyday functionality, ensuring you're always prepared.
            </p>
            
            <div className={styles.heroCtas}>
              <Link href="/shop" className={`btn btn-primary ${styles.heroPrimaryBtn}`}>
                See all <FiArrowRight size={18} />
              </Link>
              <a href="https://wa.me/917776003843" target="_blank" rel="noopener noreferrer" className={`btn btn-secondary ${styles.heroSecondaryBtn}`}>
                <div className={styles.playIcon}><FiArrowRight size={14} /></div> Play Video
              </a>
            </div>
          </div>

          {/* Right Visual Block */}
          <div className={styles.heroVisual}>
            <div className={styles.heroImageBg} />
            <img 
              src="https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800" 
              alt="Featured Custom Apparel" 
              className={styles.heroImage}
            />
          </div>
        </div>
      </section>

      {/* ========== CATEGORIES / PRODUCT SHOWCASE ========== */}
      <section className={styles.showcaseSection}>
        <div className="container">
          <div className={styles.showcaseLayout}>
            {/* Left: Pastel Cards */}
            <div className={styles.cardsRow}>
              {/* Card 1 */}
              <div className={`${styles.pastelCard} ${styles.bgYellow}`}>
                <img src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=400" alt="T-Shirt" className={styles.cardImg} />
                <div className={styles.cardPrice}>₹499</div>
                <button className={styles.addBtn} onClick={() => handleQuickAdd({ id: 'hero-1', name: 'White T-Shirt', price: 499, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=400', category: 'T-Shirts' })}>+</button>
              </div>
              {/* Card 2 */}
              <div className={`${styles.pastelCard} ${styles.bgPurple}`}>
                <img src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=400" alt="Hoodie" className={styles.cardImg} />
                <div className={styles.cardPrice}>₹999</div>
                <button className={styles.addBtn} onClick={() => handleQuickAdd({ id: 'hero-2', name: 'Grey Hoodie', price: 999, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=400', category: 'Hoodies' })}>+</button>
              </div>
              {/* Card 3 */}
              <div className={`${styles.pastelCard} ${styles.bgMint}`}>
                <img src="https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=400&q=80" alt="Premium Tee" className={styles.cardImg} />
                <div className={styles.cardPrice}>₹799</div>
                <button className={styles.addBtn} onClick={() => handleQuickAdd({ id: 'hero-3', name: 'Premium Black Tee', price: 799, image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=400&q=80', category: 'T-Shirts' })}>+</button>
              </div>
            </div>

            {/* Right: Pricing info placeholder (matching reference) */}
            <div className={styles.pricingInfo}>
              <div className={styles.totalPrice}>₹2,297<span className={styles.priceDec}>.00</span></div>
              <div className={styles.colorSwatches}>
                <span className={styles.swatch} style={{ background: '#7B61FF' }} />
                <span className={styles.swatch} style={{ background: '#4ADE80' }} />
                <span className={styles.swatch} style={{ background: '#FF7A00' }} />
                <span className={styles.swatch} style={{ background: '#111111' }} />
              </div>
              <div className={styles.reviews}>
                <div className={styles.rating}>4.8<span>/5</span></div>
                <p>Explore our TrustScore<br/>& Customer Reviews</p>
                <div className={styles.avatars}>
                  <img src="https://i.pravatar.cc/100?img=1" alt="User 1" />
                  <img src="https://i.pravatar.cc/100?img=5" alt="User 2" />
                  <div className={styles.avatarCount}>2k</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FEATURED PRODUCTS SECTION ========== */}
      <section className={`section ${styles.productsSection}`}>
        <div className="container">
          <div className="section-header">
            <div className="accent-line" />
            <h2>Featured <span className="gold-text">Products</span></h2>
            <p>Our most popular custom printed products loved by customers</p>
          </div>
          <div className={styles.productsGrid}>
            {featuredProducts.slice(0, 8).map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
          <div className={styles.viewAllWrapper}>
            <Link href="/shop" className="btn btn-secondary">
              View All Products
              <FiArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ========== WHY CHOOSE US ========== */}
      <section className={`section ${styles.featuresSection}`}>
        <div className="container">
          <div className="section-header">
            <div className="accent-line" />
            <h2>Why Choose <span className="gold-text">F.S Print Works</span>?</h2>
            <p>We deliver excellence in every print, every time</p>
          </div>
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div
                key={index}
                className={styles.featureCard}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className={styles.featureIcon}>
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== TESTIMONIALS ========== */}
      <section className={`section ${styles.testimonialsSection}`}>
        <div className="container">
          <div className="section-header">
            <div className="accent-line" />
            <h2>What Our <span className="gold-text">Customers</span> Say</h2>
            <p>Real reviews from our happy customers</p>
          </div>
          <div className={styles.testimonialsGrid}>
            {testimonials.map((review, index) => (
              <div
                key={index}
                className={styles.testimonialCard}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className={styles.stars}>
                  {[...Array(review.rating)].map((_, i) => (
                    <FiStar key={i} size={16} fill="var(--primary-gold)" color="var(--primary-gold)" />
                  ))}
                </div>
                <p className={styles.reviewText}>&ldquo;{review.text}&rdquo;</p>
                <div className={styles.reviewer}>
                  <div className={styles.reviewerAvatar}>
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <h4>{review.name}</h4>
                    <span>{review.product}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA SECTION ========== */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaBg}>
          <div className={styles.ctaOrb2} />
        </div>
        <div className={`container ${styles.ctaContent}`}>
          <h2>Ready to Print Your <span className="gold-text">Ideas</span>?</h2>
          <p>Get in touch with us today and let us bring your creative vision to life</p>
          <div className={styles.ctaButtons}>
            <Link href="/shop" className="btn btn-primary">
              Shop Now
              <FiArrowRight size={18} />
            </Link>
            <a
              href="https://wa.me/917776003843"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              <FaWhatsapp size={18} />
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
