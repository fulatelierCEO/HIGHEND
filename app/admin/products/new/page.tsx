"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader as Loader2 } from 'lucide-react';

export default function NewProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    type: 'template' as 'saas' | 'template' | 'service',
    image_url: '',
    features: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const featuresArray = formData.features
        .split('\n')
        .map(f => f.trim())
        .filter(f => f.length > 0);

      const response = await fetch('/api/admin/products/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: formData.price,
          type: formData.type,
          image_url: formData.image_url || null,
          features: featuresArray.length > 0 ? featuresArray : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create product');
      }

      toast({
        title: 'Success',
        description: 'Product created successfully in Stripe and database',
      });

      router.push('/admin/products');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create product',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <nav className="bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="text-2xl font-light tracking-tight">
                ATELIER
              </Link>
              <span className="text-sm text-neutral-500">New Product</span>
            </div>
            <Link href="/admin/products">
              <Button variant="outline" size="sm" disabled={loading}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-light tracking-tight mb-2">Create Product</h1>
          <p className="text-neutral-600 font-light">
            Product will be created in Stripe and synced to your database
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 p-8 space-y-8">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium uppercase tracking-wider text-neutral-700">
              Product Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={loading}
              placeholder="Enter product name"
              className="font-light"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium uppercase tracking-wider text-neutral-700">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={loading}
              placeholder="Enter product description"
              className="font-light min-h-[100px]"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium uppercase tracking-wider text-neutral-700">
                Product Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'saas' | 'template' | 'service') =>
                  setFormData({ ...formData, type: value })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="template">Template (One-time)</SelectItem>
                  <SelectItem value="saas">SaaS (Recurring)</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-neutral-500 font-light">
                {formData.type === 'saas' ? 'Recurring monthly subscription' : 'One-time purchase'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium uppercase tracking-wider text-neutral-700">
                Price (USD)
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                disabled={loading}
                placeholder="0.00"
                className="font-mono"
              />
              {formData.type === 'saas' && (
                <p className="text-xs text-neutral-500 font-light">Per month</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url" className="text-sm font-medium uppercase tracking-wider text-neutral-700">
              Image URL
            </Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              disabled={loading}
              placeholder="https://example.com/image.jpg"
              className="font-light"
            />
            <p className="text-xs text-neutral-500 font-light">Optional product image</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="features" className="text-sm font-medium uppercase tracking-wider text-neutral-700">
              Features
            </Label>
            <Textarea
              id="features"
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              disabled={loading}
              placeholder="Enter one feature per line"
              className="font-light min-h-[120px]"
              rows={5}
            />
            <p className="text-xs text-neutral-500 font-light">One feature per line</p>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-neutral-200">
            <Link href="/admin/products">
              <Button type="button" variant="outline" disabled={loading}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={loading} className="min-w-[200px]">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Stripe Price...
                </>
              ) : (
                'Create Product'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
