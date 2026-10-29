import test from 'node:test';
import assert from 'node:assert/strict';
import {validateDeliveryImport,buildDeliveryReport} from '../netlify/lib/kpi-delivery.mjs';
import {aggregateDeliveryOrders,deliveryChannel} from '../netlify/lib/kpi-delivery-import.mjs';
import {previousRange} from '../netlify/lib/kpi-model.mjs';
const source=()=>({version:2,project:'milo-delivery',allSources:true,currency:'EUR',sourceName:'Fixture',sourceUrl:'https://docs.google.com/spreadsheets/d/fixture/edit',updatedAt:'2026-10-22T12:00:00Z',coverage:{from:'2026-09-01',to:'2026-10-22'},daily:[{date:'2026-10-15',channel:'google',orders:3,amountCents:12345},{date:'2026-10-15',channel:'unknown',orders:20,amountCents:99999},{date:'2026-10-15',channel:'sendpulse',orders:2,amountCents:2000},{date:'2026-10-08',channel:'other',orders:10,amountCents:5000}],sendpulseCosts:{currency:'EUR',complete:true,sourceUrl:'https://login.sendpulse.com/emailservice/tasks/',coverage:{from:'2026-09-01',to:'2026-10-22'},daily:[{date:'2026-10-15',spendMicros:8342000}]}});
const ads=[{channel:'google',spend:30,currency:'EUR'},{channel:'meta',spend:10,currency:'EUR'}];
test('all sources include unknown; paid totals include three channels with actual campaign costs',()=>{
 const r=buildDeliveryReport(source(),'2026-10-15','2026-10-21',ads);
 assert.equal(r.allTotal.orders,25);assert.equal(r.allTotal.amount,1143.44);
 assert.equal(r.total.orders,5);assert.equal(r.total.amount,143.45);
 assert.equal(r.channels[0].roas,123.45/30);assert.equal(r.channels[1].roas,0);
 assert.equal(r.channels[2].spend,8.342);assert.equal(r.total.roas,143.45/48.342);
 assert.equal(r.channels[0].costOrder,10);assert.equal(r.total.costOrder,48.342/5);
 assert.equal(r.channels[1].orders,0);assert.equal(r.channels[1].costOrder,null);
});
test('equal-length comparison uses the same all-source scope in both periods',()=>{
 const s=source(),a=buildDeliveryReport(s,'2026-10-15','2026-10-21',ads),range=previousRange('2026-10-15','2026-10-21');
 const b=buildDeliveryReport(s,range.from,range.to,ads);
 assert.equal(a.complete&&b.complete,true);assert.equal(a.allTotal.orders,25);assert.equal(b.allTotal.orders,10);assert.equal(b.total.orders,0);assert.equal(b.total.costOrder,null);
});
test('partial periods and an unfinished current day suppress cost and ROAS',()=>{
 const s=source();s.completeThrough='2026-10-20';
 const r=buildDeliveryReport(s,'2026-08-15','2026-10-21',ads);
 assert.equal(r.partial,true);assert.equal(r.allTotal.orders,35);assert.equal(r.total.roas,null);assert.equal(r.channels[0].costOrder,null);
 assert.equal(buildDeliveryReport(s,'2026-10-15','2026-10-21',ads).complete,false);
 const absent=buildDeliveryReport(s,'2026-08-01','2026-08-31',ads);assert.equal(absent.total.orders,null);assert.equal(absent.allTotal.amount,null);
});
test('missing SendPulse spend never becomes zero or an incomplete total; other channels still calculate',()=>{
 const s=source();delete s.sendpulseCosts;let r=buildDeliveryReport(s,'2026-10-15','2026-10-21',ads);
 assert.equal(r.channels[2].spend,null);assert.equal(r.total.spend,null);assert.equal(r.total.roas,null);assert.equal(r.total.costOrder,null);assert.equal(r.channels[0].costOrder,10);assert.deepEqual(r.missingCosts,['sendpulse']);
 s.sendpulseCosts=source().sendpulseCosts;s.sendpulseCosts.coverage.from='2026-10-16';r=buildDeliveryReport(s,'2026-10-15','2026-10-21',ads);assert.equal(r.channels[2].spend,null);
});
test('zero denominators and incompatible currencies are not divided or summed',()=>{
 const r=buildDeliveryReport(source(),'2026-10-15','2026-10-21',[{channel:'google',spend:0,currency:'EUR'},{channel:'meta',spend:10,currency:'USD'}]);
 assert.equal(r.channels[0].roas,null);assert.equal(r.channels[1].roas,null);assert.equal(r.total.spend,null);assert.equal(r.total.roas,null);
});
test('legacy data cannot claim exhaustive orders or SendPulse attribution',()=>{
 const s=source();s.version=1;s.daily=s.daily.filter(r=>['google','other'].includes(r.channel));delete s.sendpulseCosts;
 const r=buildDeliveryReport(validateDeliveryImport(s),'2026-10-15','2026-10-21',ads);
 assert.equal(r.allTotal.orders,null);assert.equal(r.channels[2].orders,null);assert.equal(r.total.orders,null);assert.equal(r.channels[0].orders,3);
});
test('validation allowlists aggregates, strips private nested data, rejects duplicate days and invalid currency/costs',()=>{
 const s=source();s.customer='private';s.coverage.patient='private';s.daily[0].orderId='private';s.sendpulseCosts.daily[0].recipient='private';
 const r=validateDeliveryImport(s);assert.ok(!JSON.stringify(r).includes('private'));
 s.daily.push({...s.daily[0]});assert.throws(()=>validateDeliveryImport(s));
 for(const edit of [s=>s.daily[0].amountCents=-1,s=>s.currency='USD',s=>s.allSources=false,s=>s.sendpulseCosts.daily[0].spendMicros=0.5]){const bad=source();edit(bad);assert.throws(()=>validateDeliveryImport(bad));}
});
test('import deduplicates IDs, rejects conflicts, never guesses SendPulse from email',()=>{
 const order={orderId:'test-1',date:'2026-10-15',source:'Google Ads',currency:'EUR',amountCents:1000,customer:'private'};
 const r=aggregateDeliveryOrders([order,{...order}],source());assert.equal(r.uniqueOrders,1);assert.equal(r.duplicatesRemoved,1);assert.equal(r.snapshot.daily[0].orders,1);assert.ok(!JSON.stringify(r.snapshot).includes('private'));assert.ok(!JSON.stringify(r.snapshot).includes('test-1'));
 assert.throws(()=>aggregateDeliveryOrders([order,{...order,amountCents:1200}],source()));
 assert.equal(deliveryChannel('email'),'email');assert.equal(deliveryChannel('SendPulse'),'sendpulse');assert.equal(deliveryChannel('Не определён'),'unknown');
});
test('known SendPulse campaign charges do not pretend to include prepaid email allocation',()=>{
 const s=source();s.sendpulseCosts.complete=false;const r=buildDeliveryReport(s,'2026-10-15','2026-10-21',ads);
 assert.equal(r.channels[2].knownSpend,8.342);assert.equal(r.channels[2].spend,null);assert.equal(r.total.spend,null);assert.equal(r.total.roas,null);
 assert.equal(validateDeliveryImport(s).sendpulseCosts.complete,false);
});
test('explicit SendPulse source captured on an order can resolve an Other label without guessing generic email',()=>{
 assert.equal(deliveryChannel('Другое','sendpulse'),'sendpulse');
 assert.equal(deliveryChannel('Другое','email'),'other');
 assert.throws(()=>deliveryChannel('Google Ads','sendpulse'));
});
test('all-order averages count calendar zero-order days, not only active days',()=>{
 const s=source(),r=buildDeliveryReport(s,'2026-10-15','2026-10-21',ads);
 assert.equal(r.allTotal.calendarDays,7);assert.equal(r.allTotal.ordersPerDay,25/7);assert.equal(r.allTotal.averageOrderValue,1143.44/25);
 const z=buildDeliveryReport(s,'2026-10-01','2026-10-07',ads);assert.equal(z.allTotal.ordersPerDay,0);assert.equal(z.allTotal.averageOrderValue,null);
 s.completeThrough='2026-10-20';const p=buildDeliveryReport(s,'2026-10-15','2026-10-21',ads);assert.equal(p.allTotal.ordersPerDay,null);assert.equal(p.allTotal.averageOrderValue,null);
});
test('owner-declared fixed subscription prorates each calendar month, SMS remains separate',async()=>{
 const {monthlyEmailExpense}=await import('../netlify/lib/kpi-delivery.mjs');
 assert.equal(monthlyEmailExpense('2026-09-01','2026-09-30',4900),49);
 assert.equal(monthlyEmailExpense('2026-10-01','2026-10-28',4900),49*28/31);
 assert.equal(monthlyEmailExpense('2028-02-01','2028-02-29',4900),49);
 assert.equal(monthlyEmailExpense('2026-09-30','2026-10-01',4900),49/30+49/31);
 const s=source();s.sendpulseCosts.emailSubscription={monthlyCents:4900,basis:'owner_declared'};
 const r=buildDeliveryReport(validateDeliveryImport(s),'2026-10-15','2026-10-21',ads);
 assert.equal(r.channels[2].emailSpend,49*7/31);assert.equal(r.channels[2].smsSpend,8.342);assert.equal(r.channels[2].spend,8.342+49*7/31);assert.equal(r.total.spend,40+8.342+49*7/31);
 s.sendpulseCosts.emailSubscription.monthlyCents=0;const z=buildDeliveryReport(s,'2026-10-15','2026-10-21',ads);assert.equal(z.channels[2].emailMonthly,0);assert.equal(z.channels[2].emailSpend,0);assert.equal(z.channels[2].spend,8.342);
});
