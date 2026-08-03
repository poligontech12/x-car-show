import 'server-only';
import { headers } from 'next/headers';
import { auth } from './auth';

/** The signed-in member, or null. Every server component reads it here. */
export async function sessionUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}
