'use client';

import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import styles from './WhatsAppButton.module.css';

export default function WhatsAppButton() {
  const phoneNumber = '917776003843'; // Replace with actual number
  const message = encodeURIComponent('Hi! I\'m interested in your printing services. Can you help me?');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.whatsappBtn}
      aria-label="Chat on WhatsApp"
    >
      <FaWhatsapp size={28} />
      <span className={styles.tooltip}>Chat with us!</span>
    </a>
  );
}
