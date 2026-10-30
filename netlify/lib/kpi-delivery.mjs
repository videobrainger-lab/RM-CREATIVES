import { validateRange } from './kpi-model.mjs';
export const PAID_DELIVERY_CHANNELS = ['google', 'meta', 'sendpulse'];
const CHANNELS = [...PAID_DELIVERY_CHANNELS, 'other', 'unknown', 'referral', 'organic', 'direct', 'email'];
const sheetUrl = value => /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[\w-]+\//.test(value || '');
const sum = (rows, key) => rows.reduce((n, r) => n + r[key], 0);
// Allocate a fixed monthly email subscription by calendar days, not active sending days.
export function monthlyEmailExpense(from,to,monthlyCents) {
  validateRange(from,to);
  let cents=0;
  for(let date=from;date<=to;) {
    const start=new Date(date+'T12:00:00Z'),last=new Date(Date.UTC(start.getUTCFullYear(),start.getUTCMonth()+1,0,12));
    const end=[last.toISOString().slice(0,10),to].sort()[0];
    const days=(Date.parse(end)-Date.parse(date))/86400000+1;
    cents+=monthlyCents*days/last.getUTCDate();
    date=new Date(Date.parse(end)+86400000).toISOString().slice(0,10);
  }
  return cents/100;
}
// Storage spans history; the UI's 366-day selection limit must not expire ingestion.
function validateHistory(from,to){validateRange(from,from);validateRange(to,to);if(from>to)throw Error('Invalid history range');}
export function validateDeliveryImport(s) {
  if (![1, 2].includes(s?.version) || s.project !== 'milo-delivery') throw Error('Invalid delivery source');
  validateHistory(s.coverage?.from, s.coverage?.to);
  if (!Number.isFinite(Date.parse(s.updatedAt)) || !sheetUrl(s.sourceUrl) || typeof s.sourceName !== 'string' || s.sourceName.length > 150 || !Array.isArray(s.daily) || s.daily.length > 6000) throw Error('Invalid delivery metadata');
  const v2 = s.version === 2, keys = new Set();
  if (v2 && (s.allSources !== true || s.currency !== 'EUR')) throw Error('Require exhaustive EUR order import');
  const completeThrough = s.completeThrough || s.coverage.to;
  validateHistory(s.coverage.from, completeThrough);
  if (completeThrough > s.coverage.to) throw Error('Invalid complete-through date');
  for (const r of s.daily) {
    validateRange(r.date, r.date);
    const k = r.date + ':' + r.channel;
    if (!(v2 ? CHANNELS : ['google', 'meta', 'other']).includes(r.channel) || keys.has(k) || r.date < s.coverage.from || r.date > s.coverage.to || !Number.isSafeInteger(r.orders) || r.orders < 0 || !Number.isSafeInteger(r.amountCents) || r.amountCents < 0 || (r.orders === 0 && r.amountCents !== 0)) throw Error('Invalid delivery counts');
    keys.add(k);
  }
  let kitchenDaily;
  if(s.kitchenDaily){
    if(!v2||!Array.isArray(s.kitchenDaily)||s.kitchenDaily.length>6000)throw Error('Invalid kitchen data');
    const keys=new Set(),byDate=new Map();
    for(const r of s.kitchenDaily){
      validateRange(r.date,r.date);const key=r.date+':'+r.kitchen;
      if(!['center','highway','unknown'].includes(r.kitchen)||keys.has(key)||r.date<s.coverage.from||r.date>s.coverage.to||!Number.isSafeInteger(r.orders)||r.orders<0||!Number.isSafeInteger(r.amountCents)||r.amountCents<0||(r.orders===0&&r.amountCents!==0))throw Error('Invalid kitchen counts');
      keys.add(key);const day=byDate.get(r.date)||{orders:0,amountCents:0};day.orders+=r.orders;day.amountCents+=r.amountCents;byDate.set(r.date,day);
    }
    for(const date of new Set([...s.daily.map(r=>r.date),...byDate.keys()])){
      const rows=s.daily.filter(r=>r.date===date),k=byDate.get(date);
      if(!k||sum(rows,'orders')!==k.orders||sum(rows,'amountCents')!==k.amountCents)throw Error('Kitchen totals do not reconcile');
    }
    kitchenDaily=s.kitchenDaily.map(({date,kitchen,orders,amountCents})=>({date,kitchen,orders,amountCents}));
  }
  let sendpulseCosts;
  if (s.sendpulseCosts) {
    const c = s.sendpulseCosts;
    validateRange(c.coverage?.from, c.coverage?.to);
    if (c.currency !== 'EUR' || typeof c.complete !== 'boolean' || !Array.isArray(c.daily) || c.daily.length > 366 || !/^https:\/\/login\.sendpulse\.com\//.test(c.sourceUrl || '')) throw Error('Invalid SendPulse costs');
    const dates = new Set();
    for (const r of c.daily) {
      validateRange(r.date, r.date);
      if (dates.has(r.date) || r.date < c.coverage.from || r.date > c.coverage.to || !Number.isSafeInteger(r.spendMicros) || r.spendMicros < 0) throw Error('Invalid SendPulse daily costs');
      dates.add(r.date);
    }
    if (c.emailSubscription && (!Number.isSafeInteger(c.emailSubscription.monthlyCents) || c.emailSubscription.monthlyCents<0 || c.emailSubscription.basis!=='owner_declared')) throw Error('Invalid email subscription');
    sendpulseCosts = {...(c.emailSubscription?{emailSubscription:{monthlyCents:c.emailSubscription.monthlyCents,basis:'owner_declared'}}:{}),currency:c.currency,complete:c.complete,coverage:{from:c.coverage.from,to:c.coverage.to},sourceUrl:c.sourceUrl,daily:c.daily.map(({date,spendMicros})=>({date,spendMicros}))};
  }
  return {version:s.version,project:s.project,sourceName:s.sourceName,sourceUrl:s.sourceUrl,updatedAt:s.updatedAt,coverage:{from:s.coverage.from,to:s.coverage.to},...(v2 ? {allSources:true,currency:'EUR',completeThrough} : {}),...(sendpulseCosts ? {sendpulseCosts} : {}),...(kitchenDaily?{kitchenDaily}:{}),daily:s.daily.map(({date,channel,orders,amountCents})=>({date,channel,orders,amountCents}))};
}
export function buildDeliveryReport(s, from, to, ads = []) {
  if (!s) return null;
  const available = to >= s.coverage.from && from <= s.coverage.to;
  const complete = from >= s.coverage.from && to <= (s.completeThrough || s.coverage.to);
  const inRange = r => r.date >= from && r.date <= to;
  const rows = s.daily.filter(inRange), v2 = s.version === 2 && s.allSources === true;
  const channels = PAID_DELIVERY_CHANNELS.map(channel => {
    const selected = rows.filter(r => r.channel === channel);
    const knownOrders = available && (v2 || channel !== 'sendpulse');
    const orders = knownOrders ? sum(selected, 'orders') : null, amount = knownOrders ? sum(selected, 'amountCents') / 100 : null;
    const costSource = s.sendpulseCosts;
    const inventoryCovered = costSource && from >= costSource.coverage.from && to <= costSource.coverage.to;
    const costCovered = inventoryCovered && costSource.complete;
    const knownSpend = inventoryCovered ? sum(costSource.daily.filter(inRange), 'spendMicros') / 1e6 : null;
    const emailSpend=inventoryCovered&&costSource.emailSubscription?monthlyEmailExpense(from,to,costSource.emailSubscription.monthlyCents):null;
    const smsSpend=inventoryCovered?knownSpend:null;
    const ad = ads.find(c => c.channel === channel);
    const spend = channel === 'sendpulse' ? costCovered ? knownSpend+(emailSpend??0) : null : ad?.spend ?? null;
    const currency = channel === 'sendpulse' ? 'EUR' : ad?.currency || 'EUR';
    return {channel,orders,amount,spend,...(channel==='sendpulse'?{smsSpend,emailSpend,emailMonthly:costSource?.emailSubscription?costSource.emailSubscription.monthlyCents/100:null,emailCostBasis:costSource?.emailSubscription?.basis||null}:{}),knownSpend:channel === 'sendpulse' ? knownSpend : spend,currency,roas:complete && amount !== null && spend > 0 && currency === 'EUR' ? amount / spend : null,costOrder:complete && spend !== null && orders > 0 ? spend / orders : null};
  });
  const knownOrders = channels.every(r => r.orders !== null);
  const orders = knownOrders ? sum(channels, 'orders') : null, amount = knownOrders ? sum(rows.filter(r=>PAID_DELIVERY_CHANNELS.includes(r.channel)), 'amountCents') / 100 : null;
  const spend = channels.every(r => r.spend !== null && r.currency === 'EUR') ? sum(channels, 'spend') : null;
  const allTotal = {orders:available && v2 ? sum(rows,'orders') : null,amount:available && v2 ? sum(rows,'amountCents') / 100 : null};
  const calendarDays=(Date.parse(to)-Date.parse(from))/86400000+1;
  allTotal.averageOrderValue=complete&&allTotal.orders>0?allTotal.amount/allTotal.orders:null;
  allTotal.ordersPerDay=complete&&allTotal.orders!==null?allTotal.orders/calendarDays:null;
  allTotal.calendarDays=calendarDays;
  const kitchens=['center','highway','unknown'].map(kitchen=>{
    const selected=s.kitchenDaily?.filter(r=>inRange(r)&&r.kitchen===kitchen);
    const orders=!available?null:selected?sum(selected,'orders'):kitchen==='unknown'?allTotal.orders:null;
    const amount=!available?null:selected?sum(selected,'amountCents')/100:kitchen==='unknown'?allTotal.amount:null;
    return {kitchen,orders,amount,averageOrderValue:complete&&orders>0?amount/orders:null,ordersPerDay:complete&&orders!==null?orders/calendarDays:null};
  });
  const kitchenComplete=complete&&Boolean(s.kitchenDaily)&&kitchens.find(k=>k.kitchen==='unknown').orders===0;
  const otherRows = rows.filter(r => !PAID_DELIVERY_CHANNELS.includes(r.channel));
  return {available,complete,partial:available && !complete,coverage:s.coverage,completeThrough:s.completeThrough || s.coverage.to,sourceName:s.sourceName,sourceUrl:s.sourceUrl,updatedAt:s.updatedAt,channels,allTotal,kitchens,kitchenComplete,kitchenCoverage:Boolean(s.kitchenDaily),unpaid:{orders:available && v2 ? sum(otherRows,'orders') : null,amount:available && v2 ? sum(otherRows,'amountCents') / 100 : null},total:{orders,amount,spend,roas:complete && amount !== null && spend > 0 ? amount / spend : null,costOrder:complete && spend !== null && orders > 0 ? spend / orders : null},missingCosts:channels.filter(r=>r.spend===null).map(r=>r.channel),method:'orders_received_not_payment'};
}
