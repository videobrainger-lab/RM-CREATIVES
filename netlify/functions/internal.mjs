import { validateDeliveryImport } from '../lib/kpi-delivery.mjs';
import { env, headers, equal, session, authenticated, sameOrigin, json } from '../lib/kpi-auth.mjs';
import { store, getSnapshot, getSettings } from '../lib/kpi-store.mjs';
import { buildReport, previousRange, PROJECTS, validateRange } from '../lib/kpi-model.mjs';
import { dashboardPage, loginPage } from '../lib/kpi-page.mjs';
import { todayRiga } from '../lib/kpi-sync.mjs';
import { validateCrmImport } from '../lib/kpi-crm.mjs';
const html = (body,status=200,extra={}) => new Response(body,{status,headers:{...headers,'Content-Type':'text/html; charset=utf-8',...extra}});
const redirect = (location,extra={}) => new Response(null,{status:303,headers:{...headers,Location:location,...extra}});
const cookie = value => '__Host-rm_internal=' + value + '; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=' + (value ? 604800 : 0);
export default async function handler(req) {
  const path = new URL(req.url).pathname.replace(/\/+$/,'');
  if (!env('RM_DASHBOARD_PASSWORD')) return html(loginPage('Доступ ещё не настроен.'),503);
  if (req.method === 'POST' && !sameOrigin(req)) return json({error:'Недопустимый источник запроса.'},403);
  if (path === '/internal/login' && req.method === 'POST') {
    if (Number(req.headers.get('content-length'))>2048) return json({error:'Слишком большой запрос.'},413);
    const form = await req.formData();
    if (!equal(String(form.get('password')||''),env('RM_DASHBOARD_PASSWORD'))) return html(loginPage('Неверный пароль. Попробуйте ещё раз.'),401);
    return redirect('/internal/',{'Set-Cookie':cookie(session(env('RM_DASHBOARD_PASSWORD')))});
  }
  if (path === '/internal/logout' && req.method === 'POST') return redirect('/internal/',{'Set-Cookie':cookie('')});
  if (!authenticated(req)) return path === '/internal' ? html(loginPage(),200) : json({error:'Войдите в дашборд.'},401);
  if (req.method === 'GET' && path === '/internal') return html(dashboardPage);
  try {
    if (path === '/internal/status' && req.method === 'GET') {
      const [snapshot,settings,status,crm] = await Promise.all([getSnapshot(),getSettings(),store().get('sync-status',{type:'json'}),store().get('crm-denta',{type:'json'})]);
      return json({configured:Boolean(settings?.windsorKey),coverage:snapshot?.coverage||null,updatedAt:snapshot?.updatedAt||null,crmDenta:crm?{updatedAt:crm.updatedAt,coverage:crm.coverage}:null,status:status||{status:'needs_key'},today:todayRiga(),projects:PROJECTS});
    }
    if (path === '/internal/data' && req.method === 'GET') {
      const query = new URL(req.url).searchParams;
      const from = query.get('from'), to = query.get('to');
      validateRange(from,to);
      const [snapshot,crm,miloDelivery] = await Promise.all([getSnapshot(),store().get('crm-denta',{type:'json'}),store().get('crm-milo-delivery',{type:'json'})]);
      if (!snapshot) return json({error:'Данные ещё не загружены. Откройте подключения.'},503);
      snapshot.crm={denta:crm,miloDelivery};
      const previous = previousRange(from,to);
      return json({current:buildReport(snapshot,from,to),previous:buildReport(snapshot,previous.from,previous.to)});
    }
    if (path === '/internal/settings' && req.method === 'POST') {
      if (!req.headers.get('content-type')?.includes('application/json')) return json({error:'Ожидается JSON.'},415);
      const {windsorKey} = await req.json();
      if (typeof windsorKey !== 'string' || windsorKey.length<8 || windsorKey.length>512 || /\s/.test(windsorKey)) return json({error:'Проверьте API-ключ Windsor.'},400);
      await store().setJSON('settings',{windsorKey});
      return json({ok:true});
    }
    if (path === '/internal/refresh' && req.method === 'POST') {
      if (!(await getSettings())?.windsorKey) return json({error:'Добавьте API-ключ Windsor в подключениях.'},409);
      const target = new URL('/.netlify/functions/internal-refresh-background',req.url);
      const result = await fetch(target,{method:'POST',headers:{Authorization:'Basic '+Buffer.from('rm:'+env('RM_DASHBOARD_PASSWORD')).toString('base64')}});
      if (!result.ok) return json({error:'Не удалось запустить обновление.'},502);
      return json({ok:true,status:'running'},202);
    }
    if (path === '/internal/crm-import' && req.method === 'POST') {
      if (!req.headers.get('content-type')?.includes('application/json')) return json({error:'Ожидается JSON.'},415);
      const body=await req.text();
      if (body.length>1000000) return json({error:'Слишком большой запрос.'},413);
      let crm;
      try { const source=JSON.parse(body);crm=source.project==='milo-delivery'?validateDeliveryImport(source):validateCrmImport(source); } catch { return json({error:'Некорректные агрегированные данные CRM.'},400); }
      await store().setJSON(crm.project==='milo-delivery'?'crm-milo-delivery':'crm-denta',crm);
      return json({ok:true,coverage:crm.coverage,updatedAt:crm.updatedAt});
    }
    if (path === '/internal/import' && req.method === 'POST') {
      if (!req.headers.get('content-type')?.includes('application/json')) return json({error:'Ожидается JSON.'},415);
      const snapshot = await req.json();
      validateRange(snapshot.coverage?.from,snapshot.coverage?.to);
      if (!['google','meta','events','actionDefinitions'].every(key=>Array.isArray(snapshot[key])) || !snapshot.updatedAt || !snapshot.sources) return json({error:'Некорректный снимок данных.'},400);
      if (!PROJECTS.every(p=>['google','meta'].every(channel=>typeof snapshot.accounts?.[p.id]?.[channel]==='string' && /^[0-9-]{5,25}$/.test(snapshot.accounts[p.id][channel])))) return json({error:'Некорректная конфигурация кабинетов.'},400);
      const accounts = new Set(PROJECTS.flatMap(p=>Object.values(snapshot.accounts[p.id])));
      if (['google','meta','events','actionDefinitions'].some(key=>snapshot[key].some(row=>!accounts.has(row.account_id)))) return json({error:'Неизвестный рекламный аккаунт.'},400);
      await store().setJSON('snapshot',snapshot);
      return json({ok:true,coverage:snapshot.coverage});
    }
    return json({error:'Страница не найдена.'},404);
  } catch(error) {
    if (error.message.startsWith('Выберите')) return json({error:error.message},400);
    return json({error:'Не удалось загрузить данные. Повторите попытку.'},500);
  }
}
export const config = {path:['/internal','/internal/*'],rateLimit:{action:'rate_limit',aggregateBy:['ip','domain'],windowSize:60,windowLimit:90}};
