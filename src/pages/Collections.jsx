import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, PackageX } from 'lucide-react';
import { motion } from 'framer-motion';
import { catalogueService } from '../services/catalogueService';
import ProductCard from '../components/product/ProductCard';

export default function Collections() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  useEffect(() => {
    const fetchCatalogue = async () => {
      try {
        setLoading(true);
        const [fetchedProducts, fetchedCategories, shopData] = await Promise.all([
          catalogueService.getPublishedProducts(),
          catalogueService.getVisibleCategories(),
          catalogueService.getShop()
        ]);
        setProducts(fetchedProducts);
        setCategories(fetchedCategories);
        setShop(shopData);

        if (shopData?.name) {
          document.title = `Collections — ${shopData.name}`;
        } else {
          document.title = "Collections — Premium Footwear";
        }
      } catch (err) {
        console.error('Error fetching catalogue:', err);
        setError('Something went wrong while loading the collection.');
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogue();
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    
    if (val.trim()) {
      setSearchParams({ search: val });
    } else {
      setSearchParams({});
    }
  };

  const filteredProducts = products.filter(product => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(term) ||
      (product.category?.name || '').toLowerCase().includes(term) ||
      (product.description || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="store-page">
      <div className="store-container">
        
        {/* Header & Controls */}
        <div className="collection-header">
          <div className="collection-header__title-area">
            <h1 className="store-heading-1" style={{ marginBottom: '8px' }}>
              All Collections
            </h1>
            <p className="store-text-subtle">
              Explore our complete range of footwear.
            </p>
          </div>

          <div className="collection-header__search">
            <div className="search-input-wrap">
              <Search className="search-input-icon" size={20} />
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
              />
            </div>
          </div>
        </div>

        {/* Category Filters */}
        {!loading && !error && categories.length > 0 && (
          <div className="category-filters">
            <Link 
              to="/collections" 
              className="category-filter-pill category-filter-pill--active"
            >
              All Products
            </Link>
            {categories.map(category => (
              <Link 
                key={category.id}
                to={`/collections/${category.slug}`}
                className="category-filter-pill"
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="product-grid">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-image"></div>
                <div className="skeleton-line" style={{ width: '40%' }}></div>
                <div className="skeleton-line" style={{ width: '80%', height: '24px' }}></div>
                <div className="skeleton-line" style={{ width: '30%' }}></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="error-card">
            <p className="error-card__text">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="store-btn store-btn--outline"
              style={{ marginTop: '16px' }}
            >
              Try Again
            </button>
          </div>
        ) : filteredProducts.length > 0 ? (
          <motion.div 
            className="product-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="empty-state-large">
            <PackageX size={48} className="empty-state-large__icon" />
            <h3 className="empty-state-large__title">No products found</h3>
            <p className="empty-state-large__text">
              {searchTerm ? `We couldn't find anything matching "${searchTerm}".` : "There are currently no products available."}
            </p>
            {searchTerm && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSearchParams({});
                }}
                className="store-btn store-btn--outline mt-4"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
