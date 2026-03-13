"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    activeLeads: 0,
  });
  const [projects, setProjects] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddVideo, setShowAddVideo] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const [purchasesRes, leadsRes, productsRes] = await Promise.all([
        supabase
          .from('purchases')
          .select('amount')
          .eq('status', 'completed'),
        supabase
          .from('leads')
          .select('id')
          .eq('status', 'new'),
        supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
      ]);

      const totalRevenue = purchasesRes.data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      const activeLeads = leadsRes.data?.length || 0;

      setAnalytics({ totalRevenue, activeLeads });
      setProjects(productsRes.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSyncProfiles() {
    setSyncing(true);
    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', 'fulatelier@gmail.com')
        .maybeSingle();

      if (!existingProfile) {
        const { error } = await supabase
          .from('profiles')
          .insert({
            email: 'fulatelier@gmail.com',
            role: 'admin',
          });

        if (error) throw error;
        alert('Profile synced successfully!');
      } else {
        const { error } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('email', 'fulatelier@gmail.com');

        if (error) throw error;
        alert('Profile updated to admin!');
      }
    } catch (error: any) {
      alert('Error syncing profile: ' + error.message);
    } finally {
      setSyncing(false);
    }
  }

  async function handleDeleteProject(id: string) {
    if (!confirm('Delete this project?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setProjects(projects.filter(p => p.id !== id));
    } catch (error: any) {
      alert('Error deleting project: ' + error.message);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#1A1A1A] border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-xs text-[#1A1A1A]/60 tracking-wider uppercase">Loading</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF8]">
      <header className="border-b border-[#1A1A1A]/10 bg-white">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-4xl text-[#1A1A1A] mb-1">Atelier</h1>
            <p className="text-xs text-[#1A1A1A]/60 tracking-wider uppercase">Admin Dashboard</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleSyncProfiles}
              disabled={syncing}
              className="px-6 py-3 border border-[#1A1A1A] text-[#1A1A1A] text-xs tracking-wider uppercase hover:bg-[#1A1A1A] hover:text-white transition-colors disabled:opacity-50"
            >
              {syncing ? 'Syncing...' : 'Sync Profiles'}
            </button>
            <a
              href="/login"
              className="px-6 py-3 border border-[#1A1A1A]/20 text-[#1A1A1A]/60 text-xs tracking-wider uppercase hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-colors"
            >
              Login
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        <section className="mb-16">
          <h2 className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 mb-8">Sales Overview</h2>
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-white border border-[#1A1A1A]/10 p-8">
              <p className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 mb-4">Total Revenue</p>
              <p className="font-serif text-6xl text-[#1A1A1A]">${analytics.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-white border border-[#1A1A1A]/10 p-8">
              <p className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 mb-4">Active Leads</p>
              <p className="font-serif text-6xl text-[#1A1A1A]">{analytics.activeLeads}</p>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xs uppercase tracking-widest text-[#1A1A1A]/40">Project Manager</h2>
            <button
              onClick={() => setShowAddProject(!showAddProject)}
              className="px-6 py-2 bg-[#1A1A1A] text-white text-xs tracking-wider uppercase hover:bg-[#1A1A1A]/90 transition-colors"
            >
              {showAddProject ? 'Cancel' : 'Add Project'}
            </button>
          </div>

          {showAddProject && (
            <div className="bg-white border border-[#1A1A1A]/10 p-8 mb-8">
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                try {
                  const { error } = await supabase
                    .from('products')
                    .insert({
                      name: formData.get('name'),
                      description: formData.get('description'),
                      price: Number(formData.get('price')),
                      type: formData.get('type'),
                      image_url: formData.get('image_url') || 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg',
                    });

                  if (error) throw error;
                  setShowAddProject(false);
                  fetchDashboardData();
                } catch (error: any) {
                  alert('Error adding project: ' + error.message);
                }
              }}>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[#1A1A1A]/60 mb-2">
                      Project Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full px-4 py-3 border border-[#1A1A1A]/20 bg-white text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[#1A1A1A]/60 mb-2">
                      Price
                    </label>
                    <input
                      type="number"
                      name="price"
                      required
                      step="0.01"
                      className="w-full px-4 py-3 border border-[#1A1A1A]/20 bg-white text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-xs uppercase tracking-widest text-[#1A1A1A]/60 mb-2">
                    Type
                  </label>
                  <select
                    name="type"
                    required
                    className="w-full px-4 py-3 border border-[#1A1A1A]/20 bg-white text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                  >
                    <option value="template">Template</option>
                    <option value="saas">SaaS</option>
                  </select>
                </div>
                <div className="mb-6">
                  <label className="block text-xs uppercase tracking-widest text-[#1A1A1A]/60 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-[#1A1A1A]/20 bg-white text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-xs uppercase tracking-widest text-[#1A1A1A]/60 mb-2">
                    Image URL (optional)
                  </label>
                  <input
                    type="url"
                    name="image_url"
                    className="w-full px-4 py-3 border border-[#1A1A1A]/20 bg-white text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#1A1A1A] text-white py-4 text-xs tracking-wider uppercase hover:bg-[#1A1A1A]/90 transition-colors"
                >
                  Create Project
                </button>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {projects.length === 0 ? (
              <div className="bg-white border border-[#1A1A1A]/10 p-12 text-center">
                <p className="text-sm text-[#1A1A1A]/40">No projects yet</p>
              </div>
            ) : (
              projects.map((project) => (
                <div key={project.id} className="bg-white border border-[#1A1A1A]/10 p-6 flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-serif text-2xl text-[#1A1A1A] mb-1">{project.name}</h3>
                    <p className="text-sm text-[#1A1A1A]/60 mb-2">{project.description}</p>
                    <div className="flex gap-4 text-xs text-[#1A1A1A]/40">
                      <span className="uppercase tracking-wider">{project.type}</span>
                      <span>${project.price}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/admin/products?edit=${project.id}`)}
                      className="px-4 py-2 border border-[#1A1A1A]/20 text-[#1A1A1A]/60 text-xs tracking-wider uppercase hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="px-4 py-2 border border-red-600/20 text-red-600/60 text-xs tracking-wider uppercase hover:border-red-600 hover:text-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xs uppercase tracking-widest text-[#1A1A1A]/40">Build-in-Public Journal</h2>
            <button
              onClick={() => setShowAddVideo(!showAddVideo)}
              className="px-6 py-2 bg-[#1A1A1A] text-white text-xs tracking-wider uppercase hover:bg-[#1A1A1A]/90 transition-colors"
            >
              {showAddVideo ? 'Cancel' : 'Add Video'}
            </button>
          </div>

          {showAddVideo && (
            <div className="bg-white border border-[#1A1A1A]/10 p-8 mb-8">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const newVideo = {
                  id: Date.now().toString(),
                  title: formData.get('title'),
                  url: formData.get('url'),
                  description: formData.get('description'),
                };
                setVideos([newVideo, ...videos]);
                setShowAddVideo(false);
              }}>
                <div className="mb-6">
                  <label className="block text-xs uppercase tracking-widest text-[#1A1A1A]/60 mb-2">
                    Video Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="w-full px-4 py-3 border border-[#1A1A1A]/20 bg-white text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-xs uppercase tracking-widest text-[#1A1A1A]/60 mb-2">
                    Video URL
                  </label>
                  <input
                    type="url"
                    name="url"
                    required
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-4 py-3 border border-[#1A1A1A]/20 bg-white text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-xs uppercase tracking-widest text-[#1A1A1A]/60 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-4 py-3 border border-[#1A1A1A]/20 bg-white text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#1A1A1A] text-white py-4 text-xs tracking-wider uppercase hover:bg-[#1A1A1A]/90 transition-colors"
                >
                  Add Video
                </button>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {videos.length === 0 ? (
              <div className="bg-white border border-[#1A1A1A]/10 p-12 text-center">
                <p className="text-sm text-[#1A1A1A]/40">No videos yet</p>
              </div>
            ) : (
              videos.map((video) => (
                <div key={video.id} className="bg-white border border-[#1A1A1A]/10 p-6">
                  <h3 className="font-serif text-xl text-[#1A1A1A] mb-2">{video.title}</h3>
                  <p className="text-sm text-[#1A1A1A]/60 mb-3">{video.description}</p>
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#1A1A1A]/40 hover:text-[#1A1A1A] tracking-wider uppercase"
                  >
                    Watch Video →
                  </a>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
