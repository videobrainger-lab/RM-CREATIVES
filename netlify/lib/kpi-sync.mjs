import { PROJECTS } from './kpi-model.mjs';
import { getSettings, getSnapshot, store } from './kpi-store.mjs';
export const todayRiga = () => new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Riga',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export async function pull(connector, fields, from, to, key, accounts, {maxWaitMs=11*60000,requestTimeoutMs=55000}={}) {
  const url = new URL('https://connectors.windsor.ai/' + connector);
  url.search = new URLSearchParams({ api_key:key, fields:fields.join(','), select_accounts:accounts.join(','), date_from:from, date_to:to }).toString();
  const deadline = Date.now() + maxWaitMs;
  while (Date.now() < deadline) {
    const response = await fetch(url, {signal:AbortSignal.timeout(Math.max(1,Math.min(requestTimeoutMs,deadline-Date.now())))});
    if (!response.ok && response.status !== 202) throw new Error('Источник ' + connector + ': HTTP ' + response.status);
    const body = await response.json();
    if (body.error) throw new Error('Источник ' + connector + ': проверьте доступ и поля в Windsor.');
    if (Array.isArray(body.data) && !body.next && !body.next_page) return body.data;
    if (Array.isArray(body)) return body;
    if (response.status !== 202 && body.status !== 'pending' && body.status !== 'running') throw new Error('Не удалось получить полный ответ ' + connector);
    await new Promise(resolve=>setTimeout(resolve,Math.min(5000,Math.max(0,deadline-Date.now()))));
  }
  throw new Error('Windsor готовит отчёт слишком долго. Повторите обновление позже.');
}
export async function sync() {
  const cache = store();
  const previous = await getSnapshot();
  if (!previous?.accounts) throw new Error('Private account configuration is missing');
  const gAccounts = PROJECTS.map(p=>previous.accounts[p.id].google);
  const mAccounts = PROJECTS.map(p=>previous.accounts[p.id].meta);
  const settings = await getSettings();
  if (!settings?.windsorKey) { await cache.setJSON('sync-status',{status:'needs_key',updatedAt:new Date().toISOString()}); return; }
  const running = await cache.get('sync-status',{type:'json'});
  if (running?.status === 'running' && Date.now()-Date.parse(running.updatedAt)<14*60000) return;
  await cache.setJSON('sync-status',{status:'running',updatedAt:new Date().toISOString()});
  try {
    const to = new Date(Date.parse(todayRiga())-86400000).toISOString().slice(0,10);
    const from = new Date(Date.parse(to)-89*86400000).toISOString().slice(0,10);
    const [google,events,actionDefinitions,meta] = await Promise.all([
      pull('google_ads',['date','account_id','campaign','campaign_id','currency','spend','conversions','all_conversions'],from,to,settings.windsorKey,gAccounts),
      pull('google_ads',['date','account_id','campaign_id','conversion_action_name','all_conversions','all_conversions_value'],from,to,settings.windsorKey,gAccounts),
      pull('google_ads',['account_id','conversion_action_name','conversion_action_primary_for_goal','conversion_action_category'],from,to,settings.windsorKey,gAccounts),
      pull('facebook',['date','account_id','campaign','campaign_id','account_currency','spend','actions_lead','actions_offsite_conversion_fb_pixel_purchase','action_values_offsite_conversion_fb_pixel_purchase','conversions_schedule_website'],from,to,settings.windsorKey,mAccounts)
    ]);
    const updatedAt = new Date().toISOString();
    await cache.setJSON('snapshot',{accounts:previous.accounts,campaignDirections:previous.campaignDirections,coverage:{from,to},updatedAt,definitionsAsOf:updatedAt,google,events,actionDefinitions,meta,sources:{google:{status:'ok'},meta:{status:'ok'},events:{status:'ok'},definitions:{status:'ok'}}});
    await cache.setJSON('sync-status',{status:'ok',updatedAt});
  } catch(error) {
    // Do not include upstream URLs: they contain an API credential.
    const message = /^(Источник|Не удалось|Windsor)/.test(error.message) ? error.message : 'Обновление не завершилось. Сохранены предыдущие данные. Проверьте подключение Windsor.';
    await cache.setJSON('sync-status',{status:'error',message,updatedAt:new Date().toISOString()});
  }
}
