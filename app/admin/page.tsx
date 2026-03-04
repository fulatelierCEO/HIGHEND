"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, Template, ConsultingInquiry, WorkshopLog } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, MessageSquare, FileText, Plus, Settings } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    templates: 0,
    inquiries: 0,
    workshopLogs: 0,
    newInquiries: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const [templatesRes, inquiriesRes, logsRes] = await Promise.all([
        supabase.from('templates').select('id', { count: 'exact', head: true }),
        supabase.from('consulting_inquiries').select('*', { count: 'exact' }),
        supabase.from('workshop_logs').select('id', { count: 'exact', head: true })
      ]);

      const newInquiriesCount = inquiriesRes.data?.filter(i => i.status === 'new').length || 0;

      setStats({
        templates: templatesRes.count || 0,
        inquiries: inquiriesRes.count || 0,
        workshopLogs: logsRes.count || 0,
        newInquiries: newInquiriesCount
      });

      setLoading(false);
    }

    fetchStats();
  }, []);

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

  return (
    <div className="min-h-screen bg-neutral-50">
      <nav className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-2xl font-light tracking-tight">
                ATELIER
              </Link>
              <span className="text-sm text-neutral-500">Admin Dashboard</span>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm">
                Back to Site
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-light tracking-tight mb-2">Dashboard</h1>
          <p className="text-neutral-600 font-light">Manage your templates, inquiries, and content</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Templates</CardTitle>
              <Package className="w-4 h-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-light">{stats.templates}</div>
              <p className="text-xs text-neutral-500 mt-1">Total templates</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inquiries</CardTitle>
              <MessageSquare className="w-4 h-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-light">{stats.inquiries}</div>
              <p className="text-xs text-neutral-500 mt-1">
                {stats.newInquiries} new
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Workshop Logs</CardTitle>
              <FileText className="w-4 h-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-light">{stats.workshopLogs}</div>
              <p className="text-xs text-neutral-500 mt-1">Published posts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Settings</CardTitle>
              <Settings className="w-4 h-4 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <Link href="/admin/settings">
                <Button variant="outline" size="sm" className="w-full">
                  Configure
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-light">Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-neutral-600 font-light">
                Manage your template library, add new templates, and update existing ones.
              </p>
              <div className="space-y-2">
                <Link href="/admin/templates">
                  <Button className="w-full" variant="outline">
                    Manage Templates
                  </Button>
                </Link>
                <Link href="/admin/templates/new">
                  <Button className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Template
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-light">Consulting Inquiries</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-neutral-600 font-light">
                Review and respond to consulting requests from potential clients.
              </p>
              <Link href="/admin/inquiries">
                <Button className="w-full">
                  View Inquiries
                  {stats.newInquiries > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-neutral-900 text-white text-xs rounded-full">
                      {stats.newInquiries}
                    </span>
                  )}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-light">Workshop Logs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-neutral-600 font-light">
                Share your development journey with build-in-public updates.
              </p>
              <div className="space-y-2">
                <Link href="/admin/workshop">
                  <Button className="w-full" variant="outline">
                    Manage Logs
                  </Button>
                </Link>
                <Link href="/admin/workshop/new">
                  <Button className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    New Dev Log
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
