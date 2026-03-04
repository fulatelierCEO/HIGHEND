"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, WorkshopLog } from '@/lib/supabase';
import { ShoppingBag, Calendar, ArrowRight } from 'lucide-react';

export default function WorkshopPage() {
  const [logs, setLogs] = useState<WorkshopLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      const { data } = await supabase
        .from('workshop_logs')
        .select('*')
        .order('published_at', { ascending: false });

      if (data) setLogs(data);
      setLoading(false);
    }

    fetchLogs();
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
                TEMPLATES
              </Link>
              <Link href="/workshop" className="text-sm tracking-wide hover:text-neutral-600 transition-colors">
                WORKSHOP
              </Link>
              <Link href="/cart" className="text-sm tracking-wide hover:text-neutral-600 transition-colors">
                <ShoppingBag className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="max-w-3xl mb-16">
          <h1 className="text-6xl font-light tracking-tight mb-6">The Workshop</h1>
          <p className="text-xl text-neutral-600 font-light leading-relaxed">
            Follow along as we build in public. Here you'll find development logs, design decisions,
            technical deep-dives, and the story behind each template we create.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {logs.map((log) => (
            <Link
              key={log.id}
              href={`/workshop/${log.slug}`}
              className="group"
            >
              <div className="aspect-video mb-4 overflow-hidden bg-neutral-100 border border-neutral-200">
                <img
                  src={log.image_url}
                  alt={log.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-500 mb-3">
                <Calendar className="w-3.5 h-3.5" />
                <time>
                  {new Date(log.published_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </time>
              </div>
              <h2 className="text-xl font-light mb-2 group-hover:text-neutral-600 transition-colors">
                {log.title}
              </h2>
              <p className="text-sm text-neutral-600 font-light line-clamp-3 mb-4">
                {log.excerpt}
              </p>
              <div className="flex items-center text-sm text-neutral-900 group-hover:translate-x-2 transition-transform">
                Read More
                <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      <footer className="border-t border-neutral-200 py-12 mt-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-medium mb-4 tracking-wide">TEMPLATES</h3>
              <ul className="space-y-2">
                <li><Link href="/products" className="text-sm text-neutral-600 hover:text-neutral-900">All Templates</Link></li>
                <li><Link href="/workshop" className="text-sm text-neutral-600 hover:text-neutral-900">Workshop</Link></li>
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
