"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, Template, Category } from '@/lib/supabase';
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
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [templatesRes, categoriesRes] = await Promise.all([
        supabase.from('templates').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*')
      ]);

      if (templatesRes.data) setTemplates(templatesRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);
      setLoading(false);
    }

    fetchData();
  }, []);

  const filteredTemplates = templates
    .filter(t => selectedCategory === 'all' || t.category_id === selectedCategory)
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
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-neutral-400 mb-4">Collection</p>
          <h1 className="font-serif text-7xl tracking-tight mb-6">All Templates</h1>
          <p className="font-sans text-lg text-neutral-600">
            {filteredTemplates.length} {filteredTemplates.length === 1 ? 'template' : 'templates'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 mb-16 pb-8 border-b border-neutral-200/60">
          <div className="flex flex-wrap gap-4 sm:ml-auto">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px] font-sans">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
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
          {filteredTemplates.map((template) => (
            <div key={template.id} className="group">
              <Link href={`/products/${template.slug}`}>
                <div className="relative aspect-[3/4] mb-6 overflow-hidden bg-neutral-50">
                  {template.stock < 5 && template.stock > 0 && (
                    <Badge className="absolute top-4 left-4 z-10 bg-amber-500 text-white border-0 font-sans">
                      Only {template.stock} left
                    </Badge>
                  )}
                  {template.stock === 0 && (
                    <Badge className="absolute top-4 left-4 z-10 bg-neutral-900 text-white border-0 font-sans">
                      Sold Out
                    </Badge>
                  )}
                  <img
                    src={template.image_url}
                    alt={template.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </Link>
              <Link href={`/products/${template.slug}`}>
                <h3 className="font-serif text-2xl mb-3 group-hover:text-neutral-500 transition-colors">
                  {template.name}
                </h3>
              </Link>
              <p className="font-sans text-neutral-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                {template.description}
              </p>
              <div className="flex items-center justify-between">
                <p className="font-sans text-lg">${template.price.toFixed(2)}</p>
                {template.demo_url && (
                  <Link href={template.demo_url} target="_blank" className="font-sans text-xs uppercase tracking-wider text-neutral-400 hover:text-neutral-900 transition-colors flex items-center gap-1">
                    Preview
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-20">
            <p className="font-sans text-neutral-600">No templates found matching your criteria.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
