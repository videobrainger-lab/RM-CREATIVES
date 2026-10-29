import { createHash } from 'node:crypto';
const normalized = value => String(value || '').normalize('NFD').replace(/([a-zA-Z])\p{M}+/gu,'$1').normalize('NFC').toLowerCase().trim().replace(/\s+/g,' ');
// Conservative, reviewable intent rules. Brand variants are excluded before intent.
export const SEARCH_BRAND = /(?:^|[^\p{L}])(?:milo|milu|mila|мило|мила|милу|ьшдщ)(?:$|[^\p{L}])/iu;
export function isCommercialQuery(value) {
  const q = normalized(value);
  if (!q || SEARCH_BRAND.test(q) || /(?:рецепт|приготов|калори|что такое|как сделать|recept|kalor|kas ir|ka pagatavot|wikipedia)/u.test(q)) return false;
  return /(?:суши|ролл[ыаов]*|пицц|кейтеринг|кейтиринг|банкет|фуршет|еда на заказ|ед[уы].{0,15}(?:заказ|достав)|(?:заказ|достав).{0,20}(?:ед[уыа]|обед|закуск|канапе)|(?:день рождения|дня рождения|юбилей).{0,30}(?:риг|юрмал)|(?:где|мест[ао]|кафе|ресторан|помещени|зал).{0,40}(?:день рождения|дня рождения|юбилей)|(?:^|[^a-z])(?:sushi|susi|pica|picas|picu|pizza|catering|keitering[a-z]*|banket[a-z]*|picerij[a-z]*)(?:$|[^a-z])|(?:edien|pusdien).{0,20}(?:pasut|piegad)|(?:pasut|piegad).{0,20}(?:edien|pusdien)|(?:svin|vieta|telpa|restoran).{0,35}dzimsanas|dzimsanas.{0,35}(?:svin|vieta|telpa|restoran)|beru mielast)/u.test(q);
}
export function aggregateCommercialSearch(rows) {
  const result = [], keys = new Set();
  for (const r of rows) {
    if (r.country !== 'Latvia' || !isCommercialQuery(r.query)) continue;
    const impressions = Number(r.impressions), position = Number(r.position);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(r.date) || r.impressions === null || r.position === null || !Number.isFinite(impressions) || impressions < 0 || !Number.isFinite(position) || position < 1) throw Error('Incomplete commercial search metrics');
    if (!impressions) continue;
    // No query text is kept in the snapshot or returned to the browser.
    const queryKey = createHash('sha256').update(String(r.query).normalize('NFC')).digest('hex');
    const key = r.date + ':' + queryKey;
    if (keys.has(key)) throw Error('Duplicate query/day in commercial search');
    keys.add(key);
    result.push({date:r.date,queryKey,impressions,positionWeight:position * impressions});
  }
  return result;
}
export function commercialVisibility(snapshot, from, to) {
  const source = snapshot?.sources?.commercial;
  const missing = {top3:null,top10:null,queries:null,top3Count:null,top10Count:null,country:'Latvia',timezone:'America/Los_Angeles',method:'gsc_query_average_position_v1'};
  if (source?.status !== 'ok' || from < source.coverage.from || to > source.coverage.to) return missing;
  const queries = new Map();
  for (const r of snapshot.commercial || []) {
    if (r.date < from || r.date > to) continue;
    const q = queries.get(r.queryKey) || {impressions:0,positionWeight:0};
    q.impressions += r.impressions; q.positionWeight += r.positionWeight; queries.set(r.queryKey,q);
  }
  const positions = [...queries.values()].filter(q=>q.impressions>0).map(q=>q.positionWeight / q.impressions);
  const top3Count = positions.filter(p=>p<=3).length, top10Count = positions.filter(p=>p<=10).length;
  return {...missing,queries:positions.length,top3Count,top10Count,top3:positions.length ? top3Count / positions.length * 100 : null,top10:positions.length ? top10Count / positions.length * 100 : null};
}
