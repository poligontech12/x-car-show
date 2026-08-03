'use client';

import dynamic from 'next/dynamic';

/**
 * Agentation's annotation toolbar: point at anything in the running app,
 * leave a note on it, and the agent reads the annotation through the
 * `agentation-mcp` server.
 *
 * Loaded dynamically and gated on NODE_ENV so it never reaches a
 * production bundle — Next eliminates the branch, and the chunk is
 * never requested. `ssr: false` because the toolbar measures real DOM.
 */
const Toolbar = dynamic(() => import('agentation').then((m) => m.Agentation), {
  ssr: false,
});

export function DevToolbar() {
  if (process.env.NODE_ENV !== 'development') return null;
  return <Toolbar />;
}
