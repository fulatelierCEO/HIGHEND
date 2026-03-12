"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, Product } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'live')
        .order('created_at', { ascending: false });

      if (data) setProducts(data);
      setLoading(false);
    }

    fetchData();
  }, []);

  const filteredProducts = products
    .filter(p => selectedType === 'all' || p.type === selectedType)
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-sans text-sm text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="max-w-7xl mx-auto px-8 lg:px-12 py-20">
        <div className="mb-20">
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-neutral-400 mb-4">Marketplace</p>
          <h1 className="font-serif text-7xl tracking-tight mb-6">All Products</h1>
          <p className="font-sans text-lg text-neutral-600">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 mb-16 pb-8 border-b border-neutral-200/60">
          <div className="flex flex-wrap gap-4 sm:ml-auto">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[200px] font-sans">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="saas">SaaS</SelectItem>
                <SelectItem value="template">Templates</SelectItem>
                <SelectItem value="service">Services</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[200px] font-sans">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
          {filteredProducts.map((product) => (
            <div key={product.id} className="group">
              <Link href={`/products/${product.id}`}>
                <div className="relative aspect-[3/4] mb-6 overflow-hidden bg-neutral-50">
                  {product.type === 'saas' && (
                    <Badge className="absolute top-4 left-4 z-10 bg-blue-500 text-white border-0 font-sans">
                      SaaS
                    </Badge>
                  )}
                  {product.type === 'service' && (
                    <Badge className="absolute top-4 left-4 z-10 bg-purple-500 text-white border-0 font-sans">
                      Service
                    </Badge>
                  )}
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                </div>
              </Link>
              <Link href={`/products/${product.id}`}>
                <h3 className="font-serif text-2xl mb-3 group-hover:text-neutral-500 transition-colors">
                  {product.name}
                </h3>
              </Link>
              <p className="font-sans text-neutral-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                {product.description}
              </p>
              <div className="flex items-center justify-between">
                <p className="font-sans text-lg">
                  ${product.price.toFixed(2)}
                  {product.type === 'saas' && <span className="text-sm text-neutral-500">/mo</span>}
                </p>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="font-sans text-neutral-600">No products found matching your criteria.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
