import { useState, useEffect } from "react";
import realPricesData from "../data/real-prices.json";
import realPricesByCategory from "../data/real-prices-by-category.json";
import realPricesStats from "../data/real-prices-stats.json";

export interface RealPrice {
  id: number;
  name: string;
  price: number;
  store: string;
  category: string;
  image: string | null;
  volume: string | null;
  lastUpdated: string;
  source: string;
}

export interface RealPricesStats {
  totalProducts: number;
  categories: number;
  averagePrice: number;
  lastUpdated: string;
  dataSource: string;
}

export function useRealPrices() {
  const [prices, setPrices] = useState<RealPrice[]>([]);
  const [pricesByCategory, setPricesByCategory] = useState<
    Record<string, RealPrice[]>
  >({});
  const [stats, setStats] = useState<RealPricesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Load real data from exported JSON files
      setPrices(realPricesData as RealPrice[]);
      setPricesByCategory(realPricesByCategory as Record<string, RealPrice[]>);
      setStats(realPricesStats as RealPricesStats);
      setLoading(false);
    } catch (err) {
      setError("Failed to load real price data");
      setLoading(false);
    }
  }, []);

  // Search products by name
  const searchProducts = (query: string): RealPrice[] => {
    if (!query.trim()) return prices;

    const lowercaseQuery = query.toLowerCase();
    return prices.filter((product) =>
      product.name.toLowerCase().includes(lowercaseQuery)
    );
  };

  // Get products by category
  const getProductsByCategory = (category: string): RealPrice[] => {
    return pricesByCategory[category] || [];
  };

  // Get all categories
  const getCategories = (): string[] => {
    return Object.keys(pricesByCategory);
  };

  // Get products in price range
  const getProductsInPriceRange = (
    minPrice: number,
    maxPrice: number
  ): RealPrice[] => {
    return prices.filter(
      (product) => product.price >= minPrice && product.price <= maxPrice
    );
  };

  // Get cheapest products
  const getCheapestProducts = (limit: number = 10): RealPrice[] => {
    return [...prices].sort((a, b) => a.price - b.price).slice(0, limit);
  };

  // Get most expensive products
  const getMostExpensiveProducts = (limit: number = 10): RealPrice[] => {
    return [...prices].sort((a, b) => b.price - a.price).slice(0, limit);
  };

  // Get recently updated products
  const getRecentProducts = (limit: number = 10): RealPrice[] => {
    return [...prices]
      .sort(
        (a, b) =>
          new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      )
      .slice(0, limit);
  };

  return {
    prices,
    pricesByCategory,
    stats,
    loading,
    error,
    searchProducts,
    getProductsByCategory,
    getCategories,
    getProductsInPriceRange,
    getCheapestProducts,
    getMostExpensiveProducts,
    getRecentProducts,
  };
}
