import crypto from 'crypto';
import { cookies } from 'next/headers';

const ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16;  // 128 bits
const COOKIE_NAME = 'agencyos_session_token';

// Get or generate a key from the secret
function getKey(): Buffer {
  const secret = process.env.SESSION_SECRET || 'fallback-secret-at-least-32-chars-long-for-security';
  // Use sha256 to ensure we have exactly 32 bytes
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypts a session payload into a secure token
 */
export function encryptSession(payload: any): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(JSON.stringify(payload), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts a secure token back into a session payload
 */
export function decryptSession(token: string): any | null {
  try {
    const [ivHex, encryptedHex] = token.split(':');
    if (!ivHex || !encryptedHex) return null;
    
    const iv = Buffer.from(ivHex, 'hex');
    const key = getKey();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Failed to decrypt session:', error);
    return null;
  }
}

/**
 * Creates a session and sets the HTTP-only cookie
 */
export async function createSession(payload: any) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const sessionToken = encryptSession({ ...payload, expiresAt });
  
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

/**
 * Gets the current session from the cookies
 */
export async function getSession(): Promise<any | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);
  
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }
  
  const payload = decryptSession(sessionCookie.value);
  if (!payload) return null;
  
  // Check expiration
  if (payload.expiresAt && new Date(payload.expiresAt) < new Date()) {
    await deleteSession();
    return null;
  }
  
  return payload;
}

/**
 * Deletes the session cookie
 */
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0),
    sameSite: 'lax',
    path: '/',
  });
}
