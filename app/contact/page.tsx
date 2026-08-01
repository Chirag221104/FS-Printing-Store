'use client';

import React, { useState } from 'react';
import { FiMapPin, FiPhone, FiMail, FiClock, FiSend, FiCheck, FiInstagram, FiFacebook } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import styles from './page.module.css';

const contactInfo = [
  {
    icon: <FiMapPin size={22} />,
    title: 'Visit Our Shop',
    details: ['Shop No. 5, Main Road', 'Bhiwandi, Maharashtra 421302'],
  },
  {
    icon: <FiPhone size={22} />,
    title: 'Call Us',
    details: ['+91 99999 99999', '+91 88888 88888'],
  },
  {
    icon: <FiMail size={22} />,
    title: 'Email Us',
    details: ['info@fsprintworks.com', 'orders@fsprintworks.com'],
  },
  {
    icon: <FiClock size={22} />,
    title: 'Working Hours',
    details: ['Mon - Sat: 10:00 AM - 8:00 PM', 'Sunday: Closed'],
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: '', phone: '', email: '', subject: '', message: '' });
  };

  return (
    <div className={styles.contactPage}>
      {/* Header */}
      <section className={styles.pageHeader}>
        <div className={styles.headerBg}>
          <div className={styles.headerOrb1} />
          <div className={styles.headerOrb2} />
        </div>
        <div className={`container ${styles.headerContent}`}>
          <h1>Get in <span className="gold-text">Touch</span></h1>
          <p>Have a question or need a custom quote? We&apos;d love to hear from you!</p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className={`container ${styles.infoSection}`}>
        <div className={styles.infoGrid}>
          {contactInfo.map((info, index) => (
            <div key={index} className={styles.infoCard}>
              <div className={styles.infoIcon}>{info.icon}</div>
              <h3>{info.title}</h3>
              {info.details.map((detail, i) => (
                <p key={i}>{detail}</p>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Contact Form + Map */}
      <section className={`container ${styles.mainSection}`}>
        <div className={styles.contactGrid}>
          {/* Form */}
          <div className={styles.formCard}>
            <h2>Send Us a <span className="gold-text">Message</span></h2>
            <p className={styles.formDesc}>Fill out the form below and we&apos;ll get back to you within 24 hours.</p>
            
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Full Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-field" placeholder="Your name" required />
                </div>
                <div className={styles.formGroup}>
                  <label>Phone Number *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-field" placeholder="+91 99999 99999" required />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field" placeholder="your@email.com" />
              </div>
              <div className={styles.formGroup}>
                <label>Subject</label>
                <select name="subject" value={formData.subject} onChange={handleChange} className="input-field">
                  <option value="">Select a subject</option>
                  <option value="quote">Get a Custom Quote</option>
                  <option value="order">Order Inquiry</option>
                  <option value="bulk">Bulk Order</option>
                  <option value="complaint">Complaint</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Message *</label>
                <textarea name="message" value={formData.message} onChange={handleChange} className="input-field" placeholder="Tell us about your requirements..." rows={5} required />
              </div>
              <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={submitted}>
                {submitted ? (
                  <><FiCheck size={18} /> Message Sent!</>
                ) : (
                  <><FiSend size={18} /> Send Message</>
                )}
              </button>
            </form>
          </div>

          {/* Map + Social */}
          <div className={styles.mapSide}>
            <div className={styles.mapWrapper}>
              <h3>Find Us Here</h3>
              <div className={styles.mapFrame}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d120540.8553931655!2d73.0062!3d19.3!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7bda1c4e1b5a1%3A0x14868dafe6e8008!2sBhiwandi%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1"
                  width="100%"
                  height="300"
                  style={{ border: 0, borderRadius: 'var(--radius-lg)' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="F.S Print Works Location"
                />
              </div>
            </div>

            {/* Social Links */}
            <div className={styles.socialCard}>
              <h3>Connect With Us</h3>
              <div className={styles.socialLinks}>
                <a href="https://wa.me/917776003843" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                  <FaWhatsapp size={22} />
                  <div>
                    <strong>WhatsApp</strong>
                    <span>Chat with us directly</span>
                  </div>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                  <FiInstagram size={22} />
                  <div>
                    <strong>Instagram</strong>
                    <span>See our latest work</span>
                  </div>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                  <FiFacebook size={22} />
                  <div>
                    <strong>Facebook</strong>
                    <span>Follow us for updates</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
