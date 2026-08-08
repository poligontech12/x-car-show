import { expect, test } from '@playwright/test';
import {
  MAX_TRIES,
  WINDOW_MS,
  callerKey,
  clear,
  isBlocked,
  newAttempts,
  recordFailure,
} from '../lib/gate-throttle';

/**
 * The gate code is four digits, so this is the thing actually protecting
 * it — ten thousand guesses is minutes of scripting without a throttle and
 * days with one. Tested here rather than through the browser because
 * tripping it against the running server would shut the gate on every
 * other spec for ten minutes.
 *
 * Time is passed in rather than read, so the window can be tested without
 * waiting out a real one.
 */

const T0 = 1_754_600_000_000;

test('an address is refused after enough wrong answers', () => {
  const attempts = newAttempts();

  for (let i = 0; i < MAX_TRIES; i++) {
    expect(isBlocked(attempts, 'a', T0)).toBe(false);
    recordFailure(attempts, 'a', T0);
  }

  expect(isBlocked(attempts, 'a', T0)).toBe(true);
  // Still refused inside the window, however long they keep at it.
  expect(isBlocked(attempts, 'a', T0 + WINDOW_MS - 1)).toBe(true);
  // And free again once it has passed.
  expect(isBlocked(attempts, 'a', T0 + WINDOW_MS + 1)).toBe(false);
});

test('one address being refused does not refuse another', () => {
  const attempts = newAttempts();
  for (let i = 0; i < MAX_TRIES; i++) recordFailure(attempts, 'a', T0);

  expect(isBlocked(attempts, 'a', T0)).toBe(true);
  expect(isBlocked(attempts, 'b', T0)).toBe(false);
});

test('getting it right clears the record', () => {
  const attempts = newAttempts();
  for (let i = 0; i < MAX_TRIES - 1; i++) recordFailure(attempts, 'a', T0);

  // The marshal who mistypes several times and then succeeds starts fresh
  // rather than one wrong answer away from being locked out mid-show.
  clear(attempts, 'a');
  for (let i = 0; i < MAX_TRIES - 1; i++) recordFailure(attempts, 'a', T0);
  expect(isBlocked(attempts, 'a', T0)).toBe(false);
});

test('a stale window starts again rather than accumulating', () => {
  const attempts = newAttempts();
  for (let i = 0; i < MAX_TRIES; i++) recordFailure(attempts, 'a', T0);

  // Yesterday's fat fingers are not held against today's first attempt.
  recordFailure(attempts, 'a', T0 + WINDOW_MS + 1);
  expect(isBlocked(attempts, 'a', T0 + WINDOW_MS + 1)).toBe(false);
});

test('the counted address is the one our own proxy wrote', () => {
  // The rightmost hop. Reading the leftmost would let a client send a
  // different X-Forwarded-For on every request, take a fresh bucket each
  // time, and walk all ten thousand codes with the throttle looking on.
  expect(callerKey('203.0.113.9')).toBe('203.0.113.9');
  expect(callerKey('198.51.100.7, 203.0.113.9')).toBe('203.0.113.9');
  expect(callerKey('  198.51.100.7 ,  203.0.113.9  ')).toBe('203.0.113.9');

  // A spoofed header cannot buy a new bucket: whatever the client puts in
  // front, the value our proxy appended is still the one that counts.
  const spoofed = callerKey('anything-they-like, 203.0.113.9');
  expect(spoofed).toBe(callerKey('something-else-entirely, 203.0.113.9'));

  // No proxy, no trustworthy address — one shared bucket, deliberately
  // the strict end of the trade.
  expect(callerKey(null)).toBe('unknown');
  expect(callerKey('')).toBe('unknown');
  expect(callerKey('   ')).toBe('unknown');
});
