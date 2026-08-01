'use client';

import React from 'react';
import Link from 'next/link';
import { FiArrowRight, FiStar, FiUsers, FiPackage, FiAward, FiTarget, FiHeart, FiZap, FiCheckCircle, FiPrinter } from 'react-icons/fi';
import { FaTshirt, FaMugHot, FaTags, FaKey, FaCoffee, FaMobileAlt, FaPalette } from 'react-icons/fa';
import styles from './page.module.css';

const stats = [
  { icon: <FiUsers size={28} />, number: '500+', label: 'Happy Customers' },
  { icon: <FiPackage size={28} />, number: '1000+', label: 'Orders Delivered' },
  { icon: <FiAward size={28} />, number: '50+', label: 'Product Types' },
  { icon: <FiStar size={28} />, number: '4.9', label: 'Customer Rating' },
];

const services = [
  {
    icon: <FaTshirt size={32} />,
    title: 'T-Shirt Printing',
    description: 'Custom t-shirts with DTG, screen printing, and sublimation. Single orders to bulk.',
  },
  {
    icon: <FaMugHot size={32} />,
    title: 'Mug & Cup Printing',
    description: 'Photo mugs, magic mugs, travel cups with vibrant, fade-resistant printing.',
  },
  {
    icon: <FaTags size={32} />,
    title: 'Sticker Printing',
    description: 'Vinyl stickers, die-cut stickers, labels — waterproof and UV-resistant.',
  },
  {
    icon: <FaKey size={32} />,
    title: 'Keychain Making',
    description: 'Acrylic, metal, and wooden keychains with photo or text customization.',
  },
  {
    icon: <FaMobileAlt size={32} />,
    title: 'Phone Case Printing',
    description: 'Custom phone cases for all popular models. Slim-fit with premium print quality.',
  },
  {
    icon: <FaPalette size={32} />,
    title: 'Custom Designs',
    description: 'Got an idea? Our design team will create print-ready artwork just for you.',
  },
];

const values = [
  { icon: <FiTarget size={24} />, title: 'Quality First', text: 'Premium materials and inks for prints that last.' },
  { icon: <FiHeart size={24} />, title: 'Customer Love', text: 'Your satisfaction is our top priority.' },
  { icon: <FiZap size={24} />, title: 'Fast Turnaround', text: 'Quick processing without compromising quality.' },
  { icon: <FiCheckCircle size={24} />, title: 'Fair Pricing', text: 'Best quality at the most affordable prices.' },
];

export default function AboutPage() {
  return (
    <div className={styles.aboutPage}>
      {/* Hero */}
      <section className={styles.heroSection}>
        <div className={styles.heroBg}>
          <div className={styles.heroOrb1} />
          <div className={styles.heroOrb2} />
        </div>
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroText}>
            <span className={styles.heroBadge}>About Us</span>
            <h1>We Bring Your <span className="shimmer-text">Creative Vision</span> to Life</h1>
            <p>
              F.S Print Works is your one-stop destination for premium custom printing services in Bhiwandi. 
              From personalized t-shirts to custom mugs, stickers, keychains, and more — we print everything 
              with passion, precision, and unbeatable quality.
            </p>
            <div className={styles.heroActions}>
              <Link href="/shop" className="btn btn-primary">
                Explore Products <FiArrowRight size={18} />
              </Link>
              <Link href="/contact" className="btn btn-secondary">
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className={styles.statsSection}>
        <div className={`container ${styles.statsGrid}`}>
          {stats.map((stat, index) => (
            <div key={index} className={styles.statCard}>
              <div className={styles.statIcon}>{stat.icon}</div>
              <span className={styles.statNumber}>{stat.number}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className={`section ${styles.storySection}`}>
        <div className="container">
          <div className={styles.storyGrid}>
            <div className={styles.storyImage}>
              <div className={styles.storyImagePlaceholder}>
                <span><FiPrinter /></span>
                <p>F.S Print Works</p>
              </div>
            </div>
            <div className={styles.storyText}>
              <div className="accent-line" style={{ margin: 0, marginBottom: 20 }} />
              <h2>Our <span className="gold-text">Story</span></h2>
              <p>
                Started with a simple vision — to make custom printing accessible, affordable, and 
                premium quality for everyone. What began as a small shop in Bhiwandi has grown into 
                a trusted name in the custom printing industry.
              </p>
              <p>
                Today, we serve hundreds of customers across the city, from individuals looking for 
                personalized gifts to businesses needing branded merchandise. Every print that leaves 
                our shop carries our commitment to excellence.
              </p>
              <p>
                Our state-of-the-art printing equipment, combined with our experienced team, ensures 
                that every product meets the highest standards of quality. We use premium inks and 
                materials that are built to last.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className={`section ${styles.servicesSection}`}>
        <div className="container">
          <div className="section-header">
            <div className="accent-line" />
            <h2>Our <span className="gold-text">Services</span></h2>
            <p>Premium custom printing for every need</p>
          </div>
          <div className={styles.servicesGrid}>
            {services.map((service, index) => (
              <div key={index} className={styles.serviceCard}>
                <span className={styles.serviceIcon}>{service.icon}</span>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className={`section ${styles.valuesSection}`}>
        <div className="container">
          <div className="section-header">
            <div className="accent-line" />
            <h2>Our <span className="gold-text">Values</span></h2>
            <p>What drives us every day</p>
          </div>
          <div className={styles.valuesGrid}>
            {values.map((value, index) => (
              <div key={index} className={styles.valueCard}>
                <div className={styles.valueIcon}>{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className={`container ${styles.ctaContent}`}>
          <h2>Ready to Get Started?</h2>
          <p>Let&apos;s create something amazing together. Contact us for a free quote!</p>
          <div className={styles.ctaButtons}>
            <Link href="/contact" className="btn btn-primary">
              Contact Us <FiArrowRight size={18} />
            </Link>
            <Link href="/shop" className="btn btn-secondary">
              Browse Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
