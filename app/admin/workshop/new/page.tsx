"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, Template } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Video } from 'lucide-react';

export default function NewWorkshopLogPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<{id: string, name: string}[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image_url: '',
    video_url: '',
    template_id: ''
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    const { data } = await supabase
      .from('templates')
      .select('id, name')
      .order('name');

    if (data) setTemplates(data);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'title' && !formData.slug) {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('workshop_logs').insert({
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        image_url: formData.image_url,
        video_url: formData.video_url,
        template_id: formData.template_id || null,
        published_at: new Date().toISOString()
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Workshop log published successfully"
      });

      router.push('/admin/workshop');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to publish log",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <nav className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="text-2xl font-light tracking-tight">
                ATELIER
              </Link>
              <span className="text-sm text-neutral-500">New Dev Log</span>
            </div>
            <Link href="/admin/workshop">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-light tracking-tight mb-2">New Dev Log</h1>
          <p className="text-neutral-600 font-light">Share your development journey with the community</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl font-light">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="mt-1"
                    placeholder="Building the SaaS Dashboard"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt *</Label>
                <Textarea
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  required
                  rows={2}
                  className="mt-1"
                  placeholder="Brief summary for preview cards"
                />
              </div>

              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  required
                  rows={12}
                  className="mt-1"
                  placeholder="Tell your story... What challenges did you face? What did you learn?"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl font-light">Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="image_url">Cover Image URL *</Label>
                <Input
                  id="image_url"
                  name="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={handleChange}
                  required
                  placeholder="https://images.pexels.com/..."
                  className="mt-1"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Video className="w-4 h-4 text-neutral-500" />
                  <Label htmlFor="video_url">Video Embed URL (YouTube/Vimeo)</Label>
                </div>
                <Input
                  id="video_url"
                  name="video_url"
                  type="url"
                  value={formData.video_url}
                  onChange={handleChange}
                  placeholder="https://www.youtube.com/embed/..."
                  className="mt-1"
                />
                <p className="text-sm text-neutral-500 mt-1">
                  Use embed URL (e.g., youtube.com/embed/VIDEO_ID)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl font-light">Related Template</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="template_id">Link to Template (Optional)</Label>
              <Select
                value={formData.template_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, template_id: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a template..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No template</SelectItem>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <div className="flex items-center gap-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Publishing...' : 'Publish Log'}
            </Button>
            <Link href="/admin/workshop" className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
