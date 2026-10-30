import { validateRange } from './kpi-model.mjs';

export const MILO_GA4_PROPERTY = '413689112';
export const MILO_GA4_TIMEZONE = 'America/Los_Angeles';
const STAGES = [
  ['view_item', 'Просмотр товаров'],
  ['add_to_cart', 'Добавление в корзину'],
  ['begin_checkout', 'Начало оформления'],
  ['purchase', 'Покупка']
];
const localDate = now => new Intl.DateTimeFormat('en-CA', {timeZone:MILO_GA4_TIMEZONE,year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
export function miloFunnelRange(from,to,now=new Date()) {
  validateRange(from,to);
  const lastCompleteDay = new Date(Date.parse(localDate(now)) - 86400000).toISOString().slice(0,10);
  const end = to < lastCompleteDay ? to : lastCompleteDay;
  return {requestedRange:{from,to},range:from <= end ? {from,to:end} : null,lastCompleteDay};
}
const count = value => {
  if (value === null || value === undefined || value === '' || (typeof value !== 'number' && typeof value !== 'string')) throw Error('Invalid GA4 count');
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n < 0 || (typeof value === 'string' && !/^\d+$/.test(value))) throw Error('Invalid GA4 count');
  return n;
};
export function emptyMiloFunnel(from,to,now=new Date()) {
  const period=miloFunnelRange(from,to,now);
  return {version:1,status:period.range?'not_loaded':'no_complete_days',...period,timezone:MILO_GA4_TIMEZONE,updatedAt:null,users:null,steps:STAGES.map(([event,label])=>({id:event,event,label,users:null,events:null,status:'missing'})),method:'independent_event_users',scope:'whole_property',deliveryOnly:false,kitchenAvailable:false};
}
// Both reports are whole-period queries. Date/other dimensions would make distinct users non-additive.
export function buildMiloFunnel(from,to,totalRows,eventRows,now=new Date()) {
  const report=emptyMiloFunnel(from,to,now);
  if(!report.range)return report;
  if(!Array.isArray(totalRows)||!Array.isArray(eventRows)||totalRows.length>1)throw Error('Invalid GA4 report');
  const check=row=>{
    if(!row||typeof row!=='object'||row.date!==undefined)throw Error('Unexpected GA4 dimension');
    if(row.property_timezone!==undefined&&row.property_timezone!==MILO_GA4_TIMEZONE)throw Error('Unexpected GA4 timezone');
    if(row.account_id!==undefined&&String(row.account_id)!==MILO_GA4_PROPERTY)throw Error('Unexpected GA4 property');
  };
  for(const row of totalRows)check(row);
  report.users=totalRows.length?count(totalRows[0].totalusers):null;
  const events=new Map();
  for(const row of eventRows){
    check(row);
    if(!STAGES.some(([event])=>event===row.event_name))continue;
    if(events.has(row.event_name))throw Error('Duplicate GA4 event dimension');
    const users=count(row.totalusers),eventCount=count(row.event_count);
    if(users>eventCount)throw Error('Invalid GA4 event count');
    events.set(row.event_name,{users,events:eventCount});
  }
  report.steps=report.steps.map(step=>events.has(step.event)?{...step,...events.get(step.event),status:'ok'}:step);
  report.status=report.users!==null&&report.steps.every(s=>s.status==='ok')?'ok':'partial';
  report.updatedAt=now.toISOString();
  return report;
}
export async function fetchMiloFunnel({from,to,key,account,now=new Date(),pull}) {
  const empty=emptyMiloFunnel(from,to,now);
  if(!empty.range)return empty;
  if(String(account)!==MILO_GA4_PROPERTY||typeof key!=='string'||!key||typeof pull!=='function')throw Error('MILO GA4 source is not configured');
  try{
    const {from:start,to:end}=empty.range;
    const [totals,events]=await Promise.all([
      pull('googleanalytics4',['totalusers','property_timezone'],start,end,key,[String(account)]),
      pull('googleanalytics4',['event_name','totalusers','event_count','property_timezone'],start,end,key,[String(account)])
    ]);
    return buildMiloFunnel(from,to,totals,events,now);
  }catch{
    // Upstream errors can contain credential-bearing URLs; never return their text.
    throw Error('Не удалось обновить диагностику GA4 MILO. Предыдущие данные сохранены.');
  }
}

// Called only by the authenticated route. The cache key is derived solely from validated dates.
export async function getCachedMiloFunnel({from,to,cache,getSettings,account,pull,now=new Date()}) {
  const empty=emptyMiloFunnel(from,to,now);
  if(!empty.range)return {report:empty,stale:false};
  const cacheKey='milo-funnel-v1/'+from+'/'+to;
  const failure='Не удалось обновить GA4. Последний доступный срез показан с его датами; отсутствие данных не означает ноль.';
  let previous=null,cacheReadFailed=false;
  try{
    const candidate=await cache.get(cacheKey,{type:'json'});
    // Never substitute another period or a differently defined report from cache.
    if(candidate?.version===1&&candidate.timezone===MILO_GA4_TIMEZONE&&candidate.method==='independent_event_users'&&['ok','partial'].includes(candidate.status)&&candidate.requestedRange?.from===from&&candidate.requestedRange?.to===to&&candidate.range?.from===from&&candidate.range?.to<=empty.range.to&&Array.isArray(candidate.steps)&&Number.isFinite(Date.parse(candidate.updatedAt)))previous=candidate;
  }catch{cacheReadFailed=true;}
  const age=previous?now-Date.parse(previous.updatedAt):Infinity;
  if(previous?.range?.to===empty.range.to&&age>=0&&age<3600000)return {report:previous,stale:false};
  let report;
  try{
    const settings=await getSettings();
    report=await fetchMiloFunnel({from,to,key:settings?.windsorKey,account,pull,now});
  }catch{
    return previous?{report:previous,stale:true,error:failure}:{error:failure,statusCode:502};
  }
  try{await cache.setJSON(cacheKey,report);}
  catch{
    // The freshly fetched report is valid even if persistence failed. Do not falsely label it stale.
    return {report,stale:false,error:'Данные GA4 получены, но не удалось сохранить кэш. При следующем открытии потребуется обновление.'};
  }
  return {report,stale:false,...(cacheReadFailed?{error:'Кэш GA4 был недоступен; данные повторно получены из источника.'}:{})};
}
