// SEO and AI referrals stay separate from advertising and CRM totals.
const day = 86400000;
export const offsetDate = (date, days) => new Date(Date.parse(date) + days * day).toISOString().slice(0, 10);
export const BRAND = /(?:^|[^\p{L}])m[iī]lo(?:$|[^\p{L}])|мило/iu;
export const AI_HOSTS = ['chatgpt.com', 'chat.openai.com', 'perplexity.ai', 'gemini.google.com', 'copilot.microsoft.com', 'claude.ai'];
export function isAiSource(sourceMedium) {
  const [source, medium = ''] = String(sourceMedium || '').toLowerCase().split(' / ');
  if (/^(cpc|ppc|paid.*|display|cpm)$/.test(medium)) return false;
  return AI_HOSTS.some(host => source === host || source === 'www.' + host);
}
export function landingGroup(path = '') {
  path = String(path).split('?')[0].toLowerCase();
  if (/susi-piegade-jurmala|dostavka-sushi-jurmala/.test(path)) return 'jurmala';
  if (/susi-seti|sety-sushi/.test(path)) return 'sets';
  if (/pizza/.test(path)) return 'pizza';
  // Shared menus/home pages cannot be attributed to Riga or Jurmala by intent.
  if (/susi-piegade-riga|dostavka-sushi-riga/.test(path)) return 'riga';
  return 'other';
}
const lang = path => /^\/ru(?:\/|$)/.test(path) ? 'ru' : /^\/en(?:\/|$)/.test(path) ? 'en' : 'lv';
const number = v => v !== '' && v !== null && v !== undefined && Number.isFinite(Number(v)) && Number(v) >= 0 ? Number(v) : null;
export function parseEcb(xml) {
  const rates = [];
  for (const match of xml.matchAll(/<Cube\s+time=['"](\d{4}-\d{2}-\d{2})['"]>([\s\S]*?)<\/Cube>/g)) {
    const usd = match[2].match(/currency=['"]USD['"]\s+rate=['"]([\d.]+)['"]/);
    if (usd && Number(usd[1]) > 0) rates.push({ date: match[1], usdPerEur: Number(usd[1]) });
  }
  if (!rates.length) throw Error('ECB rates unavailable');
  return rates.sort((a, b) => a.date.localeCompare(b.date));
}
export function toEuro(amount, currency, date, rates = []) {
  if (number(amount) === null) return null;
  if (currency === 'EUR') return Number(amount);
  if (currency !== 'USD') return null;
  const rate = rates.filter(r => r.date <= date).at(-1);
  if (!rate || Date.parse(date) - Date.parse(rate.date) > 7 * day) return null;
  return Number(amount) / rate.usdPerEur;
}
export function aggregateGa(rows, rates) {
  const groups = new Map();
  for (const r of rows) {
    const ai = isAiSource(r.session_source_medium);
    const channel = ai ? 'ai' : r.session_default_channel_group === 'Organic Search' ? 'seo' : null;
    if (!channel) continue;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(r.date) || ['sessions','ecommerce_purchases','gross_purchase_revenue'].some(k => number(r[k]) === null)) throw Error('Incomplete GA4 metrics');
    const group = landingGroup(r.landing_page), language = lang(r.landing_page || '');
    const key = [r.date, channel, group, language].join(':');
    if (!groups.has(key)) groups.set(key, { date:r.date, channel, group, language, sessions:0, orders:0, revenue:0 });
    const value = groups.get(key), revenue = toEuro(r.gross_purchase_revenue, r.property_currency, r.date, rates);
    value.sessions += Number(r.sessions); value.orders += Number(r.ecommerce_purchases);
    value.revenue = value.revenue === null || revenue === null ? null : value.revenue + revenue;
  }
  return [...groups.values()];
}
export function aggregateSearch(rows) {
  const groups = new Map();
  for (const r of rows) {
    if (!r.query || BRAND.test(r.query)) continue;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(r.date) || number(r.clicks) === null || number(r.impressions) === null) throw Error('Incomplete Search Console metrics');
    const group = landingGroup(new URL(r.page, 'https://milo-cafe.lv').pathname), language = lang(new URL(r.page, 'https://milo-cafe.lv').pathname);
    const key = [r.date, group, language].join(':');
    if (!groups.has(key)) groups.set(key, { date:r.date, group, language, clicks:0, impressions:0 });
    const value = groups.get(key); value.clicks += Number(r.clicks); value.impressions += Number(r.impressions);
  }
  return [...groups.values()];
}
const covers = (s, from, to) => s?.status === 'ok' && from >= s.coverage.from && to <= s.coverage.to;
function gaTotal(rows, available) {
  if (!available) return { sessions:null, orders:null, revenue:null, conversion:null };
  const sum = key => rows.every(r => r[key] !== null) ? rows.reduce((n, r) => n + r[key], 0) : null;
  const sessions = sum('sessions'), orders = sum('orders');
  return { sessions, orders, revenue:sum('revenue'), conversion:sessions > 0 ? orders / sessions * 100 : null };
}
export function buildSeoReport(snapshot, from, to, searchLagDays = 0) {
  const sources = snapshot?.sources || {};
  const searchRange = {from:offsetDate(from,-searchLagDays),to:offsetDate(to,-searchLagDays)};
  const gaAvailable = covers(sources.ga4, from, to), searchAvailable = covers(sources.searchconsole, searchRange.from, searchRange.to);
  const inRange = r => r.date >= from && r.date <= to;
  const ga = (snapshot?.ga || []).filter(inRange), search = (snapshot?.search || []).filter(r=>r.date>=searchRange.from&&r.date<=searchRange.to);
  const sumSearch = rows => ({ clicks:searchAvailable ? rows.reduce((n,r) => n+r.clicks,0) : null, impressions:searchAvailable ? rows.reduce((n,r) => n+r.impressions,0) : null });
  const current = { seo:gaTotal(ga.filter(r => r.channel === 'seo'),gaAvailable), ai:gaTotal(ga.filter(r => r.channel === 'ai'),gaAvailable), ...sumSearch(search) };
  const groups = ['riga','jurmala','sets','pizza','other'].map(id => ({ id, ...gaTotal(ga.filter(r => r.channel === 'seo' && r.group === id),gaAvailable), ...sumSearch(search.filter(r => r.group === id)) }));
  const languages = ['lv','ru','en'].map(id => ({id,...gaTotal(ga.filter(r => r.channel === 'seo' && r.language === id),gaAvailable),...sumSearch(search.filter(r => r.language === id))}));
  const history = [];
  // Six calendar months, including the selected end date's month.
  const start = new Date(to + 'T12:00:00Z'); start.setUTCMonth(start.getUTCMonth()-5,1);
  for (let i=0;i<6;i++) {
    const a = new Date(start); a.setUTCMonth(a.getUTCMonth()+i);
    const b = new Date(a); b.setUTCMonth(b.getUTCMonth()+1);
    const first = a.toISOString().slice(0,10), last = [offsetDate(b.toISOString().slice(0,10),-1),to].sort()[0];
    const gaRows = (snapshot?.ga || []).filter(r => r.date >= first && r.date <= last && r.channel === 'seo');
    const scLast = last>sources.searchconsole?.coverage.to?sources.searchconsole.coverage.to:last;
    const scRows = (snapshot?.search || []).filter(r => r.date >= first && r.date <= scLast);
    history.push({month:first.slice(0,7),...gaTotal(gaRows,covers(sources.ga4,first,last)),clicks:scLast>=first&&covers(sources.searchconsole,first,scLast)?scRows.reduce((n,r)=>n+r.clicks,0):null});
  }
  return { ...current, groups, languages, history, sources, updatedAt:snapshot?.updatedAt || null,
    // Fixed query monitoring and Google AI impressions need their own verified sources.
    visibility:{top3:null,top10:null}, aiMentions:null, googleAiImpressions:null,
    method:'ga4_session_attribution_gross_ecb', currency:'EUR', searchRange, searchLagDays };
}
