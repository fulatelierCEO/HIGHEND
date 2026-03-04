"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingBag, Lock } from 'lucide-react';
import { getCart, getCartTotal, clearCart, CartItem } from '@/lib/cart';
import { useToast } from '@/hooks/use-toast';

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });

  useEffect(() => {
    const items = getCart();
    setCartItems(items);
    setTotal(getCartTotal());

    if (items.length === 0) {
      router.push('/cart');
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const items = cartItems.map(item => ({
        id: item.product.id,
        name: item.product.name,
        description: item.product.description,
        price: item.product.price,
        quantity: item.quantity,
        image_url: item.product.image_url
      }));

      const response = await fetch(`${supabaseUrl}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          items,
          customerEmail: formData.email
        })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return null;
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
        <h1 className="text-5xl font-light tracking-tight mb-12">Checkout</h1>

        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <h2 className="text-2xl font-light mb-6">Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-light mb-6">Additional Information (Optional)</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-neutral-200">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Complete Order
                    </>
                  )}
                </Button>
                <p className="text-sm text-center text-neutral-600 mt-4">
                  Your payment information is secure and encrypted
                </p>
              </div>
            </form>
          </div>

          <div>
            <div className="bg-neutral-50 p-8 sticky top-8">
              <h2 className="text-2xl font-light mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6 pb-6 border-b border-neutral-200">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="flex gap-4">
                    <div className="w-20 h-24 bg-neutral-100 overflow-hidden flex-shrink-0">
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-light">{item.product.name}</h3>
                      <p className="text-sm text-neutral-600">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-light">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b border-neutral-200">
                <div className="flex justify-between font-light">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-light">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
              </div>

              <div className="flex justify-between text-xl font-light">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
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
