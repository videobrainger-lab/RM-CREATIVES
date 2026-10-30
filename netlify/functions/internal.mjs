import {acceptDeliverySync,deliverySyncFreshness,latestDeliveryStatus,importDeliverySnapshot} from '../lib/kpi-delivery-sync.mjs';
import { validateServicesImport } from '../lib/kpi-services.mjs';
import { validateDeliveryImport } from '../lib/kpi-delivery.mjs';
import { env, headers, equal, session, authenticated, sameOrigin, json } from '../lib/kpi-auth.mjs';
import { store, getSnapshot, getSettings } from '../lib/kpi-store.mjs';
import { buildReport, comparisonRange, PROJECTS, validateRange } from '../lib/kpi-model.mjs';
import { dashboardPage, loginPage } from '../lib/kpi-page.mjs';
import { todayRiga } from '../lib/kpi-sync.mjs';
import { validateCrmImport } from '../lib/kpi-crm.mjs';
import {getCachedMiloFunnel} from '../lib/kpi-milo-funnel.mjs';
import {pull} from '../lib/kpi-sync.mjs';
const html = (body,status=200,extra={}) => new Response(body,{status,headers:{...headers,'Content-Type':'text/html; charset=utf-8',...extra}});
const redirect = (location,extra={}) => new Response(null,{status:303,headers:{...headers,Location:location,...extra}});
const cookie = value => '__Host-rm_internal=' + value + '; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=' + (value ? 604800 : 0);
const launchSeo = req => fetch(new URL('/.netlify/functions/internal-seo-background',req.url),{method:'POST',headers:{Authorization:'Basic '+Buffer.from('rm:'+env('RM_DASHBOARD_PASSWORD')).toString('base64')}});
export default async function handler(req) {
  const path = new URL(req.url).pathname.replace(/\/+$/,'');
  // A dedicated write-only credential never authenticates dashboard routes.
  if(path==='/internal/milo-delivery-sync'){
    if(req.method!=='POST')return json({error:'Method not allowed'},405);
    if(env('RM_MILO_DELIVERY_SYNC_ENABLED')!=='true')return json({error:'Автообновление заказов ещё не включено.'},409);
    const token=env('RM_MILO_DELIVERY_SYNC_TOKEN');
    if(!token||token.length<32||!equal(req.headers.get('authorization')||'','Bearer '+token))return json({error:'Unauthorized'},401);
    if(req.headers.get('origin'))return json({error:'Только серверный экспорт.'},403);
    if(!req.headers.get('content-type')?.includes('application/json'))return json({error:'Ожидается JSON.'},415);
    if(Number(req.headers.get('content-length'))>1000000)return json({error:'Слишком большой запрос.'},413);
    const body=await req.text();if(body.length>1000000)return json({error:'Слишком большой запрос.'},413);
    try{return json({ok:true,...await acceptDeliverySync(store(),JSON.parse(body),{today:todayRiga()})});}
    catch{return json({error:'Синхронизация не подтверждена. Проверьте состояние перед повторной отправкой.'},422);}
  }
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
      const [snapshot,settings,status,crm,miloDelivery,miloServices,seo,seoStatus,deliverySyncStatus] = await Promise.all([getSnapshot(),getSettings(),store().get('sync-status',{type:'json'}),store().get('crm-denta',{type:'json'}),store().get('crm-milo-delivery',{type:'json'}),store().get('crm-milo-services',{type:'json'}),store().get('seo-milo',{type:'json'}),store().get('seo-sync-status',{type:'json'}),store().get('milo-delivery-sync-status',{type:'json'})]);
      return json({miloDeliverySync:deliverySyncFreshness(latestDeliveryStatus(miloDelivery?._sync,deliverySyncStatus),env('RM_MILO_DELIVERY_SYNC_ENABLED')==='true'),configured:Boolean(settings?.windsorKey),coverage:snapshot?.coverage||null,updatedAt:snapshot?.updatedAt||null,crmDenta:crm?{updatedAt:crm.updatedAt,coverage:crm.coverage}:null,crmMiloServices:miloServices?{updatedAt:miloServices.updatedAt,coverage:miloServices.coverage}:null,crmMiloDelivery:miloDelivery?{updatedAt:miloDelivery.updatedAt,coverage:miloDelivery.coverage}:null,seoMilo:seo?{updatedAt:seo.updatedAt,sources:seo.sources}:null,seoStatus:seoStatus||{status:'not_loaded'},status:status||{status:'needs_key'},today:todayRiga(),projects:PROJECTS});
    }
    if (path === '/internal/data' && req.method === 'GET') {
      const query = new URL(req.url).searchParams;
      const from = query.get('from'), to = query.get('to');
      validateRange(from,to);
      const [snapshot,crm,miloDelivery,miloServices,seo] = await Promise.all([getSnapshot(),store().get('crm-denta',{type:'json'}),store().get('crm-milo-delivery',{type:'json'}),store().get('crm-milo-services',{type:'json'}),store().get('seo-milo',{type:'json'})]);
      if (!snapshot) return json({error:'Данные ещё не загружены. Откройте подключения.'},503);
      snapshot.crm={denta:crm,miloDelivery,miloServices};
      snapshot.seo=seo;
      // Shift both comparison windows equally to the last available GSC day.
      const searchTo=seo?.sources?.searchconsole?.coverage.to;
      snapshot.seoLagDays=searchTo?Math.max(0,Math.ceil((Date.parse(to)-Date.parse(searchTo))/86400000)):0;
      const comparisonMode=query.get('comparison')==='calendar_month'?'calendar_month':'previous_period';
      const previous = comparisonRange(from,to,comparisonMode);
      return json({comparisonMode,current:buildReport(snapshot,from,to),previous:buildReport(snapshot,previous.from,previous.to)});
    }
    if(path==='/internal/milo-funnel'&&req.method==='GET'){
      const q=new URL(req.url).searchParams,from=q.get('from'),to=q.get('to');validateRange(from,to);
      const {statusCode=200,...body}=await getCachedMiloFunnel({from,to,cache:store(),getSettings,account:env('RM_MILO_GA4_PROPERTY'),pull:(...args)=>pull(...args,{maxWaitMs:20000,requestTimeoutMs:8000})});
      return json(body,statusCode);
    }
    if (path === '/internal/seo-refresh' && req.method === 'POST') {
      if (!(await getSettings())?.windsorKey) return json({error:'Добавьте API-ключ Windsor в подключениях.'},409);
      if (!env('RM_MILO_GA4_PROPERTY') || !env('RM_MILO_GSC_SITE')) return json({error:'Не настроены источники SEO MILO.'},409);
      const result=await launchSeo(req);
      return result.ok?json({ok:true,status:'running'},202):json({error:'Не удалось запустить обновление SEO.'},502);
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
      try { const source=JSON.parse(body);crm=source.project==='milo-services'?validateServicesImport(source):source.project==='milo-delivery'?validateDeliveryImport(source):validateCrmImport(source); } catch { return json({error:'Некорректные агрегированные данные CRM.'},400); }
      if(crm.project==='milo-delivery'){
        if(env('RM_MILO_DELIVERY_SYNC_ENABLED')==='true')return json({error:'Остановите автоимпорт перед ручным восстановлением MILO.'},409);
        await importDeliverySnapshot(store(),crm);
      }else await store().setJSON(crm.project==='milo-services'?'crm-milo-services':'crm-denta',crm);
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
