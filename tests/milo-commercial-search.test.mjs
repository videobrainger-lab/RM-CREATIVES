import test from 'node:test';
import assert from 'node:assert/strict';
import {aggregateCommercialSearch,commercialVisibility,isCommercialQuery} from '../netlify/lib/kpi-commercial-search.mjs';
const row=(query,position,impressions=1,date='2026-10-15')=>({query,position,impressions,date,country:'Latvia'});
const snapshot=rows=>({commercial:aggregateCommercialSearch(rows),sources:{commercial:{status:'ok',coverage:{from:'2026-09-01',to:'2026-10-26'}}}});
test('commercial intent excludes brand variants and informational searches',()=>{
 for(const q of ['MILO sushi','Мило доставка','Milu piegāde','Mila sushi','mīlo pica','что такое кейтеринг','суши рецепт','suši receptes'])assert.equal(isCommercialQuery(q),false,q);
 for(const q of ['kur svinēt dzimšanas dienu rīgā','restorāni rīgā dzimšanas dienā','заказать суши','суши рига','кейтеринг рига','suši piegāde','picu piegāde'])assert.equal(isCommercialQuery(q),true,q);
});
test('thresholds use impression-weighted query average across the full period, not summed daily rankings',()=>{
 const s=snapshot([row('суши рига',1,1),row('суши рига',10,9,'2026-10-16'),row('suši piegāde',3),row('pica riga',10),row('суши юрмала',11)]);
 const r=commercialVisibility(s,'2026-10-15','2026-10-16');assert.equal(r.queries,4);assert.equal(r.top3,25);assert.equal(r.top10,75);assert.equal(r.top3Count,1);
 assert.ok(!JSON.stringify(s).includes('суши'));assert.equal(r.timezone,'America/Los_Angeles');
});
test('geography, zero impressions, absent coverage and empty query samples are disclosed',()=>{
 const s=snapshot([{...row('суши рига',1),country:'Estonia'},row('суши рига',1,0)]);
 const r=commercialVisibility(s,'2026-10-15','2026-10-16');assert.equal(r.queries,0);assert.equal(r.top3,null);
 assert.equal(commercialVisibility(s,'2026-08-01','2026-10-16').queries,null);
 assert.equal(commercialVisibility(null,'2026-10-15','2026-10-16').top10,null);
 assert.throws(()=>aggregateCommercialSearch([row('суши рига',null)]));
});
test('accented and unaccented queries remain separate source queries; duplicate source rows fail',()=>{
 const s=snapshot([row('suši piegāde',3),row('susi piegade',5)]);assert.equal(commercialVisibility(s,'2026-10-15','2026-10-15').queries,2);
 assert.throws(()=>aggregateCommercialSearch([row('суши рига',3),row('суши рига',3)]));
});
