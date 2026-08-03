'use client';

import { inferAdditionalFields } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import type { auth } from './auth';

/**
 * The browser half of auth. `inferAdditionalFields` carries handle, town
 * and the socials through to the session type, so screens read them off
 * the session instead of a second fetch.
 */
export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
