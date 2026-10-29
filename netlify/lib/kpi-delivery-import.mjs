import { validateDeliveryImport } from './kpi-delivery.mjs';
// Run before upload. Input order IDs never leave this aggregation step.
export function deliveryChannel(source, attributionSource) {
  const value = String(source || '').trim().toLowerCase();
  if (String(attributionSource || '').trim().toLowerCase() === 'sendpulse') {
    if (['google ads','meta ads'].includes(value)) throw Error('Conflicting paid attribution');
    return 'sendpulse';
  }
  if (value === 'google ads') return 'google';
  if (value === 'meta ads') return 'meta';
  if (value === 'sendpulse') return 'sendpulse';
  if (['не определён','не определен','unknown',''].includes(value)) return 'unknown';
  if (value === 'рекомендация') return 'referral';
  if (value === 'organic search') return 'organic';
  if (value === 'direct') return 'direct';
  if (value === 'email') return 'email';
  return 'other';
}
export function aggregateDeliveryOrders(orders, metadata) {
  const ids = new Map(), daily = new Map();
  let duplicatesRemoved = 0;
  for (const order of orders) {
    if (!order.orderId || order.currency !== 'EUR' || !Number.isSafeInteger(order.amountCents) || order.amountCents < 0) throw Error('Missing order ID or invalid EUR amount');
    const value = {date:order.date,channel:deliveryChannel(order.source,order.attributionSource),amountCents:order.amountCents};
    if (ids.has(String(order.orderId))) {
      if (JSON.stringify(ids.get(String(order.orderId))) !== JSON.stringify(value)) throw Error('Conflicting duplicate order ID; reconcile source before import');
      duplicatesRemoved++; continue;
    }
    ids.set(String(order.orderId),value);
    const key = value.date + ':' + value.channel;
    const row = daily.get(key) || {date:value.date,channel:value.channel,orders:0,amountCents:0};
    row.orders++; row.amountCents += value.amountCents; daily.set(key,row);
  }
  const snapshot = validateDeliveryImport({...metadata,version:2,project:'milo-delivery',allSources:true,currency:'EUR',daily:[...daily.values()]});
  return {snapshot,duplicatesRemoved,uniqueOrders:ids.size};
}
