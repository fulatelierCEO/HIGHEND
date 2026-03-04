"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, WorkshopLog, Template } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { ShoppingBag, ArrowLeft, Calendar, ExternalLink } from 'lucide-react';

export default function WorkshopLogPage() {
  const params = useParams();
  const router = useRouter();
  const [log, setLog] = useState<WorkshopLog | null>(null);
  const [relatedTemplate, setRelatedTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLog() {
      const { data } = await supabase
        .from('workshop_logs')
        .select('*')
        .eq('slug', params.slug)
        .maybeSingle();

      if (data) {
        setLog(data);

        if (data.template_id) {
          const { data: templateData } = await supabase
            .from('templates')
            .select('*')
            .eq('id', data.template_id)
            .maybeSingle();

          if (templateData) setRelatedTemplate(templateData);
        }
      }

      setLoading(false);
    }

    fetchLog();
  }, [params.slug]);

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

  if (!log) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light mb-4">Log not found</h1>
          <Link href="/workshop">
            <Button variant="outline">Back to Workshop</Button>
          </Link>
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

      <article className="max-w-4xl mx-auto px-6 lg:px-8 py-12">
        <button
          onClick={() => router.back()}
          className="flex items-center text-sm text-neutral-600 hover:text-neutral-900 mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="flex items-center gap-2 text-sm text-neutral-500 mb-6">
          <Calendar className="w-4 h-4" />
          <time>
            {new Date(log.published_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </time>
        </div>

        <h1 className="text-5xl font-light tracking-tight mb-6 leading-tight">
          {log.title}
        </h1>

        <p className="text-xl text-neutral-600 font-light mb-12 leading-relaxed">
          {log.excerpt}
        </p>

        <div className="aspect-video mb-12 overflow-hidden bg-neutral-100">
          <img
            src={log.image_url}
            alt={log.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="prose prose-lg max-w-none font-light text-neutral-700 leading-relaxed mb-16">
          <p className="whitespace-pre-line">{log.content}</p>
        </div>

        {relatedTemplate && (
          <div className="border-t border-neutral-200 pt-12">
            <h2 className="text-2xl font-light mb-6">Related Template</h2>
            <div className="flex gap-6 p-6 bg-neutral-50 border border-neutral-200">
              <div className="w-48 h-32 flex-shrink-0 bg-neutral-100 overflow-hidden">
                <img
                  src={relatedTemplate.image_url}
                  alt={relatedTemplate.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-light mb-2">{relatedTemplate.name}</h3>
                <p className="text-sm text-neutral-600 font-light mb-4">
                  {relatedTemplate.description}
                </p>
                <div className="flex items-center gap-3">
                  <Link href={`/products/${relatedTemplate.slug}`}>
                    <Button size="sm">
                      View Template
                    </Button>
                  </Link>
                  {relatedTemplate.demo_url && (
                    <Link href={relatedTemplate.demo_url} target="_blank">
                      <Button size="sm" variant="outline">
                        <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                        Demo
                      </Button>
                    </Link>
                  )}
                  <span className="text-lg font-light ml-auto">
                    ${relatedTemplate.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </article>

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
