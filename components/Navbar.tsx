'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/lib/context/CartContext';
import { useAuth } from '@/lib/context/AuthContext';
import { FiShoppingBag, FiMenu, FiX, FiSearch, FiUser, FiLogOut, FiShield, FiPackage } from 'react-icons/fi';
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems, setIsCartOpen } = useCart();
  const { user, profile, isAdmin, signOut } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    await signOut();
    router.push('/');
  };

  const userInitial = (profile?.displayName || profile?.email || 'U').charAt(0).toUpperCase();

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
            <Image 
              src={logoImg} 
              alt="F.S Print Works" 
              className={styles.logoImage} 
              priority 
              unoptimized 
              style={{ maxHeight: '60px', width: 'auto', objectFit: 'contain' }}
            />
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

            {/* User Auth Button */}
            {user ? (
              <div className={styles.userMenuContainer} ref={userMenuRef}>
                <button
                  className={styles.userBtn}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-label="User menu"
                >
                  {profile?.photoURL ? (
                    <Image src={profile.photoURL} alt="User Avatar" width={40} height={40} className={styles.userAvatar} referrerPolicy="no-referrer" />
                  ) : (
                    <span className={styles.userInitial}>{userInitial}</span>
                  )}
                </button>
                {userMenuOpen && (
                  <div className={styles.userDropdown}>
                    <div className={styles.dropdownHeader}>
                      <p className={styles.dropdownName}>{profile?.displayName || 'User'}</p>
                      <p className={styles.dropdownEmail}>{profile?.email}</p>
                    </div>
                    <div className={styles.dropdownDivider} />
                    <Link href="/profile" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                      <FiUser size={16} /> My Profile
                    </Link>
                    <Link href="/orders" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                      <FiPackage size={16} /> My Orders
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                        <FiShield size={16} /> Admin Panel
                      </Link>
                    )}
                    <div className={styles.dropdownDivider} />
                    <button className={styles.dropdownItem} onClick={handleSignOut}>
                      <FiLogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth" className={styles.loginBtn}>
                <FiUser size={18} />
                <span className={styles.loginText}>Login</span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`${styles.mobileOverlay} ${menuOpen ? styles.overlayOpen : ''}`} onClick={() => setMenuOpen(false)} />
      
      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.menuVisible : ''}`}>
        <div className={styles.mobileMenuInner}>
          {/* Mobile User Info */}
          {user && profile && (
            <div className={styles.mobileUserInfo}>
              <div className={styles.mobileUserAvatar}>
                {profile.photoURL ? (
                  <Image src={profile.photoURL} alt="User Avatar" width={48} height={48} referrerPolicy="no-referrer" style={{ borderRadius: '50%' }} />
                ) : (
                  <span>{userInitial}</span>
                )}
              </div>
              <div>
                <p className={styles.mobileUserName}>{profile.displayName || 'User'}</p>
                <p className={styles.mobileUserEmail}>{profile.email}</p>
              </div>
            </div>
          )}

          {navLinks.map((link) => (
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

          {user ? (
            <>
              <Link href="/profile" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                My Profile
              </Link>
              <Link href="/orders" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                My Orders
              </Link>
              {isAdmin && (
                <Link href="/admin" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                  Admin Panel
                </Link>
              )}
              <div className={styles.mobileDivider} />
              <button
                className={styles.mobileCartBtn}
                onClick={() => { setMenuOpen(false); handleSignOut(); }}
              >
                <FiLogOut size={20} />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <Link href="/auth" className={styles.mobileAuthBtn} onClick={() => setMenuOpen(false)}>
              <FiUser size={20} />
              <span>Login / Sign Up</span>
            </Link>
          )}

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
