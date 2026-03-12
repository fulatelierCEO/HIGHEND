import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Product = {
  id: string;
  name: string;
  description: string | null;
  type: 'saas' | 'template' | 'service';
  price: number;
  stripe_price_id: string | null;
  stripe_product_id: string | null;
  status: 'live' | 'draft';
  file_url: string | null;
  image_url: string | null;
  features: any;
  created_at: string;
  updated_at: string;
};

export type Template = Product;

export type BuildInPublic = {
  id: string;
  title: string;
  caption: string | null;
  video_url: string;
  product_id: string | null;
  thumbnail_url: string | null;
  published: boolean | null;
  published_at: string | null;
  created_at: string;
};

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
