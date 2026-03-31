import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.JWT_SECRET || 'fallback-secret-for-dev-only-darksaver88';
const key = new TextEncoder().encode(secretKey);

export async function signToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(key);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getSession() {
  const session = cookies().get('session')?.value;
  if (!session) return null;
  return await verifyToken(session);
}

export async function setSessionCookie(userId: string) {
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  const session = await signToken({ userId });
  cookies().set('session', session, { expires, httpOnly: true, secure: process.env.NODE_ENV === 'production' });
}
