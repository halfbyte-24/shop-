import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search } from 'lucide-react';
import { catalogueService } from '../../services/catalogueService';
import '../../styles/public.css'; // Let's create a dedicated public.css for the storefront to avoid bloating components.css

export default function PublicNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [shop, setShop] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    catalogueService.getShop().then(data => {
      if (data) setShop(data);
    }).catch(console.error);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  const handleLogoClick = (e) => {
    const now = Date.now();
    if (now - lastClickTime > 2000) {
      setClickCount(1);
    } else {
      const newCount = clickCount + 1;
      setClickCount(newCount);
      if (newCount >= 7) {
        e.preventDefault();
        navigate('/admin/login');
        setClickCount(0);
      }
    }
    setLastClickTime(now);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/collections?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Collections', path: '/collections' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isHomePage = location.pathname === '/';
  const isScrolledOrInner = scrolled || !isHomePage;

  return (
    <header className="store-navbar">
      <div className="store-container">
        <div className="store-navbar__inner">
          
          {/* Logo / Shop Name */}
          <Link to="/" className="store-navbar__brand" onClick={handleLogoClick}>
            <img src="/images/logo.png" alt={shop?.name || 'JANATA Shoe Store'} className="store-navbar__logo" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="store-navbar__nav desktop-only">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`store-navbar__link ${
                  location.pathname === link.path ? 'store-navbar__link--active' : ''
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="store-navbar__actions">
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="store-navbar__icon-btn"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* Mobile Menu Toggle */}
            <button 
              className="store-navbar__icon-btn mobile-only"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar Overlay/Dropdown */}
      <div className={`store-navbar__search-overlay ${isSearchOpen ? 'store-navbar__search-overlay--open' : ''}`}>
        <div className="store-container">
          <form onSubmit={handleSearch} className="store-navbar__search-form">
            <Search size={20} className="store-navbar__search-icon" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="store-navbar__search-input"
            />
          </form>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`store-navbar__mobile-menu ${isMobileMenuOpen ? 'store-navbar__mobile-menu--open' : ''}`}>
        <nav className="store-navbar__mobile-nav">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`store-navbar__mobile-link ${
                location.pathname === link.path ? 'store-navbar__mobile-link--active' : ''
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
