import { env } from '../lib/kpi-auth.mjs';
export default async function handler(req,context) {
  if (!env('RM_DASHBOARD_PASSWORD')) return;
  const target = new URL('/.netlify/functions/internal-refresh-background',context.site.url);
  const response = await fetch(target,{method:'POST',headers:{Authorization:'Basic '+Buffer.from('rm:'+env('RM_DASHBOARD_PASSWORD')).toString('base64')}});
  if (!response.ok) throw new Error('Dashboard refresh could not be started');
}
// 04:00 UTC = 07:00 Moscow, daily. Published deploys only.
export const config = {schedule:'0 4 * * *'};
