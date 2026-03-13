import { supabase } from './supabase';

const ADMIN_EMAIL = 'fulatelier@gmail.com';

export async function isAdmin(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    if (user.email === ADMIN_EMAIL) {
      return true;
    }

    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }

    return !!adminUser;
  } catch (error) {
    console.error('Error in isAdmin:', error);
    return false;
  }
}

export async function requireAdmin() {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error('Unauthorized: Admin access required');
  }
  return admin;
}
