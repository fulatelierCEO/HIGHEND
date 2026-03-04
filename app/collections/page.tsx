"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, Collection } from '@/lib/supabase';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCollections() {
      const { data } = await supabase
        .from('collections')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) setCollections(data);
      setLoading(false);
    }

    fetchCollections();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-light tracking-tight">
              ATELIER
            </Link>
            <div className="flex items-center gap-8">
              <Link href="/products" className="text-sm tracking-wide hover:text-neutral-600 transition-colors">
                SHOP
              </Link>
              <Link href="/collections" className="text-sm tracking-wide hover:text-neutral-600 transition-colors">
                COLLECTIONS
              </Link>
              <Link href="/cart" className="text-sm tracking-wide hover:text-neutral-600 transition-colors">
                <ShoppingBag className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-5xl font-light tracking-tight mb-4">Collections</h1>
          <p className="text-lg text-neutral-600 font-light">
            Curated selections for every aesthetic
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.slug}`}
              className="group relative h-[600px] overflow-hidden"
            >
              <img
                src={collection.image_url}
                alt={collection.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-10">
                <h3 className="text-4xl font-light text-white mb-3">{collection.name}</h3>
                <p className="text-white/90 font-light text-lg mb-4">{collection.description}</p>
                <div className="flex items-center text-white group-hover:translate-x-2 transition-transform">
                  <span className="text-sm tracking-wide mr-2">Explore Collection</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <footer className="border-t border-neutral-200 py-12 mt-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-medium mb-4 tracking-wide">SHOP</h3>
              <ul className="space-y-2">
                <li><Link href="/products" className="text-sm text-neutral-600 hover:text-neutral-900">All Products</Link></li>
                <li><Link href="/collections" className="text-sm text-neutral-600 hover:text-neutral-900">Collections</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-4 tracking-wide">SUPPORT</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-sm text-neutral-600 hover:text-neutral-900">Contact</Link></li>
                <li><Link href="#" className="text-sm text-neutral-600 hover:text-neutral-900">Shipping</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-4 tracking-wide">ABOUT</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-sm text-neutral-600 hover:text-neutral-900">Our Story</Link></li>
                <li><Link href="#" className="text-sm text-neutral-600 hover:text-neutral-900">Journal</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-4 tracking-wide">CONNECT</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-sm text-neutral-600 hover:text-neutral-900">Instagram</Link></li>
                <li><Link href="#" className="text-sm text-neutral-600 hover:text-neutral-900">Newsletter</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-neutral-200 text-center">
            <p className="text-sm text-neutral-600">© 2026 Atelier. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
