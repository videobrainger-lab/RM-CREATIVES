import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
export const env = key => globalThis.Netlify?.env?.get(key) || process.env[key];
export const headers = {
  'Cache-Control':'private, no-store, max-age=0', 'Netlify-CDN-Cache-Control':'no-store',
  'X-Robots-Tag':'noindex, nofollow, noarchive', 'X-Content-Type-Options':'nosniff',
  'X-Frame-Options':'DENY', 'Referrer-Policy':'same-origin',
  'Content-Security-Policy':"default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'"
};
export function equal(a,b) {
  return timingSafeEqual(createHash('sha256').update(String(a)).digest(),createHash('sha256').update(String(b)).digest());
}
export function session(password, expiry = Date.now() + 7 * 86400000) {
  const payload = String(expiry);
  return payload + '.' + createHmac('sha256',password).update('rm-kpi-session:' + payload).digest('hex');
}
export function authenticated(request) {
  const password = env('RM_DASHBOARD_PASSWORD');
  if (!password) return false;
  const authorization = request.headers.get('authorization');
  if (authorization?.startsWith('Basic ')) {
    const credential = Buffer.from(authorization.slice(6),'base64').toString();
    if (equal(credential,'rm:' + password)) return true;
  }
  const token = request.headers.get('cookie')?.split(';').map(v=>v.trim()).find(v=>v.startsWith('__Host-rm_internal='))?.split('=').slice(1).join('=');
  if (!token) return false;
  const expiry = Number(token.split('.')[0]);
  return Number.isFinite(expiry) && expiry > Date.now() && expiry <= Date.now()+7*86400000 && equal(token,session(password,expiry));
}
export const json = (body,status=200,extra={}) => new Response(JSON.stringify(body),{status,headers:{...headers,'Content-Type':'application/json; charset=utf-8',...extra}});
export function sameOrigin(request) {
  const origin = request.headers.get('origin');
  const expected = new URL(request.url).origin;
  // no-referrer can make WebKit send Origin: null for a same-origin form.
  // A concrete foreign Origin always fails, regardless of other headers.
  if (origin && origin !== 'null') return origin === expected;
  const site = request.headers.get('sec-fetch-site');
  if (site === 'same-origin') return true;
  if (site === 'cross-site' || site === 'same-site') return false;
  const referer = request.headers.get('referer');
  if (referer) {
    try { return new URL(referer).origin === expected; } catch { return false; }
  }
  // Non-browser clients must present their own Authorization credential.
  return request.headers.get('authorization')?.startsWith('Basic ') || false;
}
