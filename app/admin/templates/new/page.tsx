"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

export default function NewTemplatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    image_url: '',
    demo_url: '',
    stock: '100',
    featured: false,
    tech_stack: '',
    features: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'name' && !formData.slug) {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const techStack = formData.tech_stack.split(',').map(s => s.trim()).filter(Boolean);
      const features = formData.features.split(',').map(s => s.trim()).filter(Boolean);

      const { error } = await supabase.from('templates').insert({
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        price: parseFloat(formData.price),
        image_url: formData.image_url,
        demo_url: formData.demo_url,
        stock: parseInt(formData.stock),
        featured: formData.featured,
        tech_stack: techStack,
        features: features,
        gallery_images: []
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Template created successfully"
      });

      router.push('/admin/templates');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create template",
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
              <span className="text-sm text-neutral-500">New Template</span>
            </div>
            <Link href="/admin/templates">
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
          <h1 className="text-4xl font-light tracking-tight mb-2">Add New Template</h1>
          <p className="text-neutral-600 font-light">Create a new template for your marketplace</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl font-light">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <Label htmlFor="name">Template Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-1"
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
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="stock">Stock *</Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="featured">Featured Template</Label>
                  <p className="text-sm text-neutral-500">Display on homepage</p>
                </div>
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl font-light">Media & Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="image_url">Preview Image URL *</Label>
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
                <Label htmlFor="demo_url">Live Demo URL</Label>
                <Input
                  id="demo_url"
                  name="demo_url"
                  type="url"
                  value={formData.demo_url}
                  onChange={handleChange}
                  placeholder="https://demo.example.com"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl font-light">Technical Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="tech_stack">Tech Stack</Label>
                <Input
                  id="tech_stack"
                  name="tech_stack"
                  value={formData.tech_stack}
                  onChange={handleChange}
                  placeholder="Next.js, TypeScript, Tailwind CSS"
                  className="mt-1"
                />
                <p className="text-sm text-neutral-500 mt-1">Comma-separated list</p>
              </div>

              <div>
                <Label htmlFor="features">Features</Label>
                <Textarea
                  id="features"
                  name="features"
                  value={formData.features}
                  onChange={handleChange}
                  placeholder="Authentication, Billing, Analytics"
                  rows={3}
                  className="mt-1"
                />
                <p className="text-sm text-neutral-500 mt-1">Comma-separated list</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Creating...' : 'Create Template'}
            </Button>
            <Link href="/admin/templates" className="flex-1">
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
