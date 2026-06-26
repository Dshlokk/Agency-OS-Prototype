import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI;
  
  if (!clientId) {
    return NextResponse.json({ 
      error: 'GitHub Client ID not configured. Please add GITHUB_CLIENT_ID in your .env.local file.' 
    }, { status: 400 });
  }

  // Generate a random state for CSRF protection
  const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
  githubAuthUrl.searchParams.set('client_id', clientId);
  if (redirectUri) {
    githubAuthUrl.searchParams.set('redirect_uri', redirectUri);
  }
  githubAuthUrl.searchParams.set('scope', 'read:user user:email');
  githubAuthUrl.searchParams.set('state', state);

  const response = NextResponse.redirect(githubAuthUrl.toString());
  
  // Store state in HTTP-only cookie for verification during callback
  response.cookies.set('github_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 600, // 10 minutes
    sameSite: 'lax',
    path: '/'
  });

  return response;
}
