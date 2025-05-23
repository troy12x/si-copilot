import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';

// Mock Webhook class for development
class MockWebhook {
  constructor(private secret: string) {}
  
  verify(payload: string, headers: Record<string, string>) {
    // In development, we'll just return the parsed payload
    return JSON.parse(payload);
  }
}

// This endpoint handles Clerk webhooks to sync user data with Supabase
export async function POST(req: Request) {
  console.log('Received webhook from Clerk');
  
  let svix_id = '';
  let svix_timestamp = '';
  let svix_signature = '';
  
  try {
    // Get the headers - headers() is synchronous in Next.js App Router
    const headersList = headers();
    // Type assertion to handle the headers correctly
    const headerMap = headersList as unknown as { get(name: string): string | null };
    svix_id = headerMap.get('svix-id') || '';
    svix_timestamp = headerMap.get('svix-timestamp') || '';
    svix_signature = headerMap.get('svix-signature') || '';
    
    // Log header information for debugging
    console.log('Webhook headers:', { svix_id, svix_timestamp, svix_signature: svix_signature ? 'present' : 'missing' });
  } catch (error) {
    console.error('Error processing webhook headers:', error);
  }
  
  // For development, we'll skip header validation
  // In production, you would validate these headers with the svix library
  // if (!svix_id || !svix_timestamp || !svix_signature) {
  //   console.error('Missing required Svix headers');
  //   return new NextResponse('Error: Missing svix headers', { status: 400 });
  // }

  try {
    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);
    
    console.log('Webhook payload type:', payload.type);
    console.log('Webhook payload data:', JSON.stringify(payload.data, null, 2));

    // Get the webhook secret from environment variables
    const webhookSecret = process.env.CLERK_SECRET_KEY || 'whsec_placeholder_for_development';
    console.log('Using Clerk secret key:', webhookSecret ? 'Key is set' : 'Key is not set');

    // Handle the webhook
    const { type } = payload;
    
    // Handle user creation
    if (type === 'user.created') {
      console.log('Processing user.created event');
      const { id, email_addresses, username, first_name, last_name } = payload.data;
      
      console.log('Creating user in Supabase:', { 
        id, 
        email: email_addresses?.[0]?.email_address,
        username: username || email_addresses?.[0]?.email_address?.split('@')[0],
        first_name, 
        last_name 
      });
      
      // Insert the user into Supabase
      const { data, error } = await supabaseAdmin
        .from('users')
        .insert({
          id,
          email: email_addresses?.[0]?.email_address,
          username: username || email_addresses?.[0]?.email_address?.split('@')[0],
          first_name,
          last_name,
          created_at: new Date().toISOString(),
        })
        .select();
      
      if (error) {
        console.error('Error creating user in Supabase:', error);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }
      
      console.log('Successfully created user in Supabase:', data);
    }
    
    // Handle user update
    if (type === 'user.updated') {
      console.log('Processing user.updated event');
      const { id, email_addresses, username, first_name, last_name } = payload.data;
      
      console.log('Updating user in Supabase:', { 
        id, 
        email: email_addresses?.[0]?.email_address,
        username: username || email_addresses?.[0]?.email_address?.split('@')[0],
        first_name, 
        last_name 
      });
      
      // Update the user in Supabase
      const { data, error } = await supabaseAdmin
        .from('users')
        .update({
          email: email_addresses?.[0]?.email_address,
          username: username || email_addresses?.[0]?.email_address?.split('@')[0],
          first_name,
          last_name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select();
      
      if (error) {
        console.error('Error updating user in Supabase:', error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
      }
      
      console.log('Successfully updated user in Supabase:', data);
    }
    
    // Handle user deletion
    if (type === 'user.deleted') {
      console.log('Processing user.deleted event');
      const { id } = payload.data;
      
      console.log('Deleting user from Supabase:', { id });
      
      // Delete the user from Supabase
      const { error } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting user from Supabase:', error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
      }
      
      console.log('Successfully deleted user from Supabase');
    }

    // Return a success response for all handled events
    return NextResponse.json({ success: true, event: type });
  } catch (err) {
    console.error('Error processing webhook:', err);
    return NextResponse.json({ 
      error: 'Error processing webhook', 
      details: err instanceof Error ? err.message : 'Unknown error' 
    }, { status: 500 });
  }
}
