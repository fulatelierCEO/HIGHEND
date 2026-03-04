"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, WorkshopLog } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
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
import { Plus, CreditCard as Edit, Trash2, Video, ExternalLink, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminWorkshopPage() {
  const [logs, setLogs] = useState<WorkshopLog[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    const { data } = await supabase
      .from('workshop_logs')
      .select('*')
      .order('published_at', { ascending: false });

    if (data) setLogs(data);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    const { error } = await supabase
      .from('workshop_logs')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete log",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Workshop log deleted successfully"
      });
      fetchLogs();
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
              <span className="text-sm text-neutral-500">Workshop Logs</span>
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-light tracking-tight mb-2">Workshop Logs</h1>
            <p className="text-neutral-600 font-light">{logs.length} published logs</p>
          </div>
          <Link href="/admin/workshop/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Dev Log
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Media</TableHead>
                <TableHead>Template</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-12 bg-neutral-100 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={log.image_url}
                          alt={log.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{log.title}</div>
                        <div className="text-sm text-neutral-500 line-clamp-1">{log.excerpt}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(log.published_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    {log.video_url ? (
                      <Badge variant="secondary" className="gap-1">
                        <Video className="w-3 h-3" />
                        Video
                      </Badge>
                    ) : (
                      <span className="text-sm text-neutral-400">No video</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {log.template_id ? (
                      <Badge variant="outline">Linked</Badge>
                    ) : (
                      <span className="text-sm text-neutral-400">None</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/workshop/${log.slug}`} target="_blank">
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/workshop/${log.id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(log.id)}
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

        {logs.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-neutral-200">
            <p className="text-neutral-600 font-light">No workshop logs yet</p>
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workshop Log</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this log? This action cannot be undone.
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
