import { NextResponse, type NextRequest } from 'next/server';

/**
 * One number per visit, and everything that shuffles shuffles by it.
 *
 * The deck has to be in a different order each time somebody opens the app
 * — a fixed order quietly decides who gets looked at, and on a day with one
 * vote per person that matters. But it must not move *while* it is being
 * used, and the roster is handed down from the root layout, which re-renders
 * on every vote, every follow and every return to the foreground. Shuffling
 * per render would deal a new hand under somebody's thumb each time they
 * backed a car.
 *
 * So the order is a function of this seed, the seed is a cookie, and the
 * cookie is written once. The same visit sees the same deck however many
 * times the layout re-renders; a new visit gets a new one. It is set here
 * rather than in a page because a server component may not write cookies —
 * middleware is the only thing in the request that can.
 */

export const VISIT_COOKIE = 'xcs_visit';

/**
 * No Max-Age, so the browser drops it when the session ends and the next
 * open deals again. It decides nothing but display order, so it is not
 * signed and there is nothing in it worth forging.
 *
 * Deliberately **not** `secure`. This app is also reached over plain HTTP
 * on the LAN address in DEPLOY.md, and WebKit refuses a Secure cookie on
 * an http origin outright — not even localhost is excused, where Chromium
 * allows it. A rejected cookie means a new seed on every single request,
 * which is precisely the reshuffle-under-your-thumb this exists to
 * prevent, and it would have failed only on iPhones and only off HTTPS.
 * There is nothing in here that HTTPS would be protecting.
 */
export function middleware(request: NextRequest) {
  if (request.cookies.has(VISIT_COOKIE)) return NextResponse.next();

  const seed = Math.floor(Math.random() * 0x7fffffff).toString(36);

  /**
   * Set on the request as well as the response: the page rendering *this*
   * request reads cookies off the request, and without this line the first
   * page of a visit would shuffle by a seed that does not exist yet and
   * disagree with every page after it.
   */
  request.cookies.set(VISIT_COOKIE, seed);
  const response = NextResponse.next({ request });
  response.cookies.set(VISIT_COOKIE, seed, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
  });
  return response;
}

export const config = {
  /**
   * Pages only. Photographs, the auth endpoints and the build's own static
   * files have no order to shuffle, and running on them would put a
   * Set-Cookie on responses that are meant to be cached forever.
   */
  matcher: ['/((?!_next/static|_next/image|api/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)'],
};
