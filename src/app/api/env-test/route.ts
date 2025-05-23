import { NextResponse } from 'next/server';

export async function GET() {
  // Check environment variables
  const envVars = {
    // Only show if they exist, not the actual values for security
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: !!process.env.CLERK_SECRET_KEY,
    
    // Show the first few characters to verify they're correct
    PUBLISHABLE_KEY_PREFIX: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.substring(0, 10) + '...',
    SECRET_KEY_PREFIX: process.env.CLERK_SECRET_KEY?.substring(0, 10) + '...',
    
    // Show Node.js environment
    NODE_ENV: process.env.NODE_ENV,
  };
  
  return NextResponse.json(envVars);
}
