import { authenticated, json } from '../lib/kpi-auth.mjs';
import { sync } from '../lib/kpi-sync.mjs';
export default async function handler(req) {
  if (req.method !== 'POST' || !authenticated(req)) return json({error:'Unauthorized'},401);
  await sync();
  return json({ok:true});
}
export const config = {background:true};
