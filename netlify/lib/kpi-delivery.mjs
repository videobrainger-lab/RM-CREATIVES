import { validateRange } from './kpi-model.mjs';
export const PAID_DELIVERY_CHANNELS = ['google', 'meta', 'sendpulse'];
const CHANNELS = [...PAID_DELIVERY_CHANNELS, 'other', 'unknown', 'referral', 'organic', 'direct', 'email'];
const sheetUrl = value => /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[\w-]+\//.test(value || '');
const sum = (rows, key) => rows.reduce((n, r) => n + r[key], 0);
export function validateDeliveryImport(s) {
  if (![1, 2].includes(s?.version) || s.project !== 'milo-delivery') throw Error('Invalid delivery source');
  validateRange(s.coverage?.from, s.coverage?.to);
  if (!Number.isFinite(Date.parse(s.updatedAt)) || !sheetUrl(s.sourceUrl) || typeof s.sourceName !== 'string' || s.sourceName.length > 150 || !Array.isArray(s.daily) || s.daily.length > 6000) throw Error('Invalid delivery metadata');
  const v2 = s.version === 2, keys = new Set();
  if (v2 && (s.allSources !== true || s.currency !== 'EUR')) throw Error('Require exhaustive EUR order import');
  const completeThrough = s.completeThrough || s.coverage.to;
  validateRange(s.coverage.from, completeThrough);
  if (completeThrough > s.coverage.to) throw Error('Invalid complete-through date');
  for (const r of s.daily) {
    validateRange(r.date, r.date);
    const k = r.date + ':' + r.channel;
    if (!(v2 ? CHANNELS : ['google', 'meta', 'other']).includes(r.channel) || keys.has(k) || r.date < s.coverage.from || r.date > s.coverage.to || !Number.isSafeInteger(r.orders) || r.orders < 0 || !Number.isSafeInteger(r.amountCents) || r.amountCents < 0 || (r.orders === 0 && r.amountCents !== 0)) throw Error('Invalid delivery counts');
    keys.add(k);
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
    sendpulseCosts = {currency:c.currency,complete:c.complete,coverage:{from:c.coverage.from,to:c.coverage.to},sourceUrl:c.sourceUrl,daily:c.daily.map(({date,spendMicros})=>({date,spendMicros}))};
  }
  return {version:s.version,project:s.project,sourceName:s.sourceName,sourceUrl:s.sourceUrl,updatedAt:s.updatedAt,coverage:{from:s.coverage.from,to:s.coverage.to},...(v2 ? {allSources:true,currency:'EUR',completeThrough} : {}),...(sendpulseCosts ? {sendpulseCosts} : {}),daily:s.daily.map(({date,channel,orders,amountCents})=>({date,channel,orders,amountCents}))};
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
    const ad = ads.find(c => c.channel === channel);
    const spend = channel === 'sendpulse' ? costCovered ? sum(costSource.daily.filter(inRange), 'spendMicros') / 1e6 : null : ad?.spend ?? null;
    const currency = channel === 'sendpulse' ? 'EUR' : ad?.currency || 'EUR';
    return {channel,orders,amount,spend,knownSpend:channel === 'sendpulse' ? knownSpend : spend,currency,roas:complete && amount !== null && spend > 0 && currency === 'EUR' ? amount / spend : null,costOrder:complete && spend !== null && orders > 0 ? spend / orders : null};
  });
  const knownOrders = channels.every(r => r.orders !== null);
  const orders = knownOrders ? sum(channels, 'orders') : null, amount = knownOrders ? sum(rows.filter(r=>PAID_DELIVERY_CHANNELS.includes(r.channel)), 'amountCents') / 100 : null;
  const spend = channels.every(r => r.spend !== null && r.currency === 'EUR') ? sum(channels, 'spend') : null;
  const allTotal = {orders:available && v2 ? sum(rows,'orders') : null,amount:available && v2 ? sum(rows,'amountCents') / 100 : null};
  const otherRows = rows.filter(r => !PAID_DELIVERY_CHANNELS.includes(r.channel));
  return {available,complete,partial:available && !complete,coverage:s.coverage,completeThrough:s.completeThrough || s.coverage.to,sourceName:s.sourceName,sourceUrl:s.sourceUrl,updatedAt:s.updatedAt,channels,allTotal,unpaid:{orders:available && v2 ? sum(otherRows,'orders') : null,amount:available && v2 ? sum(otherRows,'amountCents') / 100 : null},total:{orders,amount,spend,roas:complete && amount !== null && spend > 0 ? amount / spend : null,costOrder:complete && spend !== null && orders > 0 ? spend / orders : null},missingCosts:channels.filter(r=>r.spend===null).map(r=>r.channel),method:'orders_received_not_payment'};
}
