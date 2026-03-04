import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Template = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category_id: string;
  collection_id: string | null;
  image_url: string;
  gallery_images: string[];
  featured: boolean;
  stock: number;
  demo_url: string;
  tech_stack: string[];
  features: string[];
  created_at: string;
};

export type Product = Template;

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  created_at: string;
};

export type TemplateCollection = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  featured: boolean;
  created_at: string;
};

export type Collection = TemplateCollection;

export type WorkshopLog = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image_url: string;
  video_url: string;
  template_id: string | null;
  published_at: string;
  created_at: string;
};

export type ConsultingInquiry = {
  id: string;
  name: string;
  email: string;
  company: string;
  message: string;
  status: 'new' | 'contacted' | 'closed';
  created_at: string;
  updated_at: string;
};

export type AdminUser = {
  id: string;
  email: string;
  role: string;
  created_at: string;
};

export type CartItem = {
  id: string;
  user_id: string;
  template_id: string;
  quantity: number;
  created_at: string;
  template?: Template;
};

export type Order = {
  id: string;
  user_id: string;
  total: number;
  status: string;
  items: any[];
  shipping_address: any;
  created_at: string;
};
