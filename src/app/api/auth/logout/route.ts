import { NextResponse } from 'next/server';
import { deleteSession } from '@/lib/services/session';

export async function POST() {
  await deleteSession();
  return NextResponse.json({ success: true });
}

export async function GET() {
  await deleteSession();
  return NextResponse.json({ success: true });
}
