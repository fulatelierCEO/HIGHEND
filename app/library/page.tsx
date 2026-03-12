"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Download, Package, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Purchase {
  id: string;
  product_id: string;
  purchased_at: string;
  products: {
    id: string;
    name: string;
    description: string;
    type: string;
    file_url: string | null;
    image_url: string | null;
  };
}

export default function LibraryPage() {
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/');
        return;
      }

      setUser(user);
      await fetchPurchases(user.id);
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/');
    }
  }

  async function fetchPurchases(userId: string) {
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          id,
          product_id,
          purchased_at,
          products (
            id,
            name,
            description,
            type,
            file_url,
            image_url
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('purchased_at', { ascending: false });

      if (error) throw error;
      setPurchases(data as any || []);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      toast({ title: 'Error', description: 'Failed to fetch your library', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(product: Purchase['products']) {
    if (!product.file_url) {
      toast({ title: 'Error', description: 'No file available for this product', variant: 'destructive' });
      return;
    }

    try {
      const isSupabaseStorage = product.file_url.includes('supabase.co/storage');

      if (isSupabaseStorage) {
        const urlParts = product.file_url.split('/storage/v1/object/public/');
        if (urlParts.length === 2) {
          const [bucket, ...pathParts] = urlParts[1].split('/');
          const filePath = pathParts.join('/');

          const { data, error } = await supabase.storage
            .from(bucket)
            .createSignedUrl(filePath, 3600);

          if (error) throw error;

          if (data?.signedUrl) {
            window.open(data.signedUrl, '_blank');
            toast({ title: 'Success', description: 'Download started' });
            return;
          }
        }
      }

      window.open(product.file_url, '_blank');
      toast({ title: 'Success', description: 'Download started' });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({ title: 'Error', description: 'Failed to download file', variant: 'destructive' });
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCF8]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#1A1A1A] border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-sm text-[#1A1A1A]/60">Loading your library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF8]">
      <nav className="border-b border-[#1A1A1A]/10 bg-white">
        <div className="max-w-7xl mx-auto px-8 lg:px-12">
          <div className="flex items-center justify-between h-24">
            <Link href="/" className="font-serif text-3xl tracking-tight text-[#1A1A1A]">
              Atelier
            </Link>
            <div className="flex items-center gap-6">
              <span className="text-sm text-[#1A1A1A]/60">{user?.email}</span>
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="uppercase tracking-widest text-xs"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 lg:px-12 py-24">
        <div className="mb-16">
          <h1 className="font-serif text-6xl text-[#1A1A1A] mb-4 tracking-tight">Your Library</h1>
          <p className="text-lg text-[#1A1A1A]/60">Access all your purchased templates and resources</p>
        </div>

        {purchases.length === 0 ? (
          <div className="bg-white border border-[#1A1A1A]/10 p-16 text-center">
            <Lock className="w-16 h-16 text-[#1A1A1A]/20 mx-auto mb-6" />
            <h2 className="font-serif text-3xl text-[#1A1A1A] mb-4">Your library is empty</h2>
            <p className="text-[#1A1A1A]/60 mb-8 max-w-md mx-auto">
              Browse our collection of premium templates to get started
            </p>
            <Link href="/products">
              <Button className="bg-[#1A1A1A] text-white hover:bg-[#1A1A1A]/80 uppercase tracking-widest">
                Browse Templates
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {purchases.map((purchase) => (
              <div key={purchase.id} className="bg-white border border-[#1A1A1A]/10 overflow-hidden group">
                {purchase.products.image_url && (
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={purchase.products.image_url}
                      alt={purchase.products.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start gap-2 mb-3">
                    <Package className="w-4 h-4 mt-1 text-[#1A1A1A]/40" />
                    <div className="flex-1">
                      <h3 className="font-serif text-xl text-[#1A1A1A] mb-2">
                        {purchase.products.name}
                      </h3>
                      <p className="text-sm text-[#1A1A1A]/60 mb-4 line-clamp-2">
                        {purchase.products.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-[#1A1A1A]/10">
                    <span className="text-xs text-[#1A1A1A]/40">
                      Purchased {new Date(purchase.purchased_at).toLocaleDateString()}
                    </span>
                    <Button
                      onClick={() => handleDownload(purchase.products)}
                      size="sm"
                      className="bg-[#1A1A1A] text-white hover:bg-[#1A1A1A]/80 uppercase tracking-widest text-xs"
                    >
                      <Download className="w-3 h-3 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
