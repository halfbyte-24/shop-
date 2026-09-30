import React, { useState } from 'react';
import { X, MapPin } from 'lucide-react';
import { orderService } from '../../services/orderService';

export default function BookNowModal({ product, shop, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    size: '',
    quantity: 1,
  });
  const [location, setLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const generateOrderId = () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = 'ORD-';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setLocError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocating(false);
      },
      (error) => {
        console.error(error);
        setLocError('Location sharing skipped or denied.');
        setLocating(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address || !formData.size || formData.quantity < 1) {
      alert("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const orderId = generateOrderId();
      const unitPrice = Number(product.price);
      const qty = Number(formData.quantity);
      const total = unitPrice * qty;

      const orderData = {
        order_id: orderId,
        shop_id: product.shop_id,
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_address: formData.address,
        customer_latitude: location ? location.lat : null,
        customer_longitude: location ? location.lng : null,
        subtotal: total,
        total: total,
        status: 'pending'
      };

      const orderItemData = {
        product_id: product.id,
        product_name: product.name,
        sku: product.sku || '',
        quantity: qty,
        size: formData.size,
        unit_price: unitPrice,
        total: total
      };

      // Prepare WhatsApp message
      const storeLat = shop?.theme_config?.latitude || '22.992212974316107';
      const storeLng = shop?.theme_config?.longitude || '88.45280213452367';
      
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
      
      const receiptUrl = `${window.location.origin}/receipt/${orderId}`;
      const mapsUrl = location 
        ? `https://www.google.com/maps/dir/?api=1&origin=${storeLat},${storeLng}&destination=${location.lat},${location.lng}&travelmode=two-wheeler`
        : '';

      const message = `🛍️ *New Order from ${shop?.name || 'JANATA Shoe Store'}*
=============================

${shop?.name || 'JANATA Shoe Store'}
${shop?.tagline || shop?.address || ''}

=============================

Order: ${orderId}
Date: ${dateStr}
Time: ${timeStr}

-----------------------------

Customer: ${formData.name}
Phone: ${formData.phone}
Address: ${formData.address}
Shoe Size: ${formData.size}

-----------------------------

ITEM              TOTAL
-----------------------------

${qty} x ${product.name}
Size: ${formData.size}
₹${unitPrice}

-----------------------------

Subtotal: ₹${total}
=============================
*GRAND TOTAL: ₹${total}*
=============================

Thank you for ordering!
Store will contact you shortly.

${location ? `📍 *Customer Location*\n${mapsUrl}\n` : ''}
🧾 *Receipt Link*
${receiptUrl}`;

      let whatsappNumber = shop?.whatsapp || shop?.phone || '919932156840';
      whatsappNumber = whatsappNumber.replace(/[^\d+]/g, '');
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      
      // Open WhatsApp in a new tab
      window.open(whatsappUrl, '_blank');
      
      // Close the modal instead of navigating to a broken receipt
      onClose();
      
    } catch (error) {
      console.error("Order error:", error);
      alert("Something went wrong while placing the order.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>Book Now</h2>
          <button onClick={onClose} style={styles.closeBtn}><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.productSummary}>
            <div style={styles.productSummaryRow}>
              <strong>Product:</strong> {product.name}
            </div>
            <div style={styles.productSummaryRow}>
              <strong>Price:</strong> ₹{product.price}
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} style={styles.input} required />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Phone Number *</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} style={styles.input} required />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Shoe Size *</label>
            <input type="text" name="size" value={formData.size} onChange={handleInputChange} placeholder="e.g. 9 or 42" style={styles.input} required />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Quantity *</label>
            <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} min="1" style={styles.input} required />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Delivery Address *</label>
            <textarea name="address" value={formData.address} onChange={handleInputChange} style={styles.textarea} required rows="3" />
          </div>

          <div style={styles.formGroup}>
            <button type="button" onClick={captureLocation} style={styles.locationBtn} disabled={locating}>
              <MapPin size={18} style={{ marginRight: '8px' }} />
              {locating ? 'Capturing...' : location ? '✓ Location captured' : 'Share Live Location'}
            </button>
            {locError && <p style={styles.errorText}>{locError}</p>}
          </div>

          <div style={styles.footer}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>Cancel</button>
            <button type="submit" style={styles.submitBtn} disabled={submitting}>
              {submitting ? 'Processing...' : 'Order on WhatsApp'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '20px'
  },
  modal: {
    backgroundColor: '#fff', borderRadius: '12px',
    width: '100%', maxWidth: '500px', maxHeight: '90vh',
    overflowY: 'auto', display: 'flex', flexDirection: 'column'
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '20px', borderBottom: '1px solid #eee'
  },
  title: { margin: 0, fontSize: '1.25rem', fontWeight: 600 },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#666' },
  form: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' },
  productSummary: { backgroundColor: '#f9fafb', padding: '12px', borderRadius: '8px', fontSize: '0.9rem' },
  productSummaryRow: { marginBottom: '4px', color: '#374151' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '0.9rem', fontWeight: 500, color: '#374151' },
  input: { padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem' },
  textarea: { padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', resize: 'vertical' },
  locationBtn: { 
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '10px', backgroundColor: '#e0e7ff', color: '#4338ca', 
    border: '1px solid #c7d2fe', borderRadius: '6px', cursor: 'pointer',
    fontWeight: 500, fontSize: '0.95rem'
  },
  errorText: { margin: 0, fontSize: '0.8rem', color: '#ef4444', marginTop: '4px' },
  footer: { display: 'flex', gap: '12px', marginTop: '8px' },
  cancelBtn: { 
    flex: 1, padding: '12px', backgroundColor: '#fff', border: '1px solid #d1d5db',
    borderRadius: '6px', cursor: 'pointer', fontWeight: 500, color: '#374151'
  },
  submitBtn: { 
    flex: 2, padding: '12px', backgroundColor: '#25D366', border: 'none',
    borderRadius: '6px', cursor: 'pointer', fontWeight: 600, color: '#fff'
  }
};
