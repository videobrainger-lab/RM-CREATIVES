import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {buildReport,previousRange} from '../netlify/lib/kpi-model.mjs';
import {miloFixture} from './fixtures/milo-dashboard.mjs';
async function render(snapshot) {
 const from='2026-10-01',to='2026-10-28',old=previousRange(from,to);
 const reports={current:buildReport(snapshot,from,to),previous:buildReport(snapshot,old.from,old.to)};
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
 assert.ok(html.includes('100%'));assert.ok(html.includes('средняя позиция запроса'));assert.ok(html.includes('ROAS'));
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
