import { authenticated, json } from '../lib/kpi-auth.mjs';
import { syncSeo } from '../lib/kpi-seo-sync.mjs';
export default async function handler(req) {
  if (req.method !== 'POST' || !authenticated(req)) return json({error:'Unauthorized'},401);
  await syncSeo();
  return json({ok:true});
}
export const config = {background:true};
