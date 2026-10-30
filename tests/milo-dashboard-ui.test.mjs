import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {buildReport,comparisonRange} from '../netlify/lib/kpi-model.mjs';
import {miloFixture} from './fixtures/milo-dashboard.mjs';
async function render(snapshot) {
 const from='2026-10-01',to='2026-10-28',old=comparisonRange(from,to,'calendar_month');
 const reports={comparisonMode:'calendar_month',current:buildReport(snapshot,from,to),previous:buildReport(snapshot,old.from,old.to)};
 const nodes=new Map();const get=id=>{if(!nodes.has(id))nodes.set(id,{value:'',checked:true,innerHTML:'',textContent:'',events:{},addEventListener(name,cb){this.events[name]=cb},setAttribute(){},removeAttribute(){}});return nodes.get(id)};
 const document={getElementById:get,querySelectorAll:()=>[],addEventListener(){}};
 const config={today:'2026-10-29',updatedAt:snapshot.updatedAt,configured:false,seoMilo:{},seoStatus:{status:'ok'}};
 const context={document,Intl,URL,URLSearchParams,location:new URL('http://localhost/internal/?project=milo'),history:{replaceState(){}},setTimeout,clearTimeout,fetch:async path=>({ok:true,status:200,json:async()=>path.includes('/status')?config:reports})};
 vm.runInNewContext(fs.readFileSync(new URL('../public/internal-assets/dashboard.js',import.meta.url),'utf8'),context);
 await new Promise(setImmediate);await new Promise(setImmediate);
 return {html:get('content').innerHTML,get};
}
test('MILO renders all CRM first, paid channels then SEO, with SendPulse and no landing-direction report',async()=>{
 const {html,get}=await render(miloFixture());
 assert.ok(html.indexOf('Все заказы · CRM')<html.indexOf('ПЛАТНЫЕ КАНАЛЫ И CRM'));
 assert.ok(html.indexOf('Реклама и продажи')<html.indexOf('ОРГАНИЧЕСКИЙ РОСТ'));
 assert.ok(html.includes('SendPulse'));assert.ok(html.includes('1143')||html.includes('1 143'));assert.ok(html.includes('25'));
 assert.ok(!html.includes('Направления · органический поиск'));assert.ok(!html.includes('Группировка по странице входа'));
 assert.ok(html.includes('100%'));assert.ok(html.includes('1 / 1'));assert.ok(html.includes('из 1 запросов'));assert.ok(html.includes('средняя позиция запроса'));assert.ok(html.includes('ROAS'));
 assert.ok(html.includes('к прошлому периоду'));
 get('compare').checked=false;get('compare').events.change();assert.ok(!get('content').innerHTML.includes('к прошлому периоду'));
});
test('missing SendPulse expense is visible and does not prevent rendering per-channel results',async()=>{
 const s=miloFixture();delete s.crm.miloDelivery.sendpulseCosts;
 const {html}=await render(s);assert.ok(html.includes('Не загружен полный расход: SendPulse'));assert.ok(html.includes('10,00'));assert.ok(html.includes('нет данных'));
});
test('known partial SendPulse charges display explicitly without showing a false complete total',async()=>{
 const s=miloFixture();s.crm.miloDelivery.sendpulseCosts.complete=false;
 const {html}=await render(s);assert.ok(html.includes('известная часть'));assert.ok(html.includes('стоимость использованного пакета email ещё не распределена'));assert.ok(html.includes('Не загружен полный расход: SendPulse'));
});
test('MILO shows average check, calendar-day average, explicit comparison dates and EUR/% expense changes',async()=>{
 const s=miloFixture();s.crm.miloDelivery.sendpulseCosts.emailSubscription={monthlyCents:4900,basis:'owner_declared'};
 const {html}=await render(s);
 for(const text of ['Средний чек','Заказов в день · в среднем','28 календарных дней','Те же календарные даты предыдущего месяца','01.09.2026','28.09.2026','в месяц по данным владельца','SMS отдельно:','Оценка email по кредитам не добавляется','ранее 0; процент недоступен'])assert.ok(html.includes(text),text);
 assert.ok(html.includes('€ · '));assert.ok(!html.includes('Infinity'));assert.ok(!html.includes('NaN'));
});
test('missing previous expense remains unavailable rather than becoming zero',async()=>{
 const s=miloFixture();s.crm.miloDelivery.sendpulseCosts.coverage.from='2026-10-01';
 const {html}=await render(s);assert.ok(html.includes('нет сравнения расходов'));
});
test('all four CRM cards include own kitchen metrics and comparisons only with full attribution',async()=>{
 const s=miloFixture(),c=s.crm.miloDelivery;
 c.daily=[{date:'2026-10-15',channel:'google',orders:3,amountCents:5000},{date:'2026-09-15',channel:'google',orders:3,amountCents:3000}];
 c.kitchenDaily=[{date:'2026-10-15',kitchen:'center',orders:1,amountCents:1000},{date:'2026-10-15',kitchen:'highway',orders:2,amountCents:4000},{date:'2026-09-15',kitchen:'center',orders:1,amountCents:1000},{date:'2026-09-15',kitchen:'highway',orders:2,amountCents:2000}];
 const {html}=await render(s),cards=html.split('aria-label="Показатели по кухне"').slice(1).map(x=>x.split('</p></div>')[0]);
 assert.equal(cards.length,4);for(const card of cards){assert.ok(card.includes('Центр'));assert.ok(card.includes('Трасса'));assert.ok(!card.includes('нет сравнения по кухне'));}
 assert.ok(cards[1].includes('10,00'));assert.ok(cards[1].includes('40,00'));assert.ok(cards[2].includes('20,00'));assert.ok(cards[3].includes('0,04'));assert.ok(cards[3].includes('0,07'));assert.ok(!cards[2].includes('Не распределены</span><strong>16,67'));
});
test('unassigned historical kitchens suppress per-kitchen percentages on all four cards',async()=>{
 const {html}=await render(miloFixture());const parts=html.match(/нет сравнения по кухне/g)||[];assert.equal(parts.length,12);assert.equal((html.match(/Разбивка неполная/g)||[]).length,4);
});
