"use client";

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/lib/supabase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Phone, Calendar, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Lead {
  id: string;
  client_name: string;
  client_email: string;
  project_intent: string;
  project_type: string | null;
  budget_range: string | null;
  message: string;
  status: string;
  created_at: string;
}

export default function LeadTracker() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchLeads();
  }, []);

  async function fetchLeads() {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({ title: 'Error', description: 'Failed to fetch leads', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  async function updateLeadStatus(leadId: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', leadId);

      if (error) throw error;

      toast({ title: 'Success', description: 'Lead status updated' });
      fetchLeads();
    } catch (error) {
      console.error('Error updating lead:', error);
      toast({ title: 'Error', description: 'Failed to update lead', variant: 'destructive' });
    }
  }

  const filteredLeads = filter === 'all'
    ? leads
    : leads.filter(lead => lead.status === filter);

  const statusCounts = {
    all: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    closed: leads.filter(l => l.status === 'closed').length,
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-12">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-[#1A1A1A]/10" />
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-12">
        <div className="mb-12">
          <h1 className="font-serif text-5xl text-[#1A1A1A] mb-2">Lead Tracker</h1>
          <p className="text-sm text-[#1A1A1A]/60">Manage consulting inquiries and client leads</p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {(['all', 'new', 'contacted', 'closed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`p-6 border transition-colors ${
                filter === status
                  ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white'
                  : 'border-[#1A1A1A]/10 bg-white hover:bg-[#1A1A1A]/5'
              }`}
            >
              <p className="text-xs uppercase tracking-widest mb-2 opacity-60">
                {status === 'all' ? 'All Leads' : status}
              </p>
              <p className="font-serif text-3xl">{statusCounts[status]}</p>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredLeads.length === 0 ? (
            <div className="bg-white border border-[#1A1A1A]/10 p-12 text-center">
              <p className="text-[#1A1A1A]/40">
                {filter === 'all' ? 'No leads yet' : `No ${filter} leads`}
              </p>
            </div>
          ) : (
            filteredLeads.map((lead) => (
              <div key={lead.id} className="bg-white border border-[#1A1A1A]/10 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-serif text-2xl text-[#1A1A1A] mb-1">{lead.client_name}</h3>
                    <div className="flex items-center gap-4 text-sm text-[#1A1A1A]/60">
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {lead.client_email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(lead.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="w-48">
                    <Select
                      value={lead.status}
                      onValueChange={(value) => updateLeadStatus(lead.id, value)}
                    >
                      <SelectTrigger className="border-[#1A1A1A]/10">
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

                <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-[#1A1A1A]/5">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 mb-1">
                      Project Type
                    </p>
                    <p className="text-sm font-medium">
                      {lead.project_type || lead.project_intent || '—'}
                    </p>
                  </div>
                  {lead.budget_range && (
                    <div>
                      <p className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 mb-1">
                        Budget Range
                      </p>
                      <p className="text-sm font-medium flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {lead.budget_range.includes('-')
                          ? lead.budget_range.split('-').map(n => `$${n}k`).join(' — ')
                          : `$${lead.budget_range}`}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 mb-2">
                    Project Brief
                  </p>
                  <p className="text-sm text-[#1A1A1A]/80 leading-relaxed whitespace-pre-wrap">
                    {lead.message}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-[#1A1A1A]/10">
                  <a
                    href={`mailto:${lead.client_email}?subject=Re: ${lead.project_type || 'Your Inquiry'}&body=Hi ${lead.client_name},%0D%0A%0D%0AThank you for reaching out about your ${lead.project_type || 'project'}.%0D%0A%0D%0A`}
                    className="inline-flex items-center gap-2 text-sm text-[#1A1A1A] hover:text-[#1A1A1A]/60 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    Send Email Reply
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
