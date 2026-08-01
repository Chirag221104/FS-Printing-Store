'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/lib/context/CartContext';
import { FiShoppingBag, FiMenu, FiX, FiSearch } from 'react-icons/fi';
import styles from './Navbar.module.css';
import logoImg from './logo.png';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
        <div className={`container ${styles.navInner}`}>
          {/* Mobile Menu Button (Top Left before logo) */}
          <button
            className={styles.menuBtn}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>

          {/* Logo */}
          <Link href="/" className={styles.logo}>
            <img src={logoImg.src} alt="F.S Print Works" className={styles.logoImage} />
          </Link>

          {/* Desktop Nav */}
          <div className={styles.navLinks}>
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className={styles.navActions}>
            <Link href="/shop" className={styles.searchBtn}>
              <FiSearch size={20} />
            </Link>
            <button
              className={styles.cartBtn}
              onClick={() => setIsCartOpen(true)}
              aria-label="Open cart"
            >
              <FiShoppingBag size={20} />
              {totalItems > 0 && (
                <span className={styles.cartBadge}>{totalItems}</span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`${styles.mobileOverlay} ${menuOpen ? styles.overlayOpen : ''}`} onClick={() => setMenuOpen(false)} />
      
      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.menuVisible : ''}`}>
        <div className={styles.mobileMenuInner}>
          {navLinks.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.mobileLink} ${pathname === link.href ? styles.active : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className={styles.mobileDivider} />
          <button
            className={styles.mobileCartBtn}
            onClick={() => { setMenuOpen(false); setIsCartOpen(true); }}
          >
            <FiShoppingBag size={20} />
            <span>Cart</span>
            {totalItems > 0 && (
              <span className={styles.mobileCartBadge}>{totalItems}</span>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
