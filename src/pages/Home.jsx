import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Tag, Grid, LayoutGrid, Gem, Truck, Heart, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { catalogueService } from '../services/catalogueService';
import ProductCard from '../components/product/ProductCard';
import { businessConfig } from '../config/businessConfig';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData, shopData] = await Promise.all([
          catalogueService.getPublishedProducts(),
          catalogueService.getVisibleCategories(),
          catalogueService.getShop()
        ]);
        
        setFeaturedProducts(productsData.slice(0, 4));
        setCategories(categoriesData);
        setShop(shopData);

        if (shopData?.name) {
          document.title = `${shopData.name} — Premium Footwear`;
        } else {
          document.title = "Home — Premium Footwear";
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="home-page">
      
      {/* 2. Hero Section */}
      <section className="store-hero">
        <div className="store-hero__overlay"></div>
        <div className="store-container store-hero__inner">
          <motion.div 
            className="store-hero__content"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="store-hero__eyebrow">STEP INTO STYLE</span>
            <h1 className="store-hero__title">Step Into Something Better</h1>
            <p className="store-hero__text">
              Discover footwear designed for everyday comfort, style, and confidence.
            </p>
            <div className="store-hero__actions">
              <Link to="/collections" className="store-btn store-btn--primary store-btn--large">
                Explore Collections <ArrowRight size={20} style={{ marginLeft: '8px' }} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. Shop By Category */}
      <section className="store-section">
        <div className="store-container">
          <div className="store-section__header store-section__header--center">
            <div>
              <h2 className="store-heading-2" style={{ marginBottom: '8px' }}>Shop By Category</h2>
              <p className="store-text-subtle">Find the right pair for every style and occasion.</p>
            </div>
          </div>
          
          {!loading && categories.length > 0 ? (
            <motion.div 
              className="category-scroll"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ staggerChildren: 0.1 }}
            >
              {categories.map((cat, index) => {
                let Icon = Tag;
                if (cat.name.toLowerCase().includes('sneaker')) Icon = LayoutGrid;
                if (cat.name.toLowerCase().includes('formal')) Icon = Gem;

                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Link to={`/collections/${cat.slug}`} className="category-card">
                      <Icon size={32} className="category-card__icon" />
                      <span className="category-card__name">{cat.name}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : !loading ? (
            <div className="empty-state-card">
              <p>More categories coming soon.</p>
            </div>
          ) : null}
        </div>
      </section>

      {/* 4. Featured Collection */}
      <section className="store-section store-section--bg">
        <div className="store-container">
          <div className="store-section__header">
            <div>
              <h2 className="store-heading-2" style={{ marginBottom: '8px' }}>Featured Collection</h2>
              <p className="store-text-subtle">Explore some of our latest styles.</p>
            </div>
            <Link to="/collections" className="store-link-primary">
              View All Products <ArrowRight size={16} />
            </Link>
          </div>

          {!loading && featuredProducts.length > 0 ? (
            <motion.div 
              className="product-grid"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.1 }}
            >
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          ) : !loading ? (
            <div className="empty-state-card">
              <p>New arrivals are on their way.</p>
            </div>
          ) : null}
        </div>
      </section>



      {/* 6. Visit Our Store / Location */}
      <section className="store-section">
        <div className="store-container">
          <div className="location-card">
            <motion.div 
              className="location-grid"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
            >
              
              <div className="location-content">
                <span className="location-content__badge">VISIT OUR STORE</span>
                <h2 className="location-content__title">{shop?.name || 'JANATA Shoe Store'}</h2>
                {shop?.tagline && (
                  <p className="location-content__tagline">
                    {shop.tagline}
                  </p>
                )}
                
                <div className="location-address">
                  <MapPin size={24} color="var(--color-primary)" className="location-address__icon" />
                  <div>
                    <p className="location-address__line">{businessConfig.demoLocation.addressLine1}</p>
                    <p className="location-address__line">{businessConfig.demoLocation.addressLine2}</p>
                    <p className="location-address__note">(Demo Address)</p>
                  </div>
                </div>

                <a 
                  href={businessConfig.demoLocation.mapsLink}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="store-btn store-btn--outline" 
                  style={{ alignSelf: 'flex-start' }}
                >
                  Get Directions &rarr;
                </a>
              </div>

              <div className="location-map">
                <iframe 
                  src={businessConfig.demoLocation.mapEmbedUrl}
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Store Location Map"
                ></iframe>
              </div>

            </motion.div>
          </div>
        </div>
      </section>

    </div>
  );
}
