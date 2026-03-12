"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, Template, WorkshopLog } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, ArrowRight, ExternalLink, Calendar } from 'lucide-react';
import ConsultingForm from '@/components/ConsultingForm';

export default function Home() {
  const [featuredTemplates, setFeaturedTemplates] = useState<Template[]>([]);
  const [workshopLogs, setWorkshopLogs] = useState<WorkshopLog[]>([]);
  const [heroTemplate, setHeroTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [templatesRes, workshopRes] = await Promise.all([
        supabase.from('templates').select('*').eq('featured', true).limit(7),
        supabase.from('workshop_logs').select('*').order('published_at', { ascending: false }).limit(3)
      ]);

      if (templatesRes.data && templatesRes.data.length > 0) {
        setHeroTemplate(templatesRes.data[0]);
        setFeaturedTemplates(templatesRes.data.slice(1));
      }

      if (workshopRes.data) {
        setWorkshopLogs(workshopRes.data);
      }

      setLoading(false);
    }

    fetchData();
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
      <nav className="border-b border-neutral-200/60">
        <div className="max-w-7xl mx-auto px-8 lg:px-12">
          <div className="flex items-center justify-between h-24">
            <Link href="/" className="font-serif text-3xl tracking-tight">
              Atelier
            </Link>
            <div className="flex items-center gap-12">
              <Link href="/products" className="font-sans text-xs uppercase tracking-widest hover:text-neutral-500 transition-colors">
                Templates
              </Link>
              <Link href="/workshop" className="font-sans text-xs uppercase tracking-widest hover:text-neutral-500 transition-colors">
                Workshop
              </Link>
              <Link href="/cart" className="hover:text-neutral-500 transition-colors">
                <ShoppingBag className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {heroTemplate && (
        <section className="relative h-[90vh] overflow-hidden">
          <div className="absolute inset-0">
            {heroTemplate.image_url && (
              <img
                src={heroTemplate.image_url}
                alt={heroTemplate.name}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>
          <div className="relative h-full max-w-7xl mx-auto px-8 lg:px-12 flex flex-col justify-end pb-24">
            <p className="font-sans text-xs uppercase tracking-[0.2em] text-white/70 mb-6">
              Featured Template
            </p>
            <h1 className="font-serif text-7xl lg:text-8xl text-white mb-8 tracking-tight max-w-4xl leading-[0.95]">
              {heroTemplate.name}
            </h1>
            <p className="font-sans text-lg text-white/90 mb-12 max-w-xl leading-relaxed">
              {heroTemplate.description}
            </p>
            <div className="flex items-center gap-6">
              <Link href={`/products/${heroTemplate.id}`}>
                <Button size="lg" className="font-sans bg-white text-neutral-900 hover:bg-neutral-100 h-12 px-8">
                  View Details
                </Button>
              </Link>
              {heroTemplate.file_url && (
                <Link href={heroTemplate.file_url} target="_blank" className="font-sans text-sm text-white hover:text-white/70 transition-colors flex items-center gap-2 border-b border-white pb-1">
                  Live Preview
                  <ExternalLink className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="py-32">
        <div className="max-w-7xl mx-auto px-8 lg:px-12">
          <div className="mb-24">
            <p className="font-sans text-xs uppercase tracking-[0.2em] text-neutral-400 mb-4">Collection</p>
            <h2 className="font-serif text-6xl tracking-tight mb-6 max-w-2xl leading-tight">Featured Templates</h2>
            <p className="font-sans text-neutral-600 text-lg max-w-xl leading-relaxed">Production-ready templates to launch faster</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
            {featuredTemplates.map((template) => (
              <div key={template.id} className="group">
                <Link href={`/products/${template.id}`}>
                  <div className="relative aspect-[3/4] mb-6 overflow-hidden bg-neutral-50">
                    {template.image_url && (
                      <img
                        src={template.image_url}
                        alt={template.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                  </div>
                </Link>
                <Link href={`/products/${template.id}`}>
                  <h3 className="font-serif text-2xl mb-3 group-hover:text-neutral-500 transition-colors">
                    {template.name}
                  </h3>
                </Link>
                <p className="font-sans text-neutral-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                  {template.description}
                </p>
                <div className="flex items-center justify-between">
                  <p className="font-sans text-lg">
                    ${template.price.toFixed(2)}
                    {template.type === 'saas' && <span className="text-sm text-neutral-500">/mo</span>}
                  </p>
                  {template.file_url && (
                    <Link href={template.file_url} target="_blank" className="font-sans text-xs uppercase tracking-wider text-neutral-400 hover:text-neutral-900 transition-colors flex items-center gap-1">
                      Preview
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-20">
            <Link href="/products" className="font-sans text-sm uppercase tracking-widest hover:text-neutral-500 transition-colors inline-flex items-center gap-2 border-b border-neutral-900 pb-1">
              View All Templates
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-32 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-8 lg:px-12">
          <div className="mb-20">
            <div className="flex items-end justify-between">
              <div>
                <p className="font-sans text-xs uppercase tracking-[0.2em] text-neutral-400 mb-4">Journal</p>
                <h2 className="font-serif text-5xl tracking-tight mb-4">Workshop Notes</h2>
                <p className="font-sans text-neutral-600">Building in public, one template at a time</p>
              </div>
              <Link href="/workshop" className="font-sans text-xs uppercase tracking-widest hover:text-neutral-500 transition-colors">
                View All
              </Link>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {workshopLogs.map((log) => (
              <Link
                key={log.id}
                href={`/workshop/${log.slug}`}
                className="group"
              >
                <div className="aspect-[4/5] mb-6 overflow-hidden bg-white">
                  <img
                    src={log.image_url}
                    alt={log.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <time className="font-sans text-xs uppercase tracking-wider text-neutral-400 mb-3 block">
                  {new Date(log.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </time>
                <h3 className="font-serif text-xl mb-2 group-hover:text-neutral-500 transition-colors leading-tight">
                  {log.title}
                </h3>
                <p className="font-sans text-sm text-neutral-600 line-clamp-2 leading-relaxed">
                  {log.excerpt}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-40 bg-neutral-900 text-white">
        <div className="max-w-5xl mx-auto px-8 lg:px-12 text-center">
          <h2 className="font-serif text-6xl lg:text-7xl tracking-tight mb-8 leading-[1.1]">
            Ship Faster, Build Better
          </h2>
          <p className="font-sans text-xl text-white/70 leading-relaxed mb-12 max-w-2xl mx-auto">
            Every template is meticulously crafted with modern best practices,
            clean code, and production-ready features.
          </p>
          <Link href="/products" className="font-sans text-sm uppercase tracking-widest hover:text-white/70 transition-colors inline-flex items-center gap-2 border-b border-white pb-1">
            Browse Templates
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <ConsultingForm />

      <footer className="border-t border-neutral-200/60 py-16">
        <div className="max-w-7xl mx-auto px-8 lg:px-12">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div>
              <h3 className="font-sans text-xs uppercase tracking-[0.2em] mb-6">Templates</h3>
              <ul className="space-y-3">
                <li><Link href="/products" className="font-sans text-sm text-neutral-600 hover:text-neutral-900 transition-colors">All Templates</Link></li>
                <li><Link href="/workshop" className="font-sans text-sm text-neutral-600 hover:text-neutral-900 transition-colors">Workshop</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-sans text-xs uppercase tracking-[0.2em] mb-6">Support</h3>
              <ul className="space-y-3">
                <li><Link href="#" className="font-sans text-sm text-neutral-600 hover:text-neutral-900 transition-colors">Contact</Link></li>
                <li><Link href="#" className="font-sans text-sm text-neutral-600 hover:text-neutral-900 transition-colors">Shipping</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-sans text-xs uppercase tracking-[0.2em] mb-6">About</h3>
              <ul className="space-y-3">
                <li><Link href="#" className="font-sans text-sm text-neutral-600 hover:text-neutral-900 transition-colors">Our Story</Link></li>
                <li><Link href="#" className="font-sans text-sm text-neutral-600 hover:text-neutral-900 transition-colors">Journal</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-sans text-xs uppercase tracking-[0.2em] mb-6">Connect</h3>
              <ul className="space-y-3">
                <li><Link href="#" className="font-sans text-sm text-neutral-600 hover:text-neutral-900 transition-colors">Instagram</Link></li>
                <li><Link href="#" className="font-sans text-sm text-neutral-600 hover:text-neutral-900 transition-colors">Newsletter</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-neutral-200/60">
            <p className="font-serif text-2xl mb-4">Atelier</p>
            <p className="font-sans text-xs text-neutral-500">© 2026 Atelier. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
