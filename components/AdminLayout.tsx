"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LayoutDashboard, Package, Video, Users, LogOut, Loader as Loader2, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function checkAdminAccess() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/');
          return;
        }

        if (user.email === 'fulatelier@gmail.com') {
          setIsAdmin(true);
          setLoading(false);
          return;
        }

        const { data: adminUser, error } = await supabase
          .from('admin_users')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error || !adminUser) {
          router.push('/');
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        console.error('Admin check error:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    }

    checkAdminAccess();
  }, [router]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/');
  }

  async function handleSyncDatabase() {
    setSyncing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: 'Error',
          description: 'No authenticated user found',
          variant: 'destructive',
        });
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', user.email)
        .maybeSingle();

      if (!profile) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            is_subscribed: false,
          });

        if (insertError) {
          toast({
            title: 'Sync Failed',
            description: insertError.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Success',
            description: 'Profile created successfully',
          });
        }
      } else {
        toast({
          title: 'Already Synced',
          description: 'Your profile already exists in the database',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to sync database',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCF8]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A1A1A]" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Build in Public', href: '/admin/build-public', icon: Video },
    { name: 'Leads', href: '/admin/leads', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#FDFCF8] flex">
      <aside className="w-64 bg-white border-r border-[#1A1A1A]/10 flex flex-col">
        <div className="p-8 border-b border-[#1A1A1A]/10">
          <h1 className="font-serif text-3xl tracking-tight text-[#1A1A1A]">Atelier</h1>
          <p className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 mt-2">Admin</p>
        </div>

        <nav className="flex-1 p-6">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 text-sm uppercase tracking-widest transition-colors ${
                      isActive
                        ? 'bg-[#1A1A1A] text-white'
                        : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A] hover:bg-[#1A1A1A]/5'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-6 border-t border-[#1A1A1A]/10 space-y-2">
          <button
            onClick={handleSyncDatabase}
            disabled={syncing}
            className="flex items-center gap-3 px-4 py-3 text-sm uppercase tracking-widest text-[#1A1A1A]/60 hover:text-[#1A1A1A] hover:bg-[#1A1A1A]/5 transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Database className="w-4 h-4" />
            {syncing ? 'Syncing...' : 'Sync Database'}
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 text-sm uppercase tracking-widest text-[#1A1A1A]/60 hover:text-[#1A1A1A] hover:bg-[#1A1A1A]/5 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
