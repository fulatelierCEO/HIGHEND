"use client";

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Play, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BuildInPublicVideo {
  id: string;
  title: string;
  caption: string | null;
  video_url: string;
  product_id: string | null;
  thumbnail_url: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  type: string;
}

export default function BuildInPublicStudio() {
  const [videos, setVideos] = useState<BuildInPublicVideo[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    caption: '',
    video_url: '',
    product_id: '',
    thumbnail_url: '',
    published: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [videosRes, productsRes] = await Promise.all([
        supabase
          .from('build_in_public')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('products')
          .select('id, name, type')
          .order('name', { ascending: true })
      ]);

      if (videosRes.error) throw videosRes.error;
      if (productsRes.error) throw productsRes.error;

      setVideos(videosRes.data || []);
      setProducts(productsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ title: 'Error', description: 'Failed to fetch data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('video')) {
      toast({ title: 'Error', description: 'Please upload a video file', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `build-in-public/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('files')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, video_url: publicUrl }));
      toast({ title: 'Success', description: 'Video uploaded successfully' });
    } catch (error) {
      console.error('Error uploading video:', error);
      toast({ title: 'Error', description: 'Failed to upload video', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.video_url) {
      toast({ title: 'Error', description: 'Please upload a video', variant: 'destructive' });
      return;
    }

    try {
      const videoData = {
        title: formData.title,
        caption: formData.caption || null,
        video_url: formData.video_url,
        product_id: formData.product_id || null,
        thumbnail_url: formData.thumbnail_url || null,
        published: formData.published,
        published_at: formData.published ? new Date().toISOString() : null,
      };

      const { error } = await supabase
        .from('build_in_public')
        .insert([videoData]);

      if (error) throw error;

      toast({ title: 'Success', description: 'Video created successfully' });
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error creating video:', error);
      toast({ title: 'Error', description: 'Failed to create video', variant: 'destructive' });
    }
  }

  async function handleTogglePublish(video: BuildInPublicVideo) {
    try {
      const { error } = await supabase
        .from('build_in_public')
        .update({
          published: !video.published,
          published_at: !video.published ? new Date().toISOString() : null,
        })
        .eq('id', video.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Video ${!video.published ? 'published' : 'unpublished'} successfully`
      });
      fetchData();
    } catch (error) {
      console.error('Error toggling publish:', error);
      toast({ title: 'Error', description: 'Failed to update video', variant: 'destructive' });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      const { error } = await supabase
        .from('build_in_public')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({ title: 'Success', description: 'Video deleted successfully' });
      fetchData();
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({ title: 'Error', description: 'Failed to delete video', variant: 'destructive' });
    }
  }

  function resetForm() {
    setFormData({
      title: '',
      caption: '',
      video_url: '',
      product_id: '',
      thumbnail_url: '',
      published: false,
    });
  }

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
          <h1 className="font-serif text-5xl text-[#1A1A1A] mb-2">Build in Public Studio</h1>
          <p className="text-sm text-[#1A1A1A]/60">Share your development journey with video updates</p>
        </div>

        <div className="bg-white border border-[#1A1A1A]/10 p-8 mb-8">
          <h2 className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 mb-6">Upload New Video</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-2 border-dashed border-[#1A1A1A]/20 p-12 text-center">
              {formData.video_url ? (
                <div className="space-y-4">
                  <video
                    src={formData.video_url}
                    controls
                    className="max-h-64 mx-auto"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormData({ ...formData, video_url: '' })}
                    className="uppercase tracking-widest"
                  >
                    Replace Video
                  </Button>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleVideoUpload}
                    disabled={uploading}
                  />
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-[#1A1A1A] text-white flex items-center justify-center">
                      {uploading ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent animate-spin" />
                      ) : (
                        <Upload className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <p className="font-serif text-lg text-[#1A1A1A] mb-1">
                        {uploading ? 'Uploading...' : 'Drop MP4 here or click to upload'}
                      </p>
                      <p className="text-xs text-[#1A1A1A]/40">Supports MP4, MOV, and other video formats</p>
                    </div>
                  </div>
                </label>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 block mb-2">
                  Video Title
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Behind the scenes: Building the checkout flow"
                  required
                  className="border-[#1A1A1A]/10"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 block mb-2">
                  Tag Product
                </label>
                <Select value={formData.product_id} onValueChange={(value) => setFormData({ ...formData, product_id: value })}>
                  <SelectTrigger className="border-[#1A1A1A]/10">
                    <SelectValue placeholder="Select a product (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No product</SelectItem>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 block mb-2">
                Caption
              </label>
              <Textarea
                value={formData.caption}
                onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                placeholder="Share what you're working on..."
                rows={3}
                className="border-[#1A1A1A]/10"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-xs uppercase tracking-widest text-[#1A1A1A]/60">
                  Publish Immediately
                </span>
              </label>
            </div>

            <Button
              type="submit"
              disabled={uploading || !formData.video_url}
              className="bg-[#1A1A1A] text-white hover:bg-[#1A1A1A]/80 uppercase tracking-widest"
            >
              Create Video Post
            </Button>
          </form>
        </div>

        <div className="space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 mb-4">All Videos</h2>
          {videos.length === 0 ? (
            <div className="bg-white border border-[#1A1A1A]/10 p-12 text-center">
              <p className="text-[#1A1A1A]/40">No videos yet. Upload your first build-in-public video.</p>
            </div>
          ) : (
            videos.map((video) => (
              <div key={video.id} className="bg-white border border-[#1A1A1A]/10 p-6">
                <div className="flex gap-6">
                  <div className="w-48 h-32 bg-[#1A1A1A]/5 flex items-center justify-center">
                    <video
                      src={video.video_url}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-serif text-xl text-[#1A1A1A]">{video.title}</h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTogglePublish(video)}
                          className={`px-3 py-1 text-xs uppercase tracking-wider ${
                            video.published
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {video.published ? 'Published' : 'Draft'}
                        </button>
                        <button
                          onClick={() => window.open(video.video_url, '_blank')}
                          className="p-2 hover:bg-[#1A1A1A]/10 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(video.id)}
                          className="p-2 hover:bg-red-100 transition-colors text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {video.caption && (
                      <p className="text-sm text-[#1A1A1A]/60 mb-3">{video.caption}</p>
                    )}
                    <p className="text-xs text-[#1A1A1A]/40">
                      Created {new Date(video.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
