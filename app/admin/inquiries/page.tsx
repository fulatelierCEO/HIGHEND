"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, ConsultingInquiry } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Mail, Building2, Calendar, ArrowLeft } from 'lucide-react';

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<ConsultingInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchInquiries();
  }, []);

  async function fetchInquiries() {
    const { data } = await supabase
      .from('consulting_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setInquiries(data);
    setLoading(false);
  }

  async function updateStatus(id: string, status: 'new' | 'contacted' | 'closed') {
    const { error } = await supabase
      .from('consulting_inquiries')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update inquiry status",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Inquiry status updated"
      });
      fetchInquiries();
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge>New</Badge>;
      case 'contacted':
        return <Badge variant="secondary">Contacted</Badge>;
      case 'closed':
        return <Badge variant="outline">Closed</Badge>;
      default:
        return null;
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

  return (
    <div className="min-h-screen bg-neutral-50">
      <nav className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="text-2xl font-light tracking-tight">
                ATELIER
              </Link>
              <span className="text-sm text-neutral-500">Consulting Inquiries</span>
            </div>
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-light tracking-tight mb-2">Consulting Inquiries</h1>
          <p className="text-neutral-600 font-light">{inquiries.length} total inquiries</p>
        </div>

        <div className="grid gap-6">
          {inquiries.map((inquiry) => (
            <Card key={inquiry.id} className="bg-white">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl font-light mb-2">{inquiry.name}</CardTitle>
                    <CardDescription>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-4 h-4" />
                          <a href={`mailto:${inquiry.email}`} className="hover:underline">
                            {inquiry.email}
                          </a>
                        </div>
                        {inquiry.company && (
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-4 h-4" />
                            {inquiry.company}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {new Date(inquiry.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(inquiry.status)}
                    <Select
                      value={inquiry.status}
                      onValueChange={(value: 'new' | 'contacted' | 'closed') =>
                        updateStatus(inquiry.id, value)
                      }
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <p className="text-sm font-light whitespace-pre-line">{inquiry.message}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {inquiries.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-neutral-200">
            <p className="text-neutral-600 font-light">No inquiries yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
