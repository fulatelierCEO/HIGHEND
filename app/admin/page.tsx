"use client";

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import AnalyticsHeader from '@/components/AnalyticsHeader';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    activeSubs: 0,
    templateSales: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const { data: purchases, error } = await supabase
          .from('purchases')
          .select('amount, product_id, products(type)')
          .eq('status', 'completed');

        if (error) throw error;

        let totalRevenue = 0;
        let activeSubs = 0;
        let templateSales = 0;

        purchases?.forEach((purchase: any) => {
          totalRevenue += Number(purchase.amount);

          if (purchase.products?.type === 'saas') {
            activeSubs += 1;
          } else if (purchase.products?.type === 'template') {
            templateSales += 1;
          }
        });

        setAnalytics({ totalRevenue, activeSubs, templateSales });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-[#1A1A1A]/10 w-48" />
            <div className="grid grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-[#1A1A1A]/10" />
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-12">
        <div className="mb-12">
          <h1 className="font-serif text-5xl text-[#1A1A1A] mb-2">Dashboard</h1>
          <p className="text-sm text-[#1A1A1A]/60">Overview of your Atelier ecosystem</p>
        </div>

        <AnalyticsHeader
          totalRevenue={analytics.totalRevenue}
          activeSubs={analytics.activeSubs}
          templateSales={analytics.templateSales}
        />

        <div className="mt-12 grid grid-cols-2 gap-8">
          <div className="bg-white border border-[#1A1A1A]/10 p-8">
            <h2 className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 mb-6">
              Quick Actions
            </h2>
            <div className="space-y-4">
              <a
                href="/admin/products"
                className="block p-4 border border-[#1A1A1A]/10 hover:bg-[#1A1A1A]/5 transition-colors"
              >
                <p className="font-serif text-lg text-[#1A1A1A]">Manage Products</p>
              </a>
              <a
                href="/admin/leads"
                className="block p-4 border border-[#1A1A1A]/10 hover:bg-[#1A1A1A]/5 transition-colors"
              >
                <p className="font-serif text-lg text-[#1A1A1A]">View Leads</p>
              </a>
            </div>
          </div>

          <div className="bg-white border border-[#1A1A1A]/10 p-8">
            <h2 className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 mb-6">
              Recent Activity
            </h2>
            <p className="text-sm text-[#1A1A1A]/40">No recent activity</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
