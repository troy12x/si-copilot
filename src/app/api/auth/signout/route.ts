import { NextResponse } from 'next/server';

export async function GET() {
  // Redirect to the dedicated sign-out page
  return NextResponse.redirect(new URL('/sign-out', 'http://localhost:3000'));
}
