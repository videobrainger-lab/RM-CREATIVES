import { store, getSettings } from './kpi-store.mjs';
import { pull, todayRiga } from './kpi-sync.mjs';
import { aggregateGa, aggregateSearch, parseEcb, offsetDate } from './kpi-seo.mjs';
import { aggregateCommercialSearch } from './kpi-commercial-search.mjs';
import { env } from './kpi-auth.mjs';
export async function syncSeo() {
  const cache = store(), settings = await getSettings();
  if (!settings?.windsorKey) return;
  const running = await cache.get('seo-sync-status',{type:'json'});
  if (running?.status === 'running' && Date.now()-Date.parse(running.updatedAt)<14*60000) return;
  await cache.setJSON('seo-sync-status',{status:'running',updatedAt:new Date().toISOString()});
  const previous = await cache.get('seo-milo',{type:'json'});
  const snapshot = previous || {version:1,ga:[],search:[],sources:{}};
  const to = offsetDate(todayRiga(),-1), start = new Date(to+'T12:00:00Z'); start.setUTCMonth(start.getUTCMonth()-5,1);
  const from = start.toISOString().slice(0,10), scTo = offsetDate(todayRiga(),-3);
  const failures = [];
  const gaAccount = env('RM_MILO_GA4_PROPERTY'), scAccount = env('RM_MILO_GSC_SITE');
  await Promise.allSettled([
    (async()=>{
      try {
        if (!gaAccount) throw Error('Missing GA4 mapping');
        const rows = await pull('googleanalytics4',['date','session_default_channel_group','session_source_medium','landing_page','sessions','ecommerce_purchases','gross_purchase_revenue','property_currency'],from,to,settings.windsorKey,[gaAccount]);
        let rates = [], currency = [...new Set(rows.map(r=>r.property_currency))];
        if (currency.includes('USD')) {
          const result = await fetch('https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist.xml',{signal:AbortSignal.timeout(30000)});
          if (!result.ok) throw Error('ECB unavailable');
          rates = parseEcb(await result.text());
        }
        const ga = aggregateGa(rows,rates);
        snapshot.ga=ga; snapshot.sources.ga4={status:'ok',coverage:{from,to},updatedAt:new Date().toISOString(),propertyCurrency:currency.join(',')};
      } catch { failures.push('GA4 / ECB'); }
    })(),
    (async()=>{
      try {
        if (!scAccount) throw Error('Missing GSC mapping');
        // Short windows avoid large upstream reports; commit only a complete history.
        let rows=[];
        for(let a=from;a<=scTo;a=offsetDate(a,28)) {
          const b=[offsetDate(a,27),scTo].sort()[0];
          rows.push(...await pull('searchconsole',['date','query','page','clicks','impressions'],a,b,settings.windsorKey,[scAccount]));
        }
        snapshot.search=aggregateSearch(rows);snapshot.sources.searchconsole={status:'ok',coverage:{from,to:scTo},updatedAt:new Date().toISOString()};
      } catch { failures.push('Search Console'); }
    })()
    ,(async()=>{
      try {
        if (!scAccount) throw Error('Missing GSC mapping');
        const commercialFrom=offsetDate(scTo,-89), rows=[];
        for(let a=commercialFrom;a<=scTo;a=offsetDate(a,28)) {
          const b=[offsetDate(a,27),scTo].sort()[0];
          rows.push(...await pull('searchconsole',['date','query','country','impressions','position'],a,b,settings.windsorKey,[scAccount]));
        }
        snapshot.commercial=aggregateCommercialSearch(rows);
        snapshot.sources.commercial={status:'ok',coverage:{from:commercialFrom,to:scTo},country:'Latvia',timezone:'America/Los_Angeles',method:'gsc_query_average_position_v1',updatedAt:new Date().toISOString()};
      } catch { failures.push('GSC commercial positions'); }
    })()
  ]);
  snapshot.updatedAt=new Date().toISOString();
  if (Object.keys(snapshot.sources).length) await cache.setJSON('seo-milo',snapshot);
  await cache.setJSON('seo-sync-status',{status:failures.length?'error':'ok',updatedAt:snapshot.updatedAt,message:failures.length?'Не обновлены '+failures.join(', ')+'. Предыдущие данные сохранены.':null});
}
