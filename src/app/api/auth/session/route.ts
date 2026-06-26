import { NextResponse } from 'next/server';
import { getSession } from '@/lib/services/session';

export async function GET() {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  
  return NextResponse.json({
    authenticated: true,
    user: {
      name: session.name,
      email: session.email,
      avatar: session.avatar,
      login: session.login,
      role: session.role
    }
  });
}
