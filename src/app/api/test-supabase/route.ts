import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Create a test user in Supabase
    const testUser = {
      id: 'test_user_' + Date.now(),
      email: 'test@example.com',
      username: 'testuser',
      first_name: 'Test',
      last_name: 'User',
      created_at: new Date().toISOString(),
    };
    
    console.log('Creating test user in Supabase:', testUser);
    
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert(testUser)
      .select();
    
    if (error) {
      console.error('Error creating test user in Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test user created successfully',
      user: data[0]
    });
  } catch (err) {
    console.error('Exception creating test user:', err);
    return NextResponse.json({ 
      error: 'Failed to create test user',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}
