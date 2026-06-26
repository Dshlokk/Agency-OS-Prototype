import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSession } from '@/lib/services/session';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const cookieStore = await cookies();
  const storedState = cookieStore.get('github_oauth_state')?.value;

  // 1. Verify CSRF state
  if (!state || state !== storedState) {
    return NextResponse.json({ error: 'CSRF state verification failed.' }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: 'OAuth authorization code is missing.' }, { status: 400 });
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const redirectUri = process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ 
      error: 'GitHub Client ID or Client Secret is not configured.' 
    }, { status: 500 });
  }

  try {
    // 2. Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return NextResponse.json({ 
        error: `GitHub token exchange failed: ${tokenData.error_description || tokenData.error}` 
      }, { status: 400 });
    }

    const accessToken = tokenData.access_token;

    // 3. Fetch user profile details
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'agencyos-auth-app',
      },
    });

    if (!userResponse.ok) {
      throw new Error(`Failed to fetch user details from GitHub (status ${userResponse.status})`);
    }

    const userProfile = await userResponse.json();

    // 4. Fetch email if public email is not available
    let email = userProfile.email;
    if (!email) {
      const emailsResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'agencyos-auth-app',
        },
      });
      
      if (emailsResponse.ok) {
        const emails = await emailsResponse.json();
        // Find primary email
        const primaryEmailObj = emails.find((e: any) => e.primary && e.verified) || emails[0];
        if (primaryEmailObj) {
          email = primaryEmailObj.email;
        }
      }
    }

    // 5. Create user details payload
    const userData = {
      name: userProfile.name || userProfile.login,
      email: email || `${userProfile.login}@users.noreply.github.com`,
      avatar: userProfile.avatar_url,
      login: userProfile.login,
      role: 'Owner', // Default role for dashboard access
    };

    // 6. Create session cookie
    await createSession(userData);

    // 7. Redirect back to client dashboard page. We will render a template page
    // that sets localStorage items and then redirects, to ensure localState is synced
    // with the active cookie session.
    const baseUrl = new URL('/', request.url).toString();
    
    // We clear the state cookie
    const response = new NextResponse(
      `<html>
        <body>
          <script>
            localStorage.setItem('agencyos_session', 'authenticated');
            localStorage.setItem('agencyos_user', ${JSON.stringify(JSON.stringify(userData))});
            window.location.href = "${baseUrl}";
          </script>
        </body>
      </html>`,
      {
        headers: { 'Content-Type': 'text/html' }
      }
    );

    response.cookies.delete('github_oauth_state');
    return response;

  } catch (error: any) {
    console.error('Error during GitHub OAuth callback:', error);
    return NextResponse.json({ 
      error: 'An unexpected error occurred during GitHub login.',
      details: error.message 
    }, { status: 500 });
  }
}
