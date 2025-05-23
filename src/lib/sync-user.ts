import { supabaseAdmin } from './supabase';
import { UserResource } from '@clerk/types';

// This function manually syncs a Clerk user to Supabase
export async function syncUserToSupabase(user: UserResource) {
  if (!user) return null;
  
  try {
    console.log('Syncing Clerk user to Supabase:', user.id);
    
    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (existingUser) {
      console.log('User already exists in Supabase, updating...');
      
      // Update existing user
      const { data, error } = await supabaseAdmin
        .from('users')
        .update({
          email: user.emailAddresses[0]?.emailAddress,
          username: user.username || user.emailAddresses[0]?.emailAddress?.split('@')[0],
          first_name: user.firstName,
          last_name: user.lastName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select();
      
      if (error) {
        console.error('Error updating user in Supabase:', error);
        return null;
      }
      
      console.log('Successfully updated user in Supabase');
      return data[0];
    } else {
      console.log('Creating new user in Supabase...');
      
      // Create new user
      const { data, error } = await supabaseAdmin
        .from('users')
        .insert({
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress,
          username: user.username || user.emailAddresses[0]?.emailAddress?.split('@')[0],
          first_name: user.firstName,
          last_name: user.lastName,
          created_at: new Date().toISOString(),
        })
        .select();
      
      if (error) {
        console.error('Error creating user in Supabase:', error);
        return null;
      }
      
      console.log('Successfully created user in Supabase');
      return data[0];
    }
  } catch (error) {
    console.error('Exception syncing user to Supabase:', error);
    return null;
  }
}
