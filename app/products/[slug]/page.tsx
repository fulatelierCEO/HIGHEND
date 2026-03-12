"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, Product } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, ArrowLeft, Check, Minus, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addToCart } from '@/lib/cart';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.slug)
        .eq('status', 'live')
        .maybeSingle();

      if (data) {
        setProduct(data);

        const { data: related } = await supabase
          .from('products')
          .select('*')
          .eq('type', data.type)
          .eq('status', 'live')
          .neq('id', data.id)
          .limit(3);

        if (related) setRelatedProducts(related);
      }

      setLoading(false);
    }

    fetchProduct();
  }, [params.slug]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      toast({
        title: "Added to cart",
        description: `${quantity} × ${product.name} added to your cart.`,
      });
    }
  };

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

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light mb-4">Product not found</h1>
          <Link href="/products">
            <Button variant="outline">Back to Products</Button>
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

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-sm text-neutral-600 hover:text-neutral-900 mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="grid lg:grid-cols-2 gap-16 mb-24">
          <div>
            <div className="aspect-[3/4] mb-4 overflow-hidden bg-neutral-100 sticky top-8">
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>

          <div className="lg:py-8">
            <div className="mb-8">
              <Badge className="mb-4 bg-neutral-900 text-white border-0">
                {product.type.toUpperCase()}
              </Badge>

              <h1 className="text-5xl font-light tracking-tight mb-4 leading-tight">
                {product.name}
              </h1>

              <p className="text-3xl font-light mb-8">
                ${product.price.toFixed(2)}
                {product.type === 'saas' && <span className="text-xl text-neutral-500">/mo</span>}
              </p>

              <div className="prose prose-lg max-w-none font-light text-neutral-700 leading-relaxed">
                <p>{product.description}</p>
              </div>
            </div>

            <div className="border-t border-neutral-200 pt-8 mb-8">
              <Button
                size="lg"
                className="w-full mb-4"
                onClick={handleAddToCart}
              >
                {product.type === 'saas' ? 'Subscribe Now' : 'Purchase'}
              </Button>
              {product.stripe_price_id && (
                <p className="text-xs text-neutral-500 text-center">
                  Secure checkout powered by Stripe
                </p>
              )}
            </div>

            {product.features && Array.isArray(product.features) && product.features.length > 0 && (
              <div className="border-t border-neutral-200 pt-8 space-y-4">
                <h3 className="font-medium mb-4">Features</h3>
                {product.features.map((feature: string, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-neutral-600 mt-1" />
                    <p className="text-sm text-neutral-600 font-light">{feature}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="border-t border-neutral-200 pt-24">
            <h2 className="text-3xl font-light tracking-tight mb-12">You May Also Like</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/products/${relatedProduct.id}`}
                  className="group"
                >
                  <div className="relative aspect-[3/4] mb-4 overflow-hidden bg-neutral-100">
                    {relatedProduct.image_url && (
                      <img
                        src={relatedProduct.image_url}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <h3 className="text-xl font-light mb-1 group-hover:text-neutral-600 transition-colors">
                    {relatedProduct.name}
                  </h3>
                  <p className="text-lg font-light">
                    ${relatedProduct.price.toFixed(2)}
                    {relatedProduct.type === 'saas' && <span className="text-sm text-neutral-500">/mo</span>}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
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
