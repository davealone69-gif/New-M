import test from 'node:test';
import assert from 'node:assert/strict';
import { getCorsDecision, parseAllowedOrigins } from './cors';

test('same-origin requests stay allowed without extra configuration', () => {
  const allowedOrigins = parseAllowedOrigins(undefined);
  const decision = getCorsDecision('http://localhost:3000', 'http://localhost:3000', allowedOrigins);
  assert.deepEqual(decision, { allowOrigin: 'http://localhost:3000', reject: false });
});

test('android webview origin stays allowed by default', () => {
  const allowedOrigins = parseAllowedOrigins(undefined);
  const decision = getCorsDecision(
    'https://appassets.androidplatform.net',
    'http://127.0.0.1:3000',
    allowedOrigins,
  );
  assert.deepEqual(decision, { allowOrigin: 'https://appassets.androidplatform.net', reject: false });
});

test('untrusted cross-origin browser requests are rejected', () => {
  const allowedOrigins = parseAllowedOrigins(undefined);
  const decision = getCorsDecision('https://evil.example', 'http://localhost:3000', allowedOrigins);
  assert.deepEqual(decision, { reject: true });
});

test('explicit wildcard configuration still permits all origins', () => {
  const allowedOrigins = parseAllowedOrigins('*,https://example.com');
  const decision = getCorsDecision('https://anywhere.example', 'http://localhost:3000', allowedOrigins);
  assert.deepEqual(decision, { allowOrigin: '*', reject: false });
});
