"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, Template } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Search, CreditCard as Edit, Trash2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    const filtered = templates.filter(t =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTemplates(filtered);
  }, [searchQuery, templates]);

  async function fetchTemplates() {
    const { data } = await supabase
      .from('templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setTemplates(data);
      setFilteredTemplates(data);
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Template deleted successfully"
      });
      fetchTemplates();
    }
    setDeleteId(null);
  }

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
              <span className="text-sm text-neutral-500">Templates</span>
            </div>
            <Link href="/admin">
              <Button variant="outline" size="sm">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-light tracking-tight mb-2">Templates</h1>
            <p className="text-neutral-600 font-light">{filteredTemplates.length} total templates</p>
          </div>
          <Link href="/admin/templates/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add New Template
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 mb-6 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tech Stack</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-12 bg-neutral-100 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={template.image_url}
                          alt={template.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-neutral-500 line-clamp-1">{template.description}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">${template.price.toFixed(2)}</TableCell>
                  <TableCell>
                    {template.stock > 0 ? (
                      <span className="text-sm">{template.stock}</span>
                    ) : (
                      <Badge variant="secondary">Out of Stock</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {template.featured ? (
                      <Badge>Featured</Badge>
                    ) : (
                      <Badge variant="outline">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {template.tech_stack?.slice(0, 2).map((tech) => (
                        <Badge key={tech} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                      {template.tech_stack?.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{template.tech_stack.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {template.demo_url && (
                        <Link href={template.demo_url} target="_blank">
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </Link>
                      )}
                      <Link href={`/admin/templates/${template.id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(template.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-neutral-200">
            <p className="text-neutral-600 font-light">No templates found</p>
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
