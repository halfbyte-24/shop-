import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { catalogueService } from '../../services/catalogueService';
import { businessConfig } from '../../config/businessConfig';

export default function PublicFooter() {
  const [shop, setShop] = useState(null);

  useEffect(() => {
    catalogueService.getShop().then(data => {
      if (data) setShop(data);
    }).catch(console.error);
  }, []);

  return (
    <footer className="store-footer">
      <div className="store-container">
        
        <div className="store-footer__grid">
          {/* Column 1: Brand */}
          <div className="store-footer__col">
            <Link to="/" className="store-footer__brand" style={{ display: 'inline-block' }}>
              <img src="/images/logo.png" alt={shop?.name || 'Janata Shoe Store'} className="store-footer__logo" />
            </Link>
            <p className="store-footer__tagline">
              {shop?.tagline || 'Premium footwear designed for comfort and style.'}
            </p>
            <p className="store-footer__desc">
              {shop?.description || 'Discover a curated selection of shoes that elevate your everyday wear. Quality, style, and reliability.'}
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div className="store-footer__col">
            <h4 className="store-footer__heading">Navigation</h4>
            <div className="store-footer__list">
              <Link to="/" className="store-footer__link">Home</Link>
              <Link to="/collections" className="store-footer__link">Collections</Link>
              <Link to="/about" className="store-footer__link">About Us</Link>
              <Link to="/contact" className="store-footer__link">Contact</Link>
            </div>
          </div>

          {/* Column 3: Visit */}
          <div className="store-footer__col">
            <h4 className="store-footer__heading">Visit</h4>
            <div className="store-footer__list">
              <span className="store-footer__text block">{businessConfig.demoLocation.addressLine1}</span>
              <span className="store-footer__text block">{businessConfig.demoLocation.addressLine2}</span>
              <a href={businessConfig.demoLocation.mapsLink} target="_blank" rel="noreferrer" className="store-footer__link mt-2 inline-block">
                Get Directions &rarr;
              </a>
            </div>
          </div>

          {/* Column 4: Location Map */}
          <div className="store-footer__col">
            <h4 className="store-footer__heading">Location</h4>
            <div style={{ width: '100%', height: '150px', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <iframe
                src={businessConfig.demoLocation.mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Store Location"
              ></iframe>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="store-footer__bottom">
          <div className="store-footer__copyright">
            &copy; {new Date().getFullYear()} {shop?.name || 'JANATA Shoe Store'}. All rights reserved.
          </div>
          {/* Deliberately omitted 'Powered by...' as per client-demo requirement */}
        </div>
        
      </div>
    </footer>
  );
}
