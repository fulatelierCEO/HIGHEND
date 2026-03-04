"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CircleCheck as CheckCircle, Mail, Package, ArrowRight } from 'lucide-react';
import { clearCart } from '@/lib/cart';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const [sessionId] = useState(searchParams.get('session_id'));

  useEffect(() => {
    clearCart();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50">
      <nav className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-light tracking-tight">
              ATELIER
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-5xl font-light tracking-tight mb-4">Thank You!</h1>
          <p className="text-xl text-neutral-600 font-light">
            Your order has been successfully placed
          </p>
        </div>

        <Card className="mb-8 bg-white">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4 pb-6 border-b border-neutral-200">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium mb-2">Confirmation Email Sent</h3>
                  <p className="text-sm text-neutral-600 font-light">
                    We've sent a confirmation email with your order details. Please check your inbox.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 pb-6 border-b border-neutral-200">
                <div className="flex-shrink-0 w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium mb-2">Templates Being Prepared</h3>
                  <p className="text-sm text-neutral-600 font-light">
                    Your templates are being prepared for delivery. You'll receive a separate email with download links within 24 hours.
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-3">What's Next?</h3>
                <ul className="space-y-2 text-sm text-neutral-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Check your email for the order confirmation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Download your templates when the delivery email arrives</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Read the documentation to get started quickly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Join our community for support and updates</span>
                  </li>
                </ul>
              </div>

              {sessionId && (
                <div className="text-center pt-4">
                  <p className="text-xs text-neutral-500 font-mono">
                    Order ID: {sessionId.substring(0, 20)}...
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/products" className="flex-1">
            <Button variant="outline" size="lg" className="w-full">
              Browse More Templates
            </Button>
          </Link>
          <Link href="/workshop" className="flex-1">
            <Button size="lg" className="w-full group">
              Visit Workshop
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-neutral-600 font-light mb-2">
            Need help? Have questions?
          </p>
          <a href="mailto:support@atelier.com" className="text-sm text-blue-600 hover:underline">
            Contact Support
          </a>
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
