import { expect, test } from '@playwright/test';
import { canonicalHttpsUrl, enforceCanonicalHttps } from '../lib/canonical-url';

test('HTTP public URL is upgraded without losing path, query, or hash', () => {
  expect(
    canonicalHttpsUrl(
      'http://xcarshow.poligontech.ro/auth?mode=signin#account',
      'https://xcarshow.poligontech.ro',
    ),
  ).toBe('https://xcarshow.poligontech.ro/auth?mode=signin#account');
});

test('HTTPS and invalid canonical URLs are not redirected', () => {
  expect(
    canonicalHttpsUrl(
      'https://xcarshow.poligontech.ro/auth',
      'https://xcarshow.poligontech.ro',
    ),
  ).toBeNull();
  expect(canonicalHttpsUrl('http://xcarshow.poligontech.ro/auth', 'not a URL')).toBeNull();
  expect(
    canonicalHttpsUrl(
      'http://xcarshow.poligontech.ro/auth',
      'http://xcarshow.poligontech.ro',
    ),
  ).toBeNull();
});

test('all HTTP auth entry points upgrade to the canonical HTTPS origin', () => {
  expect(
    canonicalHttpsUrl(
      'http://192.168.1.25:3000/auth?mode=signin',
      'https://xcarshow.poligontech.ro',
    ),
  ).toBe('https://xcarshow.poligontech.ro/auth?mode=signin');
  expect(
    canonicalHttpsUrl(
      'http://xcarshow.poligontech.ro./auth',
      'https://xcarshow.poligontech.ro',
    ),
  ).toBe('https://xcarshow.poligontech.ro/auth');
  expect(
    canonicalHttpsUrl(
      'http://xcarshow.poligontech.ro//evil.example/steal',
      'https://xcarshow.poligontech.ro',
    ),
  ).toBe('https://xcarshow.poligontech.ro//evil.example/steal');
});

test('enforcement replaces the insecure location before credentials are submitted', () => {
  let replacedWith: string | null = null;
  const location = {
    href: 'http://xcarshow.poligontech.ro/auth',
    replace(url: string) {
      replacedWith = url;
    },
  };

  expect(enforceCanonicalHttps(location, 'https://xcarshow.poligontech.ro')).toBe('redirected');
  expect(replacedWith).toBe('https://xcarshow.poligontech.ro/auth');
});

test('loopback is already secure, but a LAN address is not', () => {
  // A password typed at http://localhost never crosses a wire, and the
  // browser counts it a secure context. Blocking it only locks developers
  // and the e2e suite out of signing in at all.
  for (const href of [
    'http://localhost:3000/auth',
    'http://127.0.0.1:3000/auth',
    'http://[::1]:3000/auth',
    'http://app.localhost:3000/auth',
  ]) {
    expect(enforceCanonicalHttps({ href, replace() {} }, undefined)).toBe('safe');
    expect(enforceCanonicalHttps({ href, replace() {} }, 'https://xcarshow.poligontech.ro')).toBe(
      'safe',
    );
    expect(canonicalHttpsUrl(href, 'https://xcarshow.poligontech.ro')).toBeNull();
  }

  // The exemption stops at loopback: the phone on the showground wifi is
  // reaching a LAN address over a real network and still gets upgraded.
  let replacedWith: string | null = null;
  expect(
    enforceCanonicalHttps(
      {
        href: 'http://192.168.1.25:3000/auth',
        replace(url: string) {
          replacedWith = url;
        },
      },
      'https://xcarshow.poligontech.ro',
    ),
  ).toBe('redirected');
  expect(replacedWith).toBe('https://xcarshow.poligontech.ro/auth');
});

test('insecure submission is blocked when canonical configuration is invalid', () => {
  let replaced = false;
  const insecureLocation = {
    href: 'http://xcarshow.poligontech.ro/auth',
    replace() {
      replaced = true;
    },
  };

  expect(enforceCanonicalHttps(insecureLocation, undefined)).toBe('blocked');
  expect(enforceCanonicalHttps(insecureLocation, 'not a URL')).toBe('blocked');
  expect(replaced).toBe(false);
  expect(
    enforceCanonicalHttps(
      { href: 'https://xcarshow.poligontech.ro/auth', replace() {} },
      undefined,
    ),
  ).toBe('safe');
});
