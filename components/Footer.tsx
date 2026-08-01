'use client';

import React from 'react';
import Link from 'next/link';
import { FiMapPin, FiPhone, FiMail, FiInstagram, FiFacebook, FiArrowUpRight } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import styles from './Footer.module.css';
import logoImg from './logo.png';

const quickLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop All' },
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact' },
];

const categoryLinks = [
  { href: '/shop?category=t-shirts', label: 'T-Shirts' },
  { href: '/shop?category=mugs', label: 'Mugs' },
  { href: '/shop?category=stickers', label: 'Stickers' },
  { href: '/shop?category=keychains', label: 'Keychains' },
  { href: '/shop?category=cups', label: 'Cups' },
  { href: '/shop?category=phone-cases', label: 'Phone Cases' },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      {/* Gold line separator */}
      <div className={styles.goldLine} />

      <div className={`container ${styles.footerContent}`}>
        {/* Brand Column */}
        <div className={styles.brandCol}>
          <p className={styles.brandDesc}>
            We bring your ideas to life with premium quality custom printing on t-shirts, mugs, keychains, stickers, and more.
          </p>
          <div className={styles.socialLinks}>
            <a href="https://wa.me/917776003843" target="_blank" rel="noopener noreferrer" className={`${styles.socialIcon} ${styles.whatsappIcon}`} aria-label="WhatsApp">
              <FaWhatsapp size={18} />
            </a>
            <a href="https://www.instagram.com/fs_allrounder_shop?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className={`${styles.socialIcon} ${styles.instagramIcon}`} aria-label="Instagram">
              <FiInstagram size={18} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={`${styles.socialIcon} ${styles.facebookIcon}`} aria-label="Facebook">
              <FiFacebook size={18} />
            </a>
            <a href="mailto:info@fsprintworks.com" className={`${styles.socialIcon} ${styles.emailIcon}`} aria-label="Email">
              <FiMail size={18} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className={styles.linkCol}>
          <h4 className={styles.colTitle}>Quick Links</h4>
          <ul className={styles.linkList}>
            {quickLinks.map(link => (
              <li key={link.href}>
                <Link href={link.href} className={styles.footerLink}>
                  <FiArrowUpRight size={14} />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories */}
        <div className={styles.linkCol}>
          <h4 className={styles.colTitle}>Categories</h4>
          <ul className={styles.linkList}>
            {categoryLinks.map(link => (
              <li key={link.href}>
                <Link href={link.href} className={styles.footerLink}>
                  <FiArrowUpRight size={14} />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div className={styles.linkCol}>
          <h4 className={styles.colTitle}>Contact Us</h4>
          <div className={styles.contactList}>
            <div className={styles.contactItem}>
              <FiMapPin size={16} className={styles.contactIcon} />
              <span>Shop No. 5, Main Road,<br />Bhiwandi, Maharashtra</span>
            </div>
            <div className={styles.contactItem}>
              <FiPhone size={16} className={styles.contactIcon} />
              <a href="tel:+917776003843">+91 77760 03843</a>
            </div>
            <div className={styles.contactItem}>
              <FiMail size={16} className={styles.contactIcon} />
              <a href="mailto:info@fsprintworks.com">info@fsprintworks.com</a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.bottomBar}>
        <div className={`container ${styles.bottomContent}`}>
          <p>© {new Date().getFullYear()} F.S Print Works. All rights reserved.</p>
          <p className={styles.madeWith}>
            Made with ❤️ for your custom printing needs
          </p>
        </div>
      </div>
    </footer>
  );
}
