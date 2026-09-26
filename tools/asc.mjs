// App Store Connect REST client: signs an ES256 JWT and makes one call.
//
// It carries no credentials, which is what lets it live in this public repo
// instead of a scratchpad that is lost on every machine move. The key comes
// from the environment: ASC_KEY_ID and ASC_ISSUER_ID, plus one of ASC_KEY_P8
// (PEM text), ASC_KEY_P8_B64 (the form the repo secrets hold) or ASC_KEY_PATH.
// With none of those it looks for AuthKey_<id>.p8 where Apple's tools keep it.
//
//   node tools/asc.mjs GET v1/apps/6806109983/reviewSubmissions?limit=5
//   node tools/asc.mjs PATCH v1/appStoreVersionLocalizations/<id> body.json
//
// The leading slash is optional on purpose: Git Bash rewrites an argument that
// starts with "/" into a Windows path, and every call then 404s.
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const API = 'https://api.appstoreconnect.apple.com/';

// A secret pasted from a Windows shell carries an invisible trailing CR.
const clean = s => (s || '').replace(/\s+/g, '');

function loadKey(keyId) {
  if (process.env.ASC_KEY_P8) return process.env.ASC_KEY_P8;
  if (process.env.ASC_KEY_P8_B64) {
    return Buffer.from(process.env.ASC_KEY_P8_B64.replace(/[^A-Za-z0-9+/=]/g, ''), 'base64').toString('utf8');
  }
  const home = os.homedir();
  const tried = [
    process.env.ASC_KEY_PATH,
    ...['Documents/Apple Developer Keys', 'private_keys', '.private_keys', '.appstoreconnect/private_keys']
      .map(d => path.join(home, d, `AuthKey_${keyId}.p8`)),
  ].filter(Boolean);
  const found = tried.find(p => fs.existsSync(p));
  if (!found) throw new Error('no .p8 key found; set ASC_KEY_PATH or ASC_KEY_P8_B64. Looked in:\n  ' + tried.join('\n  '));
  return fs.readFileSync(found, 'utf8');
}

export function token({ keyId, issuer, pem }) {
  const b64u = o => Buffer.from(JSON.stringify(o)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const head = b64u({ alg: 'ES256', kid: keyId, typ: 'JWT' });
  // Apple refuses a token that lives longer than 20 minutes.
  const body = b64u({ iss: issuer, iat: now, exp: now + 15 * 60, aud: 'appstoreconnect-v1' });
  // JWS wants the raw r||s signature, not the DER that sign() emits by default.
  const sig = crypto.sign('sha256', Buffer.from(`${head}.${body}`), { key: pem, dsaEncoding: 'ieee-p1363' });
  return `${head}.${body}.${sig.toString('base64url')}`;
}

export function credentials() {
  const keyId = clean(process.env.ASC_KEY_ID);
  const issuer = clean(process.env.ASC_ISSUER_ID);
  if (!keyId || !issuer) throw new Error('ASC_KEY_ID and ASC_ISSUER_ID must be set');
  return { keyId, issuer, pem: loadKey(keyId) };
}

// Resolves to the parsed JSON (null for 204); rejects with Apple's error text.
export async function asc(method, route, body, creds = credentials()) {
  const url = /^https:\/\//.test(route) ? route : API + route.replace(/^\/+/, '');
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token(creds)}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${url} -> ${res.status}\n${text}`);
  return text ? JSON.parse(text) : null;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const [method, route, bodyFile] = process.argv.slice(2);
  if (!method || !route) {
    console.error('usage: node tools/asc.mjs <GET|POST|PATCH|DELETE> <v1/path?query | https://…> [body.json | -]');
    process.exit(2);
  }
  const body = bodyFile ? fs.readFileSync(bodyFile === '-' ? 0 : bodyFile, 'utf8') : undefined;
  try {
    const out = await asc(method.toUpperCase(), route, body);
    console.log(out === null ? '(no content)' : JSON.stringify(out, null, 2));
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
