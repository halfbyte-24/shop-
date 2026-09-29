import { supabase } from '../lib/supabase';
import { DEMO_CATEGORIES, DEMO_PRODUCTS } from '../demo-data';

export const catalogueService = {
  /**
   * Get the active shop information (assuming single tenant demo for now)
   */
  async getShop() {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching shop:', error);
      throw error;
    }
    return data;
  },

  /**
   * Get all visible categories that have at least one published, non-hidden product.
   */
  async getVisibleCategories() {
    return DEMO_CATEGORIES;
  },

  /**
   * Get all published, non-hidden products
   */
  async getPublishedProducts() {
    return DEMO_PRODUCTS;
  },

  /**
   * Get all published, non-hidden products by category slug
   */
  async getProductsByCategory(categorySlug) {
    const category = DEMO_CATEGORIES.find(c => c.slug === categorySlug);
    if (!category) return { category: null, products: [] };
    
    const products = DEMO_PRODUCTS.filter(p => p.category_id === category.id);
    return { category, products };
  },

  /**
   * Get a single published, non-hidden product by slug
   */
  async getPublishedProductBySlug(slug) {
    const product = DEMO_PRODUCTS.find(p => p.slug === slug);
    return product || null;
  }
};
