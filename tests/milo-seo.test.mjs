import test from 'node:test';
import assert from 'node:assert/strict';
import {aggregateGa,aggregateSearch,buildSeoReport,isAiSource,parseEcb,toEuro,landingGroup} from '../netlify/lib/kpi-seo.mjs';
const rates=[{date:'2026-10-16',usdPerEur:1.25},{date:'2026-10-19',usdPerEur:1.2}];
const ga=(patch={})=>({date:'2026-10-18',session_default_channel_group:'Organic Search',session_source_medium:'google / organic',landing_page:'/',sessions:10,ecommerce_purchases:2,gross_purchase_revenue:125,property_currency:'USD',...patch});
test('gross revenue converts USD to EUR at last known business-day rate, never subtracts refunds',()=>{
  const [r]=aggregateGa([ga({purchase_revenue:5,refund_amount:120})],rates);
  assert.equal(r.revenue,100);assert.equal(r.orders,2);
  assert.equal(toEuro(100,'EUR','2026-10-18'),100);
  assert.equal(toEuro(100,'GBP','2026-10-18',rates),null);
  assert.equal(toEuro(100,'USD','2026-10-15',rates),null);
  assert.equal(toEuro(100,'USD','2026-10-30',rates),null);
  assert.equal(parseEcb("<Cube time='2026-10-16'><Cube currency='USD' rate='1.25'/></Cube>")[0].usdPerEur,1.25);
});
test('AI exact-host referrals never double count SEO or accept lookalike and paid sources',()=>{
  assert.equal(isAiSource('chatgpt.com / referral'),true);
  assert.equal(isAiSource('chatgpt.com.evil.test / referral'),false);
  assert.equal(isAiSource('chatgpt.com / cpc'),false);
  const rows=aggregateGa([ga(),ga({session_source_medium:'chatgpt.com / ai-assistant'})],rates);
  assert.deepEqual(rows.map(r=>r.channel),['seo','ai']);
});
test('nonbrand excludes Latin, Latvian and Cyrillic brand variants and hidden queries',()=>{
  const r={date:'2026-10-18',page:'https://milo-cafe.lv/ru/sety-sushi',clicks:3,impressions:20};
  const rows=aggregateSearch(['MILO cafe','mīlo rīga','Мило доставка','','сеты суши'].map(query=>({...r,query})));
  assert.equal(rows.length,1);assert.equal(rows[0].clicks,3);assert.equal(rows[0].language,'ru');assert.equal(rows[0].group,'sets');
  assert.equal(landingGroup('/'),'other');assert.equal(landingGroup('/ru/menu-centrs'),'other');
  assert.throws(()=>aggregateGa([ga({sessions:null})],rates));
});
test('unavailable coverage remains null, real empty complete days are zero, conversion needs a denominator',()=>{
  assert.equal(buildSeoReport(null,'2026-10-01','2026-10-20').seo.orders,null);
  const snapshot={sources:{ga4:{status:'ok',coverage:{from:'2026-10-01',to:'2026-10-20'}}},ga:[]};
  const report=buildSeoReport(snapshot,'2026-10-01','2026-10-20');
  assert.equal(report.seo.orders,0);assert.equal(report.seo.conversion,null);assert.equal(report.clicks,null);
  assert.equal(buildSeoReport(snapshot,'2026-09-01','2026-10-20').seo.orders,null);
});
test('lag shifts GSC current and previous windows equally without changing GA dates',()=>{
  const snapshot={sources:{ga4:{status:'ok',coverage:{from:'2026-08-01',to:'2026-10-22'}},searchconsole:{status:'ok',coverage:{from:'2026-08-01',to:'2026-10-20'}}},ga:aggregateGa([ga()],rates),search:[{date:'2026-10-20',group:'sets',language:'ru',clicks:4,impressions:40}]};
  const current=buildSeoReport(snapshot,'2026-09-25','2026-10-22',2),previous=buildSeoReport(snapshot,'2026-08-28','2026-09-24',2);
  assert.deepEqual(current.searchRange,{from:'2026-09-23',to:'2026-10-20'});
  assert.deepEqual(previous.searchRange,{from:'2026-08-26',to:'2026-09-22'});
  assert.equal(current.clicks,4);assert.equal(current.seo.orders,2);assert.equal(current.history.length,6);
  assert.equal(current.visibility.top3,null);assert.equal(current.aiMentions,null);
});
