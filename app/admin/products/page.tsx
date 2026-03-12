"use client";

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  type: 'saas' | 'template' | 'service';
  price: number;
  stripe_price_id: string | null;
  stripe_product_id: string | null;
  status: 'live' | 'draft';
  file_url: string | null;
  image_url: string | null;
}

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'template' as 'saas' | 'template' | 'service',
    price: '',
    stripe_price_id: '',
    stripe_product_id: '',
    status: 'draft' as 'live' | 'draft',
    file_url: '',
    image_url: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({ title: 'Error', description: 'Failed to fetch products', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stripe_price_id: formData.stripe_price_id || null,
        stripe_product_id: formData.stripe_product_id || null,
        file_url: formData.file_url || null,
        image_url: formData.image_url || null,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Product updated successfully' });
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
        toast({ title: 'Success', description: 'Product created successfully' });
      }

      setShowForm(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({ title: 'Error', description: 'Failed to save product', variant: 'destructive' });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Success', description: 'Product deleted successfully' });
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({ title: 'Error', description: 'Failed to delete product', variant: 'destructive' });
    }
  }

  function handleEdit(product: Product) {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      type: product.type,
      price: product.price.toString(),
      stripe_price_id: product.stripe_price_id || '',
      stripe_product_id: product.stripe_product_id || '',
      status: product.status,
      file_url: product.file_url || '',
      image_url: product.image_url || '',
    });
    setShowForm(true);
  }

  function resetForm() {
    setFormData({
      name: '',
      description: '',
      type: 'template',
      price: '',
      stripe_price_id: '',
      stripe_product_id: '',
      status: 'draft',
      file_url: '',
      image_url: '',
    });
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, field: 'file_url' | 'image_url') {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${field === 'file_url' ? 'products' : 'images'}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('files')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, [field]: publicUrl }));
      toast({ title: 'Success', description: 'File uploaded successfully' });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({ title: 'Error', description: 'Failed to upload file', variant: 'destructive' });
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-12">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-[#1A1A1A]/10" />
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="font-serif text-5xl text-[#1A1A1A] mb-2">Products</h1>
            <p className="text-sm text-[#1A1A1A]/60">Manage SaaS, Templates, and Custom Services</p>
          </div>
          <Button
            onClick={() => {
              setShowForm(!showForm);
              setEditingProduct(null);
              resetForm();
            }}
            className="bg-[#1A1A1A] text-white hover:bg-[#1A1A1A]/80 uppercase tracking-widest"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        {showForm && (
          <div className="bg-white border border-[#1A1A1A]/10 p-8 mb-8">
            <h2 className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 mb-6">
              {editingProduct ? 'Edit Product' : 'New Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 block mb-2">
                    Name
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="border-[#1A1A1A]/10"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 block mb-2">
                    Type
                  </label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger className="border-[#1A1A1A]/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="saas">SaaS (Recurring)</SelectItem>
                      <SelectItem value="template">Template (One-time)</SelectItem>
                      <SelectItem value="service">Custom Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 block mb-2">
                  Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="border-[#1A1A1A]/10"
                />
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 block mb-2">
                    Price ($)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    className="border-[#1A1A1A]/10"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 block mb-2">
                    Stripe Price ID
                  </label>
                  <Input
                    value={formData.stripe_price_id}
                    onChange={(e) => setFormData({ ...formData, stripe_price_id: e.target.value })}
                    placeholder="price_..."
                    className="border-[#1A1A1A]/10"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 block mb-2">
                    Status
                  </label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger className="border-[#1A1A1A]/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="live">Live</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 block mb-2">
                    Template File
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.file_url}
                      onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                      placeholder="https://..."
                      className="border-[#1A1A1A]/10"
                    />
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'file_url')}
                      />
                      <div className="px-4 py-2 border border-[#1A1A1A]/10 hover:bg-[#1A1A1A]/5 transition-colors flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                      </div>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#1A1A1A]/40 block mb-2">
                    Image URL
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://..."
                      className="border-[#1A1A1A]/10"
                    />
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'image_url')}
                      />
                      <div className="px-4 py-2 border border-[#1A1A1A]/10 hover:bg-[#1A1A1A]/5 transition-colors flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="bg-[#1A1A1A] text-white hover:bg-[#1A1A1A]/80 uppercase tracking-widest">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                  className="uppercase tracking-widest"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white border border-[#1A1A1A]/10">
          <table className="w-full">
            <thead className="border-b border-[#1A1A1A]/10">
              <tr>
                <th className="text-left p-4 text-xs uppercase tracking-widest text-[#1A1A1A]/40">Name</th>
                <th className="text-left p-4 text-xs uppercase tracking-widest text-[#1A1A1A]/40">Type</th>
                <th className="text-left p-4 text-xs uppercase tracking-widest text-[#1A1A1A]/40">Price</th>
                <th className="text-left p-4 text-xs uppercase tracking-widest text-[#1A1A1A]/40">Status</th>
                <th className="text-left p-4 text-xs uppercase tracking-widest text-[#1A1A1A]/40">Stripe ID</th>
                <th className="text-right p-4 text-xs uppercase tracking-widest text-[#1A1A1A]/40">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#1A1A1A]/40">
                    No products yet. Create your first product to get started.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-b border-[#1A1A1A]/10 hover:bg-[#1A1A1A]/5">
                    <td className="p-4 font-serif text-[#1A1A1A]">{product.name}</td>
                    <td className="p-4 text-sm">
                      <span className="px-2 py-1 bg-[#1A1A1A]/10 text-xs uppercase tracking-wider">
                        {product.type}
                      </span>
                    </td>
                    <td className="p-4 text-sm">${product.price}</td>
                    <td className="p-4 text-sm">
                      <span className={`px-2 py-1 text-xs uppercase tracking-wider ${
                        product.status === 'live' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-[#1A1A1A]/60">{product.stripe_price_id || '—'}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 hover:bg-[#1A1A1A]/10 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 hover:bg-red-100 transition-colors text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
