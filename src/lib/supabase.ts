import { createClient } from '@supabase/supabase-js';

// For development, we'll use the hardcoded values, but in production these should come from environment variables
const supabaseUrl = 'SUPABASE_URL';
const supabaseAnonKey = 'SUPABASE_ANON_KEY';
const supabaseServiceRoleKey = 'SUPABASE_SERVICE_ROLE_KEY';

// Create the Supabase client with anonymous key for client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create a service role client for admin operations (server-side only)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// For development purposes, we'll bypass RLS policies by using the service role client
// In production, you should use proper authentication with Clerk JWT
export const getSupabaseClient = () => {
  // For now, we'll use the admin client to bypass RLS policies
  // This is only for development - in production you should use proper auth
  return supabaseAdmin;
};

export type Dataset = {
  id?: string;
  user_id: string;
  name: string;
  description: string;
  config: any;
  data: any;
  row_count: number;
  size_bytes: number;
  created_at?: string;
};

export async function createDataset(dataset: Omit<Dataset, 'id' | 'created_at'>): Promise<Dataset | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('datasets')
    .insert(dataset)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating dataset:', error);
    return null;
  }
  
  return data;
}

export async function getUserDatasets(userId: string): Promise<Dataset[]> {
  const client = getSupabaseClient();
  try {
    const { data, error } = await client
      .from('datasets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user datasets:', error);
      return [];
    }
    
    return data || [];
  } catch (e) {
    console.error('Exception fetching user datasets:', e);
    return [];
  }
}

export async function getDatasetById(id: string): Promise<Dataset | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('datasets')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching dataset:', error);
    return null;
  }
  
  return data;
}

export async function deleteDataset(id: string): Promise<boolean> {
  const client = getSupabaseClient();
  const { error } = await client
    .from('datasets')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting dataset:', error);
    return false;
  }
  
  return true;
}

export async function updateDataset(id: string, updates: Partial<Omit<Dataset, 'id' | 'created_at'>>): Promise<Dataset | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('datasets')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating dataset:', error);
    return null;
  }
  
  return data;
}

export async function getUserStats(userId: string): Promise<{ total_datasets: number; total_rows: number }> {
  const client = getSupabaseClient();
  try {
    const { data, error } = await client
      .from('datasets')
      .select('row_count')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching user stats:', error);
      return { total_datasets: 0, total_rows: 0 };
    }
    
    const total_datasets = data?.length || 0;
    const total_rows = data?.reduce((sum, dataset) => sum + (dataset.row_count || 0), 0) || 0;
    
    return { total_datasets, total_rows };
  } catch (e) {
    console.error('Exception fetching user stats:', e);
    return { total_datasets: 0, total_rows: 0 };
  }
}
