import Link from 'next/link';

export function Footer() {
  return (
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
  );
}
