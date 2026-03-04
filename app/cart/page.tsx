"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { getCart, updateCartItemQuantity, removeFromCart, getCartTotal, CartItem } from '@/lib/cart';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const router = useRouter();

  const loadCart = () => {
    setCartItems(getCart());
    setTotal(getCartTotal());
  };

  useEffect(() => {
    loadCart();

    const handleCartUpdate = () => loadCart();
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateCartItemQuantity(productId, newQuantity);
    }
  };

  const handleRemove = (productId: string) => {
    removeFromCart(productId);
  };

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
        <h1 className="text-5xl font-light tracking-tight mb-12">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-24">
            <ShoppingBag className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h2 className="text-2xl font-light mb-4">Your cart is empty</h2>
            <p className="text-neutral-600 font-light mb-8">
              Discover our curated collection of exceptional pieces
            </p>
            <Link href="/products">
              <Button size="lg">
                Continue Shopping
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-6 pb-6 border-b border-neutral-200"
                  >
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="flex-shrink-0 w-32 h-40 bg-neutral-100 overflow-hidden"
                    >
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="text-xl font-light hover:text-neutral-600 transition-colors"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-neutral-600 text-sm mt-1 font-light">
                          ${item.product.price.toFixed(2)} each
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-neutral-300 rounded-md">
                          <button
                            onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                            className="p-2 hover:bg-neutral-100 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 text-center min-w-[2.5rem]">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                            className="p-2 hover:bg-neutral-100 transition-colors"
                            disabled={item.quantity >= item.product.stock}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemove(item.product.id)}
                          className="text-neutral-600 hover:text-neutral-900 transition-colors p-2"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-light">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-neutral-50 p-8 sticky top-8">
                <h2 className="text-2xl font-light mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6 pb-6 border-b border-neutral-200">
                  <div className="flex justify-between font-light">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-light">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                </div>

                <div className="flex justify-between text-xl font-light mb-8">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <Button
                  size="lg"
                  className="w-full mb-4"
                  onClick={() => router.push('/checkout')}
                >
                  Proceed to Checkout
                </Button>

                <Link href="/products">
                  <Button size="lg" variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
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
