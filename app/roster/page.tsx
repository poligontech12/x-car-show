import { redirect } from 'next/navigation';

/**
 * The roster moved to the front door. This stays because the address is
 * already in the world — printed on a poster, pasted into a group chat —
 * and a link somebody has in their hand should not stop working because
 * the routing was tidied up.
 *
 * The query string travels with it. A poster carrying `?ref=poster` is
 * the only record of whether that poster did anything, and dropping it
 * here would quietly answer "no" to a question nobody asked.
 *
 * Temporary, not permanent: a 308 is cached by the browser more or less
 * forever, and this is a decision worth being able to take back.
 */
export default async function RosterMoved({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    if (Array.isArray(value)) value.forEach((v) => query.append(key, v));
    else if (value !== undefined) query.set(key, value);
  }

  const qs = query.toString();
  redirect(qs ? `/?${qs}` : '/');
}
