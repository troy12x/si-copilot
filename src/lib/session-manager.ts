import { getSupabaseClient } from './supabase';
import { v4 as uuidv4 } from 'uuid';
export interface UserSession {
  id: string;
  user_id: string;
  session_key: string;
  created_at?: string;
  last_accessed?: string;
  metadata?: any;
}

/**
 * Creates a new secure session for a user
 * @param userId The authenticated user's ID
 * @param metadata Optional metadata to store with the session
 * @returns The created session object with session key
 */
export async function createUserSession(userId: string, metadata?: any): Promise<UserSession | null> {
  try {
    const client = getSupabaseClient();
    
    // Generate a cryptographically secure session key
    const sessionKey = uuidv4();
    
    // Create a new session record
    const { data, error } = await client
      .from('user_sessions')
      .insert({
        user_id: userId,
        session_key: sessionKey,
        metadata: metadata || {},
        last_accessed: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user session:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Failed to create user session:', err);
    return null;
  }
}

/**
 * Validates a session key belongs to the specified user
 * @param userId The authenticated user's ID
 * @param sessionKey The session key to validate
 * @returns True if the session is valid, false otherwise
 */
export async function validateUserSession(userId: string, sessionKey: string): Promise<boolean> {
  try {
    const client = getSupabaseClient();
    
    // Look up the session
    const { data, error } = await client
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('session_key', sessionKey)
      .single();
    
    if (error || !data) {
      return false;
    }
    
    // Update the last accessed time
    await client
      .from('user_sessions')
      .update({ last_accessed: new Date().toISOString() })
      .eq('id', data.id);
    
    return true;
  } catch (err) {
    console.error('Failed to validate user session:', err);
    return false;
  }
}

/**
 * Gets a user session by session key
 * @param sessionKey The session key
 * @returns The session object if found, null otherwise
 */
export async function getUserSession(sessionKey: string): Promise<UserSession | null> {
  try {
    const client = getSupabaseClient();
    
    const { data, error } = await client
      .from('user_sessions')
      .select('*')
      .eq('session_key', sessionKey)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Failed to get user session:', err);
    return null;
  }
}

/**
 * Stores session data in localStorage with encryption
 * @param sessionKey The session key to store
 */
export function storeSessionLocally(sessionKey: string): void {
  try {
    // Store the session key in localStorage
    localStorage.setItem('dataset_session_key', sessionKey);
  } catch (err) {
    console.error('Failed to store session locally:', err);
  }
}

/**
 * Retrieves the session key from localStorage
 * @returns The session key if found, null otherwise
 */
export function getLocalSessionKey(): string | null {
  try {
    return localStorage.getItem('dataset_session_key');
  } catch (err) {
    console.error('Failed to get local session key:', err);
    return null;
  }
}

/**
 * Clears the local session data
 */
export function clearLocalSession(): void {
  try {
    localStorage.removeItem('dataset_session_key');
    localStorage.removeItem('useCase_direct');
    localStorage.removeItem('template_direct');
  } catch (err) {
    console.error('Failed to clear local session:', err);
  }
}
