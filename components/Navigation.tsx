import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

export function Navigation() {
  return (
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
  );
}
